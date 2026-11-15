// AgOpenWeb
// Copyright (C) 2024-2026 AgOpenWeb Contributors
// SPDX-License-Identifier: Apache-2.0

using AgOpenWeb.DesktopServices;
using AgOpenWeb.Models.State;
using AgOpenWeb.RemoteWiring;
using AgOpenWeb.Services.Interfaces;
using AgOpenWeb.VirtualTerminal;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using SeederTerminal.Core;

namespace SeederTerminal.Desktop;

internal sealed class SeederBackend(IHost host) : IAsyncDisposable
{
    public const int DevPort = 5174;
    public const int ProductPort = 5175;

    public static async Task<SeederBackend> StartAsync(int port, string? uiRoot)
    {
        var host = Host.CreateDefaultBuilder()
            .ConfigureServices(services =>
            {
                services.AddDesktopGuidanceServices();
                services.AddSingleton<IBatteryService, DesktopBatteryService>();
                services.AddSingleton<IVirtualTerminalService, VirtualTerminalService>();
                services.AddSingleton<ISeederTelemetrySource, SimulatedSeederTelemetrySource>();
            })
            .Build();

        WebBackend? backend = null;
        try
        {
            var sp = host.Services;
            backend = await WebBackend.StartAsync(sp, new NullBoundaryImageryCapture(), port, uiRoot);
            SeederTelemetryWiring.Attach(
                backend.Server,
                sp.GetRequiredService<ISeederTelemetrySource>(),
                sp.GetRequiredService<ISectionControlService>());

            var config = sp.GetRequiredService<IConfigurationService>();
            var state = sp.GetRequiredService<IPersistentStateService>();
            var virtualTerminal = sp.GetRequiredService<IVirtualTerminalService>() as IDisposable;
            sp.GetRequiredService<IHostApplicationLifetime>().ApplicationStopping.Register(() =>
            {
                RunShutdownStep("stop virtual terminal", () => virtualTerminal?.Dispose());
                RunShutdownStep("save open field", () => backend.ViewModel.SaveOpenFieldForExit(TimeSpan.FromSeconds(10)));
                RunShutdownStep("save config", config.SaveAppSettings);
                RunShutdownStep("save state", () => state.Save());
                RunShutdownStep("stop server", () => backend.Server.StopAsync().GetAwaiter().GetResult());
            });

            await host.StartAsync();
            return new SeederBackend(host);
        }
        catch
        {
            try
            {
                if (backend is not null)
                    await backend.Server.StopAsync();
            }
            finally
            {
                host.Dispose();
            }

            throw;
        }
    }

    public Task WaitForShutdownAsync() => host.WaitForShutdownAsync();

    public async ValueTask DisposeAsync()
    {
        try
        {
            if (!host.Services.GetRequiredService<IHostApplicationLifetime>().ApplicationStopped.IsCancellationRequested)
                await host.StopAsync();
        }
        finally
        {
            host.Dispose();
        }
    }

    private static void RunShutdownStep(string step, Action action)
    {
        try { action(); }
        catch (Exception ex) { Console.Error.WriteLine($"[seeder] {step} failed: {ex.Message}"); }
    }
}

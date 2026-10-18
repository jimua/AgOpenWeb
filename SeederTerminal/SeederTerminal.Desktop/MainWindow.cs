using System;
using System.IO;
using System.Threading.Tasks;
using AgOpenWeb.Desktop.DependencyInjection;
using AgOpenWeb.Models.Configuration;
using AgOpenWeb.Models.State;
using AgOpenWeb.Services.Interfaces;
using AgOpenWeb.Services.Threading;
using Avalonia.Controls;
using Avalonia.Layout;
using Avalonia.Media;
using Avalonia.Threading;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using SeederTerminal.Core;
using NativeWebView = Avalonia.Controls.NativeWebView;

namespace SeederTerminal.Desktop;

/// <summary>Starts AgOpenWeb WebBackend on :5175 serving SeederTerminal Vite dist + WebView.</summary>
public sealed class MainWindow : Window
{
    public const int Port = 5175;

    private const string LauncherErrorLogName = "seeder-terminal-launcher-error.log";

    private readonly NativeWebView _web = new()
    {
        HorizontalAlignment = HorizontalAlignment.Stretch,
        VerticalAlignment = VerticalAlignment.Stretch,
        IsVisible = false,
    };
    private readonly Border _splash;
    private IHost? _host;
    private HostLoopDispatcher? _hostLoop;
    private AgOpenWeb.RemoteWiring.WebBackend? _backend;
    private bool _closing;

    public MainWindow()
    {
        Title = "Seeder Terminal";
        WindowState = WindowState.Maximized;
        _splash = new Border
        {
            Background = new SolidColorBrush(Color.Parse("#0b1220")),
            Child = SplashText("Starting Seeder Terminal…"),
        };
        Content = new Grid { Children = { _web, _splash } };
        _web.NavigationCompleted += (_, e) =>
        {
            Dispatcher.UIThread.Post(() =>
            {
                if (e.IsSuccess)
                {
                    _web.IsVisible = true;
                    _splash.IsVisible = false;
                    return;
                }

                _web.IsVisible = false;
                _splash.IsVisible = true;
                _splash.Child = SplashText(
                    $"Failed to load Seeder UI at http://127.0.0.1:{Port}/.\n\nNavigation did not complete successfully.");
            });
        };
        Opened += (_, _) => _ = StartAsync();
    }

    private async Task StartAsync()
    {
        try
        {
            var uiRoot = ResolveWwwRoot()
                ?? throw new InvalidOperationException(
                    "Seeder UI not found. Build the Desktop project (copies SeederTerminal.Web/dist to wwwroot) " +
                    "or run 'npm install && npm run build' in SeederTerminal.Web.");

            var started = await Task.Run(() => StartBackendAsync(uiRoot));
            _host = started.Host;
            _hostLoop = started.HostLoop;
            _backend = started.Backend;

            _web.IsVisible = true;
            _web.Source = new Uri($"http://127.0.0.1:{Port}/");
        }
        catch (Exception ex)
        {
            var log = Path.Combine(Path.GetTempPath(), LauncherErrorLogName);
            try { File.WriteAllText(log, ex.ToString()); } catch { /* best effort */ }
            try { await StopBackendAsync(); } catch { /* best effort */ }

            _splash.IsVisible = true;
            _splash.Child = SplashText(
                $"Seeder Terminal failed to start.\n\n{ex.Message}\n\nDetails: {log}");
        }
    }

    private static (IHost Host, HostLoopDispatcher HostLoop, AgOpenWeb.RemoteWiring.WebBackend Backend) StartBackendAsync(string uiRoot)
    {
        var hostLoop = new HostLoopDispatcher();
        var host = Host.CreateDefaultBuilder()
            .ConfigureServices(services =>
            {
                services.AddAgOpenWebServices();
                services.AddSingleton(hostLoop);
                services.AddSingleton<IUiDispatcher>(hostLoop);
                services.AddSingleton<IUiTimerFactory>(hostLoop);
                services.AddSingleton<IMapService, AgOpenWeb.Services.NullMapService>();
                services.AddSingleton<ISeederTelemetrySource, SimulatedSeederTelemetrySource>();
            })
            .Build();

        var sp = host.Services;
        var backend = AgOpenWeb.RemoteWiring.WebBackend.StartAsync(
            sp,
            new NullBoundaryImageryCapture(),
            Port,
            uiRoot).GetAwaiter().GetResult();
        var remoteServer = backend.Server;

        var configService = sp.GetRequiredService<IConfigurationService>();
        var persistentState = sp.GetRequiredService<IPersistentStateService>();
        var lifetime = sp.GetRequiredService<IHostApplicationLifetime>();
        lifetime.ApplicationStopping.Register(() =>
        {
            try { configService.SaveAppSettings(); } catch (Exception ex) { Console.WriteLine($"[seeder] save config failed: {ex.Message}"); }
            try { persistentState.Save(); } catch (Exception ex) { Console.WriteLine($"[seeder] save state failed: {ex.Message}"); }
            try { remoteServer.StopAsync().GetAwaiter().GetResult(); } catch (Exception ex) { Console.WriteLine($"[seeder] server stop failed: {ex.Message}"); }
        });

        host.StartAsync().GetAwaiter().GetResult();
        return (host, hostLoop, backend);
    }

    private static string? ResolveWwwRoot()
    {
        var baseDir = AppContext.BaseDirectory;
        var candidates = new[]
        {
            Path.Combine(baseDir, "wwwroot"),
            Path.GetFullPath(Path.Combine(baseDir, "..", "..", "..", "..", "SeederTerminal.Web", "dist")),
            Path.GetFullPath(Path.Combine(baseDir, "..", "..", "..", "SeederTerminal.Web", "dist")),
        };
        foreach (var c in candidates)
        {
            if (Directory.Exists(c) && File.Exists(Path.Combine(c, "index.html")))
                return c;
        }
        return null;
    }

    protected override void OnClosing(WindowClosingEventArgs e)
    {
        if (_host is not null && _backend is not null && !_closing)
        {
            e.Cancel = true;
            _closing = true;
            _ = StopThenCloseAsync();
        }
        base.OnClosing(e);
    }

    private async Task StopThenCloseAsync()
    {
        try { await Task.Run(StopBackendAsync); } catch { /* close regardless */ }
        Close();
    }

    private async Task StopBackendAsync()
    {
        if (_host is { } host)
        {
            try { await host.StopAsync(); } catch { /* ignore */ }
            host.Dispose();
        }
        _hostLoop?.Dispose();
        _host = null;
        _hostLoop = null;
        _backend = null;
    }

    private static Control SplashText(string message) => new TextBlock
    {
        Text = message,
        Foreground = Brushes.White,
        FontSize = 16,
        TextWrapping = TextWrapping.Wrap,
        TextAlignment = TextAlignment.Center,
        HorizontalAlignment = HorizontalAlignment.Center,
        VerticalAlignment = VerticalAlignment.Center,
        MaxWidth = 560,
    };
}

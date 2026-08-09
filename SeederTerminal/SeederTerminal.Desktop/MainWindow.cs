using System;
using System.IO;
using System.Threading.Tasks;
using AgOpenWeb.Desktop.DependencyInjection;
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

    private readonly NativeWebView _web = new()
    {
        HorizontalAlignment = HorizontalAlignment.Stretch,
        VerticalAlignment = VerticalAlignment.Stretch,
    };
    private readonly Border _splash;
    private IHost? _host;
    private HostLoopDispatcher? _hostLoop;

    public MainWindow()
    {
        Title = "Seeder Terminal";
        WindowState = WindowState.Maximized;
        _splash = new Border
        {
            Background = new SolidColorBrush(Color.Parse("#0b1220")),
            Child = new TextBlock
            {
                Text = "Starting Seeder Terminal…",
                Foreground = Brushes.White,
                FontSize = 18,
                HorizontalAlignment = HorizontalAlignment.Center,
                VerticalAlignment = VerticalAlignment.Center,
            },
        };
        Content = new Grid { Children = { _web, _splash } };
        Opened += (_, _) => _ = StartAsync();
        Closing += (_, _) => _ = StopAsync();
    }

    private async Task StartAsync()
    {
        try
        {
            var uiRoot = ResolveWwwRoot();
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

            var backend = await AgOpenWeb.RemoteWiring.WebBackend.StartAsync(
                host.Services,
                new NullBoundaryImageryCapture(),
                Port,
                uiRoot);

            await host.StartAsync();
            _host = host;
            _hostLoop = hostLoop;

            Console.WriteLine($"[seeder] UI at http://localhost:{backend.Server.Port}/ (wwwroot={uiRoot ?? "(embedded fallback)"})");
            Dispatcher.UIThread.Post(() =>
            {
                _web.Source = new Uri($"http://127.0.0.1:{Port}/");
            });

            _web.NavigationCompleted += (_, e) =>
            {
                if (e.IsSuccess)
                    Dispatcher.UIThread.Post(() => _splash.IsVisible = false);
            };
        }
        catch (Exception ex)
        {
            Console.WriteLine($"[seeder] start failed: {ex}");
            Dispatcher.UIThread.Post(() =>
            {
                if (_splash.Child is TextBlock tb) tb.Text = "Start failed — see console";
            });
        }
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

    private async Task StopAsync()
    {
        if (_host is { } host)
        {
            try { await host.StopAsync(); } catch { /* ignore */ }
            host.Dispose();
        }
        _hostLoop?.Dispose();
        _host = null;
        _hostLoop = null;
    }
}

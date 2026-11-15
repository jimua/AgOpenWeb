using System;
using System.IO;
using System.Threading.Tasks;
using Avalonia.Controls;
using Avalonia.Layout;
using Avalonia.Media;
using Avalonia.Threading;
using NativeWebView = Avalonia.Controls.NativeWebView;

namespace SeederTerminal.Desktop;

/// <summary>Starts AgOpenWeb WebBackend on :5175 serving SeederTerminal Vite dist + WebView.</summary>
public sealed class MainWindow : Window
{
    public const int Port = SeederBackend.ProductPort;

    private const string LauncherErrorLogName = "seeder-terminal-launcher-error.log";

    private readonly NativeWebView _web = new()
    {
        HorizontalAlignment = HorizontalAlignment.Stretch,
        VerticalAlignment = VerticalAlignment.Stretch,
        IsVisible = false,
    };
    private readonly Border _splash;
    private Task<SeederBackend>? _backendStart;
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

            _backendStart = Task.Run(() => SeederBackend.StartAsync(Port, uiRoot));
            await _backendStart;
            if (_closing) return;

            _web.IsVisible = true;
            _web.Source = new Uri($"http://127.0.0.1:{Port}/");
        }
        catch (Exception ex)
        {
            var log = Path.Combine(Path.GetTempPath(), LauncherErrorLogName);
            try { File.WriteAllText(log, ex.ToString()); } catch { /* best effort */ }
            if (_closing) return;
            if (_backendStart is { IsCompletedSuccessfully: false })
                _backendStart = null;

            _splash.IsVisible = true;
            _splash.Child = SplashText(
                $"Seeder Terminal failed to start.\n\n{ex.Message}\n\nDetails: {log}");
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

    protected override void OnClosing(WindowClosingEventArgs e)
    {
        if (_backendStart is { } backendStart)
        {
            e.Cancel = true;
            if (!_closing)
            {
                _closing = true;
                _ = StopThenCloseAsync(backendStart);
            }
        }
        base.OnClosing(e);
    }

    private async Task StopThenCloseAsync(Task<SeederBackend> backendStart)
    {
        await Task.Yield();
        try
        {
            var backend = await backendStart;
            await Task.Run(async () => await backend.DisposeAsync());
        }
        catch { /* close regardless */ }
        _backendStart = null;
        Close();
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

using System;
using System.IO;
using Avalonia;

namespace SeederTerminal.Desktop;

internal static class Program
{
    private const string CrashLogName = "seeder-terminal-crash.log";

    [STAThread]
    public static void Main(string[] args)
    {
        AppDomain.CurrentDomain.UnhandledException += (_, e) =>
        {
            if (e.ExceptionObject is Exception ex)
            {
                var log = Path.Combine(Path.GetTempPath(), CrashLogName);
                try { File.WriteAllText(log, ex.ToString()); } catch { /* best effort */ }
            }
        };

        if (Array.IndexOf(args, "--dev-backend") >= 0)
        {
            RunDevBackendAsync().GetAwaiter().GetResult();
            return;
        }

        AppBuilder.Configure<App>()
            .UsePlatformDetect()
            .WithInterFont()
            .LogToTrace()
            .StartWithClassicDesktopLifetime(args);
    }

    private static async Task RunDevBackendAsync()
    {
        await using var backend = await SeederBackend.StartAsync(SeederBackend.DevPort, uiRoot: null);
        Console.WriteLine($"[seeder] Development backend listening on http://localhost:{SeederBackend.DevPort}/");
        await backend.WaitForShutdownAsync();
    }
}

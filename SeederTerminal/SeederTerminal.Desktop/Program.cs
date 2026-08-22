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

        AppBuilder.Configure<App>()
            .UsePlatformDetect()
            .WithInterFont()
            .LogToTrace()
            .StartWithClassicDesktopLifetime(args);
    }
}

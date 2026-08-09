namespace SeederTerminal.Android;

/// <summary>
/// Android host constants. The APK shell should start <c>WebBackend.StartAsync(..., Port, uiRoot)</c>
/// on a foreground service (same pattern as <c>AgOpenWeb.Android.AndroidBackendHost</c>) and
/// navigate <c>NativeWebView</c> to <c>http://127.0.0.1:5175/</c>.
/// </summary>
public static class SeederAndroidHost
{
    public const int Port = 5175;

    /// <summary>Relative path under the app's files dir where Vite <c>dist/</c> is unpacked.</summary>
    public const string WwwRootFolderName = "wwwroot";
}

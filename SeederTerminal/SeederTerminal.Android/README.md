# SeederTerminal.Android

Product Android head for Seeder Terminal (port **5175**).

## v1 status

Host contract lives in `SeederAndroidHost` (`Port = 5175`, `wwwroot` folder name). The full Avalonia APK shell (foreground `BackendService` + `NativeWebView`) should mirror [`Platforms/AgOpenWeb.Android`](../../Platforms/AgOpenWeb.Android) with:

```csharp
await WebBackend.StartAsync(provider, imageryCapture, SeederAndroidHost.Port, uiContentRoot);
```

Until that APK is wired, use **Desktop** on the cab tablet or browse `http://<device-ip>:5175` from an Android browser on the tractor LAN.

## Must-have path

1. Copy AgOpenWeb.Android `BackendService` / `AndroidBackendHost` pattern.
2. Pass Seeder Vite `dist/` as `uiContentRoot` (assets unpacked on first run).
3. WebView → `http://127.0.0.1:5175/`.

using AgOpenWeb.RemoteWiring;

namespace SeederTerminal.Core;

/// <summary>No-op boundary imagery for Seeder hosts (v1 does not draw-boundary-on-map).</summary>
public sealed class NullBoundaryImageryCapture : IBoundaryImageryCapture
{
    public Task<bool> TryCaptureAsync(
        double mercMinX, double mercMaxX, double mercMinY, double mercMaxY, string outPath)
        => Task.FromResult(false);
}

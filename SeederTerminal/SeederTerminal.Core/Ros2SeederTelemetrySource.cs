namespace SeederTerminal.Core;

/// <summary>Placeholder for a future ROS2 bridge (GPS + planter metrics).</summary>
public sealed class Ros2SeederTelemetrySource : ISeederTelemetrySource
{
    public IReadOnlyList<SeederSectionSample> Sections { get; } = Array.Empty<SeederSectionSample>();
    public double TotalSingulationPercent => 0;
    public double SeedRateSetpoint => 0;
    public double SeedRateActual => 0;

    public void Tick(IReadOnlyList<int> sectionColorCodes)
    {
        // Not implemented in v1 — wire DDS/ROS2 subscriptions here later.
        _ = sectionColorCodes;
    }
}

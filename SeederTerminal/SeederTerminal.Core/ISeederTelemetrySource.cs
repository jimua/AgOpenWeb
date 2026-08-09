namespace SeederTerminal.Core;

/// <summary>Seeder row telemetry (singulation, rates). Simulated in v1; ROS2 later.</summary>
public interface ISeederTelemetrySource
{
    IReadOnlyList<SeederSectionSample> Sections { get; }
    double TotalSingulationPercent { get; }
    double SeedRateSetpoint { get; }
    double SeedRateActual { get; }
    void Tick(IReadOnlyList<int> sectionColorCodes);
}

public readonly record struct SeederSectionSample(int Index, bool IsOn, double SingulationPercent);

namespace SeederTerminal.Core;

/// <summary>Client/host-side stand-in until ROS2 publishes real planter telemetry.</summary>
public sealed class SimulatedSeederTelemetrySource : ISeederTelemetrySource
{
    private readonly Random _rng = new();
    private List<SeederSectionSample> _sections = new();

    public IReadOnlyList<SeederSectionSample> Sections => _sections;
    public double TotalSingulationPercent { get; private set; }
    public double SeedRateSetpoint { get; set; } = 182_000;
    public double SeedRateActual { get; private set; }

    public void Tick(IReadOnlyList<int> sectionColorCodes)
    {
        var count = Math.Max(sectionColorCodes.Count, 1);
        var next = new List<SeederSectionSample>(count);
        for (var i = 0; i < count; i++)
        {
            var code = i < sectionColorCodes.Count ? sectionColorCodes[i] : 0;
            var isOn = code > 0 && code != 4;
            var pct = isOn ? Clamp(97 + (_rng.NextDouble() - 0.5) * 6, 0, 100) : 0;
            next.Add(new SeederSectionSample(i + 1, isOn, pct));
        }
        _sections = next;
        var on = next.Where(s => s.IsOn).ToList();
        TotalSingulationPercent = on.Count == 0 ? 0 : on.Average(s => s.SingulationPercent);
        var participation = next.Count == 0 ? 0 : (double)on.Count / next.Count;
        SeedRateActual = SeedRateSetpoint * participation * (0.96 + _rng.NextDouble() * 0.08);
    }

    private static double Clamp(double v, double lo, double hi) => Math.Max(lo, Math.Min(hi, v));
}

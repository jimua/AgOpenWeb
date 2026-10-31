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
        if (sectionColorCodes.Count == 0)
        {
            _sections = new List<SeederSectionSample>();
            TotalSingulationPercent = 0;
            SeedRateActual = 0;
            return;
        }

        var count = sectionColorCodes.Count;
        var next = new List<SeederSectionSample>(count);
        for (var i = 0; i < count; i++)
        {
            var code = sectionColorCodes[i];
            // Planting: color codes 1 (manual-on), 2 (auto-on), 3 (turning-off)
            // Not planting: 0 (off), 4 (turning-on), 5 (auto-off)
            var isOn = code is 1 or 2 or 3;
            var pct = isOn ? Clamp(97 + (_rng.NextDouble() - 0.5) * 6, 0, 100) : 0;
            var rate = isOn ? SeedRateSetpoint * (0.96 + _rng.NextDouble() * 0.08) : 0;
            next.Add(new SeederSectionSample(i + 1, isOn, pct, rate));
        }
        _sections = next;
        var on = next.Where(s => s.IsOn).ToList();
        TotalSingulationPercent = on.Count == 0 ? 0 : on.Average(s => s.SingulationPercent);
        SeedRateActual = on.Count == 0 ? 0 : on.Average(s => s.SeedRateActual);
    }

    private static double Clamp(double v, double lo, double hi) => Math.Max(lo, Math.Min(hi, v));
}

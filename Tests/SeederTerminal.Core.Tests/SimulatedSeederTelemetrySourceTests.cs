using System.Linq;
using NUnit.Framework;
using SeederTerminal.Core;

namespace SeederTerminal.Core.Tests;

[TestFixture]
public sealed class SimulatedSeederTelemetrySourceTests
{
    [Test]
    public void Tick_EmptyCodes_ProducesEmptySectionsAndZeroTotals()
    {
        var source = new SimulatedSeederTelemetrySource();
        source.Tick([]);

        Assert.That(source.Sections, Is.Empty);
        Assert.That(source.TotalSingulationPercent, Is.EqualTo(0));
        Assert.That(source.SeedRateActual, Is.EqualTo(0));
    }

    [Test]
    public void Tick_NCodes_ProducesNSamples()
    {
        var source = new SimulatedSeederTelemetrySource();
        var codes = new[] { 1, 2, 3, 0, 4, 5 };
        source.Tick(codes);

        Assert.That(source.Sections.Count, Is.EqualTo(6));
        for (int i = 0; i < codes.Length; i++)
        {
            Assert.That(source.Sections[i].Index, Is.EqualTo(i + 1));
        }
    }

    [Test]
    public void Tick_Codes0_4_5_AreZeroesAndNotOn()
    {
        var source = new SimulatedSeederTelemetrySource();
        source.Tick([0, 4, 5]);

        Assert.That(source.Sections.Count, Is.EqualTo(3));
        foreach (var sec in source.Sections)
        {
            Assert.That(sec.IsOn, Is.False);
            Assert.That(sec.SingulationPercent, Is.EqualTo(0));
            Assert.That(sec.SeedRateActual, Is.EqualTo(0));
        }
        Assert.That(source.TotalSingulationPercent, Is.EqualTo(0));
        Assert.That(source.SeedRateActual, Is.EqualTo(0));
    }

    [Test]
    public void Tick_Codes1_2_3_AreNonZeroAndOn()
    {
        var source = new SimulatedSeederTelemetrySource();
        source.Tick([1, 2, 3]);

        Assert.That(source.Sections.Count, Is.EqualTo(3));
        foreach (var sec in source.Sections)
        {
            Assert.That(sec.IsOn, Is.True);
            Assert.That(sec.SingulationPercent, Is.GreaterThan(80));
            Assert.That(sec.SeedRateActual, Is.GreaterThan(100_000));
        }
        Assert.That(source.TotalSingulationPercent, Is.GreaterThan(80));
        Assert.That(source.SeedRateActual, Is.GreaterThan(100_000));
    }

    [Test]
    public void Tick_HeaderActualAndSingulation_IsMeanOfPlantingRows()
    {
        var source = new SimulatedSeederTelemetrySource();
        source.Tick([1, 0, 2, 4, 3, 5]);

        var planting = source.Sections.Where(s => s.IsOn).ToList();
        Assert.That(planting.Count, Is.EqualTo(3));

        var expectedSingulation = planting.Average(s => s.SingulationPercent);
        var expectedSeedRate = planting.Average(s => s.SeedRateActual);

        Assert.That(source.TotalSingulationPercent, Is.EqualTo(expectedSingulation).Within(1e-5));
        Assert.That(source.SeedRateActual, Is.EqualTo(expectedSeedRate).Within(1e-5));
    }
}

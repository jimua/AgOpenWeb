using System;
using System.Collections.Generic;
using NUnit.Framework;
using SeederTerminal.Core;

namespace SeederTerminal.Core.Tests;

[TestFixture]
public sealed class SeederTelemetryCodecTests
{
    private sealed class MockSource : ISeederTelemetrySource
    {
        public IReadOnlyList<SeederSectionSample> Sections { get; set; } = Array.Empty<SeederSectionSample>();
        public double TotalSingulationPercent { get; set; }
        public double SeedRateSetpoint { get; set; } = 182_000;
        public double SeedRateActual { get; set; }
        public void Tick(IReadOnlyList<int> sectionColorCodes) { }
    }

    [Test]
    public void Encode_EmptySections_ReturnsEmptyArray()
    {
        var source = new MockSource();
        var bytes = SeederTelemetryCodec.Encode(source);
        Assert.That(bytes, Is.Empty);
    }

    [Test]
    public void EncodeDecode_RoundTrip_PreservesValues()
    {
        var sections = new List<SeederSectionSample>
        {
            new(1, true, 97.4, 181_500.2),
            new(2, false, 0, 0),
            new(3, true, 98.1, 183_200.5),
        };

        var source = new MockSource
        {
            SeedRateSetpoint = 182_000,
            SeedRateActual = 182_350.35,
            TotalSingulationPercent = 97.75,
            Sections = sections
        };

        var bytes = SeederTelemetryCodec.Encode(source);
        Assert.That(bytes.Length, Is.EqualTo(1 + 8 + 8 + 8 + 4 + (3 * (1 + 4 + 4))));

        var payload = SeederTelemetryCodec.Decode(bytes);
        Assert.That(payload, Is.Not.Null);

        var p = payload.Value;
        Assert.That(p.SeedRateSetpoint, Is.EqualTo(182_000).Within(1e-5));
        Assert.That(p.SeedRateActual, Is.EqualTo(182_350.35).Within(1e-5));
        Assert.That(p.TotalSingulationPercent, Is.EqualTo(97.75).Within(1e-5));
        Assert.That(p.Sections.Count, Is.EqualTo(3));

        Assert.That(p.Sections[0].Index, Is.EqualTo(1));
        Assert.That(p.Sections[0].IsOn, Is.True);
        Assert.That(p.Sections[0].SingulationPercent, Is.EqualTo(97.4).Within(1e-3));
        Assert.That(p.Sections[0].SeedRateActual, Is.EqualTo(181_500.2).Within(1.0));

        Assert.That(p.Sections[1].Index, Is.EqualTo(2));
        Assert.That(p.Sections[1].IsOn, Is.False);
        Assert.That(p.Sections[1].SingulationPercent, Is.EqualTo(0));
        Assert.That(p.Sections[1].SeedRateActual, Is.EqualTo(0));

        Assert.That(p.Sections[2].Index, Is.EqualTo(3));
        Assert.That(p.Sections[2].IsOn, Is.True);
        Assert.That(p.Sections[2].SingulationPercent, Is.EqualTo(98.1).Within(1e-3));
        Assert.That(p.Sections[2].SeedRateActual, Is.EqualTo(183_200.5).Within(1.0));
    }

    [Test]
    public void Decode_InvalidHeader_ReturnsNull()
    {
        var shortData = new byte[10];
        Assert.That(SeederTelemetryCodec.Decode(shortData), Is.Null);

        var wrongType = new byte[29];
        wrongType[0] = 99; // invalid type
        Assert.That(SeederTelemetryCodec.Decode(wrongType), Is.Null);
    }
}

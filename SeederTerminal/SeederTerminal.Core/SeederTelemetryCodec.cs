using System;
using System.Collections.Generic;
using System.IO;

namespace SeederTerminal.Core;

public readonly record struct SeederTelemetryPayload(
    double SeedRateSetpoint,
    double SeedRateActual,
    double TotalSingulationPercent,
    IReadOnlyList<SeederSectionSample> Sections);

public static class SeederTelemetryCodec
{
    public const byte MessageType = 22;

    public static byte[] Encode(ISeederTelemetrySource source)
    {
        if (source.Sections.Count == 0) return Array.Empty<byte>();

        using var ms = new MemoryStream();
        using var w = new BinaryWriter(ms);
        w.Write(MessageType);
        w.Write(source.SeedRateSetpoint);
        w.Write(source.SeedRateActual);
        w.Write(source.TotalSingulationPercent);
        w.Write(source.Sections.Count);

        foreach (var sec in source.Sections)
        {
            w.Write((byte)(sec.IsOn ? 1 : 0));
            w.Write((float)sec.SingulationPercent);
            w.Write((float)sec.SeedRateActual);
        }

        return ms.ToArray();
    }

    public static SeederTelemetryPayload? Decode(ReadOnlySpan<byte> data)
    {
        if (data.Length < 1 + 8 + 8 + 8 + 4) return null;

        using var ms = new MemoryStream(data.ToArray());
        using var r = new BinaryReader(ms);

        var type = r.ReadByte();
        if (type != MessageType) return null;

        var setpoint = r.ReadDouble();
        var actual = r.ReadDouble();
        var totalSingulation = r.ReadDouble();
        var count = r.ReadInt32();

        if (count < 0) return null;

        var sections = new List<SeederSectionSample>(count);
        for (int i = 0; i < count; i++)
        {
            var isOn = r.ReadByte() != 0;
            var singulation = (double)r.ReadSingle();
            var rate = (double)r.ReadSingle();
            sections.Add(new SeederSectionSample(i + 1, isOn, singulation, rate));
        }

        return new SeederTelemetryPayload(setpoint, actual, totalSingulation, sections);
    }
}

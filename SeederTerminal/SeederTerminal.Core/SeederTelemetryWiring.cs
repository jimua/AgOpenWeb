using System;
using AgOpenWeb.Models.Configuration;
using AgOpenWeb.RemoteServer;
using AgOpenWeb.Services.Interfaces;

namespace SeederTerminal.Core;

public static class SeederTelemetryWiring
{
    public static void Attach(
        RemoteServerHost server,
        ISeederTelemetrySource source,
        ISectionControlService sections)
    {
        var sync = new object();
        server.ExtraFrameProvider = () =>
        {
            lock (sync)
            {
                var secStates = sections.SectionStates;
                int n = Math.Clamp(sections.NumSections, 0, ToolConfig.MaxSections);
                if (n == 0)
                {
                    source.Tick(Array.Empty<int>());
                    return null;
                }

                var codes = new int[n];
                for (int i = 0; i < n && i < secStates.Count; i++)
                    codes[i] = secStates[i].ColorCode;

                source.Tick(codes);
                var frame = SeederTelemetryCodec.Encode(source);
                return frame.Length > 0 ? frame : null;
            }
        };
    }
}

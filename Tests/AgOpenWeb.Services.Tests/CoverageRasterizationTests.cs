using AgOpenWeb.Models.Base;
using AgOpenWeb.Models.Configuration;
using AgOpenWeb.Services.Coverage;

namespace AgOpenWeb.Services.Tests;

[TestFixture]
public class CoverageRasterizationTests
{
    private static CoverageMapService NewService()
    {
        var service = new CoverageMapService(new ConfigurationStore());
        service.SetFieldBounds(-1, 1, -1, 1);
        return service;
    }

    private static HashSet<(int X, int Y)> Cells(CoverageMapService service)
    {
        return service.GetCoverageBitmapCells(0.1, -1, 1, -1, 1)
            .Select(cell => (cell.CellX, cell.CellY))
            .ToHashSet();
    }

    private static void AssertHasAdjacentColumns(HashSet<(int X, int Y)> cells)
    {
        var columns = cells.Select(cell => cell.X).Distinct().OrderBy(x => x).ToArray();
        Assert.That(columns.Length, Is.GreaterThanOrEqualTo(2));
        Assert.That(columns.Zip(columns.Skip(1), (left, right) => right - left), Does.Contain(1));
    }

    [Test]
    public void SubCellMovementPaintsTheSweptCellRow()
    {
        var service = NewService();
        service.StartMapping(0, new Vec2(0, 0), new Vec2(0.2, 0));
        service.AddCoveragePoint(0, new Vec2(0, 0.03), new Vec2(0.2, 0.03));

        var cells = Cells(service);

        AssertHasAdjacentColumns(cells);
    }

    [Test]
    public void AbuttingSectionsPaintContinuouslyAcrossTheSharedSeam()
    {
        var service = NewService();
        service.StartMapping(0, new Vec2(0, 0), new Vec2(0.1, 0));
        service.StartMapping(1, new Vec2(0.1, 0), new Vec2(0.2, 0));
        service.AddCoveragePoint(0, new Vec2(0, 0.03), new Vec2(0.1, 0.03));
        service.AddCoveragePoint(1, new Vec2(0.1, 0.03), new Vec2(0.2, 0.03));

        var cells = Cells(service);

        AssertHasAdjacentColumns(cells);
    }
}

import re
import unittest
from pathlib import Path


APP_JS_PATH = Path(__file__).resolve().parent.parent / "app.js"


class TestRoadmapAndReportRegression(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.source = APP_JS_PATH.read_text(encoding="utf-8")

    def test_roadmap_constraints_use_company_profile_context(self):
        src = self.source
        self.assertIn("function roadmapScenarioConstraints(assessment)", src)
        self.assertIn("const context = assessment.data.context || {};", src)
        self.assertIn("const sizeBand = normalizeOrgSizeBand(context.size);", src)
        self.assertIn("const frameworks = getApplicableFrameworks(context);", src)
        self.assertIn("const hasHeavyRegulatory =", src)
        self.assertRegex(src, r"Context sizing: .*size not specified")
        self.assertIn("Context regulation: higher evidence burden", src)

    def test_roadmap_rows_tailor_duration_and_priority_from_context(self):
        src = self.source
        self.assertIn("function roadmapRows(assessment)", src)
        self.assertIn("const contextCompletenessFactor =", src)
        self.assertIn("const sizeDurationFactor =", src)
        self.assertIn("const heightenedRegulatoryScope =", src)
        self.assertIn("durationWeeks = Math.max(2, Math.round(durationWeeks * sizeDurationFactor * contextCompletenessFactor));", src)
        self.assertIn("Delivery pacing aligned to organisation size", src)
        self.assertIn("Tailored for geography:", src)
        self.assertIn("Tailored for sector:", src)

    def test_report_moves_roadmap_chart_to_landscape_appendix(self):
        src = self.source
        self.assertIn("@page roadmap-landscape", src)
        self.assertIn(".appendix-roadmap.landscape", src)
        self.assertIn("Detailed roadmap chart is provided in Appendix A in landscape format", src)
        self.assertIn("Appendix A: Detailed Roadmap Timeline (Landscape)", src)
        self.assertIn("timeline-img timeline-img-appendix", src)

    def test_roadmap_timeline_has_week_or_month_markers(self):
        src = self.source
        self.assertIn("function roadmapRulerMarkers(timeline)", src)
        self.assertIn("const mode = timeline.planningWeeks <= 14 ? \"week\" : \"month\";", src)
        self.assertIn("Timeline markers:", src)
        self.assertIn("timeline-ruler-marker", src)

    def test_export_canvas_limits_rows_to_avoid_overlap(self):
        src = self.source
        self.assertIn("const maxRows = Math.max(4, Math.floor((canvas.height - firstRowY - bottomPadding) / rowGap));", src)
        self.assertIn("const items = timeline.items.slice(0, maxRows);", src)
        self.assertIn("const fitText = (text, maxWidth) => {", src)


if __name__ == "__main__":
    unittest.main()

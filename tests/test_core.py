import unittest

from align42_core import (
    build_mailto_draft,
    build_openai_payload,
    completion_percent,
    compliance_status,
    mask_sensitive_text,
    normalize_evidence_url,
    valid_transition,
    weighted_score_percent,
)
from tests.synthetic_data import (
    synthetic_context,
    synthetic_context_requirements,
    synthetic_controls,
    synthetic_profile,
    synthetic_ratings_mid_maturity,
)


class TestCoreWithSyntheticData(unittest.TestCase):
    def setUp(self):
        self.controls = synthetic_controls()
        self.required_context = synthetic_context_requirements()
        self.context = synthetic_context()

    def test_weighted_score_percent(self):
        ratings = synthetic_ratings_mid_maturity()
        self.assertEqual(weighted_score_percent(self.controls, ratings), 66)

    def test_completion_percent(self):
        ratings = {"c1": 5, "c2": 3, "c3": 0, "c4": 2}
        self.assertEqual(
            completion_percent(self.required_context, self.controls, self.context, ratings),
            92,
        )

    def test_compliance_status(self):
        self.assertEqual(compliance_status(4), "Compliant")
        self.assertEqual(compliance_status(3.9), "Non-compliant")

    def test_transition_rules(self):
        self.assertTrue(valid_transition("SENT", "RESPONDED"))
        self.assertTrue(valid_transition("SENT", "CLOSED"))
        self.assertFalse(valid_transition("CLOSED", "RESPONDED"))

    def test_mask_sensitive_text(self):
        src = "Contact alex@company.com or 415-555-1212. Track at https://internal.local/a and host 10.1.2.3"
        masked = mask_sensitive_text(src, ["company"])
        self.assertIn("[EMAIL]", masked)
        self.assertIn("[PHONE]", masked)
        self.assertIn("[URL]", masked)
        self.assertIn("[IP]", masked)

    def test_mailto_draft(self):
        draft = build_mailto_draft("x@y.com", "Hello", "Line 1\nLine 2")
        self.assertTrue(draft.startswith("mailto:x%40y.com"))
        self.assertIn("subject=Hello", draft)

    def test_normalize_evidence_url(self):
        self.assertEqual(normalize_evidence_url("https://example.com/doc"), "https://example.com/doc")
        self.assertEqual(normalize_evidence_url("javascript:alert(1)"), "")
        self.assertEqual(normalize_evidence_url("data:text/plain,abc"), "")

    def test_openai_payload_is_masked(self):
        payload = build_openai_payload(
            mode="interpret",
            control=self.controls[0],
            response_text="Owner is Alex at alex@company.com",
            context=self.context,
            profile=synthetic_profile(),
        )
        serialized = str(payload)
        self.assertIn("[EMAIL]", serialized)
        self.assertTrue(payload["masked"])


if __name__ == "__main__":
    unittest.main()

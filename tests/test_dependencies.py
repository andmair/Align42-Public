import unittest

from align42_adapters import DictationAdapter, EmailClientAdapter, OpenAIAdapter, ProviderAIAdapter
from tests.synthetic_data import (
    synthetic_context,
    synthetic_controls,
    synthetic_profile,
)


class TestExternalDependencyAdapters(unittest.TestCase):
    def setUp(self):
        control = synthetic_controls()[0]
        self.control = {
            "control": control["control"],
            "prompt": control["prompt"],
            "bestPractice": control["bestPractice"],
        }
        self.context = synthetic_context()
        self.profile = synthetic_profile()

    def test_openai_adapter_success(self):
        calls = []

        def fake_request(url, headers, payload):
            calls.append((url, headers, payload))
            return {"status": 200, "output_text": "ok summary"}

        adapter = OpenAIAdapter(fake_request)
        result = adapter.run(
            api_key="sk-test",
            mode="interpret",
            control=self.control,
            response_text="Policy exists",
            context=self.context,
            profile=self.profile,
        )

        self.assertEqual(result, "ok summary")
        self.assertEqual(len(calls), 1)
        self.assertEqual(calls[0][0], "https://api.openai.com/v1/responses")
        self.assertIn("Authorization", calls[0][1])
        self.assertIn("masked", calls[0][2])

    def test_openai_adapter_error(self):
        def fake_request(url, headers, payload):
            return {"status": 429, "error": "rate limited"}

        adapter = OpenAIAdapter(fake_request)
        with self.assertRaises(RuntimeError):
            adapter.run(
                api_key="sk-test",
                mode="example",
                control=self.control,
                response_text="x",
                context=self.context,
                profile=self.profile,
            )

    def test_dictation_adapter_supported(self):
        created = {"ok": False}

        def factory():
            created["ok"] = True
            return object()

        adapter = DictationAdapter(factory)
        self.assertTrue(adapter.supported())
        _ = adapter.create()
        self.assertTrue(created["ok"])

    def test_dictation_adapter_unsupported(self):
        adapter = DictationAdapter(None)
        self.assertFalse(adapter.supported())
        with self.assertRaises(RuntimeError):
            adapter.create()

    def test_email_client_adapter_draft_invocation(self):
        called = {"url": ""}

        def fake_navigate(url):
            called["url"] = url

        adapter = EmailClientAdapter(fake_navigate)
        self.assertTrue(adapter.supported())
        draft = adapter.open_draft(
            "delegate@example.com",
            "Align42 Delegation Request",
            "Please respond under each question.",
        )
        self.assertEqual(called["url"], draft)
        self.assertTrue(draft.startswith("mailto:delegate%40example.com"))
        self.assertIn("subject=Align42%20Delegation%20Request", draft)

    def test_email_client_adapter_unsupported(self):
        adapter = EmailClientAdapter(None)
        self.assertFalse(adapter.supported())
        with self.assertRaises(RuntimeError):
            adapter.open_draft("x@y.com", "s", "b")

    def test_provider_adapter_openai(self):
        calls = []

        def fake_request(url, headers, payload):
            calls.append((url, headers, payload))
            return {"status": 200, "output_text": "openai ok"}

        adapter = ProviderAIAdapter(fake_request)
        out = adapter.run(
            "openai",
            {"openai_key": "sk-test"},
            "interpret",
            self.control,
            "Policy exists",
            self.context,
            self.profile,
        )
        self.assertEqual(out, "openai ok")
        self.assertEqual(calls[0][0], "https://api.openai.com/v1/responses")

    def test_provider_adapter_anthropic(self):
        def fake_request(url, headers, payload):
            self.assertEqual(url, "https://api.anthropic.com/v1/messages")
            self.assertIn("x-api-key", headers)
            return {"status": 200, "content": [{"type": "text", "text": "claude ok"}]}

        adapter = ProviderAIAdapter(fake_request)
        out = adapter.run(
            "anthropic",
            {"anthropic_key": "ak-test"},
            "interpret",
            self.control,
            "Policy exists",
            self.context,
            self.profile,
        )
        self.assertEqual(out, "claude ok")

    def test_provider_adapter_gemini(self):
        def fake_request(url, headers, payload):
            self.assertIn("generativelanguage.googleapis.com", url)
            return {"status": 200, "candidates": [{"content": {"parts": [{"text": "gemini ok"}]}}]}

        adapter = ProviderAIAdapter(fake_request)
        out = adapter.run(
            "gemini",
            {"gemini_key": "gk-test"},
            "interpret",
            self.control,
            "Policy exists",
            self.context,
            self.profile,
        )
        self.assertEqual(out, "gemini ok")

    def test_provider_adapter_azure_openai(self):
        def fake_request(url, headers, payload):
            self.assertIn("/openai/deployments/", url)
            self.assertIn("api-version=", url)
            self.assertIn("api-key", headers)
            return {"status": 200, "choices": [{"message": {"content": "azure ok"}}]}

        adapter = ProviderAIAdapter(fake_request)
        out = adapter.run(
            "azure_openai",
            {
                "azure_api_key": "az-test",
                "azure_endpoint": "https://example.openai.azure.com",
                "azure_deployment": "gpt-4o-mini",
                "azure_api_version": "2024-10-21",
            },
            "interpret",
            self.control,
            "Policy exists",
            self.context,
            self.profile,
        )
        self.assertEqual(out, "azure ok")


if __name__ == "__main__":
    unittest.main()

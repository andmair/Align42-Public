from align42_core import build_mailto_draft, build_openai_payload
from urllib.parse import quote


class OpenAIAdapter:
    def __init__(self, request_fn):
        self.request_fn = request_fn

    def run(self, api_key, mode, control, response_text, context, profile):
        payload = build_openai_payload(mode, control, response_text, context, profile)
        response = self.request_fn(
            "https://api.openai.com/v1/responses",
            {
                "Authorization": f"Bearer {api_key}",
                "Content-Type": "application/json",
            },
            payload,
        )
        if response.get("status", 500) >= 400:
            raise RuntimeError(response.get("error", f"OpenAI error ({response.get('status')})"))
        if "output_text" in response and response["output_text"]:
            return response["output_text"]
        out = []
        for item in response.get("output", []):
            for c in item.get("content", []):
                if c.get("type") in {"output_text", "text"} and c.get("text"):
                    out.append(c["text"])
        return "\n".join(out).strip() or "No output returned."


class DictationAdapter:
    def __init__(self, speech_recognition_factory=None):
        self.speech_recognition_factory = speech_recognition_factory

    def supported(self):
        return self.speech_recognition_factory is not None

    def create(self):
        if not self.supported():
            raise RuntimeError("Speech recognition not supported")
        return self.speech_recognition_factory()


class ProviderAIAdapter:
    def __init__(self, request_fn):
        self.request_fn = request_fn

    def run(self, provider, settings, mode, control, response_text, context, profile):
        p = (provider or "openai").lower()
        payload = build_openai_payload(mode, control, response_text, context, profile)
        system = payload["input"][0]["content"][0]["text"]
        user = payload["input"][1]["content"][0]["text"]

        if p == "openai":
            response = self.request_fn(
                "https://api.openai.com/v1/responses",
                {
                    "Authorization": f"Bearer {settings.get('openai_key', '')}",
                    "Content-Type": "application/json",
                },
                payload,
            )
            if response.get("status", 500) >= 400:
                raise RuntimeError(response.get("error", f"OpenAI error ({response.get('status')})"))
            return response.get("output_text") or "No output returned."

        if p == "anthropic":
            req = {
                "model": "claude-3-5-sonnet-latest",
                "max_tokens": 1200,
                "system": system,
                "messages": [{"role": "user", "content": user}],
            }
            response = self.request_fn(
                "https://api.anthropic.com/v1/messages",
                {
                    "x-api-key": settings.get("anthropic_key", ""),
                    "anthropic-version": "2023-06-01",
                    "Content-Type": "application/json",
                },
                req,
            )
            if response.get("status", 500) >= 400:
                raise RuntimeError(response.get("error", f"Anthropic error ({response.get('status')})"))
            text = "\n".join(c.get("text", "") for c in response.get("content", []) if c.get("type") == "text").strip()
            return text or "No output returned."

        if p == "gemini":
            key = settings.get("gemini_key", "")
            url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key=" + quote(key)
            req = {"contents": [{"role": "user", "parts": [{"text": f"{system}\n\n{user}"}]}]}
            response = self.request_fn(url, {"Content-Type": "application/json"}, req)
            if response.get("status", 500) >= 400:
                raise RuntimeError(response.get("error", f"Gemini error ({response.get('status')})"))
            candidates = response.get("candidates", [])
            parts = (((candidates[0] if candidates else {}).get("content") or {}).get("parts") or [])
            text = "\n".join(p.get("text", "") for p in parts if p.get("text")).strip()
            return text or "No output returned."

        if p == "azure_openai":
            endpoint = (settings.get("azure_endpoint") or "").rstrip("/")
            deployment = settings.get("azure_deployment") or ""
            api_version = settings.get("azure_api_version") or "2024-10-21"
            url = f"{endpoint}/openai/deployments/{quote(deployment)}/chat/completions?api-version={quote(api_version)}"
            req = {
                "messages": [
                    {"role": "system", "content": system},
                    {"role": "user", "content": user},
                ],
                "temperature": 0.2,
            }
            response = self.request_fn(
                url,
                {"api-key": settings.get("azure_api_key", ""), "Content-Type": "application/json"},
                req,
            )
            if response.get("status", 500) >= 400:
                raise RuntimeError(response.get("error", f"Azure OpenAI error ({response.get('status')})"))
            return ((((response.get("choices") or [{}])[0].get("message") or {}).get("content")) or "").strip() or "No output returned."

        raise RuntimeError(f"Unsupported provider: {provider}")


class EmailClientAdapter:
    def __init__(self, navigate_fn=None):
        self.navigate_fn = navigate_fn

    def supported(self):
        return callable(self.navigate_fn)

    def open_draft(self, to_email, subject, body):
        if not self.supported():
            raise RuntimeError("Email client invocation not supported")
        draft = build_mailto_draft(to_email, subject, body)
        self.navigate_fn(draft)
        return draft

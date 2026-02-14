import re
from urllib.parse import quote, urlparse


def compliance_status(score):
    return "Compliant" if float(score or 0) >= 4 else "Non-compliant"


def weighted_score_percent(controls, ratings):
    weighted_max = sum(c.get("weight", 0) for c in controls)
    if weighted_max == 0:
        return 0
    weighted = 0.0
    for c in controls:
        score = float(ratings.get(c["id"], 0) or 0)
        weighted += (score / 5.0) * c.get("weight", 0)
    return round((weighted / weighted_max) * 100)


def completion_percent(required_context_keys, controls, context, ratings):
    context_done = sum(1 for k in required_context_keys if str(context.get(k, "")).strip())
    controls_done = sum(1 for c in controls if float(ratings.get(c["id"], 0) or 0) > 0)
    total = len(required_context_keys) + len(controls)
    if total == 0:
        return 0
    return round(((context_done + controls_done) / total) * 100)


def valid_transition(current_status, target_status):
    cur = (current_status or "SENT").upper()
    tgt = (target_status or "").upper()
    allowed = {
        "SENT": {"RESPONDED", "CLOSED"},
        "RESPONDED": {"CLOSED"},
        "CLOSED": set(),
    }
    if cur == tgt:
        return True
    return tgt in allowed.get(cur, set())


def mask_sensitive_text(text, sensitive_terms=None):
    out = str(text or "")
    out = re.sub(r"[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}", "[EMAIL]", out)
    out = re.sub(r"\b(?:\+?\d{1,3}[-.\s]?)?(?:\(?\d{2,4}\)?[-.\s]?)?\d{3}[-.\s]?\d{4}\b", "[PHONE]", out)
    out = re.sub(r"\b(?:\d[ -]*?){13,19}\b", "[ACCOUNT_OR_CARD]", out)
    out = re.sub(r"\b\d{3}-\d{2}-\d{4}\b", "[NATIONAL_ID]", out)
    out = re.sub(r"\b(?:\d{1,3}\.){3}\d{1,3}\b", "[IP]", out)
    out = re.sub(r"https?://[^\s]+", "[URL]", out)
    if sensitive_terms:
        for term in sensitive_terms:
            t = str(term or "").strip()
            if len(t) < 3:
                continue
            out = re.sub(re.escape(t), "[REDACTED]", out, flags=re.IGNORECASE)
    return out


def build_mailto_draft(to_email, subject, body):
    return f"mailto:{quote(to_email)}?subject={quote(subject)}&body={quote(body)}"


def normalize_evidence_url(url):
    raw = str(url or "").strip()
    if not raw:
        return ""
    parsed = urlparse(raw)
    if parsed.scheme.lower() not in {"http", "https"}:
        return ""
    if not parsed.netloc:
        return ""
    return raw


def build_openai_payload(mode, control, response_text, context, profile):
    sensitive = [profile.get("name"), profile.get("email"), context.get("orgName"), context.get("orgLegalName")]
    masked = {
        "control": mask_sensitive_text(control.get("control", ""), sensitive),
        "prompt": mask_sensitive_text(control.get("prompt", ""), sensitive),
        "best": mask_sensitive_text(control.get("bestPractice", ""), sensitive),
        "response": mask_sensitive_text(response_text, sensitive),
        "context": {k: (mask_sensitive_text(v, sensitive) if isinstance(v, str) else v) for k, v in context.items()},
    }

    if mode == "example":
        system = "You are an ISO 42001 audit advisor. Provide practical, relevant examples of strong controls. Inputs are masked."
        user = "\\n".join([
            f"Control: {masked['control']}",
            f"Question: {masked['prompt']}",
            f"Best practice: {masked['best']}",
            f"Current response: {masked['response']}",
            f"Context: {masked['context']}",
            "Generate 2 relevant example implementations with evidence expectations.",
        ])
    else:
        system = "You are an ISO 42001 audit advisor. Interpret responses and identify strengths/gaps. Inputs are masked."
        user = "\\n".join([
            f"Control: {masked['control']}",
            f"Question: {masked['prompt']}",
            f"Best practice: {masked['best']}",
            f"Current response: {masked['response']}",
            f"Context: {masked['context']}",
            "Return: 1) alignment interpretation, 2) key gaps, 3) follow-up evidence requests.",
        ])

    return {
        "model": "gpt-4.1-mini",
        "input": [
            {"role": "system", "content": [{"type": "input_text", "text": system}]},
            {"role": "user", "content": [{"type": "input_text", "text": user}]},
        ],
        "masked": True,
    }

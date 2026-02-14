"""Synthetic fixtures for Align42 tests."""


def synthetic_controls():
    return [
        {
            "id": "c1",
            "weight": 5,
            "control": "AI governance policy",
            "prompt": "Is an approved AI governance policy in place?",
            "bestPractice": "Policy approved by accountable executive and reviewed annually.",
        },
        {
            "id": "c2",
            "weight": 10,
            "control": "Risk management",
            "prompt": "Are AI risks identified, assessed, and tracked?",
            "bestPractice": "Maintained AI risk register with treatment plans and owners.",
        },
        {
            "id": "c3",
            "weight": 7,
            "control": "Data controls",
            "prompt": "Are data quality, privacy, and lineage controls documented?",
            "bestPractice": "Documented controls with evidence and periodic testing.",
        },
        {
            "id": "c4",
            "weight": 8,
            "control": "Incident response",
            "prompt": "Are AI incidents logged, triaged, and remediated?",
            "bestPractice": "AI incident playbook with clear escalation and closure criteria.",
        },
    ]


def synthetic_context_requirements():
    return [
        "orgName",
        "industry",
        "size",
        "itPlatforms",
        "roles",
        "aiMaturity",
        "aiAspirations",
        "aspirationTimeframe",
    ]


def synthetic_context():
    return {
        "orgName": "Northbridge Financial Group",
        "orgLegalName": "Northbridge Financial Group LLC",
        "industry": "Financial services",
        "size": "2500",
        "itPlatforms": "Azure, M365, ServiceNow",
        "roles": "CIO, CRO, CISO, Head of Compliance",
        "aiMaturity": "Developing",
        "aiAspirations": "Operationalize ISO 42001-ready controls across all AI use cases",
        "aspirationTimeframe": "12 months",
        "notes": "Primary contact: alex@northbridge.example",
    }


def synthetic_profile():
    return {
        "name": "Alex Morgan",
        "email": "alex.morgan@northbridge.example",
    }


def synthetic_ratings_mid_maturity():
    return {
        "c1": 5,
        "c2": 3,
        "c3": 4,
        "c4": 2,
    }

const INSTALLATION_SCOPE = "__ALIGN42_INSTALL_ID__";
const INSTALLATION_COUNTRY = "__ALIGN42_INSTALL_COUNTRY__";
const STORAGE_PREFIX = INSTALLATION_SCOPE && INSTALLATION_SCOPE !== "__ALIGN42_INSTALL_ID__"
  ? `align42_${INSTALLATION_SCOPE}`
  : "align42";
const STORAGE = {
  profile: `${STORAGE_PREFIX}_profile_v1`,
  settings: `${STORAGE_PREFIX}_settings_v1`,
  assessments: `${STORAGE_PREFIX}_assessments_v1`
};

const OPENAI_SETUP_URL = "https://platform.openai.com/docs/quickstart?api-mode=responses";
const ANTHROPIC_SETUP_URL = "https://docs.anthropic.com/en/api/getting-started";
const GEMINI_SETUP_URL = "https://ai.google.dev/gemini-api/docs/api-key";
const AZURE_OPENAI_SETUP_URL = "https://learn.microsoft.com/azure/ai-services/openai/how-to/create-resource";
const AI_PROVIDER_TIMEOUT_MS = 60000;
const COUNTRY_OPTIONS = ["Australia", "Canada", "France", "Germany", "India", "Ireland", "Japan", "Netherlands", "New Zealand", "Singapore", "South Africa", "Spain", "Sweden", "Switzerland", "United Arab Emirates", "United Kingdom", "United States"];
const STATE_OPTIONS = {
  "United States": ["Alabama", "Alaska", "Arizona", "California", "Colorado", "Florida", "Georgia", "Illinois", "Massachusetts", "Michigan", "New York", "North Carolina", "Ohio", "Pennsylvania", "Texas", "Virginia", "Washington"],
  Canada: ["Alberta", "British Columbia", "Manitoba", "Nova Scotia", "Ontario", "Quebec", "Saskatchewan"],
  Australia: ["Australian Capital Territory", "New South Wales", "Queensland", "South Australia", "Tasmania", "Victoria", "Western Australia"],
  India: ["Delhi", "Gujarat", "Karnataka", "Maharashtra", "Tamil Nadu", "Telangana", "Uttar Pradesh"]
};
const ISIC_SECTORS = [
  "A: Agriculture, forestry and fishing",
  "B: Mining and quarrying",
  "C: Manufacturing",
  "D: Electricity, gas, steam and air conditioning supply",
  "E: Water supply; sewerage, waste management and remediation activities",
  "F: Construction",
  "G: Wholesale and retail trade; repair of motor vehicles and motorcycles",
  "H: Transportation and storage",
  "I: Accommodation and food service activities",
  "J: Information and communication",
  "K: Financial and insurance activities",
  "L: Real estate activities",
  "M: Professional, scientific and technical activities",
  "N: Administrative and support service activities",
  "O: Public administration and defence; compulsory social security",
  "P: Education",
  "Q: Human health and social work activities",
  "R: Arts, entertainment and recreation",
  "S: Other service activities",
  "T: Activities of households as employers; undifferentiated goods- and services-producing activities of households for own use",
  "U: Activities of extraterritorial organizations and bodies"
];
const ISIC_SECONDARY_BY_BROAD = {
  "A: Agriculture, forestry and fishing": ["A01: Crop and animal production, hunting and related service activities", "A02: Forestry and logging", "A03: Fishing and aquaculture"],
  "B: Mining and quarrying": ["B05: Mining of coal and lignite", "B06: Extraction of crude petroleum and natural gas", "B07: Mining of metal ores", "B08: Other mining and quarrying", "B09: Mining support service activities"],
  "C: Manufacturing": ["C10: Manufacture of food products", "C11: Manufacture of beverages", "C13: Manufacture of textiles", "C20: Manufacture of chemicals and chemical products", "C21: Manufacture of basic pharmaceutical products and pharmaceutical preparations", "C25: Manufacture of fabricated metal products", "C26: Manufacture of computer, electronic and optical products", "C27: Manufacture of electrical equipment", "C28: Manufacture of machinery and equipment n.e.c.", "C29: Manufacture of motor vehicles, trailers and semi-trailers", "C30: Manufacture of other transport equipment", "C31: Manufacture of furniture", "C32: Other manufacturing"],
  "D: Electricity, gas, steam and air conditioning supply": ["D35: Electricity, gas, steam and air conditioning supply"],
  "E: Water supply; sewerage, waste management and remediation activities": ["E36: Water collection, treatment and supply", "E37: Sewerage", "E38: Waste collection, treatment and disposal activities; materials recovery", "E39: Remediation activities and other waste management services"],
  "F: Construction": ["F41: Construction of buildings", "F42: Civil engineering", "F43: Specialized construction activities"],
  "G: Wholesale and retail trade; repair of motor vehicles and motorcycles": ["G45: Wholesale and retail trade and repair of motor vehicles and motorcycles", "G46: Wholesale trade, except of motor vehicles and motorcycles", "G47: Retail trade, except of motor vehicles and motorcycles"],
  "H: Transportation and storage": ["H49: Land transport and transport via pipelines", "H50: Water transport", "H51: Air transport", "H52: Warehousing and support activities for transportation", "H53: Postal and courier activities"],
  "I: Accommodation and food service activities": ["I55: Accommodation", "I56: Food and beverage service activities"],
  "J: Information and communication": ["J58: Publishing activities", "J59: Motion picture, video and television programme production, sound recording and music publishing activities", "J60: Programming and broadcasting activities", "J61: Telecommunications", "J62: Computer programming, consultancy and related activities", "J63: Information service activities"],
  "K: Financial and insurance activities": ["K64: Financial service activities, except insurance and pension funding", "K65: Insurance, reinsurance and pension funding, except compulsory social security", "K66: Activities auxiliary to financial service and insurance activities"],
  "L: Real estate activities": ["L68: Real estate activities"],
  "M: Professional, scientific and technical activities": ["M69: Legal and accounting activities", "M70: Activities of head offices; management consultancy activities", "M71: Architectural and engineering activities; technical testing and analysis", "M72: Scientific research and development", "M73: Advertising and market research", "M74: Other professional, scientific and technical activities", "M75: Veterinary activities"],
  "N: Administrative and support service activities": ["N77: Rental and leasing activities", "N78: Employment activities", "N79: Travel agency, tour operator and other reservation service and related activities", "N80: Security and investigation activities", "N81: Services to buildings and landscape activities", "N82: Office administrative, office support and other business support activities"],
  "O: Public administration and defence; compulsory social security": ["O84: Public administration and defence; compulsory social security"],
  "P: Education": ["P85: Education"],
  "Q: Human health and social work activities": ["Q86: Human health activities", "Q87: Residential care activities", "Q88: Social work activities without accommodation"],
  "R: Arts, entertainment and recreation": ["R90: Creative, arts and entertainment activities", "R91: Libraries, archives, museums and other cultural activities", "R92: Gambling and betting activities", "R93: Sports activities and amusement and recreation activities"],
  "S: Other service activities": ["S94: Activities of membership organizations", "S95: Repair of computers and personal and household goods", "S96: Other personal service activities"],
  "T: Activities of households as employers; undifferentiated goods- and services-producing activities of households for own use": ["T97: Activities of households as employers of domestic personnel", "T98: Undifferentiated goods- and services-producing activities of private households for own use"],
  "U: Activities of extraterritorial organizations and bodies": ["U99: Activities of extraterritorial organizations and bodies"]
};

const COUNTRY_BY_REGION_CODE = {
  AU: "Australia",
  CA: "Canada",
  FR: "France",
  DE: "Germany",
  IN: "India",
  IE: "Ireland",
  JP: "Japan",
  NL: "Netherlands",
  NZ: "New Zealand",
  SG: "Singapore",
  ZA: "South Africa",
  ES: "Spain",
  SE: "Sweden",
  CH: "Switzerland",
  AE: "United Arab Emirates",
  GB: "United Kingdom",
  UK: "United Kingdom",
  US: "United States"
};

const COUNTRY_BY_TIMEZONE = {
  "Europe/London": "United Kingdom",
  "Europe/Dublin": "Ireland",
  "Europe/Paris": "France",
  "Europe/Berlin": "Germany",
  "Europe/Amsterdam": "Netherlands",
  "Europe/Madrid": "Spain",
  "Europe/Stockholm": "Sweden",
  "Europe/Zurich": "Switzerland",
  "Asia/Tokyo": "Japan",
  "Asia/Singapore": "Singapore",
  "Asia/Kolkata": "India",
  "Asia/Dubai": "United Arab Emirates",
  "Pacific/Auckland": "New Zealand",
  "Africa/Johannesburg": "South Africa",
  "America/New_York": "United States",
  "America/Chicago": "United States",
  "America/Denver": "United States",
  "America/Phoenix": "United States",
  "America/Los_Angeles": "United States",
  "America/Anchorage": "United States",
  "Pacific/Honolulu": "United States",
  "America/Toronto": "Canada",
  "America/Vancouver": "Canada",
  "America/Montreal": "Canada",
  "America/Halifax": "Canada",
  "America/Winnipeg": "Canada",
  "America/Edmonton": "Canada",
  "America/Regina": "Canada",
  "America/St_Johns": "Canada"
};
const ORG_SIZE_BANDS = [
  "Micro enterprise (1-9 employees)",
  "Small enterprise (10-49 employees)",
  "Medium enterprise (50-249 employees)",
  "Large enterprise (250-999 employees)",
  "Very large / enterprise-scale (1000+ employees)"
];

const sections = [
  {
    id: "context",
    title: "Business Context",
    description: "Capture organisation profile and accountability structure.",
    type: "context",
    fields: [
      { key: "orgName", label: "Organisation name", type: "text", required: true, starter: "Example: Northbridge Financial Services" },
      { key: "businessOverview", label: "Business Overview", type: "textarea", required: true, starter: "Summarize your organisation's purpose/mission, primary markets/geographies served, type of business (e.g., B2B, B2C, public sector), and core products/services." },
      { key: "industryClassification", label: "Industry sector classification", type: "industry_classification", required: true },
      { key: "size", label: "Organisation size band", type: "select", required: true, options: ORG_SIZE_BANDS },
      { key: "platforms", label: "Primary IT platforms", type: "textarea", starter: "List cloud providers, ERP/CRM platforms, data stack, developer platforms, and collaboration tools." },
      { key: "roles", label: "Key roles with accountability for IT, Risk and Compliance", type: "textarea", required: true, starter: "List accountable roles and responsibilities, e.g., CIO (IT operations), CRO (risk framework), CCO (regulatory compliance), CISO (security controls)." },
      { key: "geoRegScope", label: "Regulatory and geographic scope", type: "geo_reg_scope", required: true }
    ]
  },
  {
    id: "maturity",
    title: "AI Maturity and Ambition",
    description: "Assess current AI use, maturity level and target state.",
    type: "context",
    fields: [
      { key: "maturityLevel", label: "Current AI maturity", type: "select", required: true, options: ["Ad hoc", "Emerging", "Defined", "Managed", "Optimized"] },
      { key: "currentUse", label: "Current AI use cases", type: "textarea", required: true, starter: "List active AI use cases, business owners, impacted processes, and model types used (LLM, ML, rules+AI)." },
      { key: "riskDomains", label: "Top AI risk domains", type: "textarea", starter: "Describe highest risk areas such as bias/fairness, privacy, cybersecurity, explainability, third-party model dependency, hallucinations." },
      { key: "aspiration", label: "AI aspiration / target operating model", type: "textarea", required: true, starter: "Explain the target AI operating model, governance posture, and expected business outcomes." },
      { key: "targetDate", label: "Target timeframe", type: "text", required: true, starter: "Example: Q4 2027" }
    ]
  },
  {
    id: "governance",
    title: "Clause 4-5: Context and Leadership",
    description: "Governance model, policy commitments, and accountable leadership.",
    type: "controls",
    controls: [
      { id: "c4_scope", clause: "Clause 4.3", weight: 5, control: "AIMS scope definition", prompt: "Is the AI management system scope clearly defined (entities, products, geographies, exclusions)?", bestPractice: "Scope is approved, version-controlled, and reviewed at least annually or at major change.", example: "A signed scope statement covering all customer-impacting AI use cases, with documented exclusions and rationale.", starter: "Describe your current scope statement and where it is documented." },
      { id: "c5_policy", clause: "Clause 5.2", weight: 6, control: "AI policy framework", prompt: "Does the organisation maintain approved AI governance policies and standards?", bestPractice: "Policies are documented, approved, communicated, trained, and reviewed on a defined cycle.", example: "Policy pack includes AI acceptable use, model risk policy, data governance standard, and prohibited use catalog.", starter: "List current AI policy documents and last approval dates." },
      { id: "c5_roles", clause: "Clause 5.3", weight: 6, control: "Roles and responsibilities", prompt: "Are AI accountabilities explicit across executive, risk, engineering and compliance functions?", bestPractice: "RACI is defined and linked to decision rights for high-risk AI.", example: "CRO approves risk tolerance; CIO owns technical controls; DPO signs off privacy impact for high-risk AI.", starter: "Describe who approves AI use cases, who operates controls, and who performs independent challenge." },
      { id: "c5_oversight", clause: "Clause 5.1", weight: 5, control: "Leadership oversight", prompt: "Is there an active AI governance forum with regular review cadence and tracked actions?", bestPractice: "Formal governance cadence, agenda, minutes, and action tracking are maintained.", example: "Monthly AI governance council reviewing incidents, risk profile, new use cases, and compliance actions.", starter: "Summarize governance forum frequency, attendees, and decision logs." },
      { id: "c5_objectives", clause: "Clause 6.2", weight: 4, control: "AI objectives and KPIs", prompt: "Are measurable AI objectives defined and monitored?", bestPractice: "Objectives include control effectiveness, risk reduction, compliance, and business value metrics.", example: "KPIs include model validation SLA, bias threshold adherence, incident closure times, and explainability coverage.", starter: "List AI control objectives and how they are measured." }
    ]
  },
  {
    id: "risk",
    title: "Clause 6: Planning and Risk",
    description: "Risk identification, treatment planning, and risk acceptance.",
    type: "controls",
    controls: [
      { id: "c6_risk_method", clause: "Clause 6.1", weight: 7, control: "AI risk assessment methodology", prompt: "Is there a defined and repeatable method to assess AI risk across lifecycle stages?", bestPractice: "Method covers likelihood/impact, human impact, legal exposure, and model uncertainty.", example: "A standardized risk scoring rubric used during ideation, pre-deploy, and periodic review.", starter: "Describe your AI risk assessment methodology and where evidence is stored." },
      { id: "c6_risk_register", clause: "Clause 6.1", weight: 6, control: "AI risk register", prompt: "Are AI risks catalogued with owners, treatment actions and deadlines?", bestPractice: "Register is current, linked to controls, and reviewed by governance forum.", example: "Central AI risk register with risk IDs, treatment plans, and residual risk acceptance records.", starter: "Summarize your AI risk register process and ownership." },
      { id: "c6_change", clause: "Clause 6.3", weight: 5, control: "Change planning", prompt: "Are material AI changes assessed for control and risk impact before release?", bestPractice: "Change gates include technical, legal, and risk sign-off.", example: "Any model architecture or training-data change triggers revalidation and risk review before production.", starter: "Describe your change process and AI-specific approval criteria." },
      { id: "c6_third_party", clause: "Clause 8.4", weight: 6, control: "Third-party AI dependency risk", prompt: "Are third-party model/service risks assessed and monitored?", bestPractice: "Supplier due diligence, contract clauses, and monitoring are documented.", example: "Vendor AI due diligence checklist with privacy, security and model transparency criteria.", starter: "Explain how you assess and monitor AI vendors and external APIs." },
      { id: "c6_acceptance", clause: "Clause 6.1", weight: 5, control: "Risk acceptance", prompt: "Is residual AI risk acceptance formally documented and approved?", bestPractice: "Residual risk acceptance authority and thresholds are defined and auditable.", example: "High-risk use cases require CRO and legal sign-off with expiry date and re-review trigger.", starter: "Describe risk acceptance thresholds and approval authority." }
    ]
  },
  {
    id: "support",
    title: "Clause 7: Support",
    description: "Competence, awareness, communication, and documented information.",
    type: "controls",
    controls: [
      { id: "c7_competence", clause: "Clause 7.2", weight: 4, control: "Competence and training", prompt: "Are role-based AI governance and risk training programs in place?", bestPractice: "Training is role-specific, mandatory where needed, and completion tracked.", example: "Engineers complete secure ML training; leaders complete AI accountability and legal risk modules.", starter: "Describe AI training by role and completion tracking." },
      { id: "c7_awareness", clause: "Clause 7.3", weight: 3, control: "Awareness of obligations", prompt: "Do teams understand policy obligations and prohibited AI uses?", bestPractice: "Awareness is tested and reinforced through periodic campaigns.", example: "Quarterly attestations and micro-learning on restricted AI use and escalation channels.", starter: "Explain how staff are made aware of AI obligations." },
      { id: "c7_docs", clause: "Clause 7.5", weight: 5, control: "Documented information control", prompt: "Are AI governance artifacts controlled for versioning, approval, and retention?", bestPractice: "Documentation lifecycle controls exist and evidence is readily auditable.", example: "Policy repository with owners, version history, review dates, and retention rules.", starter: "Describe where AI governance documentation is stored and controlled." },
      { id: "c7_comms", clause: "Clause 7.4", weight: 3, control: "Internal and external communication", prompt: "Are AI incidents, obligations, and stakeholder communications managed systematically?", bestPractice: "Communication protocols define what, when, and to whom for key AI events.", example: "Incident communication matrix covering legal, privacy regulator, customer support, and executive escalation.", starter: "Summarize communication protocols for AI incidents and governance updates." }
    ]
  },
  {
    id: "operations",
    title: "Clause 8: Operation",
    description: "Operational controls over data, model lifecycle, human oversight, and incident handling.",
    type: "controls",
    controls: [
      { id: "c8_data_quality", clause: "Clause 8.2", weight: 6, control: "Data quality and lineage", prompt: "Is AI training/inference data quality controlled and traceable?", bestPractice: "Data lineage, quality checks, and ownership are documented and monitored.", example: "Data contracts define source ownership, quality thresholds, and lineage provenance for all critical datasets.", starter: "Explain your data lineage and data quality controls for AI." },
      { id: "c8_validation", clause: "Clause 8.3", weight: 7, control: "Model testing and validation", prompt: "Are models tested for performance, robustness, fairness and unintended outcomes?", bestPractice: "Validation includes functional and non-functional risk criteria before production.", example: "Validation suite includes stress testing, subgroup bias checks, adversarial tests and fallback tests.", starter: "Describe your model validation process and evidence artifacts." },
      { id: "c8_human", clause: "Clause 8.5", weight: 6, control: "Human oversight", prompt: "Is human oversight defined for high-impact decisions and exceptions?", bestPractice: "Clear intervention points and override procedures exist.", example: "Human-in-the-loop approval required for high-impact customer decisions with audit trail and rationale.", starter: "Describe where human oversight is required and how overrides are logged." },
      { id: "c8_incident", clause: "Clause 8.7", weight: 6, control: "AI incident management", prompt: "Do AI-specific incident detection, escalation and corrective action processes exist?", bestPractice: "Incidents are triaged and tracked through closure with root cause analysis.", example: "Dedicated AI incident playbook with severity levels, response SLAs, and post-incident review templates.", starter: "Outline your AI incident process and typical response timelines." },
      { id: "c8_security", clause: "Clause 8.8", weight: 6, control: "AI security and access control", prompt: "Are model assets, prompts, pipelines and secrets secured with least privilege controls?", bestPractice: "Security controls cover model repositories, CI/CD, keys, and runtime monitoring.", example: "Role-based access, secret rotation, model artifact signing, and security monitoring are enforced.", starter: "Describe key AI security controls and monitoring in your environment." }
    ]
  },
  {
    id: "evaluation",
    title: "Clause 9: Performance Evaluation",
    description: "Monitoring, internal audit and management review for AIMS performance.",
    type: "controls",
    controls: [
      { id: "c9_monitor", clause: "Clause 9.1", weight: 5, control: "Monitoring and measurement", prompt: "Are AI controls and model outcomes continuously monitored against defined thresholds?", bestPractice: "Monitoring metrics are defined, owned, and reviewed with action triggers.", example: "Dashboards track drift, false positives, SLA breaches, bias metrics, and control failures.", starter: "List monitoring metrics and thresholds used for AI controls and model outcomes." },
      { id: "c9_audit", clause: "Clause 9.2", weight: 5, control: "Internal audit", prompt: "Is AI governance included in periodic internal audits?", bestPractice: "Audit program includes AIMS scope, control testing and remediation tracking.", example: "Internal audit annually tests design and operating effectiveness of high-risk AI controls.", starter: "Describe your internal audit coverage for AI governance and controls." },
      { id: "c9_review", clause: "Clause 9.3", weight: 4, control: "Management review", prompt: "Does management review AIMS suitability and effectiveness with evidence?", bestPractice: "Regular reviews assess trends, incidents, compliance status and improvement actions.", example: "Quarterly management review pack includes risk heatmap, incidents, audit findings, and action statuses.", starter: "Summarize current management review cadence and key inputs." },
      { id: "c9_reporting", clause: "Clause 9.1", weight: 4, control: "Reporting and transparency", prompt: "Are internal/external AI reports generated for key stakeholders?", bestPractice: "Reporting is tailored to executives, risk, regulators, and operations.", example: "Monthly board-level AI risk report and operational weekly control dashboard.", starter: "Explain what AI governance reports are produced and who receives them." }
    ]
  },
  {
    id: "improvement",
    title: "Clause 10: Improvement",
    description: "Nonconformity handling and continual improvement.",
    type: "controls",
    controls: [
      { id: "c10_corrective", clause: "Clause 10.1", weight: 5, control: "Corrective actions", prompt: "Are nonconformities addressed with corrective actions and verification of effectiveness?", bestPractice: "Corrective actions include root cause analysis, action ownership, and closure checks.", example: "CAPA workflow for AI control failures with evidence of implemented remediation and re-testing.", starter: "Describe corrective action workflow for AI governance/control issues." },
      { id: "c10_lessons", clause: "Clause 10.2", weight: 4, control: "Lessons learned", prompt: "Are incidents and near-misses used to improve policy, controls and training?", bestPractice: "Lessons learned are documented and integrated into control updates.", example: "Post-incident retrospectives feed updates to risk taxonomy, playbooks, and training content.", starter: "Provide examples of AI incidents or near-misses that drove improvements." },
      { id: "c10_continuous", clause: "Clause 10.2", weight: 4, control: "Continuous improvement program", prompt: "Is there a structured AI governance improvement roadmap linked to strategic goals?", bestPractice: "Improvement priorities are risk-driven, resourced, and tracked.", example: "12-month AI control maturity program with milestones, budget owner, and target outcomes.", starter: "Describe current AI governance improvement initiatives and milestones." }
    ]
  },
  { id: "final", title: "Final Outputs", description: "Download assessment report files and summary outputs.", type: "final" },
  { id: "roadmap", title: "Roadmap", description: "Review implementation sequencing and export roadmap deliverables.", type: "roadmap" }
];

const app = document.getElementById("app");

let state = {
  profile: load(STORAGE.profile, null),
  settings: load(STORAGE.settings, {
    aiMode: false,
    aiProvider: "openai",
    openaiKey: "",
    anthropicKey: "",
    geminiKey: "",
    azureApiKey: "",
    azureEndpoint: "",
    azureDeployment: "",
    azureApiVersion: "2024-10-21",
    aiDisclaimerAcknowledged: false,
    aiDiagnostics: [],
    settingsOpen: false,
    assessmentMode: "simple",
    aiCredentialStorage: "session"
  }),
  assessments: load(STORAGE.assessments, []),
  currentAssessmentId: null,
  view: "assessment",
  ui: { uploadOpen: {}, summaryOpen: {}, profileEditorOpen: false, loggedOut: false }
};

let dictationState = {
  recognition: null,
  activeTargetId: null
};

function load(key, fallback) {
  try {
    const v = localStorage.getItem(key);
    return v ? JSON.parse(v) : fallback;
  } catch {
    return fallback;
  }
}

function storageSettingsSnapshot() {
  const snapshot = { ...(state.settings || {}) };
  const mode = snapshot.aiCredentialStorage === "persistent" ? "persistent" : "session";
  snapshot.aiCredentialStorage = mode;
  if (mode !== "persistent") {
    snapshot.openaiKey = "";
    snapshot.anthropicKey = "";
    snapshot.geminiKey = "";
    snapshot.azureApiKey = "";
    snapshot.azureEndpoint = "";
    snapshot.azureDeployment = "";
    snapshot.azureApiVersion = snapshot.azureApiVersion || "2024-10-21";
  }
  return snapshot;
}

function normalizedProfile(profile) {
  return {
    name: `${profile?.name || ""}`.trim(),
    email: `${profile?.email || ""}`.trim(),
    role: `${profile?.role || ""}`.trim()
  };
}

function saveProfile() {
  state.profile = normalizedProfile(state.profile);
  localStorage.setItem(STORAGE.profile, JSON.stringify(state.profile));
}

function clearVisibleSessionState() {
  state.profile = null;
  state.assessments = [];
  state.currentAssessmentId = null;
  state.view = "assessment";
  state.settings = {
    ...state.settings,
    aiMode: false,
    settingsOpen: false,
    openaiKey: "",
    anthropicKey: "",
    geminiKey: "",
    azureApiKey: "",
    azureEndpoint: "",
    azureDeployment: ""
  };
  state.ui.uploadOpen = {};
  state.ui.summaryOpen = {};
  state.ui.profileEditorOpen = true;
  state.ui.loggedOut = true;
}
function saveSettings() { localStorage.setItem(STORAGE.settings, JSON.stringify(storageSettingsSnapshot())); }
function assessmentMode() { return state.settings?.assessmentMode === "advanced" ? "advanced" : "simple"; }
function aiFeaturesEnabled() { return assessmentMode() === "advanced" && !!state.settings?.aiMode; }
function saveAssessments() { localStorage.setItem(STORAGE.assessments, JSON.stringify(state.assessments)); }
const pendingAssessmentSaves = new Map();
function scheduleAssessmentSave(assessment, delayMs = 400) {
  if (!assessment || !assessment.id) return;
  const existing = pendingAssessmentSaves.get(assessment.id);
  if (existing) clearTimeout(existing);
  const timer = setTimeout(() => {
    assessment.updatedAt = nowIso();
    saveAssessments();
    pendingAssessmentSaves.delete(assessment.id);
  }, delayMs);
  pendingAssessmentSaves.set(assessment.id, timer);
}
function flushAssessmentSave(assessment) {
  if (!assessment || !assessment.id) return;
  const existing = pendingAssessmentSaves.get(assessment.id);
  if (existing) {
    clearTimeout(existing);
    pendingAssessmentSaves.delete(assessment.id);
  }
  assessment.updatedAt = nowIso();
  saveAssessments();
}
function ensureSettingsDefaults() {
  const s = state.settings || {};
  const storageMode = s.aiCredentialStorage === "persistent" ? "persistent" : "session";
  const selectedMode = s.assessmentMode === "advanced" ? "advanced" : "simple";
  const aiEnabled = selectedMode === "advanced" ? !!s.aiMode : false;
  state.settings = {
    aiMode: aiEnabled,
    aiProvider: s.aiProvider || "openai",
    openaiKey: storageMode === "persistent" ? (s.openaiKey || "") : "",
    anthropicKey: storageMode === "persistent" ? (s.anthropicKey || "") : "",
    geminiKey: storageMode === "persistent" ? (s.geminiKey || "") : "",
    azureApiKey: storageMode === "persistent" ? (s.azureApiKey || "") : "",
    azureEndpoint: storageMode === "persistent" ? (s.azureEndpoint || "") : "",
    azureDeployment: storageMode === "persistent" ? (s.azureDeployment || "") : "",
    azureApiVersion: storageMode === "persistent" ? (s.azureApiVersion || "2024-10-21") : "2024-10-21",
    aiDisclaimerAcknowledged: !!s.aiDisclaimerAcknowledged,
    aiDiagnostics: Array.isArray(s.aiDiagnostics) ? s.aiDiagnostics : [],
    settingsOpen: selectedMode === "advanced" ? !!s.settingsOpen : false,
    assessmentMode: selectedMode,
    aiCredentialStorage: storageMode
  };
}
ensureSettingsDefaults();

{
  let changed = false;
  (state.assessments || []).forEach((a) => {
    if (!a || !a.data) return;
    if (a.data.demoMode && (!a.demoMode || !a.isDemo)) {
      a.demoMode = true;
      a.isDemo = true;
      changed = true;
    }
  });
  if (changed) saveAssessments();
}

function activeAiProvider() {
  const p = `${state.settings?.aiProvider || "openai"}`.toLowerCase();
  return ["openai", "anthropic", "gemini", "azure_openai"].includes(p) ? p : "openai";
}
function providerLabel(provider = activeAiProvider()) {
  if (provider === "anthropic") return "Anthropic Claude";
  if (provider === "gemini") return "Google Gemini";
  if (provider === "azure_openai") return "Azure OpenAI";
  return "OpenAI";
}
function providerSetupLink(provider = activeAiProvider()) {
  if (provider === "anthropic") return ANTHROPIC_SETUP_URL;
  if (provider === "gemini") return GEMINI_SETUP_URL;
  if (provider === "azure_openai") return AZURE_OPENAI_SETUP_URL;
  return OPENAI_SETUP_URL;
}
function aiProviderReady() {
  const p = activeAiProvider();
  if (p === "anthropic") return !!state.settings.anthropicKey;
  if (p === "gemini") return !!state.settings.geminiKey;
  if (p === "azure_openai") return !!(state.settings.azureApiKey && state.settings.azureEndpoint && state.settings.azureDeployment);
  return !!state.settings.openaiKey;
}

function sanitizeDiagnosticValue(value, depth = 0) {
  if (depth > 3) return "[TRUNCATED]";
  if (value == null) return value;
  if (typeof value === "string") {
    const v = value.length > 400 ? `${value.slice(0, 400)}...` : value;
    return v
      .replace(/Bearer\s+[A-Za-z0-9._-]+/gi, "Bearer [REDACTED]")
      .replace(/sk-[A-Za-z0-9_-]+/g, "sk-[REDACTED]")
      .replace(/sk-ant-[A-Za-z0-9_-]+/g, "sk-ant-[REDACTED]")
      .replace(/AIza[0-9A-Za-z_-]+/g, "AIza[REDACTED]");
  }
  if (Array.isArray(value)) return value.slice(0, 20).map((v) => sanitizeDiagnosticValue(v, depth + 1));
  if (typeof value === "object") {
    const out = {};
    Object.entries(value).forEach(([k, v]) => {
      if (/key|token|authorization|api[-_]?key|secret/i.test(k)) out[k] = "[REDACTED]";
      else out[k] = sanitizeDiagnosticValue(v, depth + 1);
    });
    return out;
  }
  return value;
}

function addAiDiagnostic(event) {
  const item = {
    id: uid("diag"),
    at: nowIso(),
    provider: providerLabel(event.provider || activeAiProvider()),
    status: event.status || "INFO",
    stage: event.stage || "GENERAL",
    action: event.action || "",
    message: event.message || "",
    details: sanitizeDiagnosticValue(event.details || {})
  };
  if (!Array.isArray(state.settings.aiDiagnostics)) state.settings.aiDiagnostics = [];
  state.settings.aiDiagnostics.push(item);
  if (state.settings.aiDiagnostics.length > 80) state.settings.aiDiagnostics = state.settings.aiDiagnostics.slice(-80);
  saveSettings();
}

function clearAiDiagnostics() {
  state.settings.aiDiagnostics = [];
  saveSettings();
}

function providerPreflightValidation(provider = activeAiProvider()) {
  const errors = [];
  const warnings = [];
  if (window.location.protocol === "file:") {
    warnings.push("App is running from file://. Some providers may reject browser requests from null origin. Prefer http://localhost.");
  }
  if (provider === "openai") {
    const key = `${state.settings.openaiKey || ""}`.trim();
    if (!key) errors.push("OpenAI API key is required.");
    else if (!/^sk-/.test(key)) warnings.push("OpenAI key format looks unusual (expected prefix sk-).");
  } else if (provider === "anthropic") {
    const key = `${state.settings.anthropicKey || ""}`.trim();
    if (!key) errors.push("Anthropic API key is required.");
    else if (!/^sk-ant-/.test(key)) warnings.push("Anthropic key format looks unusual (expected prefix sk-ant-).");
  } else if (provider === "gemini") {
    const key = `${state.settings.geminiKey || ""}`.trim();
    if (!key) errors.push("Gemini API key is required.");
    else if (!/^AIza/.test(key)) warnings.push("Gemini key format looks unusual (expected prefix AIza).");
  } else if (provider === "azure_openai") {
    const key = `${state.settings.azureApiKey || ""}`.trim();
    const endpoint = `${state.settings.azureEndpoint || ""}`.trim();
    const deployment = `${state.settings.azureDeployment || ""}`.trim();
    const apiVersion = `${state.settings.azureApiVersion || ""}`.trim();
    if (!key) errors.push("Azure OpenAI API key is required.");
    if (!endpoint) errors.push("Azure endpoint is required.");
    if (!deployment) errors.push("Azure deployment name is required.");
    if (endpoint && !/^https:\/\/.+/i.test(endpoint)) errors.push("Azure endpoint must start with https://");
    if (endpoint && !/\.openai\.azure\.com/i.test(endpoint)) warnings.push("Azure endpoint does not look like an Azure OpenAI resource domain.");
    if (deployment && /\s/.test(deployment)) warnings.push("Azure deployment name contains spaces; deployment names are typically space-free.");
    if (apiVersion && !/^\d{4}-\d{2}-\d{2}(-preview)?$/.test(apiVersion)) warnings.push("Azure API version format may be invalid (expected YYYY-MM-DD or YYYY-MM-DD-preview).");
  }
  return { errors, warnings };
}

function formatProviderError(provider, rawMessage) {
  const msg = `${rawMessage || ""}`.trim();
  const lower = msg.toLowerCase();
  const p = providerLabel(provider);
  if (!msg) return `${p}: Unknown provider error.`;

  if (lower.includes("failed to fetch") || lower.includes("networkerror")) {
    return `${p}: Network/CORS failure. If running from file://, serve app on http://localhost and verify firewall/VPN/proxy settings.`;
  }
  if (/\b(401|403)\b/.test(lower) || lower.includes("unauthorized") || lower.includes("forbidden")) {
    return `${p}: Authentication/permission failure. Verify API key, project permissions, and provider key restrictions.`;
  }
  if (/\b(404)\b/.test(lower) && provider === "azure_openai") {
    return `${p}: Resource not found. Check Azure endpoint and deployment name (deployment, not model name).`;
  }
  if (/\b(400)\b/.test(lower) && provider === "azure_openai") {
    return `${p}: Bad request. Validate Azure API version and deployment compatibility.`;
  }
  if (/\b(429)\b/.test(lower) || lower.includes("rate limit") || lower.includes("quota")) {
    return `${p}: Rate limit or quota exceeded. Retry later or check plan/quota limits.`;
  }
  if (provider === "gemini" && lower.includes("api key")) {
    return `${p}: API key rejected. Check key validity and API restrictions for browser/localhost usage.`;
  }
  return `${p}: ${msg}`;
}

function aiDisabledReason() {
  if (assessmentMode() !== "advanced") return "AI features are disabled in Simple mode.";
  if (!state.settings.aiMode) return "AI mode is disabled. Enable AI mode from the welcome screen.";
  if (!aiProviderReady()) return "AI provider credentials/settings are incomplete.";
  return "";
}

function normalizeEvidenceUrl(url) {
  const raw = `${url || ""}`.trim();
  if (!raw) return "";
  try {
    const parsed = new URL(raw);
    if (parsed.protocol !== "http:" && parsed.protocol !== "https:") return "";
    return parsed.toString();
  } catch {
    return "";
  }
}

function renderEvidenceLinkItem(url) {
  const safe = normalizeEvidenceUrl(url);
  if (!safe) return `<li><span class="tag no">Invalid URL</span> ${escapeHtml(url || "")}</li>`;
  return `<li><a href="${escapeHtml(safe)}" target="_blank" rel="noopener noreferrer">${escapeHtml(safe)}</a></li>`;
}

function nowIso() { return new Date().toISOString(); }
function uid(prefix = "id") { return `${prefix}_${Math.random().toString(36).slice(2, 10)}_${Date.now().toString(36)}`; }
function goHome() {
  const active = currentAssessment();
  if (active) flushAssessmentSave(active);
  stopDictation();
  state.currentAssessmentId = null;
  state.view = "assessment";
  render();
}

function toast(message) {
  const old = document.querySelector(".toast");
  if (old) old.remove();
  const el = document.createElement("div");
  el.className = "toast";
  el.textContent = message;
  document.body.appendChild(el);
  setTimeout(() => el.remove(), 2600);
}

function dictationSupported() {
  return !!(window.SpeechRecognition || window.webkitSpeechRecognition);
}

function stopDictation() {
  if (dictationState.recognition) {
    try { dictationState.recognition.stop(); } catch {}
  }
  dictationState.recognition = null;
  dictationState.activeTargetId = null;
}

function startDictation(textareaId, button) {
  const setDictationButtonState = (recording) => {
    const icon = button.querySelector(".mic-icon");
    const label = button.querySelector(".mic-label");
    if (icon) icon.textContent = recording ? "⏹" : "🎤";
    if (label) label.textContent = recording ? "dictate (stop)" : "dictate";
    button.classList.toggle("recording", recording);
  };
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SpeechRecognition) {
    toast("Speech dictation is not supported in this browser.");
    return;
  }

  if (dictationState.activeTargetId === textareaId) {
    stopDictation();
    setDictationButtonState(false);
    return;
  }

  stopDictation();

  const textarea = document.getElementById(textareaId);
  if (!textarea) return;

  const recognition = new SpeechRecognition();
  recognition.lang = "en-US";
  recognition.interimResults = true;
  recognition.continuous = true;

  let finalText = "";
  let baseText = textarea.value ? `${textarea.value}${textarea.value.endsWith(" ") ? "" : " "}` : "";

  recognition.onresult = (event) => {
    let interim = "";
    for (let i = event.resultIndex; i < event.results.length; i++) {
      const transcript = event.results[i][0].transcript;
      if (event.results[i].isFinal) finalText += `${transcript} `;
      else interim += transcript;
    }
    textarea.value = `${baseText}${finalText}${interim}`.trim();
    textarea.dispatchEvent(new Event("input", { bubbles: true }));
  };

  recognition.onerror = () => {
    stopDictation();
    setDictationButtonState(false);
    toast("Dictation stopped due to an error.");
  };

  recognition.onend = () => {
    if (dictationState.activeTargetId === textareaId) {
      stopDictation();
      setDictationButtonState(false);
    }
  };

  recognition.start();
  dictationState.recognition = recognition;
  dictationState.activeTargetId = textareaId;
  setDictationButtonState(true);
}

function attachDictationButtons(root, selector) {
  if (!dictationSupported()) return;
  root.querySelectorAll(selector).forEach((textarea, index) => {
    if (textarea.dataset.micBound === "1") return;
    const id = textarea.id || `dictation_${uid("txt")}_${index}`;
    textarea.id = id;
    textarea.dataset.micBound = "1";

    const wrap = document.createElement("div");
    wrap.className = "mic-row";
    const button = document.createElement("button");
    button.type = "button";
    button.className = "btn ghost small mic-btn";
    button.innerHTML = "<span class=\"mic-icon\" aria-hidden=\"true\">🎤</span><span class=\"mic-label\">dictate</span>";
    button.title = "Dictate into this response box";
    button.addEventListener("click", () => startDictation(id, button));
    wrap.appendChild(button);

    textarea.insertAdjacentElement("afterend", wrap);
  });
}

function escapeHtml(str) {
  return `${str || ""}`
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function headingCase(text) {
  const small = new Set(["a", "an", "and", "as", "at", "by", "for", "in", "of", "on", "or", "the", "to", "v", "vs", "via", "with"]);
  return `${text || ""}`.split(/\s+/).map((token, i, arr) => {
    const m = token.match(/^([^A-Za-z0-9]*)([A-Za-z0-9][A-Za-z0-9&/.-]*)([^A-Za-z0-9]*)$/);
    if (!m) return token;
    const [, lead, core, tail] = m;
    if (/^[A-Z0-9&/.-]+$/.test(core) || /[A-Z].*[A-Z]/.test(core)) return token;
    const lower = core.toLowerCase();
    const out = (i > 0 && i < arr.length - 1 && small.has(lower))
      ? lower
      : `${lower.charAt(0).toUpperCase()}${lower.slice(1)}`;
    return `${lead}${out}${tail}`;
  }).join(" ");
}

function currentAssessment() {
  const found = state.assessments.find((a) => a.id === state.currentAssessmentId) || null;
  if (found) ensureAssessmentData(found);
  return found;
}

function normalizeCountryName(country) {
  const c = `${country || ""}`.trim();
  return COUNTRY_OPTIONS.includes(c) ? c : "";
}

function countryFromRegionCode(regionCode) {
  const code = `${regionCode || ""}`.trim().toUpperCase();
  return normalizeCountryName(COUNTRY_BY_REGION_CODE[code] || "");
}

function countryFromLocaleTag(localeTag) {
  const tag = `${localeTag || ""}`.trim();
  if (!tag) return "";
  try {
    if (typeof Intl !== "undefined" && Intl.Locale) {
      const loc = new Intl.Locale(tag);
      const fromIntl = countryFromRegionCode(loc.region || "");
      if (fromIntl) return fromIntl;
    }
  } catch {}
  const m = tag.match(/[-_]([A-Za-z]{2})(?:$|[-_])/);
  return m ? countryFromRegionCode(m[1]) : "";
}

function countryFromTimeZone(timeZone) {
  const tz = `${timeZone || ""}`.trim();
  if (!tz) return "";
  if (COUNTRY_BY_TIMEZONE[tz]) return COUNTRY_BY_TIMEZONE[tz];
  if (tz.startsWith("Australia/")) return "Australia";
  return "";
}

function detectLocalCountry() {
  const fromInstaller = normalizeCountryName(INSTALLATION_COUNTRY);
  if (fromInstaller) return { country: fromInstaller, source: "installer" };

  const localeCandidates = [];
  try {
    const loc = Intl.DateTimeFormat().resolvedOptions().locale;
    if (loc) localeCandidates.push(loc);
  } catch {}
  if (typeof navigator !== "undefined") {
    if (Array.isArray(navigator.languages)) localeCandidates.push(...navigator.languages);
    if (navigator.language) localeCandidates.push(navigator.language);
  }
  for (const tag of localeCandidates) {
    const country = countryFromLocaleTag(tag);
    if (country) return { country, source: "browser-locale" };
  }

  try {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const country = countryFromTimeZone(tz);
    if (country) return { country, source: "timezone" };
  } catch {}

  return { country: "", source: "" };
}

function localisationSourceLabel(source) {
  if (source === "installer") return "installer OS locale";
  if (source === "browser-locale") return "browser/OS locale";
  if (source === "timezone") return "device timezone";
  return "local settings";
}

function localContextDefaults() {
  const detected = detectLocalCountry();
  const country = normalizeCountryName(detected.country) || "Australia";
  const frameworkSeed = baseFrameworksForContext({ country });
  return {
    country,
    frameworkSuggestions: frameworkSeed.slice(),
    applicableFrameworks: frameworkSeed.slice(),
    localisationSource: detected.source || "default"
  };
}

function defaultAssessmentData() {
  return {
    currentSection: 0,
    context: localContextDefaults(),
    ratings: {},
    evidence: {},
    visitedSections: {},
    delegates: {},
    delegationEvents: [],
    aiInsights: {},
    sectionInsights: {},
    preferredApproach: "fastest",
    roadmapScenario: "standard",
    reportAudience: "board"
  };
}

function isDemoAssessment(assessment) {
  return !!assessment?.demoMode || !!assessment?.isDemo || !!assessment?.data?.demoMode;
}

function demoEvidenceNote(control, score) {
  if (score <= 1) {
    return `No formalized ${control.control.toLowerCase()} process exists yet. Activities are ad hoc and dependent on individual teams.`;
  }
  if (score <= 2) {
    return `${control.control} is partially defined with draft procedures, but ownership, repeatability, and assurance evidence are incomplete.`;
  }
  return `${control.control} has early documented practice, but broader rollout, measurement, and governance oversight are still maturing.`;
}

function createSimpleModeDemoAssessment() {
  const now = new Date();
  const dd = `${now.getDate()}`.padStart(2, "0");
  const mm = `${now.getMonth() + 1}`.padStart(2, "0");
  const yy = `${now.getFullYear()}`.slice(-2);
  const data = defaultAssessmentData();
  data.context = {
    orgName: "Southern Cross Intelligent Systems Pty Ltd",
    businessOverview: "Australian mid-sized technology manufacturer designing and producing industrial vision sensors, edge-AI controllers, and smart factory monitoring platforms for ANZ and Southeast Asia markets. Core business is B2B hardware-plus-software solutions for manufacturing and logistics clients.",
    industry: "Technology manufacturing (industrial automation and IoT devices)",
    size: "Large enterprise (250-999 employees)",
    platforms: "Microsoft 365, Azure, AWS for analytics workloads, SAP Business One, Jira/Confluence, GitHub Enterprise, Power BI, CrowdStrike.",
    roles: "CIO (enterprise IT and digital delivery), Head of Engineering (product and model development), Risk Manager (enterprise risk), Compliance Manager (regulatory obligations), Legal Counsel (contracts/privacy), Security Lead (cyber controls).",
    country: "Australia",
    stateProvince: "Victoria",
    industrySector: "C: Manufacturing",
    industrySubSector: "C26: Manufacture of computer, electronic and optical products",
    applicableFrameworks: [
      "ISO/IEC 42001",
      "ISO/IEC 23894 (AI risk management)",
      "Australian Privacy Act",
      "Australia AI Ethics Principles",
      "National AI Centre - Guidance for AI Adoption"
    ],
    maturityLevel: "Ad hoc",
    currentUse: "Limited pilots for demand forecasting, visual defect detection, and internal document summarization. No fully standardized model lifecycle or centralized AI governance process.",
    riskDomains: "Data quality for production telemetry, model drift, prompt/data leakage risk, third-party model dependency, explainability for customer-facing analytics outputs.",
    aspiration: "Within 18 months, establish a formal AI management system aligned to ISO 42001, expand AI-enabled product features across three product lines, and implement measurable governance, risk, and assurance controls suitable for enterprise customers and regulator scrutiny.",
    targetDate: "Q3 2027"
  };
  data.preferredApproach = "optimal";
  data.roadmapScenario = "standard";
  data.demoMode = true;

  const lowMaturityScores = {
    c4: 2,
    c5: 2,
    c6: 1,
    c7: 2,
    c8: 1,
    c9: 1,
    c10: 1
  };
  allControls().forEach((control) => {
    const prefix = `${control.id}`.split("_")[0];
    let score = lowMaturityScores[prefix] || 1;
    if (["c4_scope", "c7_awareness", "c7_comms"].includes(control.id)) score = 3;
    if (["c8_validation", "c9_reporting", "c10_continuous"].includes(control.id)) score = 2;
    data.ratings[control.id] = score;
    data.evidence[control.id] = { notes: demoEvidenceNote(control, score), links: [], files: [] };
  });

  return {
    id: uid("asmt"),
    title: `ISO 42001 Assessment - ${dd}/${mm}/${yy} (Demo)`,
    demoMode: true,
    isDemo: true,
    createdAt: nowIso(),
    updatedAt: nowIso(),
    data
  };
}

function ensureAssessmentData(assessment) {
  if (!assessment.data) assessment.data = defaultAssessmentData();
  if (assessment.data.context) {
    const normalizedSize = normalizeOrgSizeBand(assessment.data.context.size);
    if (normalizedSize) assessment.data.context.size = normalizedSize;
    ensureContextUploads(assessment.data.context);
  }
  if (!assessment.data.evidence) assessment.data.evidence = {};
  if (!assessment.data.visitedSections) assessment.data.visitedSections = {};
  if (!assessment.data.delegates) assessment.data.delegates = {};
  if (!assessment.data.delegationEvents) assessment.data.delegationEvents = [];
  if (!assessment.data.aiInsights) assessment.data.aiInsights = {};
  if (!assessment.data.sectionInsights) assessment.data.sectionInsights = {};
  if (!assessment.data.preferredApproach) assessment.data.preferredApproach = "fastest";
  if (!assessment.data.roadmapScenario) assessment.data.roadmapScenario = "standard";
  if (!assessment.data.reportAudience) assessment.data.reportAudience = "board";
  if (typeof assessment.data.currentSection !== "number") assessment.data.currentSection = 0;
  if (!assessment.demoMode && assessment.data.demoMode) assessment.demoMode = true;
  if (!assessment.isDemo && (assessment.demoMode || assessment.data.demoMode)) assessment.isDemo = true;
}

function logDelegationEvent(assessment, delegationId, eventType, details = {}, controlId = "") {
  ensureAssessmentData(assessment);
  assessment.data.delegationEvents.push({
    id: uid("evt"),
    delegationId,
    eventType,
    controlId: controlId || "",
    actor: state.profile?.email || "local-user",
    details,
    createdAt: nowIso()
  });
}

function allDelegationBatches(assessment) {
  ensureAssessmentData(assessment);
  const grouped = {};
  Object.entries(assessment.data.delegates || {}).forEach(([controlId, arr]) => {
    (arr || []).forEach((d) => {
      const key = d.delegationId || `${d.email}-${d.delegatedAt || ""}`;
      if (!grouped[key]) {
        grouped[key] = {
          delegationId: key,
          name: d.name || "",
          title: d.title || "",
          email: d.email || "",
          role: d.role || "CONTRIBUTOR",
          intro: d.intro || "",
          delegatedAt: d.delegatedAt || "",
          status: d.status || "SENT",
          controls: []
        };
      }
      const ctl = getControl(controlId);
      if (ctl && !grouped[key].controls.find((x) => x.id === ctl.id)) grouped[key].controls.push(ctl);
      if (d.status === "CLOSED" || (d.status === "RESPONDED" && grouped[key].status === "SENT")) grouped[key].status = d.status;
    });
  });
  return Object.values(grouped).sort((a, b) => `${b.delegatedAt || ""}`.localeCompare(`${a.delegatedAt || ""}`));
}

function ensureEvidence(assessment, controlId) {
  if (!assessment.data.evidence[controlId]) assessment.data.evidence[controlId] = { notes: "", links: [], files: [] };
  return assessment.data.evidence[controlId];
}

function ensureAiInsight(assessment, controlId) {
  if (!assessment.data.aiInsights[controlId]) assessment.data.aiInsights[controlId] = { interpret: "", interpretStructured: null, example: "", updatedAt: "" };
  return assessment.data.aiInsights[controlId];
}

function ensureContextUploads(context) {
  if (!context.contextUploads || typeof context.contextUploads !== "object") {
    context.contextUploads = {
      platforms: { files: [], summary: "", updatedAt: "" },
      roles: { files: [], summary: "", updatedAt: "" }
    };
  }
  if (!context.contextUploads.platforms) context.contextUploads.platforms = { files: [], summary: "", updatedAt: "" };
  if (!context.contextUploads.roles) context.contextUploads.roles = { files: [], summary: "", updatedAt: "" };
  return context.contextUploads;
}

function parseListFromText(text) {
  return `${text || ""}`
    .split(/\r?\n|;|,/)
    .map((x) => x.replace(/^[\-\*\d.)\s]+/, "").trim())
    .filter(Boolean);
}

function compactUnique(values, limit = 16) {
  return Array.from(new Set((values || []).map((x) => `${x}`.trim()).filter(Boolean))).slice(0, limit);
}

async function readTextLikeFile(file) {
  const type = `${file?.type || ""}`.toLowerCase();
  const name = `${file?.name || ""}`.toLowerCase();
  const textLike = type.startsWith("text/")
    || type.includes("json")
    || type.includes("xml")
    || type.includes("csv")
    || type.includes("yaml")
    || type.includes("javascript")
    || type.includes("markdown")
    || /\.(txt|md|csv|json|xml|yaml|yml|log|ini|conf|cfg|tsv|html?)$/.test(name);
  if (!textLike) return "";
  try {
    const txt = await file.text();
    return `${txt || ""}`.slice(0, 120000);
  } catch {
    return "";
  }
}

function summarizePlatformsFromSources(textSources = [], files = []) {
  const text = textSources.join("\n");
  const known = [
    "AWS", "Azure", "GCP", "Google Cloud", "Microsoft 365", "Office 365", "SAP", "Salesforce", "Oracle",
    "ServiceNow", "Workday", "Jira", "Confluence", "GitHub", "GitLab", "Snowflake", "Databricks", "Power BI",
    "Tableau", "Kubernetes", "Docker", "Okta", "CrowdStrike"
  ];
  const hits = [];
  const lower = text.toLowerCase();
  known.forEach((k) => { if (lower.includes(k.toLowerCase())) hits.push(k); });
  const listed = parseListFromText(text).filter((x) => x.length <= 80);
  const filenameHints = files.map((f) => `${f.name || ""}`.replace(/\.[A-Za-z0-9]+$/, "").trim());
  const items = compactUnique(hits.concat(listed).concat(filenameHints), 14);
  if (!items.length) {
    return files.length
      ? `Uploaded ${files.length} file(s). No text content could be parsed automatically; review filenames and add platform details manually.`
      : "No platform content parsed.";
  }
  return `Parsed platform summary: ${items.join("; ")}.`;
}

function summarizeRolesFromSources(textSources = [], files = []) {
  const text = textSources.join("\n");
  const roleKeywords = /\b(CIO|CTO|CISO|CRO|CCO|DPO|Chief|Head|Director|Manager|Lead|Officer|Counsel|Compliance|Risk|Security|Engineering|Data|Technology)\b/i;
  const lines = parseListFromText(text);
  const roleLines = lines.filter((x) => roleKeywords.test(x)).slice(0, 20);
  const orgChartHints = files
    .map((f) => `${f.name || ""}`.replace(/\.[A-Za-z0-9]+$/, ""))
    .filter((n) => /\b(org|organisation|organization|chart|role|raci|team)\b/i.test(n))
    .slice(0, 6);
  const roles = compactUnique(roleLines.concat(orgChartHints), 14);
  if (!roles.length) {
    return files.length
      ? `Uploaded ${files.length} file(s). No role text could be parsed automatically; for org charts in image/PDF format, add role details manually or upload a text/CSV export.`
      : "No role content parsed.";
  }
  return `Parsed role summary: ${roles.join("; ")}.`;
}

async function summarizeContextUploadWithAi(kind, textSources = [], files = [], context = {}) {
  if (!aiFeaturesEnabled() || !aiProviderReady()) return "";
  const joined = textSources.join("\n").slice(0, 16000);
  const fileNames = files.map((f) => f.name || "").filter(Boolean).slice(0, 20).join("; ");
  const label = kind === "roles" ? "Key Roles and Accountabilities" : "Primary IT Platforms";
  const prompt = [
    `Create a concise summary for: ${label}`,
    "Return plain text only, max 120 words.",
    "Focus on actionable, audit-relevant detail and avoid speculation.",
    `Organisation: ${context.orgName || "Unknown"}`,
    `Country: ${context.country || "Unknown"}`,
    `Industry sector: ${context.industrySector || "Unknown"}`,
    `Uploaded filenames: ${fileNames || "None"}`,
    `Extracted text: ${joined || "No extracted text"}`
  ].join("\n");
  const raw = `${await aiComplete("You summarize uploaded business context evidence for ISO 42001 assessments. Keep output concise and factual.", prompt) || ""}`.trim();
  return raw.slice(0, 1200);
}

function allControls() { return sections.filter((s) => s.type === "controls").flatMap((s) => s.controls); }
function getControl(controlId) { return allControls().find((c) => c.id === controlId); }
const ISO42001_REQUIREMENTS = {
  "4.1": {
    title: "Understanding the organization and its context",
    summary: "Define the internal and external factors that affect AI governance outcomes, including strategy, risk appetite, legal context, and operational constraints relevant to AI systems."
  },
  "4.2": {
    title: "Interested parties and their expectations",
    summary: "Identify stakeholders affected by AI systems and determine their relevant requirements, including regulators, customers, employees, partners, and oversight functions."
  },
  "4.3": {
    title: "Determining the scope of the AIMS",
    summary: "Set clear boundaries for the AI management system, including in-scope entities, use cases, products, geographies, and justified exclusions to support auditable governance."
  },
  "4.4": {
    title: "AI management system",
    summary: "Establish, implement, maintain, and continually improve an AI management system with defined processes, accountability, and evidence that controls are operating as designed."
  },
  "5.1": {
    title: "Leadership and commitment",
    summary: "Leadership should actively direct and support the AIMS, ensure resources and governance oversight, and drive accountability for AI risks, controls, and outcomes."
  },
  "5.2": {
    title: "AI policy",
    summary: "Maintain an approved AI policy that sets commitments, principles, and control expectations, and ensure it is communicated, understood, and periodically reviewed."
  },
  "5.3": {
    title: "Roles, responsibilities and authorities",
    summary: "Define and communicate role-based AI governance accountabilities and decision rights so ownership of controls, risk acceptance, and compliance obligations is unambiguous."
  },
  "6.1": {
    title: "Actions to address risks and opportunities",
    summary: "Use a consistent method to identify, assess, prioritize, and treat AI risks and opportunities across the lifecycle, including residual risk acceptance and monitoring."
  },
  "6.2": {
    title: "AI objectives and planning",
    summary: "Set measurable AI governance and risk objectives with owners, timelines, and performance indicators, and plan actions needed to achieve and evidence those objectives."
  },
  "6.3": {
    title: "Planning of changes",
    summary: "Control material changes affecting AI systems and governance by evaluating risk/control impacts before implementation and ensuring approvals and revalidation where required."
  },
  "7.2": {
    title: "Competence",
    summary: "Ensure personnel performing AI governance and operational roles are competent through role-specific training, experience, and records that evidence maintained capability."
  },
  "7.3": {
    title: "Awareness",
    summary: "Ensure relevant personnel understand AI policy obligations, prohibited practices, escalation channels, and the consequences of nonconformity in AI operations."
  },
  "7.4": {
    title: "Communication",
    summary: "Define what AI governance information is communicated, to whom, by whom, and when, including internal escalation and external stakeholder or regulatory communication."
  },
  "7.5": {
    title: "Documented information",
    summary: "Control AI governance documentation and records with versioning, approvals, retention, and accessibility so control design and operating evidence remains audit-ready."
  },
  "8.1": {
    title: "Operational planning and control",
    summary: "Operate AI systems under planned controls, criteria, and responsibilities to ensure governance requirements are implemented consistently in day-to-day execution."
  },
  "8.2": {
    title: "Operational AI controls",
    summary: "Apply operational controls over data, model development, deployment, and monitoring to manage quality, safety, fairness, and compliance risks in AI systems."
  },
  "8.3": {
    title: "AI risk and impact controls in operation",
    summary: "Ensure operational processes include impact and risk checks for AI systems before and during use, with evidence of review, acceptance thresholds, and mitigations."
  },
  "8.4": {
    title: "Externally provided processes, products and services",
    summary: "Manage third-party AI dependencies through due diligence, contractual safeguards, performance monitoring, and risk controls aligned to the organization’s AIMS."
  },
  "8.5": {
    title: "Human oversight",
    summary: "Define and evidence effective human oversight for relevant AI decisions, including intervention points, override conditions, accountability, and audit trails."
  },
  "8.7": {
    title: "Incident handling in operation",
    summary: "Detect, triage, and respond to AI incidents with clear escalation, corrective actions, and closure evidence to reduce recurrence and maintain governance effectiveness."
  },
  "8.8": {
    title: "Security and access control for AI assets",
    summary: "Protect AI models, data, prompts, pipelines, and secrets with access controls, monitoring, and secure lifecycle practices proportionate to risk."
  },
  "9.1": {
    title: "Monitoring, measurement, analysis and evaluation",
    summary: "Monitor AI control effectiveness and outcomes against defined thresholds, analyze trends, and trigger action where performance, risk, or compliance indicators degrade."
  },
  "9.2": {
    title: "Internal audit",
    summary: "Audit the AIMS at planned intervals to verify control design and operation, identify nonconformities, and track remediation to closure."
  },
  "9.3": {
    title: "Management review",
    summary: "Management should periodically review AIMS suitability and effectiveness using evidence on incidents, audit findings, performance metrics, and improvement actions."
  },
  "10.1": {
    title: "Continual improvement",
    summary: "Continually improve the AIMS using findings, performance data, and lessons learned so AI governance maturity and control effectiveness increase over time."
  },
  "10.2": {
    title: "Nonconformity and corrective action",
    summary: "Address nonconformities with root-cause-based corrective action, verify effectiveness, and retain evidence that issues are resolved and sustained."
  }
};

function iso42001ReferenceNumbersForControl(control) {
  const prefix = `${control?.id || ""}`.split("_")[0];
  const byPrefix = {
    c4: ["4.1", "4.2", "4.3", "4.4"],
    c5: ["5.1", "5.2", "5.3"],
    c6: ["6.1", "6.2", "6.3"],
    c7: ["7.2", "7.3", "7.4", "7.5"],
    c8: ["8.1", "8.2", "8.3", "8.4", "8.5", "8.7", "8.8"],
    c9: ["9.1", "9.2", "9.3"],
    c10: ["10.1", "10.2"]
  };
  const fromClause = `${control?.clause || ""}`.match(/Clause\s+(\d+(?:\.\d+)?)/i)?.[1] || "";
  const refs = Array.from(new Set([fromClause].concat(byPrefix[prefix] || []))).filter(Boolean);
  return refs.filter((n) => !!ISO42001_REQUIREMENTS[n]).slice(0, 5);
}

function renderIso42001References(control) {
  const numbers = iso42001ReferenceNumbersForControl(control);
  return `<details class="evidence"><summary><strong>References (${numbers.length})</strong></summary>
    ${numbers.map((n) => {
      const ref = ISO42001_REQUIREMENTS[n];
      return `<details><summary><strong>Clause ${escapeHtml(n)} - ${escapeHtml(ref.title)}</strong></summary><p class="hint">${escapeHtml(ref.summary)}</p></details>`;
    }).join("")}
  </details>`;
}

function isContextFieldComplete(context, field) {
  if (field.type === "geo_reg_scope") {
    return !!(`${context.country || ""}`.trim());
  }
  if (field.type === "industry_classification") {
    const broad = `${context.industrySector || inferSectorFromBusinessContext(context)}`.trim();
    const options = ISIC_SECONDARY_BY_BROAD[broad] || [];
    if (!broad) return false;
    return !options.length || !!(`${context.industrySubSector || ""}`.trim());
  }
  return `${context[field.key] || ""}`.trim().length > 0;
}

function completionPercent(assessment) {
  const controls = allControls();
  const answered = controls.filter((c) => Number(assessment.data.ratings[c.id] || 0) > 0).length;
  const requiredContextFields = sections
    .filter((s) => s.type === "context")
    .flatMap((s) => s.fields.filter((f) => f.required));
  const contextDone = requiredContextFields.filter((f) => isContextFieldComplete(assessment.data.context, f)).length;
  const total = controls.length + requiredContextFields.length;
  return total ? Math.round(((answered + contextDone) / total) * 100) : 0;
}

function weightedScorePercent(assessment) {
  const controls = allControls();
  const weightedMax = controls.reduce((sum, c) => sum + c.weight, 0);
  const weighted = controls.reduce((sum, c) => {
    const score = Number(assessment.data.ratings[c.id] || 0);
    return sum + (score / 5) * c.weight;
  }, 0);
  return weightedMax ? Math.round((weighted / weightedMax) * 100) : 0;
}

function sectionPercent(assessment, section) {
  if (section.type === "context") {
    const required = section.fields.filter((f) => f.required);
    const done = required.filter((f) => isContextFieldComplete(assessment.data.context, f)).length;
    return required.length ? Math.round((done / required.length) * 100) : 100;
  }
  if (section.type === "controls") {
    const ids = section.controls.map((c) => c.id);
    const done = ids.filter((id) => Number(assessment.data.ratings[id] || 0) > 0).length;
    return Math.round((done / ids.length) * 100);
  }
  return assessment.data.currentSection >= sections.length - 1 ? 100 : 0;
}

function ratingFeedback(score) {
  const n = Number(score || 0);
  if (n >= 5) return { cls: "good", text: "Excellent alignment to ISO 42001 expectations." };
  if (n >= 4) return { cls: "good", text: "Strong alignment with minor remediation required." };
  if (n >= 3) return { cls: "med", text: "Partially aligned. Improvement needed before readiness." };
  if (n >= 1) return { cls: "bad", text: "Low alignment. Major control uplift required." };
  return { cls: "", text: "Rate this control from 1-5 stars." };
}

function evidenceQualityMetrics(ev) {
  const notes = `${ev?.notes || ""}`.trim();
  const links = (ev?.links || []).length;
  const files = (ev?.files || []).length;
  const hasOwner = /\b(owner|accountable|responsible|approver)\b/i.test(notes);
  const hasWhen = /\b(weekly|monthly|quarterly|annually|daily|date|as of|since|timeline)\b/i.test(notes);
  const hasArtifacts = /\b(policy|procedure|register|report|ticket|log|dashboard|training|approval|audit)\b/i.test(notes);

  const specificity = Math.min(5, (notes.length > 600 ? 3 : notes.length > 250 ? 2 : notes.length > 80 ? 1 : 0) + (hasOwner ? 1 : 0) + (hasWhen ? 1 : 0));
  const traceability = Math.min(5, (links + files >= 4 ? 3 : links + files >= 2 ? 2 : links + files >= 1 ? 1 : 0) + (hasArtifacts ? 2 : 0));
  const operability = Math.min(5, (hasOwner ? 2 : 0) + (hasWhen ? 2 : 0) + (hasArtifacts ? 1 : 0));
  const overall5 = Number(((specificity + traceability + operability) / 3).toFixed(1));
  const overall100 = Math.round((overall5 / 5) * 100);
  const recommendations = [];
  if (!hasOwner) recommendations.push("Add accountable owner and approval authority.");
  if (!hasWhen) recommendations.push("State control frequency and latest execution/review date.");
  if (links + files === 0) recommendations.push("Attach objective evidence (documents, logs, or dashboards).");
  if (!hasArtifacts) recommendations.push("Reference named artifacts (policy, register, reports, tickets).");
  return { specificity, traceability, operability, overall5, overall100, recommendations };
}

function complianceStatus(score) {
  return Number(score || 0) >= 4 ? "Compliant" : "Non-compliant";
}

function statusToneFromScore(score) {
  const n = Number(score || 0);
  if (n >= 4) return "ok";
  if (n >= 2.5) return "warn";
  return "no";
}

function maskSensitiveText(text, sensitiveTerms = []) {
  let out = `${text || ""}`;
  out = out.replace(/[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/g, "[EMAIL]");
  out = out.replace(/\b(?:\+?\d{1,3}[-.\s]?)?(?:\(?\d{2,4}\)?[-.\s]?)?\d{3}[-.\s]?\d{4}\b/g, "[PHONE]");
  out = out.replace(/\b(?:\d[ -]*?){13,19}\b/g, "[ACCOUNT_OR_CARD]");
  out = out.replace(/\b\d{3}-\d{2}-\d{4}\b/g, "[NATIONAL_ID]");
  out = out.replace(/\b(?:\d{1,3}\.){3}\d{1,3}\b/g, "[IP]");
  out = out.replace(/https?:\/\/[^\s]+/g, "[URL]");
  for (const term of sensitiveTerms) {
    const t = `${term || ""}`.trim();
    if (t.length < 3) continue;
    out = out.replace(new RegExp(t.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "gi"), "[REDACTED]");
  }
  return out;
}

function inferSectorFromIndustryText(industryText) {
  const txt = `${industryText || ""}`.toLowerCase();
  const rules = [
    { match: ["bank", "insurance", "fintech", "investment"], sector: "K: Financial and insurance activities" },
    { match: ["health", "hospital", "pharma", "medical"], sector: "Q: Human health and social work activities" },
    { match: ["government", "public sector", "defence"], sector: "O: Public administration and defence; compulsory social security" },
    { match: ["software", "technology", "telecom", "media", "data"], sector: "J: Information and communication" },
    { match: ["retail", "commerce", "consumer"], sector: "G: Wholesale and retail trade; repair of motor vehicles and motorcycles" },
    { match: ["manufactur", "industrial", "factory"], sector: "C: Manufacturing" },
    { match: ["education", "university", "school"], sector: "P: Education" },
    { match: ["transport", "logistics", "shipping"], sector: "H: Transportation and storage" },
    { match: ["energy", "utility", "power"], sector: "D: Electricity, gas, steam and air conditioning supply" }
  ];
  for (const rule of rules) {
    if (rule.match.some((m) => txt.includes(m))) return rule.sector;
  }
  return "";
}

function inferSectorFromBusinessContext(context = {}) {
  const combined = [context.orgName, context.businessOverview, context.industry].filter(Boolean).join(" ").toLowerCase();
  if (!combined.trim()) return "";
  const rules = [
    { sector: "K: Financial and insurance activities", tokens: ["bank", "banking", "insurance", "insurer", "fintech", "lending", "wealth", "asset management", "superannuation", "broker"] },
    { sector: "Q: Human health and social work activities", tokens: ["hospital", "health", "healthcare", "clinic", "medical", "pharma", "biotech", "aged care"] },
    { sector: "O: Public administration and defence; compulsory social security", tokens: ["government", "public sector", "ministry", "department", "defence", "defense", "council", "authority"] },
    { sector: "P: Education", tokens: ["education", "university", "school", "college", "training provider", "academy"] },
    { sector: "C: Manufacturing", tokens: ["manufactur", "factory", "industrial", "production", "assembly", "plant", "hardware", "electronics manufacturing"] },
    { sector: "J: Information and communication", tokens: ["software", "technology", "telecom", "saas", "data platform", "digital platform", "cloud", "it services"] },
    { sector: "G: Wholesale and retail trade; repair of motor vehicles and motorcycles", tokens: ["retail", "ecommerce", "e-commerce", "wholesale", "consumer goods", "merchant"] },
    { sector: "H: Transportation and storage", tokens: ["transport", "logistics", "freight", "shipping", "warehouse", "courier", "supply chain"] },
    { sector: "D: Electricity, gas, steam and air conditioning supply", tokens: ["energy", "utility", "power", "electricity", "grid", "renewable"] }
  ];
  let best = { sector: "", score: 0 };
  rules.forEach((r) => {
    let score = 0;
    r.tokens.forEach((t) => {
      if (combined.includes(t)) score += 1;
    });
    if (r.sector.startsWith("C:") && /manufactur|factory|industrial/.test(combined)) score += 1;
    if (r.sector.startsWith("J:") && /software|saas|telecom|digital/.test(combined)) score += 1;
    if (score > best.score) best = { sector: r.sector, score };
  });
  if (best.score > 0) return best.sector;
  return inferSectorFromIndustryText(combined);
}

function normalizeOrgSizeBand(value) {
  const txt = `${value || ""}`.trim();
  if (!txt) return "";
  if (ORG_SIZE_BANDS.includes(txt)) return txt;
  const n = Number(txt);
  if (Number.isFinite(n) && n > 0) {
    if (n <= 9) return ORG_SIZE_BANDS[0];
    if (n <= 49) return ORG_SIZE_BANDS[1];
    if (n <= 249) return ORG_SIZE_BANDS[2];
    if (n <= 999) return ORG_SIZE_BANDS[3];
    return ORG_SIZE_BANDS[4];
  }
  const lower = txt.toLowerCase();
  if (lower.includes("very large") || lower.includes("enterprise-scale")) return ORG_SIZE_BANDS[4];
  if (lower.includes("micro")) return ORG_SIZE_BANDS[0];
  if (lower.includes("small")) return ORG_SIZE_BANDS[1];
  if (lower.includes("medium")) return ORG_SIZE_BANDS[2];
  if (lower.includes("large enterprise") || lower.includes("large")) return ORG_SIZE_BANDS[3];
  if (lower.includes("enterprise")) return ORG_SIZE_BANDS[4];
  return "";
}

function baseFrameworksForContext(context) {
  const country = context.country || "";
  const sector = context.industrySector || "";
  const frameworks = ["ISO/IEC 42001", "ISO/IEC 23894 (AI risk management)"];
  if (country === "United States") frameworks.push("NIST AI RMF 1.0", "FTC AI and automated decision guidance");
  if (country === "United Kingdom") frameworks.push("UK GDPR", "ICO AI auditing framework", "UK AI regulation principles");
  if (["France", "Germany", "Ireland", "Netherlands", "Spain", "Sweden", "European Union"].includes(country)) frameworks.push("EU AI Act", "GDPR");
  if (country === "Canada") frameworks.push("PIPEDA", "Voluntary Code of Conduct on Generative AI");
  if (country === "Australia") frameworks.push("Australian Privacy Act", "Australia AI Ethics Principles");
  if (country === "Singapore") frameworks.push("Singapore Model AI Governance Framework", "PDPA (Singapore)");
  if (sector.startsWith("K:")) frameworks.push("Basel model risk management practices", "Financial conduct and prudential AI governance expectations");
  if (sector.startsWith("Q:")) frameworks.push("Health data privacy and clinical safety governance requirements");
  if (sector.startsWith("O:")) frameworks.push("Public sector automated decision transparency requirements");
  return Array.from(new Set(frameworks));
}

function getApplicableFrameworks(context) {
  if (Array.isArray(context.applicableFrameworks) && context.applicableFrameworks.length) return context.applicableFrameworks;
  if (context.applicableFrameworksManual) {
    return `${context.applicableFrameworksManual}`.split(/\n|,/).map((x) => x.trim()).filter(Boolean);
  }
  return [];
}

async function generateFrameworksWithAi(context) {
  if (!aiFeaturesEnabled() || !aiProviderReady()) throw new Error("AI is available in Advanced mode with provider credentials configured.");
  const seed = baseFrameworksForContext(context);
  const output = await aiComplete(
    "You generate concise legal/regulatory framework lists for ISO 42001 context.",
    [
      "Generate a concise list of legal/regulatory/standards frameworks relevant to ISO 42001 readiness.",
      `Country: ${context.country || "Unknown"}`,
      `State/Province: ${context.stateProvince || "N/A"}`,
      `Industry text: ${context.industry || "Unknown"}`,
      `Industry sector: ${context.industrySector || "Unknown"}`,
      `Seed list: ${seed.join("; ")}`,
      "Return 8-14 short framework names, one per line, no numbering."
    ].join("\n")
  );
  const lines = output.split("\n").map((x) => x.replace(/^[\-\d.\)\s]+/, "").trim()).filter(Boolean);
  const merged = Array.from(new Set(seed.concat(lines))).slice(0, 18);
  return merged;
}

function personalizedControlHint(assessment, control) {
  const c = assessment.data.context || {};
  const region = [c.country, c.stateProvince].filter(Boolean).join(", ");
  const sector = c.industrySector || inferSectorFromBusinessContext(c);
  const frameworks = getApplicableFrameworks(c).slice(0, 3).join(", ");
  const parts = [];
  if (region) parts.push(`geography: ${region}`);
  if (sector) parts.push(`sector: ${sector}`);
  if (frameworks) parts.push(`framework focus: ${frameworks}`);
  if (!parts.length) return "";
  return `Context guidance (${control.clause}): prioritize evidence aligned to ${parts.join(" | ")}.`;
}

function safeJsonParse(text) {
  try { return JSON.parse(text); } catch {}
  const cleaned = `${text || ""}`.trim().replace(/^```json\s*/i, "").replace(/^```\s*/i, "").replace(/\s*```$/, "");
  try { return JSON.parse(cleaned); } catch {}
  return null;
}

function normalizeInterpretStructured(obj, fallbackText = "") {
  const parsed = obj && typeof obj === "object" ? obj : {};
  const gaps = Array.isArray(parsed.gaps) ? parsed.gaps.map((x) => `${x}`.trim()).filter(Boolean) : [];
  const evidenceRequested = Array.isArray(parsed.evidenceRequested) ? parsed.evidenceRequested.map((x) => `${x}`.trim()).filter(Boolean) : [];
  const sourcesUsed = Array.isArray(parsed.sourcesUsed) ? parsed.sourcesUsed.map((x) => `${x}`.trim()).filter(Boolean) : [];
  let suggestedRating = Number(parsed.suggestedRating);
  if (!Number.isFinite(suggestedRating)) suggestedRating = 0;
  suggestedRating = Math.max(0, Math.min(5, suggestedRating));
  let confidence = Number(parsed.confidence);
  if (!Number.isFinite(confidence)) confidence = 0;
  confidence = Math.max(0, Math.min(1, confidence));
  const alignment = `${parsed.alignment || fallbackText || ""}`.trim() || "No interpretation returned.";
  const insufficientEvidence = confidence < 0.55 || evidenceRequested.length >= 4;
  return { alignment, gaps, evidenceRequested, suggestedRating, confidence, sourcesUsed, insufficientEvidence };
}

async function aiComplete(systemPrompt, userPrompt) {
  if (!aiFeaturesEnabled()) throw new Error("AI features are only available in Advanced mode.");
  const provider = activeAiProvider();
  if (!aiProviderReady()) throw new Error("AI provider credentials/settings are incomplete.");
  const pre = providerPreflightValidation(provider);
  if (pre.errors.length) {
    addAiDiagnostic({ provider, status: "ERROR", stage: "PREFLIGHT", action: "aiComplete", message: pre.errors[0], details: { errors: pre.errors, warnings: pre.warnings } });
    throw new Error(pre.errors[0]);
  }
  if (pre.warnings.length) {
    addAiDiagnostic({ provider, status: "WARN", stage: "PREFLIGHT", action: "aiComplete", message: pre.warnings[0], details: { warnings: pre.warnings } });
  }
  addAiDiagnostic({
    provider,
    status: "INFO",
    stage: "REQUEST",
    action: "aiComplete",
    message: "AI request started",
    details: { promptChars: `${systemPrompt || ""}`.length + `${userPrompt || ""}`.length, provider }
  });

  try {
    const fetchWithTimeout = async (url, options = {}) => {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), AI_PROVIDER_TIMEOUT_MS);
      try {
        return await fetch(url, { ...options, signal: controller.signal });
      } catch (err) {
        if (err && err.name === "AbortError") {
          throw new Error(`AI request timed out after ${Math.round(AI_PROVIDER_TIMEOUT_MS / 1000)} seconds.`);
        }
        throw err;
      } finally {
        clearTimeout(timeoutId);
      }
    };
    if (provider === "openai") {
      const res = await fetchWithTimeout("https://api.openai.com/v1/responses", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${state.settings.openaiKey}`
        },
        body: JSON.stringify({
          model: "gpt-4.1-mini",
          input: [
            { role: "system", content: [{ type: "input_text", text: systemPrompt }] },
            { role: "user", content: [{ type: "input_text", text: userPrompt }] }
          ]
        })
      });
      const text = await res.text();
      let payload = {};
      try { payload = text ? JSON.parse(text) : {}; } catch { throw new Error(text || "OpenAI response parse failed"); }
      if (!res.ok) throw new Error(`[OpenAI ${res.status}] ${payload.error?.message || payload.error || "Request failed"}`);
      if (payload.output_text) {
        addAiDiagnostic({ provider, status: "SUCCESS", stage: "RESPONSE", action: "aiComplete", message: "OpenAI request succeeded", details: { status: res.status } });
        return `${payload.output_text}`.trim();
      }
      const chunks = [];
      for (const o of payload.output || []) {
        for (const c of o.content || []) {
          if ((c.type === "output_text" || c.type === "text") && c.text) chunks.push(c.text);
        }
      }
      addAiDiagnostic({ provider, status: "SUCCESS", stage: "RESPONSE", action: "aiComplete", message: "OpenAI request succeeded", details: { status: res.status } });
      return chunks.join("\n").trim() || "No output returned.";
    }

    if (provider === "anthropic") {
      const res = await fetchWithTimeout("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": state.settings.anthropicKey,
          "anthropic-version": "2023-06-01"
        },
        body: JSON.stringify({
          model: "claude-3-5-sonnet-latest",
          max_tokens: 1200,
          system: systemPrompt,
          messages: [{ role: "user", content: userPrompt }]
        })
      });
      const text = await res.text();
      let payload = {};
      try { payload = text ? JSON.parse(text) : {}; } catch { throw new Error(text || "Anthropic response parse failed"); }
      if (!res.ok) throw new Error(`[Anthropic ${res.status}] ${payload.error?.message || payload.error?.type || "Request failed"}`);
      const out = (payload.content || []).filter((c) => c.type === "text").map((c) => c.text).join("\n").trim();
      addAiDiagnostic({ provider, status: "SUCCESS", stage: "RESPONSE", action: "aiComplete", message: "Anthropic request succeeded", details: { status: res.status } });
      return out || "No output returned.";
    }

    if (provider === "gemini") {
      const model = "gemini-flash-latest";
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent?key=${encodeURIComponent(state.settings.geminiKey)}`;
      const res = await fetchWithTimeout(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ role: "user", parts: [{ text: `${systemPrompt}\n\n${userPrompt}` }] }]
        })
      });
      const text = await res.text();
      let payload = {};
      try { payload = text ? JSON.parse(text) : {}; } catch { throw new Error(text || "Gemini response parse failed"); }
      if (!res.ok) throw new Error(`[Gemini ${res.status}] ${payload.error?.message || "Request failed"}`);
      const parts = (((payload.candidates || [])[0] || {}).content || {}).parts || [];
      const out = parts.map((p) => p.text).filter(Boolean).join("\n").trim();
      addAiDiagnostic({ provider, status: "SUCCESS", stage: "RESPONSE", action: "aiComplete", message: "Gemini request succeeded", details: { status: res.status, model } });
      return out || "No output returned.";
    }

    const endpoint = `${state.settings.azureEndpoint || ""}`.replace(/\/+$/, "");
    const deployment = state.settings.azureDeployment || "";
    const apiVersion = state.settings.azureApiVersion || "2024-10-21";
    const url = `${endpoint}/openai/deployments/${encodeURIComponent(deployment)}/chat/completions?api-version=${encodeURIComponent(apiVersion)}`;
    const res = await fetchWithTimeout(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "api-key": state.settings.azureApiKey
      },
      body: JSON.stringify({
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt }
        ],
        temperature: 0.2
      })
    });
    const text = await res.text();
    let payload = {};
    try { payload = text ? JSON.parse(text) : {}; } catch { throw new Error(text || "Azure OpenAI response parse failed"); }
    if (!res.ok) throw new Error(`[Azure OpenAI ${res.status}] ${payload.error?.message || "Request failed"}`);
    const out = (((payload.choices || [])[0] || {}).message || {}).content || "";
    addAiDiagnostic({ provider, status: "SUCCESS", stage: "RESPONSE", action: "aiComplete", message: "Azure OpenAI request succeeded", details: { status: res.status, endpoint } });
    return `${out}`.trim() || "No output returned.";
  } catch (err) {
    const formatted = formatProviderError(provider, err.message || `${err}`);
    addAiDiagnostic({
      provider,
      status: "ERROR",
      stage: "RESPONSE",
      action: "aiComplete",
      message: formatted,
      details: { provider, raw: `${err.message || err}`, hint: "See provider settings and preflight validation." }
    });
    throw new Error(formatted);
  }
}

function explainabilityDetails(assessment, control, interpretStructured) {
  const ctx = assessment.data.context || {};
  const explicit = [];
  const inferred = [];
  const frameworks = getApplicableFrameworks(ctx);
  if (ctx.country) explicit.push(`country: ${ctx.country}`);
  if (ctx.stateProvince) explicit.push(`state/province: ${ctx.stateProvince}`);
  if (ctx.industry) explicit.push(`industry text: ${ctx.industry}`);
  if (ctx.industrySector) explicit.push(`industry sector: ${ctx.industrySector}`);
  if (ctx.industrySubSector) explicit.push(`industry secondary classification: ${ctx.industrySubSector}`);
  if (frameworks.length) explicit.push(`frameworks: ${frameworks.join("; ")}`);
  const inferredSector = inferSectorFromBusinessContext(ctx);
  if (!ctx.industrySector && inferredSector) inferred.push(`industry sector inferred from business name and overview: ${inferredSector}`);
  if (!frameworks.length) inferred.push("no explicit frameworks selected; recommendations use ISO 42001 baseline assumptions");
  if (!ctx.country) inferred.push("geography not specified; recommendations use global baseline");
  return {
    control: control.control,
    clause: control.clause,
    contextUsed: explicit,
    frameworksConsidered: frameworks.length ? frameworks : ["ISO/IEC 42001 baseline"],
    inferred,
    sourcesUsed: (interpretStructured && interpretStructured.sourcesUsed) || ["context", "response text", "control metadata"]
  };
}

function heuristicSectionInsights(assessment, section) {
  const insights = { topWeaknesses: [], quickWins: [], nextQuestions: [], source: "heuristic", updatedAt: nowIso() };
  if (section.type === "controls") {
    const findings = detectAnalysisFindings(assessment).filter((f) => section.controls.some((c) => c.id === f.controlId));
    const weakControls = section.controls
      .map((c) => ({ c, score: Number(assessment.data.ratings[c.id] || 0) }))
      .sort((a, b) => a.score - b.score)
      .slice(0, 3);
    insights.topWeaknesses = weakControls.map((x) => `${x.c.control}: scored ${x.score || 0}/5; strengthen design + operating evidence.`);
    if (findings.length) insights.topWeaknesses = insights.topWeaknesses.concat(findings.slice(0, 2).map((f) => `${f.type}: ${f.message}`)).slice(0, 3);
    insights.quickWins = weakControls.map((x) => `For ${x.c.control}, document owner, control frequency, and last 3 months of evidence artifacts.`).slice(0, 3);
    insights.nextQuestions = section.controls.slice(0, 3).map((c) => `Who signs off ${c.control}, and what evidence proves it is currently operating?`);
  } else {
    const required = section.fields.filter((f) => f.required);
    const missing = required.filter((f) => !isContextFieldComplete(assessment.data.context || {}, f));
    insights.topWeaknesses = missing.slice(0, 3).map((f) => `Missing required context: ${f.label}`);
    insights.quickWins = missing.slice(0, 3).map((f) => `Complete ${f.label} with specific, auditable detail.`);
    insights.nextQuestions = [
      "Which legal/regulatory frameworks are in-scope for your operating geographies?",
      "Which accountable role owns AI risk acceptance?",
      "What is your target AI governance maturity and by when?"
    ];
  }
  if (!insights.topWeaknesses.length) insights.topWeaknesses = ["No major weaknesses detected from current section inputs."];
  if (!insights.quickWins.length) insights.quickWins = ["Maintain current evidence and ensure review cadence is documented."];
  return insights;
}

async function generateSectionInsights(assessment, section) {
  const fallback = heuristicSectionInsights(assessment, section);
  if (!aiFeaturesEnabled() || !aiProviderReady()) return fallback;
  const ctx = assessment.data.context || {};
  const contextMasked = {};
  Object.entries(ctx).forEach(([k, v]) => {
    contextMasked[k] = typeof v === "string" ? maskSensitiveText(v, [state.profile?.name, state.profile?.email, ctx.orgName, ctx.orgLegalName]) : v;
  });
  const sectionPayload = section.type === "controls"
    ? section.controls.map((c) => ({
        control: c.control,
        clause: c.clause,
        rating: Number(assessment.data.ratings[c.id] || 0),
        notes: maskSensitiveText((ensureEvidence(assessment, c.id).notes || "").slice(0, 900), [state.profile?.name, state.profile?.email, ctx.orgName, ctx.orgLegalName])
      }))
    : section.fields.map((f) => ({ field: f.label, required: !!f.required, value: `${ctx[f.key] || ""}`.slice(0, 240) }));
  const prompt = [
    "Create section improvement insights for an ISO 42001 assessment.",
    `Section: ${section.title}`,
    `Context: ${JSON.stringify(contextMasked)}`,
    `Section data: ${JSON.stringify(sectionPayload)}`,
    "Return strict JSON only with keys:",
    "{\"topWeaknesses\":[\"...\"],\"quickWins\":[\"...\"],\"nextQuestions\":[\"...\"]}",
    "Each list must contain exactly 3 concise items."
  ].join("\n");
  try {
    const output = await aiComplete(
      "You are an ISO 42001 improvement planning assistant. Return valid JSON only.",
      prompt
    );
    const parsed = safeJsonParse(output || "");
    const out = parsed && typeof parsed === "object" ? parsed : {};
    const toList = (v, dflt) => (Array.isArray(v) ? v.map((x) => `${x}`.trim()).filter(Boolean).slice(0, 3) : dflt);
    return {
      topWeaknesses: toList(out.topWeaknesses, fallback.topWeaknesses).slice(0, 3),
      quickWins: toList(out.quickWins, fallback.quickWins).slice(0, 3),
      nextQuestions: toList(out.nextQuestions, fallback.nextQuestions).slice(0, 3),
      source: "ai",
      updatedAt: nowIso()
    };
  } catch {
    return fallback;
  }
}

function roleSpecificQuestions(role, control) {
  const r = `${role || "CONTRIBUTOR"}`.toUpperCase();
  if (r === "CISO") {
    return [
      "Which security threats and misuse scenarios are covered for this control?",
      "What technical security evidence (access control, monitoring, key/secrets, incident logs) supports effectiveness?"
    ];
  }
  if (r === "CRO" || r === "RISK") {
    return [
      "How is residual risk quantified and accepted for this control?",
      "What risk indicators, thresholds, and escalation triggers are documented?"
    ];
  }
  if (r === "LEGAL" || r === "DPO") {
    return [
      "What legal/privacy obligations are addressed by this control in operating geographies?",
      "Which policy, contract, or assessment artifacts demonstrate compliance?"
    ];
  }
  if (r === "COMPLIANCE") {
    return [
      "What audit trail exists for this control (owner, approvals, review cadence)?",
      "What independent challenge or assurance evidence is available?"
    ];
  }
  if (r === "ENGINEERING" || r === "AI_ENGINEERING") {
    return [
      "How is this control implemented in systems/workflows and enforced technically?",
      "What operational telemetry, tests, or runbooks prove it is working?"
    ];
  }
  return [
    "Which accountable owner confirms this control is in operation?",
    "What recent, objective evidence demonstrates this control is effective?"
  ];
}

function localDelegateResponseAnalysis(control, responseText) {
  const text = `${responseText || ""}`.trim();
  const sentences = text.split(/(?<=[.!?])\s+/).filter(Boolean);
  const summary = (sentences.slice(0, 2).join(" ") || text.slice(0, 280) || "No summary available.").trim();
  const evidence = [];
  text.split("\n").map((x) => x.trim()).filter(Boolean).forEach((line) => {
    if (/\b(policy|procedure|standard|report|register|log|dashboard|ticket|approval|training|contract|audit)\b/i.test(line)) evidence.push(line);
  });
  return {
    summary,
    extractedEvidence: evidence.slice(0, 6),
    mappedControl: control.control,
    mappingRationale: "Local heuristic mapping based on submitted response text."
  };
}

async function runDelegateResponseAi(control, responseText, context, role) {
  if (!aiFeaturesEnabled() || !aiProviderReady()) {
    return localDelegateResponseAnalysis(control, responseText);
  }
  const sensitive = [state.profile?.name, state.profile?.email, context?.orgName, context?.orgLegalName];
  const maskedControlTitle = maskSensitiveText(control.control, sensitive);
  const maskedPrompt = maskSensitiveText(control.prompt, sensitive);
  const maskedResponse = maskSensitiveText(responseText, sensitive);
  const maskedContext = {};
  Object.entries(context || {}).forEach(([k, v]) => {
    maskedContext[k] = typeof v === "string" ? maskSensitiveText(v, sensitive) : v;
  });

  const schemaPrompt = [
    "Analyze delegate response for an ISO 42001 assessment control.",
    `Role: ${role || "CONTRIBUTOR"}`,
    `Control: ${maskedControlTitle}`,
    `Control question: ${maskedPrompt}`,
    `Delegate response: ${maskedResponse}`,
    `Context: ${JSON.stringify(maskedContext)}`,
    "Return strict JSON only with keys:",
    "{\"summary\":\"...\",\"extractedEvidence\":[\"...\"],\"mappedControl\":\"...\",\"mappingRationale\":\"...\"}"
  ].join("\n");

  const raw = `${await aiComplete("You are an ISO 42001 delegation analysis assistant. Return valid JSON only.", schemaPrompt) || ""}`.trim();
  try {
    const parsed = JSON.parse(raw);
    return {
      summary: `${parsed.summary || ""}`.trim() || "No summary returned.",
      extractedEvidence: Array.isArray(parsed.extractedEvidence) ? parsed.extractedEvidence.slice(0, 8) : [],
      mappedControl: `${parsed.mappedControl || control.control}`.trim(),
      mappingRationale: `${parsed.mappingRationale || "Mapped to selected control."}`.trim()
    };
  } catch {
    return localDelegateResponseAnalysis(control, responseText);
  }
}

function frameworkObligationMap() {
  return {
    "EU AI Act": {
      appliesTo: ["c4_scope", "c5_policy", "c5_roles", "c6_risk_method", "c6_risk_register", "c8_validation", "c8_human", "c8_incident", "c9_reporting"],
      obligation: "Demonstrate risk management, human oversight, transparency, and post-market monitoring for AI systems."
    },
    GDPR: {
      appliesTo: ["c5_policy", "c6_risk_method", "c8_data_quality", "c8_human", "c8_incident", "c9_reporting"],
      obligation: "Protect personal data, enforce lawful processing, and support data-subject and accountability obligations."
    },
    "NIST AI RMF 1.0": {
      appliesTo: ["c4_scope", "c5_oversight", "c6_risk_method", "c6_risk_register", "c8_validation", "c9_monitor", "c10_continuous"],
      obligation: "Show governance, measurement, risk management, and ongoing monitoring of AI harms."
    },
    "ISO/IEC 23894 (AI risk management)": {
      appliesTo: ["c6_risk_method", "c6_risk_register", "c6_acceptance", "c9_monitor", "c10_corrective"],
      obligation: "Establish and maintain lifecycle AI risk assessment, treatment, and residual risk acceptance."
    },
    "FTC AI and automated decision guidance": {
      appliesTo: ["c5_policy", "c8_validation", "c8_human", "c9_reporting"],
      obligation: "Substantiate fairness and accuracy claims, avoid deceptive/biased automated decisions."
    },
    "UK GDPR": {
      appliesTo: ["c5_policy", "c8_data_quality", "c8_human", "c8_incident", "c9_reporting"],
      obligation: "Demonstrate lawful, fair, transparent automated processing and data protection controls."
    },
    "Singapore Model AI Governance Framework": {
      appliesTo: ["c5_oversight", "c5_roles", "c8_human", "c9_reporting", "c10_continuous"],
      obligation: "Establish internal governance, human-centric decisions, and explainability for stakeholders."
    }
  };
}

function baselineEvidenceForControl(control) {
  const map = {
    c4_scope: ["Approved AIMS scope statement", "Documented inclusions/exclusions and rationale"],
    c5_policy: ["Approved AI policy documents", "Policy communication/training records"],
    c5_roles: ["RACI with accountable owners", "Evidence of decision-right assignments"],
    c5_oversight: ["Governance forum minutes", "Action log with owners and due dates"],
    c5_objectives: ["AI KPI catalogue", "Periodic KPI reporting evidence"],
    c6_risk_method: ["Documented AI risk methodology", "Completed risk assessments across lifecycle stages"],
    c6_risk_register: ["Current AI risk register", "Assigned owners and treatment deadlines"],
    c6_change: ["AI change assessment checklist", "Pre-release sign-off evidence"],
    c6_third_party: ["Third-party AI due diligence records", "Contractual AI risk/security clauses"],
    c6_acceptance: ["Residual risk acceptance records", "Approval authority and thresholds"],
    c7_competence: ["Role-based training matrix", "Training completion logs"],
    c7_awareness: ["Awareness campaign evidence", "Staff attestations"],
    c7_docs: ["Controlled document repository", "Version/review/retention metadata"],
    c7_comms: ["AI communications protocol", "Incident/regulator communication templates"],
    c8_data_quality: ["Data lineage documentation", "Data quality test results"],
    c8_validation: ["Model validation reports", "Bias/robustness/performance test evidence"],
    c8_human: ["Human-in-the-loop procedures", "Override logs with rationale"],
    c8_incident: ["AI incident playbook", "Incident tickets with RCA and closure evidence"],
    c8_security: ["Access control matrix for AI assets", "Secrets/key management and monitoring logs"],
    c9_monitor: ["Monitoring dashboards and thresholds", "Triggered alerts and remediation evidence"],
    c9_audit: ["Internal audit plans and reports", "Remediation tracking evidence"],
    c9_review: ["Management review packs", "Documented decisions and follow-up actions"],
    c9_reporting: ["Stakeholder AI reports", "Transparency/disclosure records"],
    c10_corrective: ["Corrective action plans", "Effectiveness verification evidence"],
    c10_lessons: ["Lessons-learned records", "Updated controls/training evidence"],
    c10_continuous: ["Improvement roadmap", "Progress and milestone tracking"]
  };
  return map[control.id] || ["Control design documentation", "Operating evidence with owner/date", "Periodic review evidence"];
}

function regulatoryMappingForControl(control, context) {
  const frameworks = getApplicableFrameworks(context);
  const sector = context.industrySector || inferSectorFromBusinessContext(context);
  const geography = [context.country, context.stateProvince].filter(Boolean).join(", ");
  const obligationMap = frameworkObligationMap();

  const relevant = frameworks
    .map((name) => ({ framework: name, rule: obligationMap[name] }))
    .filter((x) => x.rule && x.rule.appliesTo.includes(control.id))
    .map((x) => ({ framework: x.framework, obligation: x.rule.obligation }));

  if (!relevant.length && frameworks.length) {
    relevant.push(...frameworks.slice(0, 2).map((fw) => ({
      framework: fw,
      obligation: "Show this control supports governance, risk reduction, and accountability obligations under the selected framework."
    })));
  }

  const why = [
    geography ? `Operates in ${geography}` : "",
    sector ? `Industry sector ${sector}` : "",
    frameworks.length ? `Mapped to ${frameworks.length} selected framework(s)` : "No frameworks selected yet"
  ].filter(Boolean).join(" | ");

  return {
    why,
    obligations: relevant,
    minimumEvidence: baselineEvidenceForControl(control)
  };
}

async function runOpenAi(mode, control, responseText, context) {
  if (!aiFeaturesEnabled() || !aiProviderReady()) {
    throw new Error("AI is available in Advanced mode with provider credentials configured.");
  }

  const sensitive = [state.profile?.name, state.profile?.email, context?.orgName, context?.orgLegalName];
  const maskedResponse = maskSensitiveText(responseText, sensitive);
  const maskedControlTitle = maskSensitiveText(control.control, sensitive);
  const maskedControlPrompt = maskSensitiveText(control.prompt, sensitive);
  const maskedBest = maskSensitiveText(control.bestPractice, sensitive);
  const maskedContext = {};
  Object.entries(context || {}).forEach(([k, v]) => {
    maskedContext[k] = typeof v === "string" ? maskSensitiveText(v, sensitive) : v;
  });

  const system = mode === "example"
    ? "You are an ISO 42001 audit advisor. Provide practical, relevant examples of strong controls. Inputs are masked. Personalize output to geography, industry sector and applicable regulations in context."
    : "You are an ISO 42001 audit advisor. Interpret responses and identify strengths/gaps. Inputs are masked. Personalize output to geography, industry sector and applicable regulations in context. Return strict JSON only.";

  const userPrompt = mode === "example"
    ? [
        `Control: ${maskedControlTitle}`,
        `Question: ${maskedControlPrompt}`,
        `Best practice: ${maskedBest}`,
        `Current response: ${maskedResponse}`,
        `Context: ${JSON.stringify(maskedContext)}`,
        "Generate 2 relevant example implementations with evidence expectations tailored to this context."
      ].join("\n")
    : [
        `Control: ${maskedControlTitle}`,
        `Question: ${maskedControlPrompt}`,
        `Best practice: ${maskedBest}`,
        `Current response: ${maskedResponse}`,
        `Context: ${JSON.stringify(maskedContext)}`,
        "Return strict JSON only with keys:",
        "{\"alignment\":\"...\",\"gaps\":[\"...\"],\"evidenceRequested\":[\"...\"],\"suggestedRating\":0-5,\"confidence\":0-1,\"sourcesUsed\":[\"response text\",\"context\",\"selected frameworks\"]}",
        "No prose outside JSON."
      ].join("\n");

  return aiComplete(system, userPrompt);
}

async function runOpenAiCopilot(action, control, responseText, context) {
  if (!aiFeaturesEnabled() || !aiProviderReady()) {
    throw new Error("AI is available in Advanced mode with provider credentials configured.");
  }
  const sensitive = [state.profile?.name, state.profile?.email, context?.orgName, context?.orgLegalName];
  const maskedResponse = maskSensitiveText(responseText, sensitive);
  const maskedControlTitle = maskSensitiveText(control.control, sensitive);
  const maskedControlPrompt = maskSensitiveText(control.prompt, sensitive);
  const maskedBest = maskSensitiveText(control.bestPractice, sensitive);
  const maskedContext = {};
  Object.entries(context || {}).forEach(([k, v]) => {
    maskedContext[k] = typeof v === "string" ? maskSensitiveText(v, sensitive) : v;
  });

  const actionMap = {
    draft: "Draft a first-pass response as if written by the organization, with concrete control design and operating evidence.",
    improve: "Improve the existing response by increasing specificity, clarity, and audit usefulness.",
    tighten: "Shorten and strengthen the response into concise, high-value audit language."
  };
  const actionText = actionMap[action] || actionMap.improve;

  const system = "You are an ISO 42001 audit response copilot. Produce practical, evidence-oriented response text tailored to geography, sector, and applicable frameworks in context.";
  const userPrompt = [
    `Task: ${actionText}`,
    `Control: ${maskedControlTitle}`,
    `Question: ${maskedControlPrompt}`,
    `Best practice: ${maskedBest}`,
    `Current response: ${maskedResponse || "(none provided)"}`,
    `Context: ${JSON.stringify(maskedContext)}`,
    "Output only the revised response text. No bullets unless essential. No preamble."
  ].join("\n");

  return aiComplete(system, userPrompt);
}

async function testOpenAiConnection() {
  if (!aiProviderReady()) throw new Error("Provider credentials/settings are incomplete.");
  try {
    await Promise.race([
      aiComplete("You are a connectivity check endpoint.", "Reply with: OK"),
      new Promise((_resolve, reject) => setTimeout(() => reject(new Error(`Connection test timed out after ${Math.round(AI_PROVIDER_TIMEOUT_MS / 1000)} seconds.`)), AI_PROVIDER_TIMEOUT_MS))
    ]);
    return true;
  } catch (err) {
    if (`${err.message || ""}`.toLowerCase().includes("timed out")) throw new Error(`Connection test timed out after ${Math.round(AI_PROVIDER_TIMEOUT_MS / 1000)} seconds.`);
    throw err;
  }
}

function draftEmail(to, subject, body) {
  const params = new URLSearchParams({ subject, body });
  window.location.href = `mailto:${encodeURIComponent(to)}?${params.toString()}`;
}

function normalizeDelegationControlText(value) {
  return `${value || ""}`.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
}

function findDelegationControlByLabel(label, controls) {
  const norm = normalizeDelegationControlText(label);
  if (!norm) return null;
  return controls.find((c) => {
    const idNorm = normalizeDelegationControlText(c.id);
    const controlNorm = normalizeDelegationControlText(c.control);
    return norm === idNorm || norm === controlNorm || controlNorm.includes(norm) || norm.includes(controlNorm);
  }) || null;
}

function parseDelegatedResponseTemplate(rawText, batch) {
  const text = `${rawText || ""}`.replace(/\r/g, "").trim();
  const controls = batch?.controls || [];
  const byControl = {};
  const notes = [];
  if (!controls.length || !text) return { byControl, notes, mappedCount: 0, fallback: true };

  controls.forEach((c) => { byControl[c.id] = ""; });
  let current = controls[0];
  const lines = text.split("\n");
  lines.forEach((line) => {
    const controlMatch = line.match(/^\s*(control|heading)\s*[:#-]\s*(.+)\s*$/i);
    if (controlMatch) {
      const found = findDelegationControlByLabel(controlMatch[2], controls);
      if (found) current = found;
      return;
    }
    const bracketMatch = line.match(/^\s*\[(.+)\]\s*$/);
    if (bracketMatch) {
      const found = findDelegationControlByLabel(bracketMatch[1], controls);
      if (found) {
        current = found;
        return;
      }
    }
    const directControl = controls.find((c) => normalizeDelegationControlText(line) === normalizeDelegationControlText(c.control));
    if (directControl) {
      current = directControl;
      return;
    }
    if (!line.trim() && !byControl[current.id]) return;
    byControl[current.id] = `${byControl[current.id]}${line}\n`;
  });

  let mappedCount = 0;
  Object.keys(byControl).forEach((id) => {
    byControl[id] = byControl[id].trim();
    if (byControl[id]) mappedCount += 1;
  });
  if (!mappedCount && text) {
    byControl[controls[0].id] = text;
    mappedCount = 1;
    notes.push("No control headings found; content mapped to the first delegated control.");
  }
  return { byControl, notes, mappedCount, fallback: mappedCount === 1 && controls.length > 1 };
}

async function mapDelegatedResponseWithAi(rawText, batch, context) {
  const controls = batch?.controls || [];
  if (!controls.length) return { byControl: {}, mappedCount: 0, notes: ["No delegated controls found."] };
  if (assessmentMode() !== "advanced" || !aiFeaturesEnabled() || !aiProviderReady()) {
    throw new Error("AI mapping is available only in Advanced mode with AI provider configured.");
  }

  const sensitive = [state.profile?.name, state.profile?.email, context?.orgName, context?.orgLegalName, batch?.name, batch?.email];
  const masked = maskSensitiveText(rawText, sensitive);
  const controlSpecs = controls.map((c) => ({
    controlId: c.id,
    control: c.control,
    questions: delegationQuestions(c, { data: { context: context || {} } }, batch.role || "CONTRIBUTOR")
  }));

  const prompt = [
    "Map delegate response text to the provided controls.",
    `Role: ${batch.role || "CONTRIBUTOR"}`,
    `Controls: ${JSON.stringify(controlSpecs)}`,
    `Response text: ${masked}`,
    "Return strict JSON only:",
    "{\"mappings\":[{\"controlId\":\"...\",\"response\":\"...\"}],\"unmapped\":\"...\"}",
    "Do not invent control IDs."
  ].join("\n");

  const raw = `${await aiComplete("You map delegated ISO 42001 responses into control buckets. Return JSON only.", prompt) || ""}`.trim();
  const parsed = safeJsonParse(raw) || {};
  const byControl = {};
  controls.forEach((c) => { byControl[c.id] = ""; });

  const mappings = Array.isArray(parsed.mappings) ? parsed.mappings : [];
  mappings.forEach((m) => {
    const id = `${m.controlId || ""}`.trim();
    if (!byControl.hasOwnProperty(id)) return;
    const txt = `${m.response || ""}`.trim();
    if (!txt) return;
    byControl[id] = byControl[id] ? `${byControl[id]}\n\n${txt}` : txt;
  });
  const mappedCount = Object.values(byControl).filter((v) => `${v}`.trim()).length;
  const notes = [];
  const unmapped = `${parsed.unmapped || ""}`.trim();
  if (unmapped) notes.push(`Unmapped excerpt: ${unmapped.slice(0, 220)}${unmapped.length > 220 ? "..." : ""}`);
  return { byControl, mappedCount, notes };
}

function fillDelegationResponseTextareas(root, delegationId, byControl) {
  Object.entries(byControl || {}).forEach(([controlId, text]) => {
    const area = root.querySelector(`[data-response-text='${delegationId}:${controlId}']`);
    if (!area) return;
    area.value = `${text || ""}`.trim();
    area.dispatchEvent(new Event("input", { bubbles: true }));
  });
}

async function applyDelegatedResponses(assessment, batch, responseByControl, files = []) {
  let analyzedCount = 0;
  let appliedCount = 0;
  for (const c of batch.controls) {
    const txt = `${(responseByControl || {})[c.id] || ""}`.trim();
    if (!txt) continue;
    const ev = ensureEvidence(assessment, c.id);
    const stamp = `Delegate response from ${batch.name} (${batch.title}) on ${new Date(batch.delegatedAt).toLocaleString()}:`;
    ev.notes = `${ev.notes || ""}\n\n${stamp}\n${txt}`.trim();
    logDelegationEvent(assessment, batch.delegationId, "RESPONDED", { responseText: txt }, c.id);
    appliedCount += 1;
    if (assessmentMode() === "advanced" && aiFeaturesEnabled() && aiProviderReady()) {
      try {
        const analysis = await runDelegateResponseAi(c, txt, assessment.data.context || {}, batch.role || "CONTRIBUTOR");
        if (!ev.delegateAnalysis) ev.delegateAnalysis = [];
        ev.delegateAnalysis.push({
          id: uid("delegate_ai"),
          delegationId: batch.delegationId,
          role: batch.role || "CONTRIBUTOR",
          analyzedAt: nowIso(),
          summary: analysis.summary || "",
          extractedEvidence: analysis.extractedEvidence || [],
          mappedControl: analysis.mappedControl || c.control,
          mappingRationale: analysis.mappingRationale || ""
        });
        analyzedCount += 1;
        logDelegationEvent(assessment, batch.delegationId, "DELEGATE_RESPONSE_ANALYZED", { mappedControl: analysis.mappedControl || c.control }, c.id);
      } catch (err) {
        logDelegationEvent(assessment, batch.delegationId, "DELEGATE_RESPONSE_ANALYSIS_FAILED", { error: err.message || "analysis failed" }, c.id);
      }
    }
  }

  for (const c of batch.controls) {
    const ev = ensureEvidence(assessment, c.id);
    for (const f of files) ev.files.push({ id: uid("file"), name: f.name, size: f.size, type: f.type || "file", addedAt: nowIso(), delegationId: batch.delegationId });
  }
  if (files.length) {
    logDelegationEvent(assessment, batch.delegationId, "RESPONSE_FILES_ADDED", { fileNames: files.map((f) => f.name) });
  }
  if (appliedCount || files.length) updateDelegationStatus(assessment, batch.delegationId, "RESPONDED");
  assessment.updatedAt = nowIso();
  saveAssessments();
  return { analyzedCount, appliedCount };
}

function delegationSectionIndex(assessment, batch) {
  const controlIds = new Set((batch.controls || []).map((c) => c.id));
  const idx = sections.findIndex((s) => s.type === "controls" && s.controls.some((c) => controlIds.has(c.id)));
  return idx >= 0 ? idx : 0;
}

function updateDelegationStatus(assessment, delegationId, targetStatus) {
  const allowed = {
    SENT: ["RESPONDED", "CLOSED"],
    RESPONDED: ["CLOSED"],
    CLOSED: []
  };
  const batches = allDelegationBatches(assessment);
  const batch = batches.find((b) => b.delegationId === delegationId);
  if (!batch) return { ok: false, error: "Delegation not found." };
  const current = (batch.status || "SENT").toUpperCase();
  const next = (targetStatus || "").toUpperCase();
  if (current === next) return { ok: true };
  if (!(allowed[current] || []).includes(next)) {
    return { ok: false, error: `Invalid transition from ${current} to ${next}.` };
  }
  Object.keys(assessment.data.delegates || {}).forEach((controlId) => {
    assessment.data.delegates[controlId] = (assessment.data.delegates[controlId] || []).map((d) =>
      d.delegationId === delegationId ? { ...d, status: next } : d
    );
  });
  logDelegationEvent(assessment, delegationId, "STATUS_CHANGED", { from: current, to: next });
  assessment.updatedAt = nowIso();
  saveAssessments();
  return { ok: true };
}

function renderDelegationsPage(assessment) {
  const batches = allDelegationBatches(assessment);
  const pending = batches.filter((b) => `${b.status || "SENT"}`.toUpperCase() === "SENT");
  const responded = batches.filter((b) => `${b.status || "SENT"}`.toUpperCase() === "RESPONDED");
  const closed = batches.filter((b) => `${b.status || "SENT"}`.toUpperCase() === "CLOSED");
  const aiMapAvailable = assessmentMode() === "advanced" && aiFeaturesEnabled() && aiProviderReady();
  app.innerHTML = `
    <div class="shell">
      <header class="topbar">
        <div class="brand">
          <div class="brand-row"><img class="brand-logo" src="logo-align42.svg" alt="Align42 logo" /><button class="btn ghost small" id="homeBtn">Home</button><h1>Delegations Audit Trail</h1><span class="meta-pill">Audit log</span></div>
          <p>${escapeHtml(assessment.title)} | ${escapeHtml(state.profile?.name || "Local user")} (${escapeHtml(state.profile?.email || "email not set")})</p>
        </div>
        <div class="actions">
          <a class="btn ghost" href="standards.html" target="_blank" rel="noopener noreferrer">📘 Standards</a>
          <button class="btn secondary" id="refreshDelegationsBtn">↻ Refresh</button>
          <button class="btn ghost" id="backToAssessmentBtn">← Back to Assessment</button>
        </div>
      </header>
      <main class="container card content">
        <div class="list-head"><h2 style="margin:0;">Delegation Records</h2><span class="meta-pill">${batches.length} delegations</span></div>
        <p class="hint">Track status transitions, view response history, and process delegated responses.</p>

        <div class="report-grid">
          <div class="tile"><h3>Pending (SENT)</h3><p><strong>${pending.length}</strong></p></div>
          <div class="tile"><h3>Responded</h3><p><strong>${responded.length}</strong></p></div>
          <div class="tile"><h3>Closed</h3><p><strong>${closed.length}</strong></p></div>
          <div class="tile"><h3>Total Delegations</h3><p><strong>${batches.length}</strong></p></div>
        </div>

        <div class="question question-focus">
          <h3>Pending Response Inbox</h3>
          ${pending.length ? pending.map((b) => `
            <div class="roadmap-row delegate-row">
              <p><strong>${escapeHtml(b.name || b.email)}</strong> (${escapeHtml(b.title || "")}) | ${escapeHtml(b.email)}</p>
              <p><strong>Controls pending:</strong> ${escapeHtml((b.controls || []).map((c) => c.control).join("; "))}</p>
              <div class="actions">
                <button class="btn secondary small" data-open-workspace="${escapeHtml(b.delegationId)}">Open Response Workspace</button>
                <button class="btn ghost small" data-status-update="${escapeHtml(b.delegationId)}:CLOSED">Close Delegation</button>
              </div>
            </div>
          `).join("") : "<p>No pending delegated responses.</p>"}
        </div>

        ${batches.length === 0 ? "<p>No delegations yet.</p>" : batches.map((b) => {
          const status = `${b.status || "SENT"}`.toUpperCase();
          const statusTone = status === "CLOSED" ? "ok" : status === "RESPONDED" ? "warn" : "info";
          const history = (assessment.data.delegationEvents || []).filter((e) => e.delegationId === b.delegationId).sort((a, z) => `${a.createdAt}`.localeCompare(`${z.createdAt}`));
          return `
            <div class="question delegate-record">
              <h3>${escapeHtml(b.name || b.email)}</h3>
              <p class="hint">${escapeHtml(b.title || "")} | ${escapeHtml(b.email)} | Delegated ${escapeHtml(new Date(b.delegatedAt || Date.now()).toLocaleString())}</p>
              <div class="control-meta meta-cluster">
                <span class="tag">Role: ${escapeHtml(b.role || "CONTRIBUTOR")}</span>
                <span class="tag ${statusTone}">Status: ${escapeHtml(status)}</span>
              </div>
              <p><strong>Controls:</strong> ${escapeHtml(b.controls.map((c) => c.control).join("; "))}</p>
              <div class="actions">
                <button class="btn secondary small" data-status-update="${escapeHtml(b.delegationId)}:RESPONDED" ${(b.status || "SENT") !== "SENT" ? "disabled" : ""}>Mark RESPONDED</button>
                <button class="btn secondary small" data-status-update="${escapeHtml(b.delegationId)}:CLOSED" ${(b.status || "SENT") === "CLOSED" ? "disabled" : ""}>Mark CLOSED</button>
              </div>
              <details class="evidence" style="margin-top:0.55rem;">
                <summary><strong>Paste and Parse Delegated Response</strong></summary>
                <p class="hint">Paste a full email reply. Use "Parse and Auto-fill" for quick mapping by headings. ${assessmentMode() === "advanced" ? "AI mapping is available for unstructured replies." : ""}</p>
                <textarea data-parse-input="${escapeHtml(b.delegationId)}" placeholder="Paste full delegated response here, including control and question headings."></textarea>
                <div class="actions">
                  <button class="btn secondary small" data-parse-local="${escapeHtml(b.delegationId)}">Parse and Auto-fill</button>
                  ${assessmentMode() === "advanced" ? `<button class="btn secondary small" data-parse-ai="${escapeHtml(b.delegationId)}" ${aiMapAvailable ? "" : "disabled"}>${aiMapAvailable ? "AI Assist Mapping" : "AI mapping unavailable"}</button>` : ""}
                </div>
                <div>
                  ${(b.controls || []).map((c) => `<label style="display:block; margin-top:0.45rem;"><strong>${escapeHtml(c.control)}</strong><textarea data-parse-target="${escapeHtml(b.delegationId)}:${escapeHtml(c.id)}" placeholder="Mapped response for this control"></textarea></label>`).join("")}
                </div>
                <input type="file" data-parse-files="${escapeHtml(b.delegationId)}" multiple />
                <button class="btn primary small" data-parse-apply="${escapeHtml(b.delegationId)}">Apply Parsed Responses</button>
              </details>
              <div class="evidence">
                <strong>Response History</strong>
                <ul class="evidence-list">
                  ${history.length ? history.map((h) => `<li><strong>${escapeHtml(new Date(h.createdAt).toLocaleString())}</strong> - ${escapeHtml(h.eventType)}${h.controlId ? ` (${escapeHtml(getControl(h.controlId)?.control || h.controlId)})` : ""}</li>`).join("") : "<li>No events recorded yet.</li>"}
                </ul>
              </div>
            </div>
          `;
        }).join("")}
      </main>
    </div>
  `;

  document.getElementById("homeBtn").addEventListener("click", goHome);
  document.getElementById("refreshDelegationsBtn").addEventListener("click", () => renderDelegationsPage(assessment));
  document.getElementById("backToAssessmentBtn").addEventListener("click", () => {
    state.view = "assessment";
    render();
  });
  document.querySelectorAll("[data-open-workspace]").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      const did = e.currentTarget.dataset.openWorkspace;
      const batch = batches.find((b) => b.delegationId === did);
      if (!batch) return;
      const idx = delegationSectionIndex(assessment, batch);
      assessment.data.currentSection = idx;
      state.view = "assessment";
      if (!state.ui.uploadOpen) state.ui.uploadOpen = {};
      state.ui.uploadOpen[did] = true;
      flushAssessmentSave(assessment);
      renderAssessment(assessment);
    });
  });
  document.querySelectorAll("[data-status-update]").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      const [delegationId, status] = e.currentTarget.dataset.statusUpdate.split(":");
      const updated = updateDelegationStatus(assessment, delegationId, status);
      if (!updated.ok) return toast(updated.error);
      toast(`Status updated to ${status}.`);
      renderDelegationsPage(assessment);
    });
  });
  document.querySelectorAll("[data-parse-local]").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      const did = e.currentTarget.dataset.parseLocal;
      const batch = batches.find((b) => b.delegationId === did);
      if (!batch) return;
      const raw = (document.querySelector(`[data-parse-input='${did}']`)?.value || "").trim();
      if (!raw) return toast("Paste delegated response text first.");
      const parsed = parseDelegatedResponseTemplate(raw, batch);
      Object.entries(parsed.byControl).forEach(([controlId, text]) => {
        const target = document.querySelector(`[data-parse-target='${did}:${controlId}']`);
        if (target) target.value = text || "";
      });
      toast(`Parsed responses mapped to ${parsed.mappedCount} control(s).${parsed.notes.length ? ` ${parsed.notes[0]}` : ""}`);
    });
  });
  document.querySelectorAll("[data-parse-ai]").forEach((btn) => {
    btn.addEventListener("click", async (e) => {
      const did = e.currentTarget.dataset.parseAi;
      const batch = batches.find((b) => b.delegationId === did);
      if (!batch) return;
      const raw = (document.querySelector(`[data-parse-input='${did}']`)?.value || "").trim();
      if (!raw) return toast("Paste delegated response text first.");
      e.currentTarget.disabled = true;
      e.currentTarget.textContent = "Mapping...";
      try {
        const parsed = await mapDelegatedResponseWithAi(raw, batch, assessment.data.context || {});
        Object.entries(parsed.byControl).forEach(([controlId, text]) => {
          const target = document.querySelector(`[data-parse-target='${did}:${controlId}']`);
          if (target) target.value = text || "";
        });
        toast(`AI mapped responses to ${parsed.mappedCount} control(s).`);
      } catch (err) {
        toast(err.message || "AI mapping failed.");
      } finally {
        e.currentTarget.disabled = !aiMapAvailable;
        e.currentTarget.textContent = aiMapAvailable ? "AI Assist Mapping" : "AI mapping unavailable";
      }
    });
  });
  document.querySelectorAll("[data-parse-apply]").forEach((btn) => {
    btn.addEventListener("click", async (e) => {
      const did = e.currentTarget.dataset.parseApply;
      const batch = batches.find((b) => b.delegationId === did);
      if (!batch) return;
      let responseByControl = {};
      (batch.controls || []).forEach((c) => {
        responseByControl[c.id] = (document.querySelector(`[data-parse-target='${did}:${c.id}']`)?.value || "").trim();
      });
      const files = Array.from(document.querySelector(`[data-parse-files='${did}']`)?.files || []);
      let hasText = Object.values(responseByControl).some((x) => `${x}`.trim());
      if (!hasText) {
        const raw = (document.querySelector(`[data-parse-input='${did}']`)?.value || "").trim();
        if (raw) {
          const parsed = parseDelegatedResponseTemplate(raw, batch);
          responseByControl = parsed.byControl || responseByControl;
          hasText = Object.values(responseByControl).some((x) => `${x}`.trim());
        }
      }
      if (!hasText && !files.length) return toast("Add parsed text or attachments before applying.");
      const applied = await applyDelegatedResponses(assessment, batch, responseByControl, files);
      toast(applied.analyzedCount ? `Applied ${applied.appliedCount} response(s); AI analyzed ${applied.analyzedCount}.` : `Applied ${applied.appliedCount} response(s).`);
      renderDelegationsPage(assessment);
    });
  });
  attachDictationButtons(app, "textarea[data-parse-input]");
  attachDictationButtons(app, "textarea[data-parse-target]");
}

function render() {
  const assessment = currentAssessment();
  if (state.view === "delegations" && assessment) return renderDelegationsPage(assessment);
  if (assessment) return renderAssessment(assessment);
  return renderWelcome();
}

function renderWelcome() {
  const mode = assessmentMode();
  const aiMode = aiFeaturesEnabled();
  const hasProfile = !!(state.profile && state.profile.name && state.profile.email);
  const showProfileEditor = !hasProfile || !!state.ui.profileEditorOpen;
  const showAiSettings = mode === "advanced" && !!state.settings.settingsOpen;
  const provider = activeAiProvider();
  const setupLink = providerSetupLink(provider);
  const preflight = providerPreflightValidation(provider);
  const diagnostics = (state.settings.aiDiagnostics || []).slice().reverse().slice(0, 25);
  const rows = (state.ui.loggedOut ? [] : state.assessments)
    .slice()
    .filter((a) => !isDemoAssessment(a))
    .sort((a, b) => (b.updatedAt || "").localeCompare(a.updatedAt || ""));
  const completedCount = rows.filter((a) => completionPercent(a) >= 100).length;
  const inProgressCount = Math.max(0, rows.length - completedCount);
  app.innerHTML = `
    <div class="shell">
      <header class="topbar">
        <div class="brand">
          <div class="brand-row"><img class="brand-logo" src="logo-align42.svg" alt="Align42 logo" /><button class="btn ghost small" id="homeBtn">Home</button><span class="meta-pill">${mode === "advanced" ? "Advanced mode" : "Simple mode"}</span>${mode === "advanced" ? `<span class="meta-pill ${aiMode ? "ok-pill" : ""}">${aiMode ? "AI on" : "AI off"}</span>` : ""}</div>
          <p>${escapeHtml(state.profile?.name || "Profile not set")} (${escapeHtml(state.profile?.email || "email not set")})</p>
          ${state.profile?.role ? `<p class="hint" style="margin-top:0.2rem;">Role: ${escapeHtml(state.profile.role)}</p>` : ""}
        </div>
        <div class="actions">
          <a class="btn ghost" href="standards.html" target="_blank" rel="noopener noreferrer">📘 Standards</a>
          <button class="btn primary" id="newAssessmentBtn">➕ New Assessment</button>
          ${mode === "simple" ? `<button class="btn secondary" id="demoAssessmentBtn">🧪 Demo Assessment</button>` : ""}
          <button class="btn ghost" id="editProfileBtn">👤 ${showProfileEditor ? "Hide Profile" : "Edit Profile"}</button>
        </div>
      </header>

      <div class="container card content">
        <div class="welcome-metrics">
          <div class="metric-card"><div class="metric-label">Saved assessments</div><div class="metric-value">${rows.length}</div></div>
          <div class="metric-card"><div class="metric-label">In progress</div><div class="metric-value">${inProgressCount}</div></div>
          <div class="metric-card"><div class="metric-label">Completed</div><div class="metric-value">${completedCount}</div></div>
        </div>
        <div class="setup-grid">
        ${state.ui.loggedOut ? `
          <div class="question question-focus">
            <h3>Logged Out</h3>
            <p class="hint">Your details and saved assessments have been cleared from the current UI and in-memory cache. Local saved data is still retained on this device in the background.</p>
          </div>
        ` : ""}
        ${showProfileEditor ? `
          <div class="question">
            <h3>${hasProfile ? "Edit Profile" : "Set Up Your Profile"}</h3>
            <p class="hint">Enter your details to start or open assessments. All profile fields are shown here together.</p>
            <div class="row">
              <label>Name<input id="profileName" type="text" placeholder="Example: Alex Morgan" value="${escapeHtml(state.profile?.name || "")}" /></label>
              <label>Email<input id="profileEmail" type="email" placeholder="Example: alex@company.com" value="${escapeHtml(state.profile?.email || "")}" /></label>
            </div>
            <label style="margin-top:0.6rem;">Role<input id="profileRole" type="text" placeholder="Example: Risk Manager" value="${escapeHtml(state.profile?.role || "")}" /></label>
            <div class="actions" style="margin-top:0.7rem;">
              <button class="btn primary" id="saveProfileBtn">Save Profile</button>
              ${hasProfile ? `<button class="btn ghost" id="cancelProfileBtn">Close</button>` : ""}
              ${hasProfile ? `<button class="btn ghost" id="logoutBtn">Log Out</button>` : ""}
            </div>
          </div>
        `}
        <div class="question">
          <h3>Assessment Mode</h3>
          <p class="hint">Simple mode is optimized for generalists. Advanced mode enables deeper, more granular specialist scoring and recommendations.</p>
          <label style="display:flex; align-items:center; gap:0.5rem;">
            <select id="assessmentModeSelect">
              <option value="simple" ${mode === "simple" ? "selected" : ""}>Simple (generalist)</option>
              <option value="advanced" ${mode === "advanced" ? "selected" : ""}>Advanced (specialist)</option>
            </select>
          </label>
          <p class="hint">${mode === "advanced" ? "Advanced mode: 0.5-step scoring, richer evidence quality breakdown, and nuanced AI recommendations." : "Simple mode: quick 1-5 scoring with concise guidance."}</p>
        </div>

        <div class="question">
          <h3>AI Mode</h3>
          ${mode === "advanced" ? `
          <p class="hint">Enable optional generative AI support for interpretation and examples.</p>
          <label style="display:flex; align-items:center; gap:0.5rem; margin-top:0.5rem;">
            <input id="aiModeToggle" type="checkbox" ${aiMode ? "checked" : ""} />
            <span>${aiMode ? "AI mode enabled" : "AI mode disabled"}</span>
            ${aiMode ? `<button class="btn ghost small icon-btn" id="aiSettingsToggleBtn" title="Open AI settings" type="button">⚙</button>` : ""}
          </label>
          ${aiDisabledReason() ? `<p class="hint"><strong>AI unavailable:</strong> ${escapeHtml(aiDisabledReason())}</p>` : `<p class="hint"><strong>AI status:</strong> Ready (${escapeHtml(providerLabel())}).</p>`}
          ` : `<p class="hint">AI features are hidden in Simple mode. Switch to Advanced mode to configure and use AI.</p>`}

          <div id="aiSettingsPanel" style="display:${mode === "advanced" && showAiSettings ? "block" : "none"}; margin-top:0.8rem; border-top:1px dashed var(--line); padding-top:0.8rem;">
            <h3>AI Settings</h3>
            <label>Credential Storage
              <select id="aiCredentialStorageSelect">
                <option value="session" ${state.settings.aiCredentialStorage === "persistent" ? "" : "selected"}>Session only (recommended)</option>
                <option value="persistent" ${state.settings.aiCredentialStorage === "persistent" ? "selected" : ""}>Persist on this device</option>
              </select>
            </label>
            <p class="hint">${state.settings.aiCredentialStorage === "persistent" ? "Provider credentials are persisted in local browser storage on this device." : "Provider credentials are kept in-memory for this session and are not persisted to local storage."}</p>
            <label>AI Provider
              <select id="aiProviderSelect">
                <option value="openai" ${provider === "openai" ? "selected" : ""}>OpenAI</option>
                <option value="anthropic" ${provider === "anthropic" ? "selected" : ""}>Anthropic Claude</option>
                <option value="gemini" ${provider === "gemini" ? "selected" : ""}>Google Gemini</option>
                <option value="azure_openai" ${provider === "azure_openai" ? "selected" : ""}>Azure OpenAI</option>
              </select>
            </label>
            ${provider === "openai" ? `
              <label>OpenAI API Key
                <input id="openaiKeyInput" type="password" placeholder="sk-..." value="${escapeHtml(state.settings.openaiKey || "")}" />
              </label>
            ` : ""}
            ${provider === "anthropic" ? `
              <label>Anthropic API Key
                <input id="anthropicKeyInput" type="password" placeholder="sk-ant-..." value="${escapeHtml(state.settings.anthropicKey || "")}" />
              </label>
            ` : ""}
            ${provider === "gemini" ? `
              <label>Gemini API Key
                <input id="geminiKeyInput" type="password" placeholder="AIza..." value="${escapeHtml(state.settings.geminiKey || "")}" />
              </label>
            ` : ""}
            ${provider === "azure_openai" ? `
              <label>Azure OpenAI API Key
                <input id="azureApiKeyInput" type="password" placeholder="Azure API key" value="${escapeHtml(state.settings.azureApiKey || "")}" />
              </label>
              <label>Azure Endpoint
                <input id="azureEndpointInput" type="text" placeholder="https://your-resource.openai.azure.com" value="${escapeHtml(state.settings.azureEndpoint || "")}" />
              </label>
              <label>Azure Deployment Name
                <input id="azureDeploymentInput" type="text" placeholder="gpt-4o-mini" value="${escapeHtml(state.settings.azureDeployment || "")}" />
              </label>
              <label>Azure API Version
                <input id="azureApiVersionInput" type="text" placeholder="2024-10-21" value="${escapeHtml(state.settings.azureApiVersion || "2024-10-21")}" />
              </label>
            ` : ""}
            <div class="actions">
              <button class="btn secondary" id="testAiSettingsBtn">Test API Connection</button>
              <button class="btn secondary" id="saveAiSettingsBtn">Save AI Settings</button>
              <a class="btn ghost" href="${setupLink}" target="_blank" rel="noopener noreferrer">Provider API Setup Instructions</a>
            </div>
            ${preflight.errors.length ? `<div class="evidence"><strong>Provider preflight errors</strong><ul class="evidence-list">${preflight.errors.map((x) => `<li>${escapeHtml(x)}</li>`).join("")}</ul></div>` : ""}
            ${preflight.warnings.length ? `<div class="evidence"><strong>Provider preflight warnings</strong><ul class="evidence-list">${preflight.warnings.map((x) => `<li>${escapeHtml(x)}</li>`).join("")}</ul></div>` : ""}
            <div class="question" style="margin-top:0.7rem;">
              <p class="hint"><strong>Disclaimer:</strong> Although every attempt is made to mask sensitive details when using AI services within Align 42 you should check that the service you are connecting has appropriate data security safeguards based on your organisation's AI policy.</p>
              <label style="display:flex; align-items:center; gap:0.5rem; margin-top:0.45rem;">
                <input type="checkbox" id="aiDisclaimerCheck" ${state.settings.aiDisclaimerAcknowledged ? "checked" : ""} />
                <span>I understand</span>
              </label>
            </div>
            <details class="question">
              <summary><strong>API Diagnostics</strong></summary>
              <p class="hint">Recent connection and request diagnostics (redacted).</p>
              <div class="actions">
                <button class="btn ghost small" type="button" id="clearAiDiagnosticsBtn">Clear Diagnostics</button>
                <button class="btn ghost small" type="button" id="exportAiDiagnosticsBtn">Export Diagnostics JSON</button>
              </div>
              ${diagnostics.length ? `<ul class="evidence-list">${diagnostics.map((d) => `<li><strong>${escapeHtml(new Date(d.at).toLocaleString())}</strong> [${escapeHtml(d.status)}] ${escapeHtml(d.provider)} / ${escapeHtml(d.stage)}${d.action ? ` / ${escapeHtml(d.action)}` : ""}: ${escapeHtml(d.message)}<details><summary>Details</summary><pre class="diag-pre">${escapeHtml(JSON.stringify(d.details || {}, null, 2))}</pre></details></li>`).join("")}</ul>` : "<p class=\"hint\">No diagnostics yet.</p>"}
            </details>
            <p class="hint">Choose session-only storage for stronger local key hygiene.</p>
          </div>
        </div>
        </div>

        <div class="list-head">
          <h2 style="margin:0;">Saved Assessments</h2>
          <span class="meta-pill">${rows.length} total</span>
        </div>
        <div class="assessment-list">
          ${rows.length ? rows.map((a) => `
            <div class="assessment-row">
              <div>
                <h3>${escapeHtml(a.title)}</h3>
                <p>Updated: ${escapeHtml(new Date(a.updatedAt).toLocaleString())} | Score: ${weightedScorePercent(a)}% | Completion: ${completionPercent(a)}%</p>
                <div class="progress-bar tiny"><div style="width:${completionPercent(a)}%"></div></div>
              </div>
              <div class="actions">
                <button class="btn secondary" data-open="${a.id}">Open</button>
                <button class="btn ghost" data-delete="${a.id}">Delete</button>
              </div>
            </div>
          `).join("") : `<p>No assessments yet.</p>`}
        </div>
      </div>
    </div>
  `;

  document.getElementById("homeBtn").addEventListener("click", goHome);
  document.getElementById("saveProfileBtn")?.addEventListener("click", () => {
    const name = document.getElementById("profileName").value.trim();
    const email = document.getElementById("profileEmail").value.trim();
    const role = document.getElementById("profileRole").value.trim();
    if (!name || !email) return toast("Name and email are required.");
    if (state.ui.loggedOut) {
      state.assessments = load(STORAGE.assessments, []);
      state.settings = { ...state.settings, ...load(STORAGE.settings, {}) };
      state.ui.loggedOut = false;
    }
    state.profile = { name, email, role };
    state.ui.profileEditorOpen = false;
    saveProfile();
    render();
  });

  document.getElementById("newAssessmentBtn").addEventListener("click", () => {
    if (!hasProfile) return toast("Set your profile name and email first.");
    const now = new Date();
    const dd = `${now.getDate()}`.padStart(2, "0");
    const mm = `${now.getMonth() + 1}`.padStart(2, "0");
    const yy = `${now.getFullYear()}`.slice(-2);
    const title = prompt("Assessment title", `ISO 42001 Assessment - ${dd}/${mm}/${yy}`);
    if (!title) return;
    const assessment = { id: uid("asmt"), title: title.trim(), createdAt: nowIso(), updatedAt: nowIso(), data: defaultAssessmentData() };
    state.assessments.push(assessment);
    saveAssessments();
    state.currentAssessmentId = assessment.id;
    state.view = "assessment";
    render();
  });

  document.getElementById("demoAssessmentBtn")?.addEventListener("click", () => {
    if (!hasProfile) return toast("Set your profile name and email first.");
    if (assessmentMode() !== "simple") return toast("Demo assessment is available in Simple mode.");
    const assessment = createSimpleModeDemoAssessment();
    state.assessments.push(assessment);
    saveAssessments();
    state.currentAssessmentId = assessment.id;
    state.view = "assessment";
    render();
    toast("Demo assessment created.");
  });

  document.getElementById("editProfileBtn").addEventListener("click", () => {
    state.ui.profileEditorOpen = !state.ui.profileEditorOpen;
    render();
  });
  document.getElementById("cancelProfileBtn")?.addEventListener("click", () => {
    state.ui.profileEditorOpen = false;
    render();
  });
  document.getElementById("logoutBtn")?.addEventListener("click", () => {
    clearVisibleSessionState();
    render();
    toast("Logged out. Local saved data has been hidden from this session.");
  });

  document.getElementById("aiModeToggle")?.addEventListener("change", (e) => {
    state.settings.aiDisclaimerAcknowledged = false;
    state.settings.aiMode = e.target.checked;
    state.settings.settingsOpen = e.target.checked;
    saveSettings();
    render();
  });
  document.getElementById("assessmentModeSelect").addEventListener("change", (e) => {
    const prevMode = state.settings.assessmentMode;
    state.settings.assessmentMode = e.target.value === "advanced" ? "advanced" : "simple";
    if (state.settings.assessmentMode !== prevMode) state.settings.aiDisclaimerAcknowledged = false;
    if (state.settings.assessmentMode !== "advanced") {
      state.settings.aiMode = false;
      state.settings.settingsOpen = false;
      state.settings.aiDisclaimerAcknowledged = false;
    }
    saveSettings();
    render();
  });

  document.getElementById("aiSettingsToggleBtn")?.addEventListener("click", () => {
    state.settings.settingsOpen = !state.settings.settingsOpen;
    saveSettings();
    render();
  });
  const clearAiDisclaimerAck = (refresh = false) => {
    state.settings.aiDisclaimerAcknowledged = false;
    const check = document.getElementById("aiDisclaimerCheck");
    if (check) check.checked = false;
    saveSettings();
    if (refresh) render();
  };
  document.getElementById("aiProviderSelect")?.addEventListener("change", (e) => {
    state.settings.aiProvider = e.target.value;
    clearAiDisclaimerAck(true);
  });
  document.getElementById("aiCredentialStorageSelect")?.addEventListener("change", (e) => {
    state.settings.aiCredentialStorage = e.target.value === "persistent" ? "persistent" : "session";
    clearAiDisclaimerAck(false);
  });
  ["openaiKeyInput", "anthropicKeyInput", "geminiKeyInput", "azureApiKeyInput", "azureEndpointInput", "azureDeploymentInput", "azureApiVersionInput"].forEach((id) => {
    document.getElementById(id)?.addEventListener("input", () => clearAiDisclaimerAck(false));
  });

  document.getElementById("testAiSettingsBtn")?.addEventListener("click", async () => {
    state.settings.aiCredentialStorage = (document.getElementById("aiCredentialStorageSelect")?.value || state.settings.aiCredentialStorage || "session") === "persistent" ? "persistent" : "session";
    state.settings.openaiKey = (document.getElementById("openaiKeyInput")?.value || state.settings.openaiKey || "").trim();
    state.settings.anthropicKey = (document.getElementById("anthropicKeyInput")?.value || state.settings.anthropicKey || "").trim();
    state.settings.geminiKey = (document.getElementById("geminiKeyInput")?.value || state.settings.geminiKey || "").trim();
    state.settings.azureApiKey = (document.getElementById("azureApiKeyInput")?.value || state.settings.azureApiKey || "").trim();
    state.settings.azureEndpoint = (document.getElementById("azureEndpointInput")?.value || state.settings.azureEndpoint || "").trim();
    state.settings.azureDeployment = (document.getElementById("azureDeploymentInput")?.value || state.settings.azureDeployment || "").trim();
    state.settings.azureApiVersion = (document.getElementById("azureApiVersionInput")?.value || state.settings.azureApiVersion || "2024-10-21").trim();
    const pre = providerPreflightValidation(activeAiProvider());
    if (pre.errors.length) {
      addAiDiagnostic({ status: "ERROR", stage: "PREFLIGHT", action: "connection_test", message: pre.errors[0], details: { errors: pre.errors, warnings: pre.warnings } });
      toast(pre.errors[0]);
      render();
      return;
    }
    if (pre.warnings.length) addAiDiagnostic({ status: "WARN", stage: "PREFLIGHT", action: "connection_test", message: pre.warnings[0], details: { warnings: pre.warnings } });
    const btn = document.getElementById("testAiSettingsBtn");
    btn.disabled = true;
    btn.textContent = "Testing...";
    try {
      await testOpenAiConnection();
      toast("AI provider connection successful.");
      addAiDiagnostic({ status: "SUCCESS", stage: "CONNECTION", action: "connection_test", message: "Connection test successful." });
    } catch (err) {
      const formatted = formatProviderError(activeAiProvider(), err.message || `${err}`);
      toast(formatted);
      addAiDiagnostic({ status: "ERROR", stage: "CONNECTION", action: "connection_test", message: formatted, details: { raw: err.message || `${err}` } });
    } finally {
      btn.disabled = false;
      btn.textContent = "Test API Connection";
      render();
    }
  });

  document.getElementById("saveAiSettingsBtn")?.addEventListener("click", () => {
    const disclaimerChecked = !!document.getElementById("aiDisclaimerCheck")?.checked;
    if (!disclaimerChecked) {
      toast("You must confirm the AI disclaimer before saving AI settings.");
      return;
    }
    state.settings.aiCredentialStorage = (document.getElementById("aiCredentialStorageSelect")?.value || state.settings.aiCredentialStorage || "session") === "persistent" ? "persistent" : "session";
    state.settings.openaiKey = (document.getElementById("openaiKeyInput")?.value || state.settings.openaiKey || "").trim();
    state.settings.anthropicKey = (document.getElementById("anthropicKeyInput")?.value || state.settings.anthropicKey || "").trim();
    state.settings.geminiKey = (document.getElementById("geminiKeyInput")?.value || state.settings.geminiKey || "").trim();
    state.settings.azureApiKey = (document.getElementById("azureApiKeyInput")?.value || state.settings.azureApiKey || "").trim();
    state.settings.azureEndpoint = (document.getElementById("azureEndpointInput")?.value || state.settings.azureEndpoint || "").trim();
    state.settings.azureDeployment = (document.getElementById("azureDeploymentInput")?.value || state.settings.azureDeployment || "").trim();
    state.settings.azureApiVersion = (document.getElementById("azureApiVersionInput")?.value || state.settings.azureApiVersion || "2024-10-21").trim();
    const pre = providerPreflightValidation(activeAiProvider());
    if (pre.errors.length) {
      addAiDiagnostic({ status: "ERROR", stage: "PREFLIGHT", action: "save_settings", message: pre.errors[0], details: { errors: pre.errors, warnings: pre.warnings } });
      toast(pre.errors[0]);
      return;
    }
    const warningMsg = pre.warnings.length ? pre.warnings[0] : "";
    if (pre.warnings.length) {
      addAiDiagnostic({ status: "WARN", stage: "PREFLIGHT", action: "save_settings", message: pre.warnings[0], details: { warnings: pre.warnings } });
    }
    state.settings.aiDisclaimerAcknowledged = true;
    state.settings.settingsOpen = false;
    saveSettings();
    toast(warningMsg ? `AI settings saved with warning: ${warningMsg}` : "AI settings saved locally.");
    render();
  });
  document.getElementById("clearAiDiagnosticsBtn")?.addEventListener("click", () => {
    clearAiDiagnostics();
    toast("AI diagnostics cleared.");
    render();
  });
  document.getElementById("exportAiDiagnosticsBtn")?.addEventListener("click", () => {
    const payload = {
      exportedAt: nowIso(),
      provider: providerLabel(),
      assessmentMode: assessmentMode(),
      entries: state.settings.aiDiagnostics || []
    };
    const stamp = new Date().toISOString().replace(/[:.]/g, "-");
    download(`align42-ai-diagnostics-${stamp}.json`, "application/json", JSON.stringify(payload, null, 2));
    toast("AI diagnostics exported.");
  });

  document.querySelectorAll("[data-open]").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      if (!hasProfile) return toast("Set your profile name and email first.");
      state.currentAssessmentId = e.currentTarget.dataset.open;
      state.view = "assessment";
      render();
    });
  });
  document.querySelectorAll("[data-delete]").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      const id = e.currentTarget.dataset.delete;
      if (!confirm("Delete this assessment?")) return;
      state.assessments = state.assessments.filter((a) => a.id !== id);
      saveAssessments();
      render();
    });
  });
}

function renderAssessment(assessment) {
  stopDictation();
  const section = sections[assessment.data.currentSection];
  if (!assessment.data.visitedSections) assessment.data.visitedSections = {};
  if (!assessment.data.visitedSections[section.id]) {
    assessment.data.visitedSections[section.id] = true;
    assessment.updatedAt = nowIso();
    saveAssessments();
  }
  const completion = completionPercent(assessment);
  const score = weightedScorePercent(assessment);
  const delegateOpen = !!(state.ui.delegateOpen && state.ui.delegateOpen[section.id]);
  const sectionDelegation = sectionDelegationSummary(assessment, section);

  app.innerHTML = `
    <div class="shell">
      <header class="topbar">
        <div class="brand">
          <div class="brand-row"><img class="brand-logo" src="logo-align42.svg" alt="Align42 logo" /><button class="btn ghost small" id="homeBtn">Home</button><h1>${escapeHtml(assessment.title)}</h1><span class="meta-pill">Step ${assessment.data.currentSection + 1}/${sections.length}</span>${section.type === "controls" && sectionDelegation.pendingControls > 0 ? `<span class="meta-pill pending">Pending feedback: ${sectionDelegation.pendingControls}</span>` : ""}</div>
          <p>${escapeHtml(state.profile?.name || "Local user")} (${escapeHtml(state.profile?.email || "email not set")})</p>
        </div>
        <div class="actions">
          <a class="btn ghost" href="standards.html" target="_blank" rel="noopener noreferrer">📘 Standards</a>
          <button class="btn warn" id="delegateBtn">${section.type === "controls" ? (delegateOpen ? "📨 Hide Delegate" : "📨 Delegate") : "Delegate (Controls only)"}</button>
          <button class="btn secondary" id="delegationsBtn">📋 Delegations</button>
          <button class="btn secondary" id="saveBtn">💾 Save</button>
          <button class="btn ghost" id="backBtn">← Back</button>
        </div>
      </header>
      <main class="container layout">
        <aside class="card sidebar">
          <h2>📈 Assessment Progress</h2>
          <p class="hint">Track completion by section and focus first on low-completion or high-risk controls.</p>
          <div class="progress-wrap">
            <div class="progress-head"><span>${completion}%</span><span>Complete</span></div>
            <div class="progress-bar"><div style="width:${completion}%"></div></div>
          </div>
          <div class="section-progress-list">
            ${sections.map((s, i) => {
              const p = sectionPercent(assessment, s);
              const visited = !!assessment.data.visitedSections[s.id];
              const canJump = p >= 100 || visited || i === assessment.data.currentSection;
              const stateClass = p >= 100 ? "done" : p > 0 ? "active" : "todo";
              const currentClass = i === assessment.data.currentSection ? "current" : "";
              const ds = sectionDelegationSummary(assessment, s);
              const cue = ds.pendingControls > 0
                ? `<span class="section-cue section-cue-pending">${ds.pendingControls} pending</span>`
                : ds.delegatedControls > 0
                  ? `<span class="section-cue section-cue-delegated">${ds.delegatedControls} delegated</span>`
                  : "";
              const sectionHeading = headingCase(s.title);
              const heading = canJump
                ? `<span class="section-link">${i + 1}. ${escapeHtml(sectionHeading)}</span>${cue}`
                : `<span class="section-static">${i + 1}. ${escapeHtml(sectionHeading)}</span>${cue}`;
              return `<div class="section-progress-item ${stateClass} ${currentClass} ${canJump ? "jumpable" : ""}" ${canJump ? `data-jump-section="${i}" role="button" tabindex="0" aria-label="Go to ${escapeHtml(sectionHeading)}"` : ""}><div class="title">${heading}<strong>${p}%</strong></div><div class="progress-bar"><div style="width:${p}%"></div></div></div>`;
            }).join("")}
          </div>
          <div class="score-wrap"><div>Weighted alignment score</div><div class="score-pill">${score}%</div></div>
          <div class="score-wrap">
            <div>Status legend</div>
            <div class="control-meta">
              <span class="tag ok">Compliant</span>
              <span class="tag warn">Partially aligned</span>
              <span class="tag no">Non-compliant</span>
            </div>
          </div>
        </aside>
        <section class="card content" id="wizardSection"></section>
      </main>
    </div>
  `;

  document.getElementById("homeBtn").addEventListener("click", goHome);
  document.getElementById("saveBtn").addEventListener("click", () => {
    flushAssessmentSave(assessment);
    toast("Saved.");
  });
  document.getElementById("backBtn").addEventListener("click", () => {
    flushAssessmentSave(assessment);
    state.currentAssessmentId = null;
    state.view = "assessment";
    render();
  });
  document.getElementById("delegationsBtn").addEventListener("click", () => {
    state.view = "delegations";
    render();
  });
  document.getElementById("delegateBtn").addEventListener("click", () => {
    if (section.type !== "controls") {
      toast("Delegation is available on control sections.");
      return;
    }
    if (!state.ui.delegateOpen) state.ui.delegateOpen = {};
    state.ui.delegateOpen[section.id] = !state.ui.delegateOpen[section.id];
    renderAssessment(assessment);
  });

  app.querySelectorAll(".section-progress-item[data-jump-section]").forEach((el) => {
    const jumpToSection = (target) => {
      const idx = Number(target.dataset.jumpSection);
      if (!Number.isFinite(idx)) return;
      assessment.data.currentSection = Math.max(0, Math.min(sections.length - 1, idx));
      flushAssessmentSave(assessment);
      renderAssessment(assessment);
    };
    el.addEventListener("click", (e) => jumpToSection(e.currentTarget));
    el.addEventListener("keydown", (e) => {
      if (e.key !== "Enter" && e.key !== " ") return;
      e.preventDefault();
      jumpToSection(e.currentTarget);
    });
  });

  if (section.type === "context") renderContext(assessment, section);
  else if (section.type === "controls") renderControls(assessment, section);
  else if (section.type === "final") renderFinal(assessment);
  else renderRoadmap(assessment);
}

function renderContext(assessment, section) {
  const root = document.getElementById("wizardSection");
  const ctx = assessment.data.context || {};
  const contextUploads = ensureContextUploads(ctx);
  let initializedDefaultCountry = false;
  if (!`${ctx.country || ""}`.trim()) {
    ctx.country = "Australia";
    if (!ctx.localisationSource) ctx.localisationSource = "default";
    const seed = baseFrameworksForContext(ctx);
    if (!Array.isArray(ctx.frameworkSuggestions) || !ctx.frameworkSuggestions.length) ctx.frameworkSuggestions = seed.slice();
    if (!Array.isArray(ctx.applicableFrameworks) || !ctx.applicableFrameworks.length) ctx.applicableFrameworks = seed.slice();
    initializedDefaultCountry = true;
  }
  if (initializedDefaultCountry) {
    assessment.updatedAt = nowIso();
    saveAssessments();
  }
  const selectedCountry = ctx.country || "Australia";
  const stateOptions = STATE_OPTIONS[selectedCountry] || [];
  const inferredSector = inferSectorFromBusinessContext(ctx);
  const chosenSector = ctx.industrySector || inferredSector || "";
  const secondaryOptions = ISIC_SECONDARY_BY_BROAD[chosenSector] || [];
  const chosenSecondary = ctx.industrySubSector || "";
  if (inferredSector && (!ctx.industrySector || ctx.industrySectorAuto)) {
    ctx.industrySector = inferredSector;
    ctx.industrySectorAuto = true;
  }
  if (!Array.isArray(ctx.applicableFrameworks)) ctx.applicableFrameworks = [];
  const frameworks = getApplicableFrameworks(ctx);
  const aiEnabled = aiFeaturesEnabled();
  const aiReady = !!(aiFeaturesEnabled() && aiProviderReady());
  const frameworkSuggestions = aiEnabled ? (ctx.frameworkSuggestions && ctx.frameworkSuggestions.length ? ctx.frameworkSuggestions : baseFrameworksForContext(ctx)) : [];
  const sectionInsight = assessment.data.sectionInsights[section.id] || null;
  const sectionInsightView = sectionInsight || heuristicSectionInsights(assessment, section);

  root.innerHTML = `
    <div class="wizard-head"><div><div class="step-badge">Step ${assessment.data.currentSection + 1} of ${sections.length}</div><h2 class="section-title">${escapeHtml(headingCase(section.title))}</h2><p class="section-desc">${escapeHtml(section.description)}</p></div></div>
    ${section.fields.map((f) => {
      const val = assessment.data.context[f.key] || "";
      if (f.type === "geo_reg_scope") {
        return `
          <div class="question question-focus">
            <h3>${escapeHtml(headingCase(f.label))}${f.required ? " *" : ""}</h3>
            <label>Country
              <select data-field="country">
                <option value="">Select country</option>
                ${COUNTRY_OPTIONS.map((c) => `<option value="${escapeHtml(c)}" ${selectedCountry === c ? "selected" : ""}>${escapeHtml(c)}</option>`).join("")}
              </select>
            </label>
            ${ctx.country && ctx.localisationSource && ctx.localisationSource !== "manual"
              ? `<p class="hint">Country pre-filled from ${escapeHtml(localisationSourceLabel(ctx.localisationSource))}. You can change it.</p>`
              : ""}
            ${stateOptions.length ? `
              <label>State / Province
                <select data-field="stateProvince">
                  <option value="">Select state/province</option>
                  ${stateOptions.map((s) => `<option value="${escapeHtml(s)}" ${ctx.stateProvince === s ? "selected" : ""}>${escapeHtml(s)}</option>`).join("")}
                </select>
              </label>` :
              `<label>Region / Province (optional)
                <input type="text" data-field="stateProvince" value="${escapeHtml(ctx.stateProvince || "")}" placeholder="Enter state/province/region if relevant" />
              </label>`
            }

            ${aiEnabled ? `
              <div class="evidence">
                <strong>Applicable legal/regulatory frameworks</strong>
                <p class="hint">AI mode is enabled. Generate and select frameworks relevant to your geography and sector.</p>
                <div class="actions">
                  <button class="btn secondary small" type="button" id="genFrameworksBtn" ${aiReady ? "" : "disabled"}>${aiReady ? "Generate with AI" : "Add provider credentials to generate"}</button>
                  <button class="btn ghost small" type="button" id="applyBaseFrameworksBtn">Use Baseline Suggestions</button>
                </div>
                <div style="margin-top:0.55rem;">
                  ${frameworkSuggestions.map((name) => `
                    <label style="display:flex; align-items:center; gap:0.45rem; margin-bottom:0.32rem;">
                      <input type="checkbox" data-framework-option="${escapeHtml(name)}" ${frameworks.includes(name) ? "checked" : ""} />
                      <span>${escapeHtml(name)}</span>
                    </label>
                  `).join("") || `<p class="hint">No suggestions yet. Generate using AI or use baseline suggestions.</p>`}
                </div>
                <div class="row" style="margin-top:0.45rem;">
                  <input type="text" id="customFrameworkInput" placeholder="Add your own framework" />
                  <button class="btn secondary small" type="button" id="addCustomFrameworkBtn">Add More</button>
                </div>
                <p class="hint">Selected: ${frameworks.length ? escapeHtml(frameworks.join("; ")) : "None selected yet."}</p>
              </div>
            ` : `
              <div class="evidence">
                <strong>Applicable legal/regulatory frameworks</strong>
                <p class="hint">AI mode is disabled. Enter frameworks manually for your geography and industry.</p>
                <textarea data-field="applicableFrameworksManual" placeholder="Example: EU AI Act, GDPR, NIST AI RMF, sector-specific regulator guidance.">${escapeHtml(ctx.applicableFrameworksManual || "")}</textarea>
              </div>
            `}
          </div>
        `;
      }
      if (f.type === "industry_classification") {
        return `
          <div class="question question-lite">
            <h3>${escapeHtml(headingCase(f.label))}${f.required ? " *" : ""}</h3>
            <div class="row">
              <label>Broad industry (ISIC Rev.5 section)
                <select data-field="industrySector">
                  <option value="">Select broad industry</option>
                  ${ISIC_SECTORS.map((s) => `<option value="${escapeHtml(s)}" ${chosenSector === s ? "selected" : ""}>${escapeHtml(s)}</option>`).join("")}
                </select>
              </label>
              <label>Secondary classification
                <select data-field="industrySubSector">
                  <option value="">Select secondary classification</option>
                  ${secondaryOptions.map((s) => `<option value="${escapeHtml(s)}" ${chosenSecondary === s ? "selected" : ""}>${escapeHtml(s)}</option>`).join("")}
                </select>
              </label>
            </div>
          </div>
        `;
      }
      if (f.type === "textarea") {
        const uploadBlock = (f.key === "platforms" || f.key === "roles")
          ? `<div class="evidence">
              <strong>Upload Supporting Files</strong>
              <p class="hint">${f.key === "roles" ? "Upload org charts or role matrices (text/CSV preferred for parsing)." : "Upload platform inventories or architecture exports (text/CSV preferred for parsing)."}</p>
              <input type="file" data-context-upload="${f.key}" multiple />
              <div class="actions" style="margin-top:0.45rem;">
                <button class="btn secondary small" type="button" data-context-parse="${f.key}">${assessmentMode() === "advanced" ? "Parse Uploaded Files (AI if available)" : "Parse Uploaded Files"}</button>
              </div>
              ${(contextUploads[f.key]?.summary || "") ? `<p class="hint"><strong>Parsed summary:</strong> ${escapeHtml(contextUploads[f.key].summary)}</p>` : ""}
              ${(contextUploads[f.key]?.files || []).length ? `<ul class="evidence-list">${(contextUploads[f.key].files || []).map((x) => `<li>${escapeHtml(x.name)} (${Math.max(1, Math.round((x.size || 0) / 1024))} KB)</li>`).join("")}</ul>` : ""}
            </div>`
          : "";
        return `<div class="question question-lite"><h3>${escapeHtml(headingCase(f.label))}${f.required ? " *" : ""}</h3><textarea data-field="${f.key}" placeholder="${escapeHtml(f.starter || "Provide response")}">${escapeHtml(val)}</textarea>${uploadBlock}</div>`;
      }
      if (f.type === "select") return `<div class="question question-lite"><h3>${escapeHtml(headingCase(f.label))}${f.required ? " *" : ""}</h3><select data-field="${f.key}">${f.options.map((o) => `<option value="${escapeHtml(o)}" ${val === o ? "selected" : ""}>${escapeHtml(o)}</option>`).join("")}</select></div>`;
      return `<div class="question question-lite"><h3>${escapeHtml(headingCase(f.label))}${f.required ? " *" : ""}</h3><input type="${f.type}" data-field="${f.key}" value="${escapeHtml(val)}" placeholder="${escapeHtml(f.starter || "Provide response")}" /></div>`;
    }).join("")}
    <div class="question question-insight">
      <h3>Feedback</h3>
      <p class="hint"><strong>Focus area:</strong> ${escapeHtml(practicalSectionFeedback(sectionInsightView).focus)}.</p>
      <p class="hint"><strong>Suggested action:</strong> ${escapeHtml(practicalSectionFeedback(sectionInsightView).nextStep)}</p>
      ${(practicalSectionFeedback(sectionInsightView).questions || []).length ? `<p class="hint"><strong>Questions for stakeholders:</strong></p><ul class="evidence-list">${practicalSectionFeedback(sectionInsightView).questions.map((q) => `<li>${escapeHtml(q)}</li>`).join("")}</ul>` : ""}
    </div>
    ${renderNav(assessment)}
  `;

  root.querySelectorAll("[data-field]").forEach((el) => {
    const syncIndustryClassificationUi = () => {
      const broadSelect = root.querySelector("select[data-field='industrySector']");
      const secondarySelect = root.querySelector("select[data-field='industrySubSector']");
      if (!broadSelect || !secondarySelect) return;
      const broad = assessment.data.context.industrySector || "";
      if (broad && broadSelect.value !== broad) broadSelect.value = broad;
      const secondaryOptions = ISIC_SECONDARY_BY_BROAD[broad] || [];
      if (!secondaryOptions.includes(assessment.data.context.industrySubSector || "")) assessment.data.context.industrySubSector = "";
      secondarySelect.innerHTML = `<option value="">Select secondary classification</option>${secondaryOptions.map((s) => `<option value="${escapeHtml(s)}" ${(assessment.data.context.industrySubSector || "") === s ? "selected" : ""}>${escapeHtml(s)}</option>`).join("")}`;
    };
    const eventName = el.tagName === "SELECT" ? "change" : "input";
    el.addEventListener(eventName, (e) => {
      const field = e.target.dataset.field;
      assessment.data.context[field] = e.target.value;
      if (e.target.dataset.field === "country") {
        const selected = e.target.value;
        const states = STATE_OPTIONS[selected] || [];
        if (!states.includes(assessment.data.context.stateProvince || "")) assessment.data.context.stateProvince = "";
        assessment.data.context.localisationSource = "manual";
        assessment.data.context.frameworkSuggestions = baseFrameworksForContext(assessment.data.context);
      }
      if (["orgName", "businessOverview"].includes(field) && !assessment.data.context.industrySector) {
        const inferred = inferSectorFromBusinessContext(assessment.data.context);
        if (inferred) {
          assessment.data.context.industrySector = inferred;
          assessment.data.context.industrySectorAuto = true;
          syncIndustryClassificationUi();
        }
      }
      if (["orgName", "businessOverview"].includes(field) && assessment.data.context.industrySectorAuto) {
        const inferred = inferSectorFromBusinessContext(assessment.data.context);
        if (inferred && inferred !== assessment.data.context.industrySector) {
          assessment.data.context.industrySector = inferred;
          syncIndustryClassificationUi();
        }
      }
      if (field === "industrySector") {
        assessment.data.context.industrySectorAuto = false;
        const options = ISIC_SECONDARY_BY_BROAD[assessment.data.context.industrySector || ""] || [];
        if (!options.includes(assessment.data.context.industrySubSector || "")) assessment.data.context.industrySubSector = "";
      }
      scheduleAssessmentSave(assessment);
      if (["country", "industrySector", "industrySubSector"].includes(field)) renderContext(assessment, section);
    });
  });

  root.querySelectorAll("[data-framework-option]").forEach((box) => {
    box.addEventListener("change", (e) => {
      const name = e.target.dataset.frameworkOption;
      const cur = new Set(getApplicableFrameworks(assessment.data.context));
      if (e.target.checked) cur.add(name);
      else cur.delete(name);
      assessment.data.context.applicableFrameworks = Array.from(cur);
      assessment.updatedAt = nowIso();
      saveAssessments();
      renderContext(assessment, section);
    });
  });

  document.getElementById("applyBaseFrameworksBtn")?.addEventListener("click", () => {
    assessment.data.context.frameworkSuggestions = baseFrameworksForContext(assessment.data.context);
    assessment.data.context.applicableFrameworks = Array.from(new Set((assessment.data.context.applicableFrameworks || []).concat(assessment.data.context.frameworkSuggestions)));
    assessment.updatedAt = nowIso();
    saveAssessments();
    renderContext(assessment, section);
  });

  document.getElementById("genFrameworksBtn")?.addEventListener("click", async () => {
    const btn = document.getElementById("genFrameworksBtn");
    btn.disabled = true;
    btn.textContent = "Generating...";
    try {
      const generated = await generateFrameworksWithAi(assessment.data.context);
      assessment.data.context.frameworkSuggestions = generated;
      assessment.data.context.applicableFrameworks = Array.from(new Set((assessment.data.context.applicableFrameworks || []).concat(generated)));
      assessment.updatedAt = nowIso();
      saveAssessments();
      toast("Framework suggestions generated.");
      renderContext(assessment, section);
    } catch (err) {
      toast(err.message || "Could not generate frameworks.");
      btn.disabled = false;
      btn.textContent = "Generate with AI";
    }
  });

  document.getElementById("addCustomFrameworkBtn")?.addEventListener("click", () => {
    const input = document.getElementById("customFrameworkInput");
    const value = (input.value || "").trim();
    if (!value) return;
    const cur = new Set(getApplicableFrameworks(assessment.data.context));
    cur.add(value);
    assessment.data.context.applicableFrameworks = Array.from(cur);
    input.value = "";
    assessment.updatedAt = nowIso();
    saveAssessments();
    renderContext(assessment, section);
  });

  root.querySelectorAll("[data-context-upload]").forEach((el) => {
    el.addEventListener("change", (e) => {
      const key = e.target.dataset.contextUpload;
      if (!["platforms", "roles"].includes(key)) return;
      const files = Array.from(e.target.files || []);
      if (!files.length) return;
      ensureContextUploads(assessment.data.context);
      assessment.data.context.contextUploads[key].files = files.map((f) => ({
        id: uid("ctx_file"),
        name: f.name,
        size: f.size,
        type: f.type || "file",
        addedAt: nowIso()
      }));
      assessment.updatedAt = nowIso();
      saveAssessments();
      toast(`${files.length} file(s) attached for ${key}.`);
      renderContext(assessment, section);
    });
  });

  root.querySelectorAll("[data-context-parse]").forEach((btn) => {
    btn.addEventListener("click", async (e) => {
      const key = e.currentTarget.dataset.contextParse;
      if (!["platforms", "roles"].includes(key)) return;
      const fileInput = root.querySelector(`[data-context-upload='${key}']`);
      const files = Array.from(fileInput?.files || []);
      if (!files.length) return toast("Upload file(s) first.");
      e.currentTarget.disabled = true;
      const original = e.currentTarget.textContent;
      e.currentTarget.textContent = "Parsing...";
      try {
        const texts = [];
        for (const f of files) {
          const txt = await readTextLikeFile(f);
          if (txt) texts.push(txt);
        }
        let summary = "";
        if (assessmentMode() === "advanced" && aiFeaturesEnabled() && aiProviderReady()) {
          try {
            summary = await summarizeContextUploadWithAi(key, texts, files, assessment.data.context || {});
          } catch {}
        }
        if (!summary) {
          summary = key === "platforms"
            ? summarizePlatformsFromSources(texts, files)
            : summarizeRolesFromSources(texts, files);
        }
        ensureContextUploads(assessment.data.context);
        assessment.data.context.contextUploads[key].summary = summary;
        assessment.data.context.contextUploads[key].updatedAt = nowIso();
        const current = `${assessment.data.context[key] || ""}`.trim();
        assessment.data.context[key] = current
          ? `${current}\n\n${summary}`
          : summary;
        assessment.updatedAt = nowIso();
        saveAssessments();
        toast(`Parsed ${files.length} file(s) for ${key}.`);
        renderContext(assessment, section);
      } finally {
        e.currentTarget.disabled = false;
        e.currentTarget.textContent = original;
      }
    });
  });
  bindNav(assessment);
}

function delegationsForSection(assessment, section) {
  const all = allDelegationBatches(assessment);
  const ids = new Set(section.controls.map((c) => c.id));
  return all
    .map((b) => ({ ...b, controls: b.controls.filter((c) => ids.has(c.id)) }))
    .filter((b) => b.controls.length > 0);
}

function latestDelegationForControl(assessment, controlId) {
  return (assessment.data.delegates[controlId] || [])
    .slice()
    .sort((a, b) => `${b.delegatedAt || ""}`.localeCompare(`${a.delegatedAt || ""}`))[0] || null;
}

function sectionDelegationSummary(assessment, section) {
  if (!section || section.type !== "controls") return { delegatedControls: 0, pendingControls: 0 };
  const delegated = new Set();
  const pending = new Set();
  (section.controls || []).forEach((c) => {
    const entries = assessment.data.delegates[c.id] || [];
    if (!entries.length) return;
    delegated.add(c.id);
    if (entries.some((d) => `${d.status || "SENT"}`.toUpperCase() === "SENT")) pending.add(c.id);
  });
  return { delegatedControls: delegated.size, pendingControls: pending.size };
}

function delegatedContributorsForControl(assessment, controlId) {
  const batches = allDelegationBatches(assessment);
  const nameByDelegationId = {};
  batches.forEach((b) => {
    nameByDelegationId[b.delegationId] = (b.name || b.email || "").trim();
  });

  const profileName = `${state.profile?.name || ""}`.trim().toLowerCase();
  const profileEmail = `${state.profile?.email || ""}`.trim().toLowerCase();
  const contributors = new Set();
  (assessment.data.delegationEvents || []).forEach((e) => {
    if (e.controlId !== controlId || e.eventType !== "RESPONDED") return;
    const txt = `${e.details?.responseText || ""}`.trim();
    if (!txt) return;
    const rawName = `${nameByDelegationId[e.delegationId] || ""}`.trim();
    if (!rawName) return;
    const lowered = rawName.toLowerCase();
    if (lowered === profileName || lowered === profileEmail) return;
    contributors.add(rawName);
  });
  return Array.from(contributors);
}

function delegationQuestions(control, assessment = null, role = "CONTRIBUTOR") {
  const list = [
    control.prompt,
    "What evidence demonstrates this control is designed and operating effectively?",
    "What gaps, exceptions, or risks remain and what remediation is planned?"
  ];
  list.push(...roleSpecificQuestions(role, control));
  if (assessment) {
    const c = assessment.data.context || {};
    const frameworks = getApplicableFrameworks(c);
    const region = [c.country, c.stateProvince].filter(Boolean).join(", ");
    if (frameworks.length || region || c.industrySector) {
      list.push(`How does this control address ${[region, c.industrySector, frameworks.slice(0, 2).join(" / ")].filter(Boolean).join(" | ")} requirements?`);
    }
  }
  return list;
}

function shortSectionSuggestion(sectionInsightView) {
  if (sectionInsightView?.quickWins?.length) return sectionInsightView.quickWins[0];
  if (sectionInsightView?.topWeaknesses?.length) return `Focus first on ${sectionInsightView.topWeaknesses[0].replace(/\.$/, "")}.`;
  if (sectionInsightView?.nextQuestions?.length) return sectionInsightView.nextQuestions[0];
  return "Complete the highest-risk responses first, then add supporting evidence for any partial or weak controls.";
}

function practicalSectionFeedback(sectionInsightView) {
  const focus = sectionInsightView?.topWeaknesses?.[0]
    ? sectionInsightView.topWeaknesses[0].replace(/\.$/, "")
    : "the weakest controls with the largest compliance gap";
  const nextStep = sectionInsightView?.quickWins?.[0]
    || "Add concise evidence and clear ownership for any control scored below target.";
  const questions = (sectionInsightView?.nextQuestions || [])
    .map((q) => `${q || ""}`.trim())
    .filter(Boolean)
    .slice(0, 3);
  return { focus, nextStep, questions };
}

function renderControls(assessment, section) {
  const root = document.getElementById("wizardSection");
  const batches = delegationsForSection(assessment, section);
  const delegationSummary = sectionDelegationSummary(assessment, section);
  const delegateOpen = !!(state.ui.delegateOpen && state.ui.delegateOpen[section.id]);
  const mode = assessmentMode();
  const aiWarning = mode === "advanced" ? aiDisabledReason() : "";
  const sectionControlIds = new Set(section.controls.map((c) => c.id));
  const sectionFindings = detectAnalysisFindings(assessment).filter((f) => f.controlId && sectionControlIds.has(f.controlId));
  const sectionInsight = assessment.data.sectionInsights[section.id] || null;
  const sectionInsightView = sectionInsight || heuristicSectionInsights(assessment, section);

  root.innerHTML = `
    <div class="wizard-head"><div><div class="step-badge">Step ${assessment.data.currentSection + 1} of ${sections.length}</div><h2 class="section-title">${escapeHtml(headingCase(section.title))}</h2><p class="section-desc">${escapeHtml(section.description)}</p></div><div class="heading-cues">${delegationSummary.delegatedControls > 0 ? `<span class="tag info">Delegated controls: ${delegationSummary.delegatedControls}</span>` : ""}${delegationSummary.pendingControls > 0 ? `<span class="tag warn">Pending feedback: ${delegationSummary.pendingControls}</span>` : ""}</div></div>

    ${sectionFindings.length ? `<div class="question question-alert">
      <h3>⚠ Consistency and Dependency Findings</h3>
      <p class="hint">Potential contradictions or dependency risks detected in this section.</p>
      <ul class="evidence-list">
        ${sectionFindings.map((f) => `<li><span class="tag ${f.severity === "High" ? "no" : "ok"}">${escapeHtml(f.severity)}</span> <strong>${escapeHtml(getControl(f.controlId)?.control || f.controlId)}:</strong> ${escapeHtml(f.message)}</li>`).join("")}
      </ul>
    </div>` : ""}

    ${delegateOpen ? `<div class="question question-delegate">
      <h3>📨 Delegate Questions for This Section</h3>
      <p class="hint">Select controls, choose delegate role, and create a draft email in your default email client.</p>
      <div class="row">
        <input id="delegateName" type="text" placeholder="Delegate name" />
        <input id="delegateTitle" type="text" placeholder="Delegate title" />
      </div>
      <div class="row" style="margin-top:0.55rem;">
        <input id="delegateEmail" type="email" placeholder="delegate@company.com" />
        <select id="delegateRole">
          <option value="CONTRIBUTOR">Contributor</option>
          <option value="REVIEWER">Reviewer</option>
          <option value="CISO">CISO</option>
          <option value="CRO">CRO / Risk Lead</option>
          <option value="LEGAL">Legal Counsel</option>
          <option value="DPO">Data Protection Officer</option>
          <option value="COMPLIANCE">Compliance Lead</option>
          <option value="AI_ENGINEERING">AI Engineering Lead</option>
        </select>
      </div>
      <div style="margin-top:0.55rem;"><input id="delegateIntro" type="text" placeholder="Optional context message" /></div>
      <div style="margin-top:0.65rem;">${section.controls.map((c) => `<label style="display:flex; gap:0.5rem; align-items:center; margin-bottom:0.35rem;"><input type="checkbox" data-delegate-control="${c.id}" /><span><strong>${escapeHtml(c.control)}</strong> <span class="hint">(${escapeHtml(c.clause)})</span></span></label>`).join("")}</div>
      <button class="btn warn small" id="sendDelegationBtn" style="margin-top:0.6rem;">Create Delegation Draft</button>
    </div>` : ""}

    ${aiWarning ? `<div class="question question-alert"><p class="hint"><strong>AI currently unavailable:</strong> ${escapeHtml(aiWarning)}</p></div>` : ""}

    ${batches.length ? `<div class="question"><h3>📬 Delegated Requests</h3>${batches.map((b) => {
      const status = `${b.status || "SENT"}`.toUpperCase();
      const statusTone = status === "CLOSED" ? "ok" : status === "RESPONDED" ? "warn" : "info";
      return `
      <div class="roadmap-row delegate-row">
        <p><strong>Delegated to:</strong> ${escapeHtml(b.name || b.email)} (${escapeHtml(b.title || "")})</p>
        <p><strong>Email:</strong> ${escapeHtml(b.email)} | <strong>Role:</strong> ${escapeHtml(b.role || "CONTRIBUTOR")} | <strong>Date:</strong> ${escapeHtml(new Date(b.delegatedAt || Date.now()).toLocaleString())} | <strong>Status:</strong> <span class="tag ${statusTone}">${escapeHtml(status)}</span></p>
        <p><strong>Controls:</strong> ${escapeHtml(b.controls.map((c) => c.control).join("; "))}</p>
        <button class="btn secondary small" data-upload-toggle="${escapeHtml(b.delegationId)}">Upload Responses</button>
        <div style="display:${state.ui.uploadOpen[b.delegationId] ? "block" : "none"}; margin-top:0.6rem;" id="upload-${escapeHtml(b.delegationId)}">
          <div class="question">
            <h3>Paste and Parse (all delegated controls)</h3>
            <p class="hint">Paste the delegate's full email response. Parse it to auto-fill control response boxes.</p>
            <textarea data-import-text="${escapeHtml(b.delegationId)}" placeholder="Paste full delegated response email text here."></textarea>
            <div class="actions">
              <button class="btn secondary small" type="button" data-parse-import="${escapeHtml(b.delegationId)}">Parse and Auto-fill</button>
              ${assessmentMode() === "advanced" ? `<button class="btn secondary small" type="button" data-parse-import-ai="${escapeHtml(b.delegationId)}" ${(aiFeaturesEnabled() && aiProviderReady()) ? "" : "disabled"}>${(aiFeaturesEnabled() && aiProviderReady()) ? "AI Assist Mapping" : "AI mapping unavailable"}</button>` : ""}
            </div>
          </div>
          ${b.controls.map((c) => {
            const ev = ensureEvidence(assessment, c.id);
            const analyses = (ev.delegateAnalysis || []).filter((x) => x.delegationId === b.delegationId);
            return `<div class="question"><h3>${escapeHtml(c.control)}</h3><p class="hint">${delegationQuestions(c, assessment, b.role || "CONTRIBUTOR").map((q, i) => `${i + 1}. ${escapeHtml(q)}`).join("<br>")}</p><textarea data-response-text="${escapeHtml(b.delegationId)}:${c.id}" placeholder="Paste delegate response here"></textarea>${analyses.length ? `<div class="evidence"><strong>Delegate AI Analysis History</strong><ul class="evidence-list">${analyses.map((a) => `<li><strong>${escapeHtml(new Date(a.analyzedAt).toLocaleString())}</strong> [${escapeHtml(a.role || "CONTRIBUTOR")}]: ${escapeHtml(a.summary)}</li>`).join("")}</ul></div>` : ""}</div>`;
          }).join("")}
          <input type="file" data-response-files="${escapeHtml(b.delegationId)}" multiple />
          <button class="btn primary small" data-submit-responses="${escapeHtml(b.delegationId)}">Apply Responses and Attach Documents</button>
        </div>
      </div>
    `; }).join("")}</div>` : ""}

    ${section.controls.map((c) => {
      const score = Number(assessment.data.ratings[c.id] || 0);
      const ev = ensureEvidence(assessment, c.id);
      const ai = ensureAiInsight(assessment, c.id);
      const fb = ratingFeedback(score);
      const tone = statusToneFromScore(score);
      const regMap = regulatoryMappingForControl(c, assessment.data.context || {});
      const explain = ai.interpretStructured ? explainabilityDetails(assessment, c, ai.interpretStructured) : null;
      const eq = evidenceQualityMetrics(ev);
      const contributors = delegatedContributorsForControl(assessment, c.id);
      const latestDelegateAnalysis = (ev.delegateAnalysis || []).slice().sort((a, b) => `${b.analyzedAt || ""}`.localeCompare(`${a.analyzedAt || ""}`))[0];
      const latestDelegation = latestDelegationForControl(assessment, c.id);
      const latestDelegationStatus = `${latestDelegation?.status || ""}`.toUpperCase();
      const delegatedClass = latestDelegationStatus === "SENT" ? "delegated-pending" : latestDelegation ? "delegated" : "";
      return `
        <div class="question control-card ${tone} ${delegatedClass}">
          <h3>${escapeHtml(c.control)}</h3>
          <p class="hint">${escapeHtml(c.prompt)}</p>
          ${personalizedControlHint(assessment, c) ? `<p class="hint"><strong>Personalized focus:</strong> ${escapeHtml(personalizedControlHint(assessment, c))}</p>` : ""}
          <div class="control-meta">
            <span class="tag">${escapeHtml(c.clause)}</span>
            <span class="tag">Weight ${c.weight}</span>
            <span class="tag ${tone}">${complianceStatus(score)}</span>
            ${latestDelegation ? `<span class="tag ${latestDelegationStatus === "SENT" ? "warn" : latestDelegationStatus === "RESPONDED" ? "info" : "ok"}">${latestDelegationStatus === "SENT" ? "Pending delegate feedback" : latestDelegationStatus === "RESPONDED" ? "Delegate response received" : "Delegation closed"}</span>` : ""}
            ${latestDelegation ? `<span class="tag">Delegated to ${escapeHtml(latestDelegation.name || latestDelegation.email)} on ${escapeHtml(new Date(latestDelegation.delegatedAt).toLocaleDateString())}</span>` : ""}
          </div>
          ${mode === "advanced"
            ? `<div class="score-row">${[0.5,1,1.5,2,2.5,3,3.5,4,4.5,5].map((v) => `<button type="button" class="score-chip ${Number(score) === v ? "active" : ""}" data-score="${v}" data-control="${c.id}">${v.toFixed(1)}</button>`).join("")}</div>`
            : `<div class="star-row">${[1,2,3,4,5].map((i) => `<button type="button" class="star ${i <= Math.round(score) ? "filled" : ""}" data-score="${i}" data-control="${c.id}">★</button>`).join("")}</div>`
          }
          <div class="feedback ${fb.cls}">${fb.text}</div>
          <p class="hint">${mode === "advanced" ? "Advanced mode scoring: 0.5 increments for nuanced maturity." : "Simple mode scoring: whole-number 1-5 assessment."}</p>

          <div class="control-actions">
            <button class="btn ghost small" type="button" data-example-toggle="${c.id}">Show Best Practice Example</button>
            ${mode === "advanced" ? `
              <button class="btn secondary small" type="button" data-ai-action="${c.id}:interpret">AI Interpret Response</button>
              <button class="btn secondary small" type="button" data-ai-action="${c.id}:example">AI Generate Relevant Example</button>
            ` : ""}
          </div>
          <div class="hint" id="example-${c.id}" style="display:none; margin-top:0.4rem;"><strong>Example:</strong> ${escapeHtml(c.example)}</div>
          ${mode === "advanced" ? `<div class="hint" style="margin-top:0.35rem;"><strong>AI Privacy:</strong> sensitive content is masked before provider request.</div>` : ""}
          ${mode === "advanced" && ai.interpret ? `<details class="evidence"><summary><strong>AI Interpretation</strong></summary><p class="hint">${escapeHtml(ai.interpret)}</p>${ai.interpretStructured ? `
            <p class="hint"><strong>Suggested rating:</strong> ${ai.interpretStructured.suggestedRating || 0}/5 | <strong>Confidence:</strong> ${Math.round((ai.interpretStructured.confidence || 0) * 100)}% ${ai.interpretStructured.insufficientEvidence ? `<span class="tag no">Insufficient evidence</span>` : `<span class="tag ok">Evidence appears sufficient</span>`}</p>
            <div style="margin-top:0.35rem;">
              <button class="btn secondary small" type="button" data-apply-ai-rating="${c.id}">Apply AI suggested rating</button>
            </div>
            <p class="hint"><strong>Key gaps:</strong></p>
            <ul class="evidence-list">${(ai.interpretStructured.gaps || []).length ? ai.interpretStructured.gaps.map((x) => `<li>${escapeHtml(x)}</li>`).join("") : "<li>No major gaps identified.</li>"}</ul>
            <p class="hint"><strong>Evidence requested:</strong></p>
            <ul class="evidence-list">${(ai.interpretStructured.evidenceRequested || []).length ? ai.interpretStructured.evidenceRequested.map((x) => `<li>${escapeHtml(x)}</li>`).join("") : "<li>No additional evidence requested.</li>"}</ul>
            <p class="hint"><strong>Sources used:</strong> ${(ai.interpretStructured.sourcesUsed || []).length ? escapeHtml(ai.interpretStructured.sourcesUsed.join("; ")) : "context and response text"}</p>
            ${explain ? `<details><summary><strong>Why this recommendation?</strong></summary><p class="hint"><strong>Context used:</strong> ${(explain.contextUsed || []).length ? escapeHtml(explain.contextUsed.join(" | ")) : "None explicit."}</p><p class="hint"><strong>Frameworks considered:</strong> ${escapeHtml((explain.frameworksConsidered || []).join("; "))}</p><p class="hint"><strong>Inferred assumptions:</strong> ${(explain.inferred || []).length ? escapeHtml(explain.inferred.join(" | ")) : "None."}</p><p class="hint"><strong>Control reference:</strong> ${escapeHtml(explain.control)} (${escapeHtml(explain.clause)})</p></details>` : ""}
          ` : ""}</details>` : ""}
          ${mode === "advanced" && ai.example ? `<details class="evidence"><summary><strong>AI Relevant Example</strong></summary><p class="hint">${escapeHtml(ai.example)}</p></details>` : ""}
          <details class="evidence">
            <summary><strong>Regulatory Mapping</strong></summary>
            <p class="hint"><strong>Why this matters here:</strong> ${escapeHtml(regMap.why)}</p>
            <p class="hint"><strong>Likely obligations:</strong></p>
            <ul class="evidence-list">
              ${(regMap.obligations || []).length
                ? regMap.obligations.map((o) => `<li><strong>${escapeHtml(o.framework)}:</strong> ${escapeHtml(o.obligation)}</li>`).join("")
                : "<li>No frameworks selected yet. Add frameworks in Business Context for tailored mapping.</li>"
              }
            </ul>
            <p class="hint"><strong>Minimum acceptable evidence:</strong></p>
            <ul class="evidence-list">${(regMap.minimumEvidence || []).map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul>
          </details>
          ${renderIso42001References(c)}

          <div class="evidence">
            <strong>Response and Evidence</strong>
            ${contributors.length ? `<p class="hint"><strong>Contributors:</strong> ${escapeHtml(contributors.join(", "))}</p>` : ""}
            ${mode === "advanced" ? `<div class="control-actions" style="margin-top:0.45rem;">
              <button class="btn secondary small" type="button" data-ai-copilot="${c.id}:draft">AI Draft Response</button>
              <button class="btn secondary small" type="button" data-ai-copilot="${c.id}:improve">AI Improve Response</button>
              <button class="btn secondary small" type="button" data-ai-copilot="${c.id}:tighten">AI Shorten & Strengthen</button>
            </div>` : ""}
            <textarea data-evidence-note="${c.id}" placeholder="${escapeHtml(c.starter)}">${escapeHtml(ev.notes || "")}</textarea>
            ${mode === "advanced" && ai.copilot ? `<p class="hint"><strong>Copilot:</strong> ${escapeHtml(ai.copilot)}</p>` : ""}
            ${mode === "advanced"
              ? `<p class="hint"><strong>Evidence quality:</strong> ${eq.overall100}% (specificity ${eq.specificity}/5, traceability ${eq.traceability}/5, operability ${eq.operability}/5)</p><ul class="evidence-list">${(eq.recommendations || []).slice(0, 3).map((r) => `<li>${escapeHtml(r)}</li>`).join("") || "<li>Evidence quality looks strong.</li>"}</ul>`
              : `<p class="hint"><strong>Evidence quality:</strong> ${eq.overall5 >= 4 ? "Strong" : eq.overall5 >= 2.8 ? "Moderate" : "Needs improvement"}${eq.recommendations[0] ? ` | Next step: ${escapeHtml(eq.recommendations[0])}` : ""}</p>`
            }
            ${mode === "advanced" && latestDelegateAnalysis ? `<div class="evidence"><strong>Latest Delegate AI Analysis</strong><p class="hint"><strong>Role:</strong> ${escapeHtml(latestDelegateAnalysis.role || "CONTRIBUTOR")} | <strong>Mapped control:</strong> ${escapeHtml(latestDelegateAnalysis.mappedControl || c.control)}</p><p class="hint"><strong>Summary:</strong> ${escapeHtml(latestDelegateAnalysis.summary || "")}</p><p class="hint"><strong>Rationale:</strong> ${escapeHtml(latestDelegateAnalysis.mappingRationale || "")}</p>${(latestDelegateAnalysis.extractedEvidence || []).length ? `<ul class="evidence-list">${latestDelegateAnalysis.extractedEvidence.map((x) => `<li>${escapeHtml(x)}</li>`).join("")}</ul>` : ""}</div>` : ""}
            <details class="evidence">
              <summary><strong>Attachments and Links</strong></summary>
              <div class="row">
                <div>
                  <input type="text" data-link-input="${c.id}" placeholder="Paste supporting URL" />
                  <button class="btn secondary small" type="button" data-add-link="${c.id}" style="margin-top:0.45rem;">Add Link</button>
                </div>
                <div><input type="file" data-file-input="${c.id}" multiple /></div>
              </div>
              <ul class="evidence-list">
                ${(ev.links || []).map((l) => renderEvidenceLinkItem(l.url)).join("")}
                ${(ev.files || []).map((f) => `<li>${escapeHtml(f.name)} (${Math.max(1, Math.round((f.size || 0) / 1024))} KB)</li>`).join("")}
              </ul>
            </details>
          </div>
        </div>
      `;
    }).join("")}

    <h3>📊 Section Summary</h3>
    ${section.controls.map((c) => {
      const score = Number(assessment.data.ratings[c.id] || 0);
      const status = complianceStatus(score);
      const tone = statusToneFromScore(score);
      const key = `${section.id}:${c.id}`;
      const open = state.ui.summaryOpen[key] !== false;
      return `<div class="summary-card ${open ? "open" : ""}"><div class="summary-header" data-summary="${key}" role="button" tabindex="0" aria-expanded="${open ? "true" : "false"}"><div class="summary-title-wrap"><strong>${escapeHtml(c.control)}</strong><span class="summary-cue">${open ? "Hide details" : "Show details"}</span></div><div class="summary-header-actions"><span class="tag ${tone}">${status}</span><span class="summary-chevron" aria-hidden="true">${open ? "▾" : "▸"}</span></div></div><div class="summary-body"><p><strong>Score:</strong> ${score || "Not scored"}/5</p><p><strong>Best practice:</strong> ${escapeHtml(c.bestPractice)}</p><p><strong>Current response:</strong> ${escapeHtml(ensureEvidence(assessment, c.id).notes || "No response")}</p></div></div>`;
    }).join("")}

    <div class="question question-insight">
      <h3>Feedback</h3>
      <p class="hint"><strong>Focus area:</strong> ${escapeHtml(practicalSectionFeedback(sectionInsightView).focus)}.</p>
      <p class="hint"><strong>Suggested action:</strong> ${escapeHtml(practicalSectionFeedback(sectionInsightView).nextStep)}</p>
      ${(practicalSectionFeedback(sectionInsightView).questions || []).length ? `<p class="hint"><strong>Questions for stakeholders:</strong></p><ul class="evidence-list">${practicalSectionFeedback(sectionInsightView).questions.map((q) => `<li>${escapeHtml(q)}</li>`).join("")}</ul>` : ""}
    </div>

    ${renderNav(assessment)}
  `;

  root.querySelectorAll("[data-score]").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      const val = Number(e.currentTarget.dataset.score);
      assessment.data.ratings[e.currentTarget.dataset.control] = assessmentMode() === "advanced" ? val : Math.round(val);
      assessment.updatedAt = nowIso();
      saveAssessments();
      renderAssessment(assessment);
    });
  });

  root.querySelectorAll("[data-apply-ai-rating]").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      const controlId = e.currentTarget.dataset.applyAiRating;
      const ai = ensureAiInsight(assessment, controlId);
      const suggested = Number(ai?.interpretStructured?.suggestedRating || 0);
      if (!suggested) return toast("No AI suggested rating available.");
      assessment.data.ratings[controlId] = assessmentMode() === "advanced"
        ? Math.round(suggested * 2) / 2
        : Math.round(suggested);
      assessment.updatedAt = nowIso();
      saveAssessments();
      renderAssessment(assessment);
      toast("Applied AI suggested rating.");
    });
  });

  root.querySelectorAll("[data-example-toggle]").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      const id = e.currentTarget.dataset.exampleToggle;
      const target = document.getElementById(`example-${id}`);
      const shown = target.style.display !== "none";
      target.style.display = shown ? "none" : "block";
      e.currentTarget.textContent = shown ? "Show Best Practice Example" : "Hide Example";
    });
  });

  root.querySelectorAll("[data-ai-action]").forEach((btn) => {
    btn.addEventListener("click", async (e) => {
      const [controlId, mode] = e.currentTarget.dataset.aiAction.split(":");
      const control = getControl(controlId);
      if (!aiFeaturesEnabled()) return toast("AI actions are available in Advanced mode only.");
      if (!aiProviderReady()) return toast("Add selected provider credentials in AI settings first.");
      e.currentTarget.disabled = true;
      e.currentTarget.textContent = "Working...";
      try {
        const output = await runOpenAi(mode, control, ensureEvidence(assessment, controlId).notes || "", assessment.data.context || {});
        const ai = ensureAiInsight(assessment, controlId);
        if (mode === "interpret") {
          const parsed = safeJsonParse(output);
          const structured = normalizeInterpretStructured(parsed, typeof output === "string" ? output : "");
          ai.interpretStructured = structured;
          ai.interpret = structured.alignment;
        } else {
          ai[mode] = output;
        }
        ai.updatedAt = nowIso();
        assessment.updatedAt = nowIso();
        saveAssessments();
        renderAssessment(assessment);
      } catch (err) {
        toast(err.message || "AI request failed.");
        e.currentTarget.disabled = false;
        e.currentTarget.textContent = mode === "interpret" ? "AI Interpret Response" : "AI Generate Relevant Example";
      }
    });
  });

  root.querySelectorAll("[data-ai-copilot]").forEach((btn) => {
    btn.addEventListener("click", async (e) => {
      const [controlId, action] = e.currentTarget.dataset.aiCopilot.split(":");
      const control = getControl(controlId);
      if (!aiFeaturesEnabled()) return toast("AI actions are available in Advanced mode only.");
      if (!aiProviderReady()) return toast("Add selected provider credentials in AI settings first.");
      const originalLabel = e.currentTarget.textContent;
      e.currentTarget.disabled = true;
      e.currentTarget.textContent = "Working...";
      try {
        const ev = ensureEvidence(assessment, controlId);
        const output = await runOpenAiCopilot(action, control, ev.notes || "", assessment.data.context || {});
        ev.notes = output;
        const ai = ensureAiInsight(assessment, controlId);
        ai.copilot = action === "draft"
          ? "Draft generated."
          : action === "improve"
            ? "Response improved."
            : "Response shortened and strengthened.";
        ai.updatedAt = nowIso();
        assessment.updatedAt = nowIso();
        saveAssessments();
        renderAssessment(assessment);
        toast("AI copilot response applied.");
      } catch (err) {
        toast(err.message || "AI copilot failed.");
        e.currentTarget.disabled = false;
        e.currentTarget.textContent = originalLabel;
      }
    });
  });

  root.querySelectorAll("[data-evidence-note]").forEach((el) => {
    el.addEventListener("input", (e) => {
      ensureEvidence(assessment, e.target.dataset.evidenceNote).notes = e.target.value;
      scheduleAssessmentSave(assessment);
    });
  });

  root.querySelectorAll("[data-add-link]").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      const id = e.currentTarget.dataset.addLink;
      const input = root.querySelector(`[data-link-input='${id}']`);
      const url = (input.value || "").trim();
      if (!url) return;
      const safeUrl = normalizeEvidenceUrl(url);
      if (!safeUrl) return toast("Enter a valid http(s) URL.");
      const ev = ensureEvidence(assessment, id);
      if (!ev.links.find((x) => x.url === safeUrl)) ev.links.push({ url: safeUrl, addedAt: nowIso() });
      input.value = "";
      flushAssessmentSave(assessment);
      renderAssessment(assessment);
    });
  });

  root.querySelectorAll("[data-file-input]").forEach((el) => {
    el.addEventListener("change", (e) => {
      const id = e.target.dataset.fileInput;
      const files = Array.from(e.target.files || []);
      if (!files.length) return;
      const ev = ensureEvidence(assessment, id);
      for (const f of files) ev.files.push({ id: uid("file"), name: f.name, size: f.size, type: f.type || "file", addedAt: nowIso() });
      assessment.updatedAt = nowIso();
      saveAssessments();
      renderAssessment(assessment);
      toast("File metadata attached locally.");
    });
  });

  root.querySelectorAll("[data-summary]").forEach((el) => {
    const toggleSummary = (target) => {
      const key = target.dataset.summary;
      state.ui.summaryOpen[key] = !state.ui.summaryOpen[key];
      renderAssessment(assessment);
    };
    el.addEventListener("click", (e) => toggleSummary(e.currentTarget));
    el.addEventListener("keydown", (e) => {
      if (e.key !== "Enter" && e.key !== " ") return;
      e.preventDefault();
      toggleSummary(e.currentTarget);
    });
  });

  document.getElementById("sendDelegationBtn")?.addEventListener("click", () => {
    const name = (document.getElementById("delegateName").value || "").trim();
    const title = (document.getElementById("delegateTitle").value || "").trim();
    const email = (document.getElementById("delegateEmail").value || "").trim();
    const role = (document.getElementById("delegateRole").value || "CONTRIBUTOR").trim();
    const intro = (document.getElementById("delegateIntro").value || "").trim();
    const selected = Array.from(root.querySelectorAll("[data-delegate-control]:checked")).map((x) => x.dataset.delegateControl);
    if (!name || !title || !email) return toast("Delegate name, title, and email are required.");
    if (!selected.length) return toast("Select at least one control.");

    const delegationId = uid("delegation");
    const delegatedAt = nowIso();
    const controls = selected.map((id) => getControl(id)).filter(Boolean);
    controls.forEach((c) => {
      if (!assessment.data.delegates[c.id]) assessment.data.delegates[c.id] = [];
      assessment.data.delegates[c.id].push({ delegationId, name, title, email, role, intro, status: "SENT", delegatedAt });
    });
    logDelegationEvent(assessment, delegationId, "SENT", {
      delegateName: name,
      delegateTitle: title,
      delegateEmail: email,
      role,
      controlIds: controls.map((c) => c.id)
    });

    const lines = [
      `Hello ${name},`,
      "",
      `${state.profile.name} (${state.profile.email}) is completing an Align42 ISO 42001 assessment and requires your input.`,
      "",
      `Assigned role: ${role}`,
      "What is required:",
      "1) Reply to this email.",
      "2) Keep the headings and question numbers unchanged.",
      "3) Write your responses under each 'Response Q#' prompt.",
      "4) Add evidence references under each 'Evidence Ref Q#' prompt.",
      "5) Attach supporting documents and reference filenames in your answers.",
      ""
    ];
    if (intro) lines.push(`Additional context: ${intro}`, "");
    lines.push(`Assessment: ${assessment.title}`, "", "Controls and response template:", "");
    controls.forEach((c) => {
      lines.push(`Control: ${c.control} (${c.id} | ${c.clause})`);
      lines.push("-".repeat(Math.max(8, c.control.length)));
      delegationQuestions(c, assessment, role).forEach((q, i) => {
        lines.push(`Q${i + 1}. ${q}`);
        lines.push(`Response Q${i + 1}:`);
        lines.push("");
        lines.push(`Evidence Ref Q${i + 1}:`);
        lines.push("");
      });
      lines.push("");
    });
    lines.push(`Please reply to: ${state.profile.email}`);

    draftEmail(email, `Align42 input request: ${assessment.title}`, lines.join("\n"));
    assessment.updatedAt = nowIso();
    saveAssessments();
    renderAssessment(assessment);
    toast("Delegation draft opened in your email client.");
  });

  root.querySelectorAll("[data-upload-toggle]").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      const id = e.currentTarget.dataset.uploadToggle;
      state.ui.uploadOpen[id] = !state.ui.uploadOpen[id];
      renderAssessment(assessment);
    });
  });

  root.querySelectorAll("[data-parse-import]").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      const delegationId = e.currentTarget.dataset.parseImport;
      const batch = batches.find((b) => b.delegationId === delegationId);
      if (!batch) return;
      const raw = (root.querySelector(`[data-import-text='${delegationId}']`)?.value || "").trim();
      if (!raw) return toast("Paste delegated response text first.");
      const parsed = parseDelegatedResponseTemplate(raw, batch);
      fillDelegationResponseTextareas(root, delegationId, parsed.byControl);
      toast(`Parsed responses mapped to ${parsed.mappedCount} control(s).${parsed.notes.length ? ` ${parsed.notes[0]}` : ""}`);
    });
  });

  root.querySelectorAll("[data-parse-import-ai]").forEach((btn) => {
    btn.addEventListener("click", async (e) => {
      const delegationId = e.currentTarget.dataset.parseImportAi;
      const batch = batches.find((b) => b.delegationId === delegationId);
      if (!batch) return;
      const raw = (root.querySelector(`[data-import-text='${delegationId}']`)?.value || "").trim();
      if (!raw) return toast("Paste delegated response text first.");
      e.currentTarget.disabled = true;
      e.currentTarget.textContent = "Mapping...";
      try {
        const parsed = await mapDelegatedResponseWithAi(raw, batch, assessment.data.context || {});
        fillDelegationResponseTextareas(root, delegationId, parsed.byControl);
        toast(`AI mapped responses to ${parsed.mappedCount} control(s).`);
      } catch (err) {
        toast(err.message || "AI mapping failed.");
      } finally {
        const available = aiFeaturesEnabled() && aiProviderReady();
        e.currentTarget.disabled = !available;
        e.currentTarget.textContent = available ? "AI Assist Mapping" : "AI mapping unavailable";
      }
    });
  });

  root.querySelectorAll("[data-submit-responses]").forEach((btn) => {
    btn.addEventListener("click", async (e) => {
      const delegationId = e.currentTarget.dataset.submitResponses;
      const batch = batches.find((b) => b.delegationId === delegationId);
      if (!batch) return;
      let responseByControl = {};
      (batch.controls || []).forEach((c) => {
        responseByControl[c.id] = (root.querySelector(`[data-response-text='${delegationId}:${c.id}']`)?.value || "").trim();
      });
      const files = Array.from(root.querySelector(`[data-response-files='${delegationId}']`)?.files || []);
      let hasText = Object.values(responseByControl).some((x) => `${x}`.trim());
      if (!hasText) {
        const raw = (root.querySelector(`[data-import-text='${delegationId}']`)?.value || "").trim();
        if (raw) {
          const parsed = parseDelegatedResponseTemplate(raw, batch);
          responseByControl = parsed.byControl || responseByControl;
          hasText = Object.values(responseByControl).some((x) => `${x}`.trim());
          fillDelegationResponseTextareas(root, delegationId, responseByControl);
        }
      }
      if (!hasText && !files.length) return toast("Add responses or attachments before applying.");
      const applied = await applyDelegatedResponses(assessment, batch, responseByControl, files);
      renderAssessment(assessment);
      toast(applied.analyzedCount ? `Delegate responses applied. AI analyzed ${applied.analyzedCount} response(s).` : `Delegate responses applied (${applied.appliedCount} response(s)).`);
    });
  });

  bindNav(assessment);

  attachDictationButtons(root, "textarea[data-evidence-note]");
  attachDictationButtons(root, "textarea[data-response-text]");
  attachDictationButtons(root, "textarea[data-import-text]");
}

function controlRows(assessment) {
  return sections.filter((s) => s.type === "controls").flatMap((s) =>
    s.controls.map((c) => {
      const ev = ensureEvidence(assessment, c.id);
      return {
        id: c.id,
        section: s.title,
        clause: c.clause,
        weight: c.weight,
        control: c.control,
        score: Number(assessment.data.ratings[c.id] || 0),
        status: complianceStatus(assessment.data.ratings[c.id]),
        notes: ev.notes || "",
        links: (ev.links || []).map((x) => x.url || ""),
        files: (ev.files || []).map((x) => x.name || "")
      };
    })
  );
}

function controlSectionMap() {
  const map = {};
  sections.filter((s) => s.type === "controls").forEach((s) => {
    s.controls.forEach((c) => { map[c.id] = s.title; });
  });
  return map;
}

function detectAnalysisFindings(assessment) {
  const findings = [];
  const sectionByControl = controlSectionMap();
  const ratings = assessment.data.ratings || {};
  const evidence = assessment.data.evidence || {};
  const context = assessment.data.context || {};
  const frameworks = getApplicableFrameworks(context);

  const addFinding = (severity, type, message, controlId = "") => {
    findings.push({
      id: uid("finding"),
      severity,
      type,
      message,
      controlId,
      section: controlId ? (sectionByControl[controlId] || "Cross-control") : "Cross-control"
    });
  };

  const score = (id) => Number(ratings[id] || 0);
  const note = (id) => `${(evidence[id] || {}).notes || ""}`.toLowerCase();

  Object.keys(ratings).forEach((controlId) => {
    const s = score(controlId);
    const n = note(controlId);
    if (s >= 4 && /\b(not applicable|not documented|not defined|no policy|no process|none)\b/.test(n)) {
      addFinding("High", "Contradiction", "High rating conflicts with response text indicating missing or undefined control elements.", controlId);
    }
    if (s <= 2 && /\b(formal|approved|implemented|operating effectively|fully)\b/.test(n)) {
      addFinding("Medium", "Consistency check", "Low rating may be inconsistent with response text that suggests mature implementation.", controlId);
    }
  });

  if (score("c5_roles") < 3 && [score("c6_risk_method"), score("c8_validation"), score("c9_monitor")].some((x) => x >= 4)) {
    addFinding("High", "Dependency gap", "Advanced risk/operations ratings depend on clearer role/accountability definition (Clause 5.3).", "c5_roles");
  }
  if (score("c5_policy") < 3 && [score("c6_risk_register"), score("c8_incident"), score("c9_reporting")].some((x) => x >= 4)) {
    addFinding("High", "Dependency gap", "Strong downstream controls are unlikely without an approved AI policy framework.", "c5_policy");
  }
  if (score("c6_risk_method") < 3 && score("c6_risk_register") >= 4) {
    addFinding("Medium", "Dependency gap", "Risk register appears stronger than the underlying risk assessment methodology.", "c6_risk_method");
  }
  if (score("c8_human") < 3 && score("c8_validation") >= 4) {
    addFinding("Medium", "Dependency gap", "Validation maturity should be paired with explicit human oversight controls.", "c8_human");
  }
  if (score("c8_incident") < 3 && score("c9_monitor") >= 4) {
    addFinding("Medium", "Dependency gap", "Monitoring signals should flow into a robust AI incident process.", "c8_incident");
  }
  if (frameworks.length && score("c9_reporting") < 3) {
    addFinding("Medium", "Regulatory gap", "Selected frameworks imply stronger transparency/reporting obligations than current reporting control maturity.", "c9_reporting");
  }
  if ((frameworks.some((f) => /GDPR|AI Act|Privacy|PDPA|PIPEDA|UK GDPR/i.test(f))) && score("c8_data_quality") < 3) {
    addFinding("High", "Regulatory gap", "Privacy/regulatory frameworks selected but data quality/lineage controls are weak.", "c8_data_quality");
  }

  const dedup = new Set();
  return findings.filter((f) => {
    const key = `${f.type}|${f.message}|${f.controlId}`;
    if (dedup.has(key)) return false;
    dedup.add(key);
    return true;
  });
}

const ROADMAP_DEPENDENCY_GRAPH = {
  c5_policy: [],
  c5_roles: [],
  c5_oversight: ["c5_policy", "c5_roles"],
  c6_risk_method: ["c5_policy"],
  c6_risk_register: ["c6_risk_method"],
  c6_change: ["c5_policy", "c6_risk_method"],
  c6_acceptance: ["c6_risk_method", "c5_roles"],
  c8_validation: ["c6_risk_method", "c5_policy"],
  c8_human: ["c5_roles", "c8_validation"],
  c8_incident: ["c5_policy", "c8_security"],
  c8_security: ["c5_policy"],
  c9_monitor: ["c8_validation", "c8_incident"],
  c9_reporting: ["c9_monitor", "c5_oversight"],
  c9_review: ["c9_monitor", "c5_oversight"],
  c10_corrective: ["c8_incident", "c9_monitor"],
  c10_continuous: ["c9_review", "c10_corrective"]
};

const ROADMAP_REGULATORY_HOT = new Set(["c5_policy", "c6_risk_method", "c8_data_quality", "c8_validation", "c8_human", "c8_incident", "c9_reporting"]);

function addDays(date, days) {
  const d = new Date(date.getTime());
  d.setDate(d.getDate() + days);
  return d;
}

function formatDateShort(date) {
  return date.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
}

function parseTargetDateValue(raw, now = new Date()) {
  const txt = `${raw || ""}`.trim();
  if (!txt) return null;
  const q = txt.match(/\bq([1-4])\s*([12]\d{3})\b/i);
  if (q) {
    const quarter = Number(q[1]);
    const year = Number(q[2]);
    const endMonth = quarter * 3;
    return new Date(year, endMonth, 0);
  }
  const months = txt.match(/(\d+)\s*(month|months|mo)\b/i);
  if (months) return addDays(now, Number(months[1]) * 30);
  const years = txt.match(/(\d+)\s*(year|years|yr)\b/i);
  if (years) return addDays(now, Number(years[1]) * 365);
  const ukDate = txt.match(/^(\d{1,2})\/(\d{1,2})\/(\d{2,4})$/);
  if (ukDate) {
    const dd = Number(ukDate[1]);
    const mm = Number(ukDate[2]);
    let yy = Number(ukDate[3]);
    if (yy < 100) yy += 2000;
    const d = new Date(yy, Math.max(0, mm - 1), dd);
    return Number.isNaN(d.getTime()) ? null : d;
  }
  const parsed = new Date(txt);
  if (!Number.isNaN(parsed.getTime())) return parsed;
  return null;
}

function roadmapScenarioConstraints(assessment) {
  const scenario = assessment.data.roadmapScenario || "standard";
  if (scenario === "budget") {
    return {
      scenarioLabel: "Budget constrained",
      maxParallel: 2,
      paceFactor: 1.15,
      hardHorizonWeeks: null,
      notes: "Constraint emphasis: fewer parallel workstreams and lower tooling spend."
    };
  }
  if (scenario === "regulator_6m") {
    return {
      scenarioLabel: "Regulator review < 6 months",
      maxParallel: 4,
      paceFactor: 0.85,
      hardHorizonWeeks: 26,
      notes: "Constraint emphasis: accelerated compliance-evidence delivery before external review."
    };
  }
  return {
    scenarioLabel: "Standard",
    maxParallel: 3,
    paceFactor: 1.0,
    hardHorizonWeeks: null,
    notes: "Constraint emphasis: balanced delivery speed and control quality."
  };
}

function roadmapHorizon(assessment) {
  const now = new Date();
  const targetText = assessment.data.context?.targetDate || "";
  let targetDate = parseTargetDateValue(targetText, now);
  if (!targetDate) targetDate = addDays(now, 365);
  if (targetDate.getTime() <= now.getTime()) targetDate = addDays(now, 56);
  const weeksRaw = Math.max(8, Math.ceil((targetDate.getTime() - now.getTime()) / (7 * 24 * 60 * 60 * 1000)));
  return { now, targetDate, targetText: targetText || "12 months", weeksRaw };
}

function roadmapRows(assessment) {
  const approach = assessment.data.preferredApproach || "fastest";
  const scenario = assessment.data.roadmapScenario || "standard";
  const constraints = roadmapScenarioConstraints(assessment);
  const dependentsCount = {};
  Object.keys(ROADMAP_DEPENDENCY_GRAPH).forEach((id) => { dependentsCount[id] = 0; });
  Object.entries(ROADMAP_DEPENDENCY_GRAPH).forEach(([_id, deps]) => deps.forEach((d) => { dependentsCount[d] = (dependentsCount[d] || 0) + 1; }));

  const rows = controlRows(assessment).map((r) => {
    const gap = Math.max(0, 5 - r.score);
    const basePriority = gap >= 3 ? "High" : gap >= 2 ? "Medium" : "Low";
    const deps = ROADMAP_DEPENDENCY_GRAPH[r.id] || [];
    const unmetDeps = deps.filter((d) => Number(assessment.data.ratings[d] || 0) < 4);
    const dependency = deps.length
      ? `Depends on: ${deps.map((d) => getControl(d)?.control || d).join("; ")}`
      : "Foundation control with no upstream dependencies";
    const owner = r.section.includes("Operation")
      ? "CIO / CISO / AI Engineering Lead"
      : r.section.includes("Performance")
        ? "Head of Internal Audit / Risk"
        : "AI Governance Lead";

    let method = approach === "fastest"
      ? "Rapid uplift using minimum viable controls, templates, and focused evidence capture."
      : "Optimal uplift using integrated controls, assurance, training, and tooling automation.";
    let durationWeeks = approach === "fastest"
      ? (basePriority === "High" ? 6 : basePriority === "Medium" ? 4 : 3)
      : (basePriority === "High" ? 12 : basePriority === "Medium" ? 8 : 6);
    let priority = basePriority;

    if (scenario === "budget") {
      method = `${method} Budget-constrained variant: prioritize policy/process changes first, defer tooling-heavy automation to later phases.`;
      durationWeeks = Math.max(2, Math.round(durationWeeks * constraints.paceFactor));
    }
    if (scenario === "regulator_6m") {
      if (ROADMAP_REGULATORY_HOT.has(r.id) && gap >= 1) priority = "High";
      method = `${method} Regulator <6 months variant: prioritize demonstrable compliance evidence and closure of regulatory-critical controls.`;
      durationWeeks = Math.max(2, Math.round(durationWeeks * constraints.paceFactor));
    }

    const criticalPath = priority === "High" || (dependentsCount[r.id] || 0) >= 2 || unmetDeps.length > 0;
    const riskOfDeferral = priority === "High"
      ? (scenario === "regulator_6m" ? "High risk of regulatory challenge if deferred." : "High residual risk and potential audit failure if deferred.")
      : priority === "Medium"
        ? "Moderate risk of control weakness accumulation if deferred."
        : "Lower immediate risk, but may slow long-term maturity progression.";

    return {
      ...r,
      gap,
      priority,
      dependency,
      dependencyIds: deps,
      owner,
      durationWeeks,
      timeframe: `${durationWeeks} week${durationWeeks === 1 ? "" : "s"}`,
      method,
      criticalPath,
      unmetDependencyCount: unmetDeps.length,
      riskOfDeferral
    };
  });

  return rows.sort((a, b) => {
    const pri = { High: 3, Medium: 2, Low: 1 };
    const ap = pri[a.priority] || 0;
    const bp = pri[b.priority] || 0;
    if (bp !== ap) return bp - ap;
    if ((b.criticalPath ? 1 : 0) !== (a.criticalPath ? 1 : 0)) return (b.criticalPath ? 1 : 0) - (a.criticalPath ? 1 : 0);
    return (b.gap * b.weight) - (a.gap * a.weight);
  });
}

function roadmapTimeline(assessment, rows = roadmapRows(assessment)) {
  const horizon = roadmapHorizon(assessment);
  const constraints = roadmapScenarioConstraints(assessment);
  const planningWeeks = Math.max(8, constraints.hardHorizonWeeks ? Math.min(horizon.weeksRaw, constraints.hardHorizonWeeks) : horizon.weeksRaw);
  const tasks = rows.map((r) => ({ ...r, deps: (r.dependencyIds || []).filter((d) => rows.some((x) => x.id === d)) }));
  const byId = Object.fromEntries(tasks.map((t) => [t.id, t]));
  const unresolved = Object.fromEntries(tasks.map((t) => [t.id, t.deps.length]));
  const dependents = {};
  tasks.forEach((t) => { dependents[t.id] = []; });
  tasks.forEach((t) => t.deps.forEach((d) => { if (dependents[d]) dependents[d].push(t.id); }));
  const priorityOrder = { High: 3, Medium: 2, Low: 1 };
  const ready = () => tasks
    .filter((t) => !t._scheduled && unresolved[t.id] <= 0)
    .sort((a, b) => {
      const pri = (priorityOrder[b.priority] || 0) - (priorityOrder[a.priority] || 0);
      if (pri) return pri;
      if ((b.criticalPath ? 1 : 0) !== (a.criticalPath ? 1 : 0)) return (b.criticalPath ? 1 : 0) - (a.criticalPath ? 1 : 0);
      return (b.gap * b.weight) - (a.gap * a.weight);
    });

  const active = [];
  let week = 0;
  while (tasks.some((t) => !t._scheduled || !t._completed)) {
    const options = ready();
    while (active.length < constraints.maxParallel && options.length) {
      const t = options.shift();
      t._scheduled = true;
      t.startWeek = week;
      t.endWeek = week + Math.max(1, t.durationWeeks);
      active.push(t);
    }

    if (!active.length) {
      const stalled = tasks.find((t) => !t._scheduled);
      if (!stalled) break;
      stalled._scheduled = true;
      stalled.startWeek = week;
      stalled.endWeek = week + Math.max(1, stalled.durationWeeks);
      active.push(stalled);
    }

    const nextWeek = Math.min(...active.map((t) => t.endWeek));
    week = nextWeek;
    const done = active.filter((t) => t.endWeek <= week);
    done.forEach((t) => {
      t._completed = true;
      (dependents[t.id] || []).forEach((id) => { unresolved[id] = Math.max(0, (unresolved[id] || 0) - 1); });
    });
    for (let i = active.length - 1; i >= 0; i--) {
      if (active[i]._completed) active.splice(i, 1);
    }
  }

  const maxEndWeekRaw = Math.max(1, ...tasks.map((t) => t.endWeek || 1));
  const scale = maxEndWeekRaw > planningWeeks ? planningWeeks / maxEndWeekRaw : 1;
  const maxEndWeek = Math.max(1, Math.round(maxEndWeekRaw * scale));
  const timelineItems = tasks.map((t) => {
    const s = Math.max(0, Math.round((t.startWeek || 0) * scale));
    const e = Math.max(s + 1, Math.round((t.endWeek || 1) * scale));
    const startDate = addDays(horizon.now, s * 7);
    const endDate = addDays(horizon.now, e * 7);
    return {
      ...t,
      startWeekScaled: s,
      endWeekScaled: e,
      startDate,
      endDate,
      startLabel: formatDateShort(startDate),
      endLabel: formatDateShort(endDate),
      onHorizon: e <= planningWeeks
    };
  }).sort((a, b) => a.startWeekScaled - b.startWeekScaled || b.weight - a.weight);

  return {
    items: timelineItems,
    horizonStart: horizon.now,
    horizonEnd: addDays(horizon.now, planningWeeks * 7),
    horizonTargetDate: horizon.targetDate,
    horizonTargetText: horizon.targetText,
    planningWeeks,
    scenarioLabel: constraints.scenarioLabel,
    constraintNotes: constraints.notes,
    compressed: scale < 1
  };
}

function csvEscape(v) { return `"${`${v ?? ""}`.replaceAll('"', '""')}"`; }
function download(name, type, content) {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

function buildRoadmapCanvas(assessment) {
  const rows = roadmapRows(assessment);
  const timeline = roadmapTimeline(assessment, rows);
  const items = timeline.items.slice(0, 10);
  const score = weightedScorePercent(assessment);
  const approachLabel = assessment.data.preferredApproach === "optimal" ? "Optimal" : "Fastest";
  const scenarioLabel = timeline.scenarioLabel;
  const canvas = document.createElement("canvas");
  canvas.width = 1680;
  canvas.height = 1080;
  const ctx = canvas.getContext("2d");
  ctx.fillStyle = "#f2f7f3";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  const grad = ctx.createLinearGradient(0, 0, canvas.width, 0);
  grad.addColorStop(0, "#0d7f60"); grad.addColorStop(1, "#23ab7d");
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, canvas.width, 130);
  ctx.fillStyle = "#fff";
  ctx.font = "700 38px 'Avenir Next', 'Segoe UI', sans-serif";
  ctx.fillText("Align42 Compliance Readiness Timeline", 54, 64);
  ctx.font = "600 22px 'Avenir Next', 'Segoe UI', sans-serif";
  ctx.fillText(`Approach: ${approachLabel} | Scenario: ${scenarioLabel} | Weighted score: ${score}%`, 54, 96);
  ctx.font = "500 18px 'Avenir Next', 'Segoe UI', sans-serif";
  ctx.fillText(`Horizon: ${formatDateShort(timeline.horizonStart)} to ${formatDateShort(timeline.horizonEnd)} | Target: ${timeline.horizonTargetText}`, 54, 122);

  const axisLeft = 830;
  const axisRight = 1600;
  const axisWidth = axisRight - axisLeft;
  const axisY = 190;
  ctx.strokeStyle = "#aec8bd";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(axisLeft, axisY);
  ctx.lineTo(axisRight, axisY);
  ctx.stroke();
  ctx.fillStyle = "#345950";
  ctx.font = "600 16px 'Avenir Next', 'Segoe UI', sans-serif";
  ctx.fillText(formatDateShort(timeline.horizonStart), axisLeft, axisY - 12);
  const endLabelWidth = ctx.measureText(formatDateShort(timeline.horizonEnd)).width;
  ctx.fillText(formatDateShort(timeline.horizonEnd), axisRight - endLabelWidth, axisY - 12);

  let y = 250;
  items.forEach((r, i) => {
    const pColor = r.priority === "High" ? "#cc3a3a" : r.priority === "Medium" ? "#c18428" : "#2a8d4a";
    const startX = axisLeft + Math.round((r.startWeekScaled / timeline.planningWeeks) * axisWidth);
    const endX = axisLeft + Math.round((r.endWeekScaled / timeline.planningWeeks) * axisWidth);
    ctx.fillStyle = "#fff";
    ctx.fillRect(40, y - 30, 1560, 92);
    ctx.strokeStyle = "#d0dfd8";
    ctx.strokeRect(40, y - 30, 1560, 92);
    ctx.fillStyle = "#18322e";
    ctx.font = "700 21px 'Avenir Next', 'Segoe UI', sans-serif";
    ctx.fillText(`${i + 1}. ${r.control}`, 56, y - 2);
    ctx.font = "500 17px 'Avenir Next', 'Segoe UI', sans-serif";
    ctx.fillStyle = "#5b766f";
    ctx.fillText(`${r.clause} | Owner: ${r.owner}`, 56, y + 24);
    ctx.fillText(`${r.startLabel} -> ${r.endLabel} (${r.timeframe})`, 56, y + 46);
    ctx.fillStyle = "#eef4f1";
    ctx.fillRect(axisLeft, y + 8, axisWidth, 18);
    ctx.fillStyle = pColor;
    ctx.fillRect(startX, y + 8, Math.max(10, endX - startX), 18);
    ctx.fillStyle = pColor;
    ctx.font = "700 15px 'Avenir Next', 'Segoe UI', sans-serif";
    ctx.fillText(`${r.priority}${r.criticalPath ? " | critical path" : ""}`, axisRight + 10, y + 23);
    y += 102;
  });
  ctx.fillStyle = "#4f6b63";
  ctx.font = "500 15px 'Avenir Next', 'Segoe UI', sans-serif";
  ctx.fillText(`Constraint notes: ${timeline.constraintNotes}${timeline.compressed ? " | Timeline compressed to fit selected horizon." : ""}`, 54, canvas.height - 24);
  return canvas;
}

function maturityDimensionRows(assessment) {
  const labelById = {
    governance: "Context & Leadership",
    risk: "Planning & Risk",
    support: "Support",
    operations: "Operation",
    evaluation: "Performance Eval",
    improvement: "Improvement"
  };
  return sections
    .filter((s) => s.type === "controls")
    .map((s) => {
      const scores = s.controls.map((c) => Number(assessment.data.ratings[c.id] || 0));
      const avg = scores.length ? Number((scores.reduce((sum, v) => sum + v, 0) / scores.length).toFixed(1)) : 0;
      return {
        id: s.id,
        label: labelById[s.id] || s.title.replace(/^Clause\s+\d+(?:-\d+)?:\s*/i, ""),
        value: avg
      };
    });
}

function buildMaturityRadarCanvas(assessment, size = 920) {
  const dims = maturityDimensionRows(assessment);
  const n = Math.max(3, dims.length);
  const threshold = 4 / 5;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = Math.round(size * 0.74);
  const ctx = canvas.getContext("2d");
  const cx = canvas.width / 2;
  const cy = Math.round(canvas.height * 0.45);
  const radius = Math.min(canvas.width * 0.3, canvas.height * 0.34);
  const angleAt = (i) => (-Math.PI / 2) + (i * (Math.PI * 2 / n));
  const pointAt = (i, frac) => {
    const a = angleAt(i);
    const r = radius * frac;
    return { x: cx + Math.cos(a) * r, y: cy + Math.sin(a) * r };
  };
  const polygon = (frac) => {
    ctx.beginPath();
    for (let i = 0; i < n; i++) {
      const p = pointAt(i, frac);
      if (i === 0) ctx.moveTo(p.x, p.y);
      else ctx.lineTo(p.x, p.y);
    }
    ctx.closePath();
  };

  ctx.fillStyle = "#f8fcfa";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  const zones = [
    { frac: 1.0, fill: "rgba(38,143,91,0.10)" },
    { frac: 0.8, fill: "rgba(211,156,43,0.12)" },
    { frac: 0.6, fill: "rgba(194,70,70,0.12)" }
  ];
  zones.forEach((z) => {
    polygon(z.frac);
    ctx.fillStyle = z.fill;
    ctx.fill();
  });

  for (let r = 0.2; r <= 1.0; r += 0.2) {
    polygon(r);
    ctx.strokeStyle = "#cfdfd8";
    ctx.lineWidth = 1;
    ctx.stroke();
  }
  for (let i = 0; i < n; i++) {
    const p = pointAt(i, 1);
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(p.x, p.y);
    ctx.strokeStyle = "#d7e6e0";
    ctx.lineWidth = 1;
    ctx.stroke();
  }

  polygon(threshold);
  ctx.strokeStyle = "#1e8753";
  ctx.lineWidth = 2;
  ctx.setLineDash([8, 6]);
  ctx.stroke();
  ctx.setLineDash([]);

  ctx.beginPath();
  dims.forEach((d, i) => {
    const p = pointAt(i, Math.max(0, Math.min(1, d.value / 5)));
    if (i === 0) ctx.moveTo(p.x, p.y);
    else ctx.lineTo(p.x, p.y);
  });
  ctx.closePath();
  ctx.fillStyle = "rgba(13,127,96,0.22)";
  ctx.fill();
  ctx.strokeStyle = "#0d7f60";
  ctx.lineWidth = 3;
  ctx.stroke();

  dims.forEach((d, i) => {
    const p = pointAt(i, Math.max(0, Math.min(1, d.value / 5)));
    const tone = d.value >= 4 ? "#237f4a" : d.value >= 3 ? "#b77724" : "#bd4242";
    ctx.beginPath();
    ctx.arc(p.x, p.y, 5, 0, Math.PI * 2);
    ctx.fillStyle = tone;
    ctx.fill();
    ctx.strokeStyle = "#fff";
    ctx.lineWidth = 1.2;
    ctx.stroke();
  });

  ctx.fillStyle = "#2f4f47";
  ctx.font = "600 15px 'Avenir Next', 'Segoe UI', sans-serif";
  dims.forEach((d, i) => {
    const lp = pointAt(i, 1.14);
    const a = Math.cos(angleAt(i));
    ctx.textAlign = a > 0.25 ? "left" : a < -0.25 ? "right" : "center";
    ctx.textBaseline = "middle";
    ctx.fillText(d.label, lp.x, lp.y);
    const vp = pointAt(i, 1.02);
    ctx.fillStyle = "#4f6f65";
    ctx.font = "500 13px 'Avenir Next', 'Segoe UI', sans-serif";
    ctx.fillText(`${d.value.toFixed(1)}/5`, vp.x, vp.y);
    ctx.fillStyle = "#2f4f47";
    ctx.font = "600 15px 'Avenir Next', 'Segoe UI', sans-serif";
  });

  const legendY = canvas.height - 28;
  const chip = (x, color, label) => {
    ctx.fillStyle = color;
    ctx.fillRect(x, legendY - 9, 16, 10);
    ctx.strokeStyle = "#d3e2db";
    ctx.strokeRect(x, legendY - 9, 16, 10);
    ctx.fillStyle = "#385a51";
    ctx.font = "500 13px 'Avenir Next', 'Segoe UI', sans-serif";
    ctx.textAlign = "left";
    ctx.fillText(label, x + 22, legendY);
  };
  chip(36, "rgba(194,70,70,0.45)", "Below expected maturity");
  chip(300, "rgba(211,156,43,0.45)", "Transitional maturity");
  chip(520, "rgba(38,143,91,0.45)", "Compliance threshold zone (>=4/5)");

  return canvas;
}

function readinessBandFromScore(score) {
  if (score >= 80) return "High readiness";
  if (score >= 60) return "Moderate readiness";
  return "Foundational uplift required";
}

function readinessNarrative(score) {
  if (score >= 80) {
    return "Your organisation has a strong baseline. Focus on targeted remediation, evidence quality, and closure of remaining high-priority gaps.";
  }
  if (score >= 60) {
    return "Your organisation has meaningful controls in place, but readiness will depend on consistent execution, clearer ownership, and stronger evidence.";
  }
  return "Your organisation is in an early stage of ISO 42001 readiness and should prioritize foundational governance, risk, and operational controls.";
}

function sectionPerformanceRows(assessment) {
  const rows = sections
    .filter((s) => s.type === "controls")
    .map((s) => {
      const controls = s.controls || [];
      const values = controls.map((c) => Number(assessment.data.ratings[c.id] || 0));
      const average = values.length ? Number((values.reduce((sum, x) => sum + x, 0) / values.length).toFixed(1)) : 0;
      const compliantCount = values.filter((x) => x >= 4).length;
      return {
        id: s.id,
        section: s.title,
        average,
        compliantCount,
        totalControls: controls.length
      };
    });
  return rows;
}

function actionWindowLabel(endWeekScaled) {
  if (endWeekScaled <= 4) return "0-30 days";
  if (endWeekScaled <= 9) return "31-60 days";
  if (endWeekScaled <= 13) return "61-90 days";
  return "Beyond 90 days";
}

function businessImpactFromPriority(priority) {
  if (priority === "High") return "High likelihood of audit nonconformity and elevated AI risk if delayed.";
  if (priority === "Medium") return "Moderate operational and compliance risk if not addressed on time.";
  return "Lower immediate risk, but prolonged delay will slow maturity and assurance confidence.";
}

function conciseActionText(text) {
  const raw = `${text || ""}`.trim();
  if (!raw) return "Implement control improvements with clear owner, evidence, and review cadence.";
  const sentence = raw.split(".").map((s) => s.trim()).filter(Boolean)[0] || raw;
  return sentence.endsWith(".") ? sentence : `${sentence}.`;
}

function buildExecutiveActionPlan(assessment, timeline, findings, maxItems = 8) {
  const findingsByControl = {};
  findings.forEach((f) => {
    if (!f.controlId) return;
    if (!findingsByControl[f.controlId]) findingsByControl[f.controlId] = [];
    findingsByControl[f.controlId].push(f);
  });
  return timeline.items.slice(0, maxItems).map((item, idx) => {
    const related = findingsByControl[item.id] || [];
    const findingText = related.length
      ? `${related[0].type}: ${related[0].message}`
      : "No explicit contradiction detected, but current maturity indicates uplift is still required.";
    return {
      number: idx + 1,
      control: item.control,
      clause: item.clause,
      owner: item.owner,
      priority: item.priority,
      window: actionWindowLabel(item.endWeekScaled || 0),
      due: item.endLabel,
      businessImpact: businessImpactFromPriority(item.priority),
      recommendedAction: conciseActionText(item.method),
      evidenceExpected: conciseActionText((getControl(item.id)?.bestPractice || "").replace(/^([a-z])/i, (m) => m.toUpperCase())),
      findingText
    };
  });
}

function buildComplianceDonutCanvas(compliant, total, size = 480) {
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d");
  const center = size / 2;
  const radius = size * 0.34;
  const ring = size * 0.12;
  const nonCompliant = Math.max(0, total - compliant);
  const ratio = total ? compliant / total : 0;

  ctx.fillStyle = "#f8fcfa";
  ctx.fillRect(0, 0, size, size);

  ctx.beginPath();
  ctx.arc(center, center, radius, 0, Math.PI * 2);
  ctx.lineWidth = ring;
  ctx.strokeStyle = "#e2ece7";
  ctx.stroke();

  const start = -Math.PI / 2;
  const end = start + (Math.PI * 2 * ratio);
  ctx.beginPath();
  ctx.arc(center, center, radius, start, end);
  ctx.lineWidth = ring;
  ctx.strokeStyle = "#1e8a63";
  ctx.stroke();

  ctx.fillStyle = "#17352f";
  ctx.textAlign = "center";
  ctx.font = "700 56px 'Avenir Next', 'Segoe UI', sans-serif";
  ctx.fillText(`${Math.round(ratio * 100)}%`, center, center + 14);
  ctx.font = "500 18px 'Avenir Next', 'Segoe UI', sans-serif";
  ctx.fillStyle = "#55736a";
  ctx.fillText("Control coverage", center, center + 44);

  const legendY = size - 68;
  ctx.textAlign = "left";
  ctx.fillStyle = "#1e8a63";
  ctx.fillRect(36, legendY - 10, 18, 10);
  ctx.fillStyle = "#304b45";
  ctx.font = "600 15px 'Avenir Next', 'Segoe UI', sans-serif";
  ctx.fillText(`Compliant: ${compliant}`, 62, legendY);
  ctx.fillStyle = "#c44d4d";
  ctx.fillRect(240, legendY - 10, 18, 10);
  ctx.fillStyle = "#304b45";
  ctx.fillText(`Non-compliant: ${nonCompliant}`, 266, legendY);

  return canvas;
}

function buildSectionMaturityBarsCanvas(assessment, width = 980, height = 430) {
  const data = sectionPerformanceRows(assessment);
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");

  ctx.fillStyle = "#f7fbf9";
  ctx.fillRect(0, 0, width, height);
  ctx.fillStyle = "#20453d";
  ctx.font = "700 24px 'Avenir Next', 'Segoe UI', sans-serif";
  ctx.fillText("ISO 42001 Dimension Maturity", 34, 42);
  ctx.fillStyle = "#58766d";
  ctx.font = "500 14px 'Avenir Next', 'Segoe UI', sans-serif";
  ctx.fillText("Target threshold for readiness is approximately 4.0/5 across dimensions.", 34, 66);

  const left = 270;
  const right = width - 34;
  const top = 92;
  const rowH = Math.max(44, Math.floor((height - top - 26) / Math.max(1, data.length)));
  const plotW = right - left;
  const toX = (score) => left + Math.round((Math.max(0, Math.min(5, score)) / 5) * plotW);

  ctx.strokeStyle = "#d6e5de";
  ctx.lineWidth = 1;
  for (let t = 0; t <= 5; t++) {
    const x = toX(t);
    ctx.beginPath();
    ctx.moveTo(x, top - 8);
    ctx.lineTo(x, height - 22);
    ctx.stroke();
    ctx.fillStyle = "#6b8a81";
    ctx.font = "500 12px 'Avenir Next', 'Segoe UI', sans-serif";
    ctx.fillText(`${t}`, x - 3, top - 12);
  }

  const targetX = toX(4);
  ctx.strokeStyle = "#1f8d56";
  ctx.lineWidth = 2;
  ctx.setLineDash([6, 5]);
  ctx.beginPath();
  ctx.moveTo(targetX, top - 8);
  ctx.lineTo(targetX, height - 22);
  ctx.stroke();
  ctx.setLineDash([]);

  data.forEach((row, i) => {
    const y = top + (i * rowH);
    const barY = y + 8;
    const barH = Math.max(20, rowH - 18);
    const tone = row.average >= 4 ? "#2d9963" : row.average >= 3 ? "#c5892e" : "#c64c4c";
    const endX = toX(row.average);

    ctx.fillStyle = "#2a4a42";
    ctx.font = "600 14px 'Avenir Next', 'Segoe UI', sans-serif";
    ctx.fillText(row.section.replace(/^Clause\s+\d+(?:-\d+)?:\s*/i, ""), 34, barY + 15);
    ctx.fillStyle = "#6b8880";
    ctx.font = "500 12px 'Avenir Next', 'Segoe UI', sans-serif";
    ctx.fillText(`${row.compliantCount}/${row.totalControls} controls compliant`, 34, barY + 32);

    ctx.fillStyle = "#e6f0eb";
    ctx.fillRect(left, barY, plotW, barH);
    ctx.fillStyle = tone;
    ctx.fillRect(left, barY, Math.max(3, endX - left), barH);

    ctx.fillStyle = "#ffffff";
    ctx.font = "700 12px 'Avenir Next', 'Segoe UI', sans-serif";
    ctx.fillText(`${row.average.toFixed(1)}/5`, Math.max(left + 6, endX - 48), barY + 16);
  });

  return canvas;
}

function renderFinal(assessment) {
  const root = document.getElementById("wizardSection");
  const rows = controlRows(assessment);
  const findings = detectAnalysisFindings(assessment);
  const score = weightedScorePercent(assessment);
  const total = rows.length;
  const compliant = rows.filter((r) => r.status === "Compliant").length;
  const nonCompliant = total - compliant;
  const roadmap = roadmapRows(assessment);
  const timeline = roadmapTimeline(assessment, roadmap);
  const strengths = rows
    .filter((r) => r.status === "Compliant")
    .sort((a, b) => (b.weight * b.score) - (a.weight * a.score))
    .slice(0, 4);
  const urgent = timeline.items.filter((r) => r.priority === "High" || r.criticalPath).slice(0, 6);
  const criticalFindings = findings.filter((f) => f.severity === "High");
  const approachLabel = assessment.data.preferredApproach === "optimal" ? "Optimal" : "Fastest";
  const horizonSummary = `${formatDateShort(timeline.horizonStart)} to ${formatDateShort(timeline.horizonEnd)} (${timeline.planningWeeks} weeks)`;
  const timelineRows = timeline.items.slice(0, 16);
  const coveragePercent = total ? Math.round((compliant / total) * 100) : 0;
  const averageRating = total ? (rows.reduce((sum, r) => sum + Number(r.score || 0), 0) / total).toFixed(1) : "0.0";
  const readinessBand = readinessBandFromScore(score);
  const readinessText = readinessNarrative(score);
  const audienceLabel = "Compliance-focused";
  const executiveLead = "This report uses a compliance-focused tone aligned to ISO 42001 readiness, emphasizing control effectiveness, evidence sufficiency, and accountable remediation.";
  const interpretationGuide = "Use this report to verify control maturity, identify likely nonconformity risk, and track corrective actions to closure with objective evidence.";
  const constraintNarrative = `${timeline.constraintNotes}${timeline.compressed ? " Timeline has been compressed to fit the selected horizon." : ""}`;
  const isDemoMode = isDemoAssessment(assessment);
  const isAdvancedMode = assessmentMode() === "advanced";
  const sectionRows = sectionPerformanceRows(assessment);
  const actionPlan = buildExecutiveActionPlan(assessment, timeline, findings, 9);
  const actionRowsForAudience = actionPlan;
  const timelineById = Object.fromEntries(timeline.items.map((x) => [x.id, x]));
  const generatedAt = new Date().toLocaleString();
  const preparedFor = state.profile?.name || "User";
  const orgDisplay = assessment.data.context?.orgName || "Organisation";
  const complianceChartDataUrl = buildComplianceDonutCanvas(compliant, total, 420).toDataURL("image/png");
  const sectionBarsDataUrl = buildSectionMaturityBarsCanvas(assessment, 980, 430).toDataURL("image/png");
  const roadmapCanvasForExport = buildRoadmapCanvas(assessment);
  const roadmapDataUrl = roadmapCanvasForExport.toDataURL("image/png");
  const radarForExport = isAdvancedMode ? buildMaturityRadarCanvas(assessment, 920) : null;
  const radarDataUrl = radarForExport ? radarForExport.toDataURL("image/png") : "";

  const documentShell = (reportName, innerHtml) => `
    <html>
      <head>
        <style>
          @page { size: A4; margin: 2cm; }
          :root {
            --doc-text: #16312b;
            --doc-muted: #4a635d;
            --doc-bg: #f6f8f7;
            --doc-surface: #ffffff;
            --doc-line: #c7d7d1;
            --doc-accent: #005a4f;
            --doc-accent-soft: #e6f2ef;
            --doc-good: #16643b;
            --doc-warn: #8a5a00;
            --doc-bad: #8f2d2d;
          }
          * { box-sizing: border-box; }
          body {
            font-family: "Aptos", "Segoe UI", "Helvetica Neue", Arial, sans-serif;
            color: var(--doc-text);
            margin: 0;
            background: var(--doc-bg);
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
          .doc-header, .doc-footer {
            position: fixed;
            left: 0;
            right: 0;
            color: var(--doc-muted);
            font-size: 10pt;
          }
          .doc-header {
            top: 0;
            padding: 0 2cm 0.35cm;
            border-bottom: 1px solid var(--doc-line);
          }
          .doc-footer {
            bottom: 0;
            padding: 0.35cm 2cm 0;
            border-top: 1px solid var(--doc-line);
          }
          .doc-row {
            display: flex;
            justify-content: space-between;
            gap: 16px;
            align-items: center;
          }
          .doc-main {
            padding-top: 1.2cm;
            padding-bottom: 1.1cm;
          }
          .page {
            max-width: 17cm;
            margin: 0 auto;
            background: var(--doc-surface);
          }
          .cover {
            background: linear-gradient(135deg, #005a4f, #0b7668);
            color: #ffffff;
            padding: 1.2cm;
            min-height: 20cm;
          }
          .cover h1 { margin: 0 0 0.2cm; font-size: 26pt; }
          .cover h2 { margin: 0 0 0.5cm; font-size: 15pt; font-weight: 600; }
          .cover p { margin: 0.14cm 0; line-height: 1.45; }
          .body { padding: 0.6cm 0.2cm 0.3cm; }
          h2 {
            margin: 0.7cm 0 0.28cm;
            font-size: 15pt;
            color: var(--doc-accent);
            border-bottom: 1px solid var(--doc-line);
            padding-bottom: 0.12cm;
          }
          h3 { margin: 0.35cm 0 0.18cm; font-size: 11.5pt; color: var(--doc-text); }
          p, li, td, th { font-size: 10.5pt; line-height: 1.45; }
          ul, ol { margin: 0.18cm 0 0.24cm 0.5cm; }
          .toc, .note, .card {
            border: 1px solid var(--doc-line);
            border-radius: 10px;
            background: #fbfcfc;
            padding: 0.28cm 0.32cm;
          }
          .kpi {
            display: grid;
            grid-template-columns: repeat(4, minmax(0, 1fr));
            gap: 0.22cm;
            margin-top: 0.22cm;
          }
          .card .label {
            font-size: 8.5pt;
            color: var(--doc-muted);
            text-transform: uppercase;
            letter-spacing: 0.03em;
          }
          .card .value {
            font-size: 18pt;
            margin-top: 0.08cm;
            color: var(--doc-text);
            font-weight: 700;
          }
          .viz-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 0.28cm; margin-top: 0.22cm; }
          .viz-grid img, .timeline-img {
            width: 100%;
            border: 1px solid var(--doc-line);
            border-radius: 10px;
            background: #ffffff;
          }
          .pill {
            display: inline-block;
            font-size: 8.5pt;
            font-weight: 700;
            border-radius: 999px;
            padding: 0.04cm 0.18cm;
            margin-right: 0.12cm;
          }
          .pill-high { background: #fbe4e4; color: var(--doc-bad); }
          .icon-chip {
            display: inline-block;
            font-weight: 700;
            color: var(--doc-accent);
            margin-right: 0.14cm;
          }
          table { width: 100%; border-collapse: collapse; margin-top: 0.22cm; }
          th, td { border: 1px solid var(--doc-line); padding: 0.14cm; text-align: left; vertical-align: top; }
          th { background: var(--doc-accent-soft); }
          .small { font-size: 9pt; color: var(--doc-muted); }
          .break-after { page-break-after: always; }
          .page-no::after { content: counter(page); }
          @media (max-width: 900px) {
            .kpi { grid-template-columns: 1fr 1fr; }
            .viz-grid { grid-template-columns: 1fr; }
          }
        </style>
      </head>
      <body>
        <div class="doc-header">
          <div class="doc-row">
            <div><strong>${escapeHtml(reportName)}</strong> - ${escapeHtml(orgDisplay)}</div>
            <div>Prepared for: ${escapeHtml(preparedFor)}</div>
          </div>
        </div>
        <div class="doc-footer">
          <div class="doc-row">
            <div>${escapeHtml(generatedAt)}</div>
            <div>Page <span class="page-no"></span></div>
          </div>
        </div>
        <main class="doc-main">${innerHtml}</main>
      </body>
    </html>
  `;

  const reportHtml = () => documentShell("ISO 42001 Readiness Assessment Report", `
        <div class="page">
          <div class="cover break-after">
            <h1>Align42</h1>
            <h2>ISO 42001 Readiness Assessment Report</h2>
            <p><strong>Assessment:</strong> ${escapeHtml(assessment.title)}</p>
            <p><strong>Prepared for:</strong> ${escapeHtml(preparedFor)}</p>
            <p><strong>Organisation:</strong> ${escapeHtml(orgDisplay)}</p>
            <p><strong>Audience Mode:</strong> ${escapeHtml(audienceLabel)}</p>
            <p><strong>Report Purpose:</strong> Provide a clear view of current maturity, key risks, and a prioritized plan to improve ISO 42001 readiness.</p>
            <p class="meta"><strong>Generated:</strong> ${escapeHtml(generatedAt)}<br><strong>Prepared by:</strong> Align42 Assessment Assistant</p>
          </div>
          <div class="body">
            <h2>Table of Contents</h2>
            <div class="toc">
              <ol>
                <li>Executive Summary</li>
                <li>Visual Overview</li>
                <li>Key Findings and Business Impact</li>
                <li>Priority Action Plan</li>
                <li>Roadmap Timeline</li>
                <li>Detailed Control Results and Next Steps</li>
                <li>Dimension Summary</li>
              </ol>
            </div>
            <h2>Executive Summary</h2>
            <div class="note">
              <p><span class="icon-chip">[Summary]</span><strong>What this means:</strong> ${escapeHtml(readinessText)}</p>
              <p><span class="icon-chip">[Audience]</span><strong>Audience context:</strong> ${escapeHtml(executiveLead)}</p>
              <p><span class="icon-chip">[Guide]</span><strong>How to use this report:</strong> ${escapeHtml(interpretationGuide)}</p>
            </div>
            <div class="kpi">
              <div class="card"><div class="label">Weighted score</div><div class="value">${score}%</div></div>
              <div class="card"><div class="label">Control coverage</div><div class="value">${coveragePercent}%</div></div>
              <div class="card"><div class="label">Avg control rating</div><div class="value">${averageRating}/5</div></div>
              <div class="card"><div class="label">Readiness band</div><div class="value" style="font-size:18px;">${escapeHtml(readinessBand)}</div></div>
            </div>

            <h2>Visual Overview</h2>
            <div class="viz-grid">
              <div>
                <p><span class="icon-chip">[Chart]</span><strong>Compliance profile</strong></p>
                <img src="${complianceChartDataUrl}" alt="Compliance profile chart" />
              </div>
              <div>
                <p><span class="icon-chip">[Chart]</span><strong>Dimension maturity snapshot</strong></p>
                <img src="${sectionBarsDataUrl}" alt="Section maturity bar chart" />
              </div>
            </div>
            ${isAdvancedMode ? `<p class="small">Advanced mode includes a radar chart showing ISO 42001 dimension maturity versus the indicative readiness threshold.</p><img src="${radarDataUrl}" style="width:100%; border:1px solid #d5e4dc; border-radius:12px;" alt="ISO 42001 maturity radar chart" />` : ""}

            <h2>Key Findings and Business Impact</h2>
            ${criticalFindings.length ? `
              <ul>
                ${criticalFindings.map((f) => `<li><span class="pill pill-high">High</span><strong>${escapeHtml(f.type)}</strong>${f.controlId ? ` (${escapeHtml(getControl(f.controlId)?.control || f.controlId)})` : ""}: ${escapeHtml(f.message)}</li>`).join("")}
              </ul>
            ` : "<p>No critical findings detected from current responses.</p>"}
            <p><strong>Top strengths:</strong></p>
            ${strengths.length ? `<ul>${strengths.map((r) => `<li>${escapeHtml(r.control)} (${escapeHtml(r.clause)}) is performing strongly at ${r.score}/5.</li>`).join("")}</ul>` : "<p>No high-confidence strengths identified yet.</p>"}

            <h2>Priority Action Plan</h2>
            <p>This plan is designed for non-technical leadership visibility and delivery accountability. Actions are grouped by urgency window and include expected evidence.</p>
            <table>
              <tr><th>#</th><th>Action</th><th>Priority</th><th>Owner</th><th>Target Window</th><th>Business Impact if Delayed</th><th>Expected Evidence of Completion</th></tr>
              ${actionRowsForAudience.map((a) => `<tr>
                <td>${a.number}</td>
                <td><strong>${escapeHtml(a.control)}</strong><br><span class="small">${escapeHtml(a.recommendedAction)}</span></td>
                <td>${escapeHtml(a.priority)}</td>
                <td>${escapeHtml(a.owner)}</td>
                <td>${escapeHtml(a.window)} (by ${escapeHtml(a.due)})</td>
                <td>${escapeHtml(a.businessImpact)}</td>
                <td>${escapeHtml(a.evidenceExpected)}</td>
              </tr>`).join("")}
            </table>

            <h2>Roadmap Timeline</h2>
            <div class="kpi" style="grid-template-columns: repeat(3, minmax(0, 1fr));">
              <div class="card"><div class="label">Approach</div><div class="value" style="font-size:16px;">${escapeHtml(approachLabel)}</div></div>
              <div class="card"><div class="label">Scenario</div><div class="value" style="font-size:16px;">${escapeHtml(timeline.scenarioLabel)}</div></div>
              <div class="card"><div class="label">Horizon</div><div class="value" style="font-size:16px;">${escapeHtml(horizonSummary)}</div></div>
            </div>
            <p><strong>Constraint notes:</strong> ${escapeHtml(constraintNarrative)}</p>
            <img class="timeline-img" src="${roadmapDataUrl}" alt="Roadmap timeline chart" />
            <table>
              <tr><th>#</th><th>Control</th><th>Priority</th><th>Owner</th><th>Start</th><th>Finish</th><th>Dependency Summary</th></tr>
              ${timelineRows.map((r, i) => `<tr><td>${i + 1}</td><td>${escapeHtml(r.control)}</td><td>${escapeHtml(r.priority)}${r.criticalPath ? " (critical path)" : ""}</td><td>${escapeHtml(r.owner)}</td><td>${escapeHtml(r.startLabel)}</td><td>${escapeHtml(r.endLabel)}</td><td>${escapeHtml(r.dependency)}</td></tr>`).join("")}
            </table>

            <h2>Detailed Control Results and Next Steps</h2>
            <table>
              <tr><th>Section</th><th>Clause</th><th>Control</th><th>Score</th><th>Status</th><th>Recommended Next Step</th><th>Current Evidence Summary</th></tr>
              ${rows.map((r) => {
                const tr = timelineById[r.id];
                const nextStep = tr ? conciseActionText(tr.method) : "Review control and define a practical uplift action with owner and due date.";
                const notesSummary = r.notes ? r.notes : "No response captured yet.";
                return `<tr><td>${escapeHtml(r.section)}</td><td>${escapeHtml(r.clause)}</td><td>${escapeHtml(r.control)}</td><td>${r.score}/5</td><td>${escapeHtml(r.status)}</td><td>${escapeHtml(nextStep)}</td><td>${escapeHtml(notesSummary)}</td></tr>`;
              }).join("")}
            </table>

            <h2>Dimension Summary</h2>
            <table>
              <tr><th>ISO 42001 Dimension</th><th>Average Maturity</th><th>Compliant Controls</th><th>Interpretation</th></tr>
              ${sectionRows.map((s) => `<tr><td>${escapeHtml(s.section)}</td><td>${s.average.toFixed(1)}/5</td><td>${s.compliantCount}/${s.totalControls}</td><td>${escapeHtml(s.average >= 4 ? "At or near expected readiness threshold." : s.average >= 3 ? "Partially established; strengthen repeatability and evidence." : "Requires foundational uplift and clear ownership.")}</td></tr>`).join("")}
            </table>
          </div>
        </div>
  `);

  const boardBriefHtml = () => documentShell("Executive Summary", `
        <div style="max-width:1100px; margin:0 auto; background:#fff; min-height:100vh;">
          <div class="cover" style="min-height:unset;">
            <h1 style="margin:0 0 8px;">Align42 Executive Summary</h1>
            <p style="margin:0 0 4px;"><strong>ISO 42001 Readiness Snapshot</strong></p>
            <p style="margin:0;"><strong>Assessment:</strong> ${escapeHtml(assessment.title)} | <strong>Prepared for:</strong> ${escapeHtml(preparedFor)}</p>
          </div>
          <div class="body" style="padding:20px 26px;">
            <p><span class="icon-chip">[Summary]</span><strong>Executive message:</strong> ${escapeHtml(readinessText)}</p>
            <div style="display:grid; grid-template-columns:repeat(4,minmax(0,1fr)); gap:10px; margin:10px 0 14px;">
              <div style="border:1px solid #d7e5de; border-radius:10px; padding:10px; background:#f7fcf9;"><div style="font-size:11px; color:#5b756d; text-transform:uppercase;">Weighted score</div><div style="font-size:24px; font-weight:700;">${score}%</div></div>
              <div style="border:1px solid #d7e5de; border-radius:10px; padding:10px; background:#f7fcf9;"><div style="font-size:11px; color:#5b756d; text-transform:uppercase;">Readiness band</div><div style="font-size:20px; font-weight:700;">${escapeHtml(readinessBand)}</div></div>
              <div style="border:1px solid #d7e5de; border-radius:10px; padding:10px; background:#f7fcf9;"><div style="font-size:11px; color:#5b756d; text-transform:uppercase;">Control coverage</div><div style="font-size:24px; font-weight:700;">${coveragePercent}%</div></div>
              <div style="border:1px solid #d7e5de; border-radius:10px; padding:10px; background:#f7fcf9;"><div style="font-size:11px; color:#5b756d; text-transform:uppercase;">Avg maturity</div><div style="font-size:24px; font-weight:700;">${averageRating}/5</div></div>
            </div>
            <img src="${complianceChartDataUrl}" style="width:42%; min-width:320px; border:1px solid #d5e4dc; border-radius:10px; float:right; margin:0 0 10px 16px;" alt="Compliance chart" />
            <h2 style="margin:0 0 8px;">Top Risks Requiring Board Attention</h2>
            ${criticalFindings.length ? `<ul style="margin-top:0;">${criticalFindings.slice(0, 4).map((f) => `<li><strong>${escapeHtml(f.type)}:</strong> ${escapeHtml(f.message)}</li>`).join("")}</ul>` : "<p>No critical contradictions detected from current data.</p>"}
            <h2 style="margin:14px 0 8px;">Immediate Decisions / Actions</h2>
            <table style="width:100%; border-collapse:collapse;">
              <tr><th style="border:1px solid #d6e5dd; background:#edf6f1; text-align:left; padding:7px;">Priority Action</th><th style="border:1px solid #d6e5dd; background:#edf6f1; text-align:left; padding:7px;">Owner</th><th style="border:1px solid #d6e5dd; background:#edf6f1; text-align:left; padding:7px;">By When</th><th style="border:1px solid #d6e5dd; background:#edf6f1; text-align:left; padding:7px;">Why It Matters</th></tr>
              ${actionPlan.slice(0, 5).map((a) => `<tr><td style="border:1px solid #d6e5dd; padding:7px;"><strong>${escapeHtml(a.control)}</strong><br><span style="font-size:11px; color:#607a72;">${escapeHtml(a.recommendedAction)}</span></td><td style="border:1px solid #d6e5dd; padding:7px;">${escapeHtml(a.owner)}</td><td style="border:1px solid #d6e5dd; padding:7px;">${escapeHtml(a.window)} (by ${escapeHtml(a.due)})</td><td style="border:1px solid #d6e5dd; padding:7px;">${escapeHtml(a.businessImpact)}</td></tr>`).join("")}
            </table>
            <p style="clear:both; margin-top:14px;"><strong>Roadmap context:</strong> ${escapeHtml(horizonSummary)} | ${escapeHtml(approachLabel)} approach | ${escapeHtml(timeline.scenarioLabel)} scenario.</p>
          </div>
        </div>
  `);

  const demoSampleReportHtml = () => documentShell("Demo Sample Report", `
        <div style="max-width:1040px; margin:0 auto; background:#fff; min-height:100vh;">
          <div class="cover" style="min-height:unset;">
            <h1 style="margin:0 0 8px;">Align42 Demo Sample Report</h1>
            <p style="margin:0;"><strong>Organisation:</strong> ${escapeHtml(assessment.data.context?.orgName || "Demo organisation")} | <strong>Prepared for:</strong> ${escapeHtml(preparedFor)}</p>
          </div>
          <div class="body" style="padding:22px 28px;">
            <h2>Sample Executive Summary</h2>
            <p>This sample report demonstrates a low-maturity/high-ambition scenario for a mid-sized Australian technology manufacturer. The current control baseline is early-stage, while strategic ambition requires rapid formalization of governance, risk, and operational assurance controls.</p>
            <ul>
              <li><strong>Current weighted readiness:</strong> ${score}%</li>
              <li><strong>Control coverage:</strong> ${coveragePercent}%</li>
              <li><strong>Average control rating:</strong> ${averageRating}/5</li>
              <li><strong>Readiness profile:</strong> Low baseline with high uplift potential</li>
            </ul>
            <h2>Sample Priority Themes</h2>
            <ol>
              <li>Establish formal AI policy, scope, and role accountability model.</li>
              <li>Implement repeatable AI risk assessment and risk register governance.</li>
              <li>Strengthen model validation, data quality lineage, and incident response controls.</li>
              <li>Embed monitoring, internal audit coverage, and management review cadence.</li>
            </ol>
            <h2>Sample Outcome Statement</h2>
            <p>If executed as planned, the organisation can progress from ad hoc to defined-and-managed maturity with evidence suitable for ISO 42001 readiness activities and stakeholder assurance conversations.</p>
            <p style="margin-top:20px; font-size:12px; color:#56766f;"><em>Demo note: This is a sample deliverable generated for demonstration mode and should be tailored before real use.</em></p>
          </div>
        </div>
  `);

  const demoSampleRoadmapHtml = () => documentShell("Demo Sample Roadmap", `
        <div style="max-width:1160px; margin:0 auto; background:#fff; min-height:100vh;">
          <div class="cover" style="min-height:unset;">
            <h1 style="margin:0 0 8px;">Align42 Demo Sample Roadmap</h1>
            <p style="margin:0;"><strong>Horizon:</strong> ${escapeHtml(horizonSummary)} | <strong>Prepared for:</strong> ${escapeHtml(preparedFor)}</p>
          </div>
          <div class="body" style="padding:22px 30px;">
            <p>This sample roadmap shows a phased path from foundational governance uplift to operating-control assurance for a low-maturity, high-ambition AI program.</p>
            <table style="width:100%; border-collapse:collapse; margin-top:10px;">
              <tr>
                <th style="border:1px solid #d6e5dd; background:#edf6f1; text-align:left; padding:8px;">Phase</th>
                <th style="border:1px solid #d6e5dd; background:#edf6f1; text-align:left; padding:8px;">Window</th>
                <th style="border:1px solid #d6e5dd; background:#edf6f1; text-align:left; padding:8px;">Focus</th>
                <th style="border:1px solid #d6e5dd; background:#edf6f1; text-align:left; padding:8px;">Expected Evidence</th>
              </tr>
              <tr>
                <td style="border:1px solid #d6e5dd; padding:8px;">Phase 1 - Foundation</td>
                <td style="border:1px solid #d6e5dd; padding:8px;">Weeks 1-8</td>
                <td style="border:1px solid #d6e5dd; padding:8px;">Scope, policy framework, governance forum, role accountability</td>
                <td style="border:1px solid #d6e5dd; padding:8px;">Approved policy pack, scope register, governance charter, RACI</td>
              </tr>
              <tr>
                <td style="border:1px solid #d6e5dd; padding:8px;">Phase 2 - Risk and Operations</td>
                <td style="border:1px solid #d6e5dd; padding:8px;">Weeks 9-20</td>
                <td style="border:1px solid #d6e5dd; padding:8px;">Risk method, risk register, model validation, data lineage, oversight controls</td>
                <td style="border:1px solid #d6e5dd; padding:8px;">Risk records, validation templates, oversight logs, incident playbooks</td>
              </tr>
              <tr>
                <td style="border:1px solid #d6e5dd; padding:8px;">Phase 3 - Assurance and Improvement</td>
                <td style="border:1px solid #d6e5dd; padding:8px;">Weeks 21+</td>
                <td style="border:1px solid #d6e5dd; padding:8px;">Monitoring, reporting, internal audit, corrective actions, continual improvement</td>
                <td style="border:1px solid #d6e5dd; padding:8px;">KPI dashboards, management reviews, audit findings, CAPA evidence</td>
              </tr>
            </table>
            <h2 style="margin-top:18px;">Sample Timeline Snapshot</h2>
            <ul>
              ${timelineRows.slice(0, 8).map((r) => `<li><strong>${escapeHtml(r.control)}</strong> (${escapeHtml(r.priority)}) - ${escapeHtml(r.startLabel)} to ${escapeHtml(r.endLabel)}</li>`).join("")}
            </ul>
            <p style="margin-top:20px; font-size:12px; color:#56766f;"><em>Demo note: This is a sample roadmap output for demonstration mode and should be adapted to live evidence and delivery constraints.</em></p>
          </div>
        </div>
  `);

  root.innerHTML = `
    <div class="wizard-head"><div><div class="step-badge">Step ${assessment.data.currentSection + 1} of ${sections.length}</div><h2 class="section-title">Final Outputs</h2><p class="section-desc">Download the assessment report package. Roadmap planning and roadmap exports are on the next screen.</p></div></div>

    <div class="report-grid">
      <div class="tile"><h3>Overall Weighted Score</h3><p><strong>${score}%</strong></p></div>
      <div class="tile"><h3>Readiness Band</h3><p><strong>${escapeHtml(readinessBand)}</strong></p></div>
      <div class="tile"><h3>Compliant Controls</h3><p><strong>${compliant}</strong> of ${total}</p></div>
    </div>

    <div class="question question-focus">
      <h3>Assessment Summary</h3>
      <p class="hint"><strong>Readiness narrative:</strong> ${escapeHtml(readinessText)}</p>
      ${criticalFindings.length
        ? `<p class="hint"><strong>Priority findings:</strong> ${escapeHtml(criticalFindings.slice(0, 2).map((f) => f.message).join(" "))}</p>`
        : `<p class="hint"><strong>Priority findings:</strong> No critical contradictions were detected from current responses.</p>`}
      <p class="hint"><strong>Report style:</strong> Compliance-focused and suitable for non-technical stakeholders.</p>
    </div>

    <h3>📄 Assessment Report</h3>
    <div class="actions">
      <button class="btn secondary" id="downloadExecutiveSummaryBtn">Executive Summary (.doc)</button>
      <button class="btn secondary" id="downloadFullReportBtn">Full Report (.doc)</button>
      <button class="btn secondary" id="downloadControlsCsvBtn">Controls List (.csv)</button>
    </div>
    ${isDemoMode ? `<div class="question question-focus">
      <h3>Demo Sample Deliverables</h3>
      <p class="hint">Use these sample files to preview the structure before tailoring a live assessment output.</p>
      <div class="actions">
        <button class="btn secondary" id="downloadDemoExecutiveSummaryBtn">Sample Executive Summary (.doc)</button>
        <button class="btn secondary" id="downloadDemoReportBtn">Sample Full Report (.doc)</button>
      </div>
    </div>` : ""}

    ${renderNav(assessment)}
  `;

  document.getElementById("downloadExecutiveSummaryBtn").addEventListener("click", () => {
    download("align42-executive-summary.doc", "application/msword", boardBriefHtml());
  });

  document.getElementById("downloadControlsCsvBtn").addEventListener("click", () => {
    const header = ["Section", "Clause", "Control", "Weight", "Score", "Status", "Priority", "Owner", "Start Date", "Finish Date", "Duration Weeks", "Action Window", "Business Impact if Delayed", "Recommended Action", "Expected Evidence", "Notes", "Links", "Files", "Findings"];
    const csv = [header.map(csvEscape).join(",")].concat(rows.map((r) => {
      const controlFindings = findings.filter((f) => f.controlId && f.controlId === r.id).map((f) => `[${f.severity}] ${f.type}: ${f.message}`).join(" | ");
      const tr = timelineById[r.id] || null;
      const expected = conciseActionText((getControl(r.id)?.bestPractice || "").replace(/^([a-z])/i, (m) => m.toUpperCase()));
      return [r.section, r.clause, r.control, r.weight, r.score, r.status, tr?.priority || "", tr?.owner || "", tr?.startLabel || "", tr?.endLabel || "", tr?.durationWeeks || "", tr ? actionWindowLabel(tr.endWeekScaled || 0) : "", tr ? businessImpactFromPriority(tr.priority) : "", tr ? conciseActionText(tr.method) : "", expected, r.notes, r.links.join(" | "), r.files.join(" | "), controlFindings].map(csvEscape).join(",");
    })).join("\n");
    download("align42-controls-list.csv", "text/csv", csv);
  });

  document.getElementById("downloadFullReportBtn").addEventListener("click", () => {
    download("align42-assessment-report.doc", "application/msword", reportHtml());
  });
  document.getElementById("downloadDemoExecutiveSummaryBtn")?.addEventListener("click", () => {
    download("align42-demo-executive-summary.doc", "application/msword", boardBriefHtml());
  });
  document.getElementById("downloadDemoReportBtn")?.addEventListener("click", () => {
    download("align42-demo-sample-report.doc", "application/msword", demoSampleReportHtml());
  });
  bindNav(assessment);
}

function renderRoadmap(assessment) {
  const root = document.getElementById("wizardSection");
  const rows = roadmapRows(assessment);
  const findings = detectAnalysisFindings(assessment);
  const timeline = roadmapTimeline(assessment, rows);
  const actionPlan = buildExecutiveActionPlan(assessment, timeline, findings, 9);
  const preparedFor = state.profile?.name || "User";
  const isDemoMode = isDemoAssessment(assessment);
  const horizonSummary = `${formatDateShort(timeline.horizonStart)} to ${formatDateShort(timeline.horizonEnd)} (${timeline.planningWeeks} weeks)`;
  const constraintNarrative = `${timeline.constraintNotes}${timeline.compressed ? " Timeline has been compressed to fit the selected horizon." : ""}`;
  const approachLabel = assessment.data.preferredApproach === "optimal" ? "Optimal" : "Fastest";
  const timelineRows = timeline.items.slice(0, 16);
  const roadmapDataUrl = buildRoadmapCanvas(assessment).toDataURL("image/png");
  const demoSampleRoadmapHtml = () => `
    <html><body style="font-family:Aptos,'Segoe UI',Arial,sans-serif; color:#16312b; margin:24px;">
      <h1>Align42 Demo Sample Roadmap</h1>
      <p><strong>Prepared for:</strong> ${escapeHtml(preparedFor)}</p>
      <p>This sample roadmap shows a phased path from foundational governance uplift to operating-control assurance for a low-maturity, high-ambition AI program.</p>
      <table style="width:100%; border-collapse:collapse; margin-top:10px;">
        <tr><th style="border:1px solid #d6e5dd; background:#edf6f1; text-align:left; padding:8px;">Phase</th><th style="border:1px solid #d6e5dd; background:#edf6f1; text-align:left; padding:8px;">Window</th><th style="border:1px solid #d6e5dd; background:#edf6f1; text-align:left; padding:8px;">Focus</th></tr>
        <tr><td style="border:1px solid #d6e5dd; padding:8px;">Phase 1 - Foundation</td><td style="border:1px solid #d6e5dd; padding:8px;">Weeks 1-8</td><td style="border:1px solid #d6e5dd; padding:8px;">Scope, policy framework, governance forum, role accountability</td></tr>
        <tr><td style="border:1px solid #d6e5dd; padding:8px;">Phase 2 - Risk and Operations</td><td style="border:1px solid #d6e5dd; padding:8px;">Weeks 9-20</td><td style="border:1px solid #d6e5dd; padding:8px;">Risk method, risk register, model validation, data lineage, oversight controls</td></tr>
        <tr><td style="border:1px solid #d6e5dd; padding:8px;">Phase 3 - Assurance and Improvement</td><td style="border:1px solid #d6e5dd; padding:8px;">Weeks 21+</td><td style="border:1px solid #d6e5dd; padding:8px;">Monitoring, reporting, internal audit, corrective actions, continual improvement</td></tr>
      </table>
    </body></html>
  `;

  root.innerHTML = `
    <div class="wizard-head"><div><div class="step-badge">Step ${assessment.data.currentSection + 1} of ${sections.length}</div><h2 class="section-title">Roadmap</h2><p class="section-desc">Review sequencing, choose your preferred implementation path, and export the roadmap.</p></div></div>

    <div class="question question-focus">
      <h3>Roadmap Settings</h3>
      <select id="approachSelect">
        <option value="fastest" ${assessment.data.preferredApproach === "fastest" ? "selected" : ""}>A) Fastest implementation</option>
        <option value="optimal" ${assessment.data.preferredApproach === "optimal" ? "selected" : ""}>B) Optimal implementation</option>
      </select>
      <h3 style="margin-top:0.75rem;">Scenario</h3>
      <select id="scenarioSelect">
        <option value="standard" ${assessment.data.roadmapScenario === "standard" ? "selected" : ""}>Standard scenario</option>
        <option value="budget" ${assessment.data.roadmapScenario === "budget" ? "selected" : ""}>Budget constrained</option>
        <option value="regulator_6m" ${assessment.data.roadmapScenario === "regulator_6m" ? "selected" : ""}>Regulator review in &lt; 6 months</option>
      </select>
      <button class="btn primary small" id="refreshRoadmapBtn" style="margin-top:0.6rem;">Refresh Roadmap</button>
      <p class="hint" style="margin-top:0.5rem;"><strong>Timeline:</strong> ${escapeHtml(horizonSummary)}</p>
      <p class="hint"><strong>Constraint notes:</strong> ${escapeHtml(constraintNarrative)}</p>
    </div>

    <div class="report-grid">
      <div class="tile"><h3>Preferred Approach</h3><p><strong>${escapeHtml(approachLabel)}</strong></p></div>
      <div class="tile"><h3>Scenario</h3><p><strong>${escapeHtml(timeline.scenarioLabel)}</strong></p></div>
      <div class="tile"><h3>Priority Actions</h3><p><strong>${timeline.items.filter((r) => r.priority === "High").length}</strong></p></div>
    </div>

    <div class="timeline-axis">
      <div class="timeline-axis-point"><span class="k">Start</span><strong>${escapeHtml(formatDateShort(timeline.horizonStart))}</strong></div>
      <div class="timeline-axis-point"><span class="k">Midpoint</span><strong>${escapeHtml(formatDateShort(addDays(timeline.horizonStart, Math.floor((timeline.planningWeeks * 7) / 2))))}</strong></div>
      <div class="timeline-axis-point"><span class="k">Horizon End</span><strong>${escapeHtml(formatDateShort(timeline.horizonEnd))}</strong></div>
    </div>

    <div class="timeline-shell">
      ${timelineRows.map((r, i) => {
        const left = Math.max(0, Math.min(96, (r.startWeekScaled / timeline.planningWeeks) * 100));
        const width = Math.max(4, Math.min(100 - left, ((r.endWeekScaled - r.startWeekScaled) / timeline.planningWeeks) * 100));
        return `<div class="roadmap-row timeline-row">
          <p><strong>${i + 1}. ${escapeHtml(r.control)}</strong> <span class="tag ${r.priority === "High" ? "no" : "ok"}">${r.priority}</span> ${r.criticalPath ? `<span class="tag">Critical path</span>` : ""}</p>
          <p class="timeline-meta-row"><span><strong>Owner:</strong> ${escapeHtml(r.owner)}</span><span><strong>Timeline:</strong> ${escapeHtml(r.startLabel)} -> ${escapeHtml(r.endLabel)} (${escapeHtml(r.timeframe)})</span></p>
          <div class="timeline-bar"><div class="timeline-fill ${r.priority === "High" ? "high" : r.priority === "Medium" ? "medium" : "low"}" style="left:${left.toFixed(2)}%; width:${width.toFixed(2)}%;"></div></div>
          <p><strong>Dependency:</strong> ${escapeHtml(r.dependency)}</p>
          <p><strong>Recommended:</strong> ${escapeHtml(r.method)}</p>
        </div>`;
      }).join("")}
    </div>

    <div class="question question-lite">
      <h3>Priority Action Summary</h3>
      <ul class="evidence-list">${actionPlan.slice(0, 6).map((a) => `<li><strong>${escapeHtml(a.control)}</strong> - ${escapeHtml(a.window)} (${escapeHtml(a.owner)}): ${escapeHtml(a.recommendedAction)}</li>`).join("")}</ul>
    </div>

    <div class="actions">
      <button class="btn secondary" id="downloadRoadmapPngBtn">Download Roadmap PNG</button>
      <button class="btn secondary" id="downloadRoadmapPptBtn">Download Roadmap PPT</button>
      <button class="btn secondary" id="downloadRoadmapPdfBtn">Download Roadmap PDF</button>
    </div>
    ${isDemoMode ? `<div class="question question-focus">
      <h3>Demo Sample Roadmap</h3>
      <p class="hint">Use this sample file to preview roadmap presentation before tailoring a live output.</p>
      <div class="actions">
        <button class="btn secondary" id="downloadDemoRoadmapBtn">Sample Roadmap (.ppt)</button>
      </div>
    </div>` : ""}

    ${renderNav(assessment)}
  `;

  document.getElementById("approachSelect").addEventListener("change", (e) => {
    assessment.data.preferredApproach = e.target.value;
    assessment.updatedAt = nowIso();
    saveAssessments();
  });
  document.getElementById("scenarioSelect").addEventListener("change", (e) => {
    assessment.data.roadmapScenario = e.target.value;
    assessment.updatedAt = nowIso();
    saveAssessments();
  });
  document.getElementById("refreshRoadmapBtn").addEventListener("click", () => renderRoadmap(assessment));
  document.getElementById("downloadRoadmapPngBtn").addEventListener("click", () => {
    const a = document.createElement("a");
    a.href = roadmapDataUrl;
    a.download = "align42-roadmap.png";
    a.click();
  });
  document.getElementById("downloadRoadmapPptBtn").addEventListener("click", () => {
    const html = `
      <html><body style="font-family:Aptos,'Segoe UI',Arial,sans-serif; color:#16312b; margin:24px;">
        <h1>Align42 Compliance Readiness Roadmap</h1>
        <p><strong>Assessment:</strong> ${escapeHtml(assessment.title)} | <strong>Prepared for:</strong> ${escapeHtml(preparedFor)}</p>
        <p><strong>Approach:</strong> ${escapeHtml(approachLabel)} | <strong>Scenario:</strong> ${escapeHtml(timeline.scenarioLabel)}</p>
        <p><strong>Timeline:</strong> ${escapeHtml(horizonSummary)}</p>
        <img src="${roadmapDataUrl}" style="width:100%; border:1px solid #d5e4dc; border-radius:10px;" />
      </body></html>
    `;
    download("align42-roadmap.ppt", "application/vnd.ms-powerpoint", html);
  });
  document.getElementById("downloadRoadmapPdfBtn").addEventListener("click", () => {
    const w = window.open("", "_blank");
    if (!w) return;
    w.document.write(`
      <html><body style="font-family:Aptos,'Segoe UI',Arial,sans-serif; color:#16312b; margin:24px;">
        <h1>Align42 Compliance Readiness Roadmap</h1>
        <p><strong>Assessment:</strong> ${escapeHtml(assessment.title)} | <strong>Prepared for:</strong> ${escapeHtml(preparedFor)}</p>
        <p><strong>Approach:</strong> ${escapeHtml(approachLabel)} | <strong>Scenario:</strong> ${escapeHtml(timeline.scenarioLabel)}</p>
        <p><strong>Timeline:</strong> ${escapeHtml(horizonSummary)}</p>
        <img src="${roadmapDataUrl}" style="width:100%; border:1px solid #d5e4dc; border-radius:10px;" />
      </body></html>
    `);
    w.document.close();
    w.focus();
    w.print();
  });
  document.getElementById("downloadDemoRoadmapBtn")?.addEventListener("click", () => {
    download("align42-demo-sample-roadmap.ppt", "application/vnd.ms-powerpoint", demoSampleRoadmapHtml());
  });
  bindNav(assessment);
}

function renderNav(assessment) {
  const idx = assessment.data.currentSection;
  return `
    <div class="nav">
      <button class="btn ghost" id="prevBtn" ${idx === 0 ? "disabled" : ""}>Previous</button>
      <button class="btn primary" id="nextBtn">${idx === sections.length - 1 ? "Finish and Return to Welcome" : "Next"}</button>
    </div>
  `;
}

function bindNav(assessment) {
  document.getElementById("prevBtn")?.addEventListener("click", () => {
    assessment.data.currentSection = Math.max(0, assessment.data.currentSection - 1);
    flushAssessmentSave(assessment);
    renderAssessment(assessment);
  });
  document.getElementById("nextBtn")?.addEventListener("click", () => {
    if (assessment.data.currentSection === sections.length - 1) {
      flushAssessmentSave(assessment);
      state.currentAssessmentId = null;
      render();
      return;
    }
    assessment.data.currentSection = Math.min(sections.length - 1, assessment.data.currentSection + 1);
    flushAssessmentSave(assessment);
    renderAssessment(assessment);
  });
}

render();

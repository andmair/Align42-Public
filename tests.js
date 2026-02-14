(function () {
  function complianceStatus(score) {
    return Number(score || 0) >= 4 ? "Compliant" : "Non-compliant";
  }

  function weightedScorePercent(controls, ratings) {
    const weightedMax = controls.reduce((sum, c) => sum + Number(c.weight || 0), 0);
    if (!weightedMax) return 0;
    const weighted = controls.reduce((sum, c) => {
      const score = Number(ratings[c.id] || 0);
      return sum + (score / 5) * Number(c.weight || 0);
    }, 0);
    return Math.round((weighted / weightedMax) * 100);
  }

  function completionPercent(requiredContextKeys, controls, context, ratings) {
    const contextDone = requiredContextKeys.filter((k) => `${context[k] || ""}`.trim().length > 0).length;
    const controlsDone = controls.filter((c) => Number(ratings[c.id] || 0) > 0).length;
    const total = requiredContextKeys.length + controls.length;
    if (!total) return 0;
    return Math.round(((contextDone + controlsDone) / total) * 100);
  }

  function validTransition(currentStatus, targetStatus) {
    const allowed = {
      SENT: ["RESPONDED", "CLOSED"],
      RESPONDED: ["CLOSED"],
      CLOSED: []
    };
    const current = `${currentStatus || "SENT"}`.toUpperCase();
    const target = `${targetStatus || ""}`.toUpperCase();
    if (current === target) return true;
    return (allowed[current] || []).includes(target);
  }

  function escapeRegex(input) {
    return `${input || ""}`.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  }

  function maskSensitiveText(text, sensitiveTerms) {
    let out = `${text || ""}`;
    out = out.replace(/[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/g, "[EMAIL]");
    out = out.replace(/\b(?:\+?\d{1,3}[-.\s]?)?(?:\(?\d{2,4}\)?[-.\s]?)?\d{3}[-.\s]?\d{4}\b/g, "[PHONE]");
    out = out.replace(/\b(?:\d[ -]*?){13,19}\b/g, "[ACCOUNT_OR_CARD]");
    out = out.replace(/\b\d{3}-\d{2}-\d{4}\b/g, "[NATIONAL_ID]");
    out = out.replace(/\b(?:\d{1,3}\.){3}\d{1,3}\b/g, "[IP]");
    out = out.replace(/https?:\/\/[^\s]+/g, "[URL]");

    (sensitiveTerms || []).forEach((term) => {
      const t = `${term || ""}`.trim();
      if (t.length < 3) return;
      out = out.replace(new RegExp(escapeRegex(t), "gi"), "[REDACTED]");
    });
    return out;
  }

  function buildMailtoDraft(toEmail, subject, body) {
    const params = new URLSearchParams({ subject: subject || "", body: body || "" });
    return `mailto:${encodeURIComponent(toEmail || "")}?${params.toString()}`;
  }

  function normalizeEvidenceUrl(url) {
    try {
      const parsed = new URL(`${url || ""}`.trim());
      if (parsed.protocol !== "http:" && parsed.protocol !== "https:") return "";
      return parsed.toString();
    } catch {
      return "";
    }
  }

  function aiFeaturesEnabledForMode(mode, aiModeToggle) {
    return mode === "advanced" && !!aiModeToggle;
  }

  function buildOpenAiPayload(mode, control, responseText, context, profile) {
    const sensitive = [profile && profile.name, profile && profile.email, context && context.orgName, context && context.orgLegalName];
    const masked = {
      control: maskSensitiveText(control.control, sensitive),
      prompt: maskSensitiveText(control.prompt, sensitive),
      best: maskSensitiveText(control.bestPractice, sensitive),
      response: maskSensitiveText(responseText, sensitive),
      context: {}
    };

    Object.keys(context || {}).forEach((k) => {
      const v = context[k];
      masked.context[k] = typeof v === "string" ? maskSensitiveText(v, sensitive) : v;
    });

    const system = mode === "example"
      ? "You are an ISO 42001 audit advisor. Provide practical, relevant examples of strong controls. Inputs are masked."
      : "You are an ISO 42001 audit advisor. Interpret responses and identify strengths/gaps. Inputs are masked.";

    const user = [
      `Control: ${masked.control}`,
      `Question: ${masked.prompt}`,
      `Best practice: ${masked.best}`,
      `Current response: ${masked.response}`,
      `Context: ${JSON.stringify(masked.context)}`,
      mode === "example"
        ? "Generate 2 relevant example implementations with evidence expectations."
        : "Return: 1) alignment interpretation, 2) key gaps, 3) follow-up evidence requests."
    ].join("\n");

    return {
      model: "gpt-4.1-mini",
      input: [
        { role: "system", content: [{ type: "input_text", text: system }] },
        { role: "user", content: [{ type: "input_text", text: user }] }
      ],
      masked: true
    };
  }

  function OpenAiAdapter(requestFn) {
    this.requestFn = requestFn;
  }

  OpenAiAdapter.prototype.run = function run(apiKey, mode, control, responseText, context, profile) {
    const payload = buildOpenAiPayload(mode, control, responseText, context, profile);
    return Promise.resolve(this.requestFn("https://api.openai.com/v1/responses", {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json"
    }, payload)).then((response) => {
      if ((response.status || 500) >= 400) {
        throw new Error(response.error || `OpenAI error (${response.status})`);
      }
      if (response.output_text) return response.output_text;
      const chunks = [];
      (response.output || []).forEach((item) => {
        (item.content || []).forEach((c) => {
          if ((c.type === "output_text" || c.type === "text") && c.text) chunks.push(c.text);
        });
      });
      return chunks.join("\n").trim() || "No output returned.";
    });
  };

  function DictationAdapter(factory) {
    this.factory = factory || null;
  }

  DictationAdapter.prototype.supported = function supported() {
    return !!this.factory;
  };

  DictationAdapter.prototype.create = function create() {
    if (!this.supported()) throw new Error("Speech recognition not supported");
    return this.factory();
  };

  function EmailClientAdapter(navigateFn) {
    this.navigateFn = navigateFn || null;
  }

  EmailClientAdapter.prototype.supported = function supported() {
    return typeof this.navigateFn === "function";
  };

  EmailClientAdapter.prototype.openDraft = function openDraft(toEmail, subject, body) {
    if (!this.supported()) throw new Error("Email client invocation not supported");
    const draftUrl = buildMailtoDraft(toEmail, subject, body);
    this.navigateFn(draftUrl);
    return draftUrl;
  };

  function syntheticControls() {
    return [
      { id: "c1", weight: 5, control: "Policy", prompt: "Is policy defined?", bestPractice: "Approved policy" },
      { id: "c2", weight: 10, control: "Risk", prompt: "Is risk tracked?", bestPractice: "Risk register" },
      { id: "c3", weight: 7, control: "Ops", prompt: "Are incidents managed?", bestPractice: "Playbook" },
      { id: "c4", weight: 8, control: "Security", prompt: "Is access controlled?", bestPractice: "Least privilege" }
    ];
  }

  function syntheticContextKeys() {
    return ["orgName", "industry", "size", "platforms", "roles", "maturity", "targetDate", "aspiration"];
  }

  function syntheticContext() {
    return {
      orgName: "Northbridge Financial Group",
      orgLegalName: "Northbridge Financial Group LLC",
      industry: "Financial services",
      size: "2500",
      platforms: "Azure, M365, ServiceNow",
      roles: "CIO, CRO, CISO",
      maturity: "Defined",
      targetDate: "Q4 2027",
      aspiration: "ISO 42001 readiness"
    };
  }

  function syntheticRatings() {
    return { c1: 5, c2: 3, c3: 4, c4: 2 };
  }

  function assert(condition, message) {
    if (!condition) throw new Error(message || "Assertion failed");
  }

  function assertEqual(actual, expected, message) {
    if (actual !== expected) {
      throw new Error(`${message || "Expected values to match"}. Expected ${expected}, got ${actual}`);
    }
  }

  async function runSuite(testCases) {
    const started = performance.now();
    const results = [];
    for (const t of testCases) {
      try {
        await t.run();
        results.push({ name: t.name, ok: true, error: "" });
      } catch (err) {
        results.push({ name: t.name, ok: false, error: err && err.message ? err.message : `${err}` });
      }
    }
    const durationMs = Math.round(performance.now() - started);
    const passed = results.filter((r) => r.ok).length;
    return { total: results.length, passed, failed: results.length - passed, durationMs, results };
  }

  function renderSuiteResult(targetId, suite, label) {
    const root = document.getElementById(targetId);
    root.innerHTML = `
      <div class="test-summary ${suite.failed ? "fail" : "pass"}">
        <strong>${label}</strong>
        <span>${suite.passed}/${suite.total} passed</span>
        <span>${suite.durationMs} ms</span>
      </div>
      <div class="test-list">
        ${suite.results.map((r) => `
          <div class="test-row ${r.ok ? "pass" : "fail"}">
            <div>${r.ok ? "PASS" : "FAIL"} | ${escapeHtml(r.name)}</div>
            ${r.ok ? "" : `<div class="test-error">${escapeHtml(r.error)}</div>`}
          </div>
        `).join("")}
      </div>
    `;
  }

  function escapeHtml(v) {
    return `${v || ""}`
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#39;");
  }

  function coreTests() {
    return [
      {
        name: "weighted score uses control weights",
        run: function () {
          assertEqual(weightedScorePercent(syntheticControls(), syntheticRatings()), 66, "Weighted score mismatch");
        }
      },
      {
        name: "completion percent counts required context and answered controls",
        run: function () {
          const controls = syntheticControls();
          const ratings = { c1: 5, c2: 0, c3: 2, c4: 0 };
          const pct = completionPercent(syntheticContextKeys(), controls, syntheticContext(), ratings);
          assertEqual(pct, 83, "Completion percent mismatch");
        }
      },
      {
        name: "compliance status threshold",
        run: function () {
          assertEqual(complianceStatus(4), "Compliant");
          assertEqual(complianceStatus(3.99), "Non-compliant");
        }
      },
      {
        name: "delegation status transitions",
        run: function () {
          assert(validTransition("SENT", "RESPONDED"), "SENT->RESPONDED should be valid");
          assert(validTransition("RESPONDED", "CLOSED"), "RESPONDED->CLOSED should be valid");
          assert(!validTransition("CLOSED", "RESPONDED"), "CLOSED->RESPONDED should be invalid");
        }
      },
      {
        name: "sensitive data masking",
        run: function () {
          const masked = maskSensitiveText("Email alex@company.com phone 415-555-1212 at https://x.test/1", ["company"]);
          assert(masked.includes("[EMAIL]"), "email not masked");
          assert(masked.includes("[PHONE]"), "phone not masked");
          assert(masked.includes("[URL]"), "url not masked");
        }
      },
      {
        name: "mailto draft URL encoding",
        run: function () {
          const link = buildMailtoDraft("owner@org.com", "Delegation Request", "Line 1\nLine 2");
          assert(link.startsWith("mailto:owner%40org.com"), "mailto recipient encoding mismatch");
          assert(link.includes("subject=Delegation+Request"), "subject missing");
        }
      },
      {
        name: "openai payload masking and shape",
        run: function () {
          const payload = buildOpenAiPayload(
            "interpret",
            syntheticControls()[0],
            "Contact Alex at alex@company.com",
            syntheticContext(),
            { name: "Alex", email: "alex@company.com" }
          );
          const serialized = JSON.stringify(payload);
          assert(payload.masked === true, "payload should be marked masked");
          assert(serialized.includes("[EMAIL]"), "payload should mask emails");
          assertEqual(payload.model, "gpt-4.1-mini", "unexpected model");
        }
      },
      {
        name: "evidence URL validation allows only http(s)",
        run: function () {
          assertEqual(normalizeEvidenceUrl("https://example.com/doc"), "https://example.com/doc");
          assertEqual(normalizeEvidenceUrl("javascript:alert(1)"), "");
          assertEqual(normalizeEvidenceUrl("data:text/plain,hello"), "");
        }
      },
      {
        name: "AI mode gate requires advanced mode",
        run: function () {
          assertEqual(aiFeaturesEnabledForMode("simple", true), false);
          assertEqual(aiFeaturesEnabledForMode("advanced", false), false);
          assertEqual(aiFeaturesEnabledForMode("advanced", true), true);
        }
      }
    ];
  }

  function dependencyTests() {
    return [
      {
        name: "OpenAI adapter success path",
        run: async function () {
          const calls = [];
          const adapter = new OpenAiAdapter(function (url, headers, payload) {
            calls.push({ url: url, headers: headers, payload: payload });
            return { status: 200, output_text: "ok summary" };
          });
          const result = await adapter.run("sk-test", "interpret", syntheticControls()[0], "Policy exists", syntheticContext(), { name: "Alex", email: "alex@company.com" });
          assertEqual(result, "ok summary");
          assertEqual(calls.length, 1);
          assertEqual(calls[0].url, "https://api.openai.com/v1/responses");
          assert(!!calls[0].headers.Authorization, "authorization header missing");
        }
      },
      {
        name: "OpenAI adapter fallback content extraction",
        run: async function () {
          const adapter = new OpenAiAdapter(function () {
            return {
              status: 200,
              output: [{ content: [{ type: "text", text: "part a" }, { type: "output_text", text: "part b" }] }]
            };
          });
          const result = await adapter.run("sk-test", "example", syntheticControls()[0], "x", syntheticContext(), { name: "Alex", email: "alex@company.com" });
          assert(result.includes("part a") && result.includes("part b"), "fallback output parse mismatch");
        }
      },
      {
        name: "OpenAI adapter error path",
        run: async function () {
          const adapter = new OpenAiAdapter(function () {
            return { status: 429, error: "rate limited" };
          });
          let threw = false;
          try {
            await adapter.run("sk-test", "example", syntheticControls()[0], "x", syntheticContext(), { name: "Alex", email: "alex@company.com" });
          } catch (_err) {
            threw = true;
          }
          assert(threw, "adapter should throw on error status");
        }
      },
      {
        name: "Dictation adapter supported path",
        run: function () {
          let created = false;
          const adapter = new DictationAdapter(function () {
            created = true;
            return { recognizer: true };
          });
          assert(adapter.supported(), "adapter should report supported");
          const instance = adapter.create();
          assert(created && !!instance.recognizer, "factory should be invoked");
        }
      },
      {
        name: "Dictation adapter unsupported path",
        run: function () {
          const adapter = new DictationAdapter(null);
          assert(!adapter.supported(), "adapter should report unsupported");
          let threw = false;
          try {
            adapter.create();
          } catch (_err) {
            threw = true;
          }
          assert(threw, "create should throw when unsupported");
        }
      },
      {
        name: "Email client adapter draft invocation",
        run: function () {
          const calls = [];
          const adapter = new EmailClientAdapter(function (url) { calls.push(url); });
          const draft = adapter.openDraft("delegate@example.com", "Align42 Delegation Request", "Please respond.");
          assertEqual(calls.length, 1, "navigate should be called once");
          assertEqual(calls[0], draft, "draft URL should be passed to navigator");
          assert(draft.startsWith("mailto:delegate%40example.com"), "mailto recipient encoding mismatch");
          assert(draft.includes("subject=Align42+Delegation+Request"), "subject missing");
        }
      },
      {
        name: "Email client adapter unsupported path",
        run: function () {
          const adapter = new EmailClientAdapter(null);
          let threw = false;
          try {
            adapter.openDraft("x@y.com", "s", "b");
          } catch (_err) {
            threw = true;
          }
          assert(threw, "openDraft should throw when unsupported");
        }
      }
    ];
  }

  async function runCoreSuite() {
    const result = await runSuite(coreTests());
    renderSuiteResult("coreResults", result, "Core Suite");
    return result;
  }

  async function runDependencySuite() {
    const result = await runSuite(dependencyTests());
    renderSuiteResult("dependencyResults", result, "Dependency Suite");
    return result;
  }

  function setBusy(isBusy) {
    ["runCoreBtn", "runDependencyBtn", "runAllBtn", "clearBtn"].forEach((id) => {
      const el = document.getElementById(id);
      if (el) el.disabled = !!isBusy;
    });
  }

  async function runAllSuites() {
    setBusy(true);
    try {
      const core = await runCoreSuite();
      const dep = await runDependencySuite();
      const total = core.total + dep.total;
      const passed = core.passed + dep.passed;
      const failed = total - passed;
      const durationMs = core.durationMs + dep.durationMs;
      const overall = document.getElementById("overallResults");
      overall.innerHTML = `
        <div class="test-summary ${failed ? "fail" : "pass"}">
          <strong>Overall</strong>
          <span>${passed}/${total} passed</span>
          <span>${durationMs} ms</span>
        </div>
      `;
    } finally {
      setBusy(false);
    }
  }

  function clearResults() {
    document.getElementById("overallResults").innerHTML = "";
    document.getElementById("coreResults").innerHTML = "";
    document.getElementById("dependencyResults").innerHTML = "";
  }

  document.addEventListener("DOMContentLoaded", function () {
    document.getElementById("runCoreBtn").addEventListener("click", async function () {
      setBusy(true);
      try { await runCoreSuite(); } finally { setBusy(false); }
    });
    document.getElementById("runDependencyBtn").addEventListener("click", async function () {
      setBusy(true);
      try { await runDependencySuite(); } finally { setBusy(false); }
    });
    document.getElementById("runAllBtn").addEventListener("click", runAllSuites);
    document.getElementById("clearBtn").addEventListener("click", clearResults);
  });
})();

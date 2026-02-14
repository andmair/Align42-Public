#!/usr/bin/env python3
import cgi
import datetime as dt
import hashlib
import hmac
import json
import os
import re
import secrets
import sqlite3
import urllib.error
import urllib.request
from http import cookies
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from typing import Optional
from urllib.parse import parse_qs, quote, urlencode, urlparse

ROOT = Path(__file__).resolve().parent
DB_PATH = ROOT / "iso42001.db"
UPLOAD_DIR = ROOT / "uploads"
SESSION_COOKIE = "iso42001_session"
AI_SESSION_KEYS = {}
MAX_JSON_BODY_BYTES = int(os.getenv("MAX_JSON_BODY_BYTES", "1048576"))
MAX_UPLOAD_BYTES = int(os.getenv("MAX_UPLOAD_BYTES", "10485760"))
ALLOWED_DELEGATE_ROLES = {
    "CONTRIBUTOR",
    "REVIEWER",
    "CISO",
    "CRO",
    "LEGAL",
    "DPO",
    "COMPLIANCE",
    "AI_ENGINEERING",
}


def now_iso():
    return dt.datetime.utcnow().replace(microsecond=0).isoformat() + "Z"


def init_db():
    conn = sqlite3.connect(DB_PATH)
    cur = conn.cursor()
    cur.executescript(
        """
        PRAGMA foreign_keys=ON;

        CREATE TABLE IF NOT EXISTS users (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT NOT NULL,
          email TEXT NOT NULL UNIQUE,
          created_at TEXT NOT NULL
        );

        CREATE TABLE IF NOT EXISTS sessions (
          token TEXT PRIMARY KEY,
          user_id INTEGER NOT NULL,
          created_at TEXT NOT NULL,
          expires_at TEXT NOT NULL,
          csrf_token TEXT,
          FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
        );

        CREATE TABLE IF NOT EXISTS auth_magic_links (
          token TEXT PRIMARY KEY,
          email TEXT NOT NULL,
          name TEXT NOT NULL,
          created_at TEXT NOT NULL,
          expires_at TEXT NOT NULL,
          used_at TEXT
        );

        CREATE TABLE IF NOT EXISTS assessment_invites (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          assessment_id INTEGER NOT NULL,
          invited_email TEXT NOT NULL,
          role TEXT NOT NULL DEFAULT 'CONTRIBUTOR',
          status TEXT NOT NULL DEFAULT 'PENDING',
          token TEXT NOT NULL UNIQUE,
          invited_by_user_id INTEGER NOT NULL,
          created_at TEXT NOT NULL,
          accepted_at TEXT,
          UNIQUE(assessment_id, invited_email),
          FOREIGN KEY(assessment_id) REFERENCES assessments(id) ON DELETE CASCADE,
          FOREIGN KEY(invited_by_user_id) REFERENCES users(id) ON DELETE CASCADE
        );

        CREATE TABLE IF NOT EXISTS assessments (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          title TEXT NOT NULL,
          owner_user_id INTEGER NOT NULL,
          data_json TEXT NOT NULL,
          created_at TEXT NOT NULL,
          updated_at TEXT NOT NULL,
          FOREIGN KEY(owner_user_id) REFERENCES users(id) ON DELETE CASCADE
        );

        CREATE TABLE IF NOT EXISTS assessment_collaborators (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          assessment_id INTEGER NOT NULL,
          user_email TEXT NOT NULL,
          invited_by_user_id INTEGER NOT NULL,
          control_id TEXT,
          message TEXT,
          delegate_name TEXT,
          delegate_title TEXT,
          delegated_at TEXT,
          delegation_id TEXT,
          delegate_role TEXT,
          status TEXT NOT NULL DEFAULT 'INVITED',
          created_at TEXT NOT NULL,
          UNIQUE(assessment_id, user_email, control_id),
          FOREIGN KEY(assessment_id) REFERENCES assessments(id) ON DELETE CASCADE,
          FOREIGN KEY(invited_by_user_id) REFERENCES users(id) ON DELETE CASCADE
        );

        CREATE TABLE IF NOT EXISTS evidence_files (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          assessment_id INTEGER NOT NULL,
          control_id TEXT NOT NULL,
          delegation_id TEXT,
          original_name TEXT NOT NULL,
          stored_name TEXT NOT NULL,
          mime_type TEXT,
          size INTEGER NOT NULL,
          uploaded_by_user_id INTEGER NOT NULL,
          created_at TEXT NOT NULL,
          FOREIGN KEY(assessment_id) REFERENCES assessments(id) ON DELETE CASCADE,
          FOREIGN KEY(uploaded_by_user_id) REFERENCES users(id) ON DELETE CASCADE
        );

        CREATE TABLE IF NOT EXISTS delegation_events (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          assessment_id INTEGER NOT NULL,
          delegation_id TEXT NOT NULL,
          control_id TEXT,
          event_type TEXT NOT NULL,
          actor_email TEXT NOT NULL,
          details_json TEXT,
          created_at TEXT NOT NULL,
          FOREIGN KEY(assessment_id) REFERENCES assessments(id) ON DELETE CASCADE
        );

        CREATE INDEX IF NOT EXISTS idx_assessments_owner_updated
          ON assessments(owner_user_id, updated_at DESC);
        CREATE INDEX IF NOT EXISTS idx_assessment_invites_email_status
          ON assessment_invites(invited_email, status);
        CREATE INDEX IF NOT EXISTS idx_assessment_invites_assessment_email
          ON assessment_invites(assessment_id, invited_email);
        """
    )
    ensure_collaborator_columns(conn)
    ensure_evidence_columns(conn)
    ensure_session_columns(conn)
    ensure_indexes(conn)
    conn.commit()
    conn.close()


def ensure_collaborator_columns(conn):
    needed = {
        "delegate_name": "TEXT",
        "delegate_title": "TEXT",
        "delegated_at": "TEXT",
        "delegation_id": "TEXT",
        "delegate_role": "TEXT",
    }
    cur = conn.cursor()
    cur.execute("PRAGMA table_info(assessment_collaborators)")
    existing = {r[1] for r in cur.fetchall()}
    for col, col_type in needed.items():
        if col not in existing:
            cur.execute(f"ALTER TABLE assessment_collaborators ADD COLUMN {col} {col_type}")


def ensure_indexes(conn):
    cur = conn.cursor()
    cur.execute(
        "CREATE INDEX IF NOT EXISTS idx_collaborators_assessment_email "
        "ON assessment_collaborators(assessment_id, user_email)"
    )
    cur.execute(
        "CREATE INDEX IF NOT EXISTS idx_collaborators_delegation "
        "ON assessment_collaborators(assessment_id, delegation_id)"
    )
    cur.execute(
        "CREATE INDEX IF NOT EXISTS idx_files_assessment_control "
        "ON evidence_files(assessment_id, control_id)"
    )
    cur.execute(
        "CREATE INDEX IF NOT EXISTS idx_events_assessment_delegation_created "
        "ON delegation_events(assessment_id, delegation_id, created_at)"
    )


def ensure_evidence_columns(conn):
    cur = conn.cursor()
    cur.execute("PRAGMA table_info(evidence_files)")
    existing = {r[1] for r in cur.fetchall()}
    if "delegation_id" not in existing:
        cur.execute("ALTER TABLE evidence_files ADD COLUMN delegation_id TEXT")


def ensure_session_columns(conn):
    cur = conn.cursor()
    cur.execute("PRAGMA table_info(sessions)")
    existing = {r[1] for r in cur.fetchall()}
    if "csrf_token" not in existing:
        cur.execute("ALTER TABLE sessions ADD COLUMN csrf_token TEXT")
    cur.execute("UPDATE sessions SET csrf_token = lower(hex(randomblob(16))) WHERE csrf_token IS NULL OR csrf_token = ''")


def db_conn():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn


def issue_session(conn, user_id: int):
    token = secrets.token_urlsafe(32)
    csrf_token = secrets.token_hex(16)
    expires = (dt.datetime.now(dt.timezone.utc) + dt.timedelta(days=14)).replace(microsecond=0).isoformat().replace("+00:00", "Z")
    conn.execute(
        "INSERT INTO sessions(token, user_id, created_at, expires_at, csrf_token) VALUES(?,?,?,?,?)",
        (token, user_id, now_iso(), expires, csrf_token),
    )
    return token, csrf_token


def normalize_status(status: str) -> str:
    s = (status or "").upper()
    if s == "DELEGATED":
        return "SENT"
    if s in {"SENT", "RESPONDED", "CLOSED"}:
        return s
    return "SENT"


def normalize_delegate_role(role: str) -> str:
    r = (role or "").strip().upper()
    if r in ALLOWED_DELEGATE_ROLES:
        return r
    return "CONTRIBUTOR"


def log_delegation_event(conn, assessment_id: int, delegation_id: str, event_type: str, actor_email: str, details=None, control_id=None):
    conn.execute(
        """
        INSERT INTO delegation_events(assessment_id, delegation_id, control_id, event_type, actor_email, details_json, created_at)
        VALUES(?,?,?,?,?,?,?)
        """,
        (
            assessment_id,
            delegation_id,
            control_id,
            event_type,
            actor_email,
            json.dumps(details or {}),
            now_iso(),
        ),
    )


def default_assessment_data():
    return {
        "currentSection": 0,
        "context": {},
        "ratings": {},
        "evidence": {},
        "delegates": {},
        "preferredApproach": "fastest",
    }


def email_sender():
    return os.getenv("EMAIL_FROM", "iso42001-audit-assistant@localhost")


def mask_sensitive_text(text: str, sensitive_terms=None) -> str:
    if not text:
        return ""
    out = text
    out = re.sub(r"[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}", "[EMAIL]", out)
    out = re.sub(r"\b(?:\+?\d{1,3}[-.\s]?)?(?:\(?\d{2,4}\)?[-.\s]?)?\d{3}[-.\s]?\d{4}\b", "[PHONE]", out)
    out = re.sub(r"\b(?:\d[ -]*?){13,19}\b", "[ACCOUNT_OR_CARD]", out)
    out = re.sub(r"\b\d{3}-\d{2}-\d{4}\b", "[NATIONAL_ID]", out)
    out = re.sub(r"\b(?:\d{1,3}\.){3}\d{1,3}\b", "[IP]", out)
    out = re.sub(r"https?://[^\s]+", "[URL]", out)
    out = re.sub(r"\b[A-Z]{2,5}-\d{2,}\b", "[INTERNAL_ID]", out)
    if sensitive_terms:
        for term in sensitive_terms:
            t = (term or "").strip()
            if len(t) < 3:
                continue
            out = re.sub(re.escape(t), "[REDACTED]", out, flags=re.IGNORECASE)
    return out


def call_openai(api_key: str, system_prompt: str, user_prompt: str):
    model = os.getenv("OPENAI_MODEL", "gpt-4.1-mini")
    payload = {
        "model": model,
        "input": [
            {
                "role": "system",
                "content": [{"type": "input_text", "text": system_prompt}],
            },
            {
                "role": "user",
                "content": [{"type": "input_text", "text": user_prompt}],
            },
        ],
    }
    req = urllib.request.Request(
        "https://api.openai.com/v1/responses",
        data=json.dumps(payload).encode("utf-8"),
        method="POST",
    )
    req.add_header("Content-Type", "application/json")
    req.add_header("Authorization", f"Bearer {api_key}")
    try:
        with urllib.request.urlopen(req, timeout=60) as resp:
            body = resp.read().decode("utf-8")
            data = json.loads(body)
    except urllib.error.HTTPError as ex:
        try:
            err_body = ex.read().decode("utf-8")
        except Exception:  # noqa: BLE001
            err_body = str(ex)
        return False, f"OpenAI HTTP error: {err_body}"
    except Exception as ex:  # noqa: BLE001
        return False, f"OpenAI request error: {ex}"

    text = data.get("output_text")
    if text:
        return True, text.strip()

    try:
        outputs = data.get("output") or []
        chunks = []
        for item in outputs:
            for c in (item.get("content") or []):
                if c.get("type") in {"output_text", "text"} and c.get("text"):
                    chunks.append(c["text"])
        if chunks:
            return True, "\n".join(chunks).strip()
    except Exception:  # noqa: BLE001
        pass
    return False, "OpenAI returned no text output."


def send_email(to_email: str, subject: str, body: str, reply_to: Optional[str] = None):
    # Open default email client via mailto draft; user customizes and sends manually.
    full_body = body
    if reply_to:
        full_body = f"{body}\n\nRequested reply-to: {reply_to}\n"
    q = urlencode({"subject": subject, "body": full_body}, quote_via=quote)
    draft_url = f"mailto:{quote(to_email)}?{q}"
    return True, "Draft created in default email client", draft_url


def build_auth_request_link_response(sent: bool, info: str, draft_url: str):
    return {"ok": True, "linkSent": sent, "deliveryInfo": info, "draftUrl": draft_url}


def group_delegation_rows(rows):
    groups = {}
    for r in rows:
        did = r["delegation_id"]
        if did not in groups:
            groups[did] = {
                "delegationId": did,
                "delegateEmail": r["user_email"],
                "delegateName": r["delegate_name"] or "",
                "delegateTitle": r["delegate_title"] or "",
                "role": normalize_delegate_role(r["delegate_role"] or "CONTRIBUTOR"),
                "delegatedAt": r["delegated_at"],
                "status": normalize_status(r["status"]),
                "controlIds": [],
                "history": [],
            }
        if r["control_id"] and r["control_id"] not in groups[did]["controlIds"]:
            groups[did]["controlIds"].append(r["control_id"])
        status = normalize_status(r["status"])
        if status == "CLOSED" or (status == "RESPONDED" and groups[did]["status"] == "SENT"):
            groups[did]["status"] = status
    return groups


class Handler(BaseHTTPRequestHandler):
    server_version = "ISO42001Server/1.0"

    def do_GET(self):
        parsed = urlparse(self.path)
        path = parsed.path

        if path.startswith("/api/"):
            return self.api_get(path, parse_qs(parsed.query))

        if path == "/" or path == "/index.html" or path == "/Align42.html":
            return self.serve_file(ROOT / "Align42.html", "text/html; charset=utf-8")
        if path == "/standards.html":
            return self.serve_file(ROOT / "standards.html", "text/html; charset=utf-8")
        if path == "/app.js":
            return self.serve_file(ROOT / "app.js", "application/javascript; charset=utf-8")
        if path == "/styles.css":
            return self.serve_file(ROOT / "styles.css", "text/css; charset=utf-8")
        if path == "/logo-align42.svg":
            return self.serve_file(ROOT / "logo-align42.svg", "image/svg+xml; charset=utf-8")

        return self.send_json(404, {"error": "Not found"})

    def do_POST(self):
        parsed = urlparse(self.path)
        path = parsed.path
        if not path.startswith("/api/"):
            return self.send_json(404, {"error": "Not found"})
        if path not in {"/api/auth/request-link", "/api/auth/verify"}:
            user = self.current_user()
            if not user:
                return self.send_json(401, {"error": "Authentication required"})
            if not self.verify_csrf(user):
                return self.send_json(403, {"error": "Invalid CSRF token"})
        return self.api_post(path)

    def do_PUT(self):
        parsed = urlparse(self.path)
        path = parsed.path
        if not path.startswith("/api/"):
            return self.send_json(404, {"error": "Not found"})
        user = self.current_user()
        if not user:
            return self.send_json(401, {"error": "Authentication required"})
        if not self.verify_csrf(user):
            return self.send_json(403, {"error": "Invalid CSRF token"})
        return self.api_put(path)

    def do_OPTIONS(self):
        self.send_response(200)
        self.send_header("Allow", "GET, POST, PUT, OPTIONS")
        self.end_headers()

    def parse_json_body(self):
        length = int(self.headers.get("Content-Length", "0") or "0")
        if length > MAX_JSON_BODY_BYTES:
            return {"__error__": f"Request body too large (max {MAX_JSON_BODY_BYTES} bytes)"}
        if length == 0:
            return {}
        raw = self.rfile.read(length)
        try:
            return json.loads(raw.decode("utf-8"))
        except json.JSONDecodeError:
            return None

    def has_body_error(self, body):
        return isinstance(body, dict) and "__error__" in body

    def add_standard_headers(self):
        self.send_header("X-Content-Type-Options", "nosniff")
        self.send_header("X-Frame-Options", "DENY")
        self.send_header("Referrer-Policy", "no-referrer")
        self.send_header(
            "Content-Security-Policy",
            "default-src 'self'; script-src 'self'; "
            "connect-src 'self' https://api.openai.com https://api.anthropic.com https://generativelanguage.googleapis.com https://*.openai.azure.com; "
            "img-src 'self' data:; "
            "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com data:;",
        )

    def send_json(self, status, payload, set_cookie=None, clear_cookie=False):
        raw = json.dumps(payload).encode("utf-8")
        self.send_response(status)
        self.add_standard_headers()
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(raw)))
        if set_cookie:
            self.send_header("Set-Cookie", set_cookie.OutputString())
        if clear_cookie:
            c = cookies.SimpleCookie()
            c[SESSION_COOKIE] = ""
            c[SESSION_COOKIE]["path"] = "/"
            c[SESSION_COOKIE]["expires"] = "Thu, 01 Jan 1970 00:00:00 GMT"
            c[SESSION_COOKIE]["httponly"] = True
            c[SESSION_COOKIE]["samesite"] = "Lax"
            if os.getenv("COOKIE_SECURE", "false").lower() == "true":
                c[SESSION_COOKIE]["secure"] = True
            self.send_header("Set-Cookie", c.OutputString())
        self.end_headers()
        self.wfile.write(raw)

    def send_binary(self, status, data, content_type, content_disposition=None):
        self.send_response(status)
        self.add_standard_headers()
        self.send_header("Content-Type", content_type)
        self.send_header("Content-Length", str(len(data)))
        if content_disposition:
            self.send_header("Content-Disposition", content_disposition)
        self.end_headers()
        self.wfile.write(data)

    def serve_file(self, path, content_type):
        if not path.exists() or not path.is_file():
            return self.send_json(404, {"error": "File not found"})
        data = path.read_bytes()
        self.send_binary(200, data, content_type)

    def verify_csrf(self, user):
        expected = user.get("csrfToken", "")
        provided = self.headers.get("X-CSRF-Token", "")
        return bool(expected and provided and hmac.compare_digest(expected, provided))

    def session_token(self):
        c = cookies.SimpleCookie(self.headers.get("Cookie", ""))
        morsel = c.get(SESSION_COOKIE)
        return morsel.value if morsel else None

    def current_user(self):
        token = self.session_token()
        if not token:
            return None
        conn = db_conn()
        cur = conn.cursor()
        cur.execute(
            """
            SELECT u.id, u.name, u.email, s.expires_at, s.csrf_token
            FROM sessions s
            JOIN users u ON u.id = s.user_id
            WHERE s.token = ?
            """,
            (token,),
        )
        row = cur.fetchone()
        if not row:
            conn.close()
            return None
        try:
            expires = dt.datetime.fromisoformat(row["expires_at"].replace("Z", "+00:00"))
            if dt.datetime.now(dt.timezone.utc) > expires:
                cur.execute("DELETE FROM sessions WHERE token = ?", (token,))
                conn.commit()
                conn.close()
                return None
        except ValueError:
            conn.close()
            return None
        csrf = row["csrf_token"]
        if not csrf:
            csrf = secrets.token_hex(16)
            cur.execute("UPDATE sessions SET csrf_token = ? WHERE token = ?", (csrf, token))
            conn.commit()
        user = {"id": row["id"], "name": row["name"], "email": row["email"], "csrfToken": csrf}
        conn.close()
        return user

    def require_user(self):
        user = self.current_user()
        if not user:
            self.send_json(401, {"error": "Authentication required"})
            return None
        return user

    def can_access_assessment(self, conn, assessment_id, user):
        cur = conn.cursor()
        cur.execute(
            "SELECT id, title, owner_user_id, data_json, created_at, updated_at FROM assessments WHERE id = ?",
            (assessment_id,),
        )
        row = cur.fetchone()
        if not row:
            return None
        if row["owner_user_id"] == user["id"]:
            return row
        cur.execute(
            """
            SELECT 1 FROM assessment_invites
            WHERE assessment_id = ? AND lower(invited_email) = lower(?) AND status = 'ACCEPTED'
            """,
            (assessment_id, user["email"]),
        )
        if cur.fetchone():
            return row
        return None

    def assessment_summary(self, conn, row, user):
        cur = conn.cursor()
        if row["owner_user_id"] == user["id"]:
            role = "owner"
        else:
            cur.execute(
                """
                SELECT role FROM assessment_invites
                WHERE assessment_id = ? AND lower(invited_email)=lower(?) AND status='ACCEPTED'
                LIMIT 1
                """,
                (row["id"], user["email"]),
            )
            invite = cur.fetchone()
            role = f"collaborator:{invite['role'].lower()}" if invite and invite["role"] else "collaborator"
        cur.execute(
            "SELECT COUNT(*) AS c FROM assessment_invites WHERE assessment_id = ? AND status = 'ACCEPTED'",
            (row["id"],),
        )
        collaborator_count = cur.fetchone()["c"]
        return {
            "id": row["id"],
            "title": row["title"],
            "role": role,
            "updatedAt": row["updated_at"],
            "createdAt": row["created_at"],
            "collaboratorCount": collaborator_count,
        }

    def api_get(self, path, query):
        if path == "/api/session":
            user = self.current_user()
            return self.send_json(200, {"authenticated": bool(user), "user": user, "csrfToken": (user or {}).get("csrfToken")})

        if path == "/api/ai/status":
            user = self.require_user()
            if not user:
                return
            token = self.session_token()
            return self.send_json(200, {"connected": bool(token and AI_SESSION_KEYS.get(token))})

        m = re.fullmatch(r"/api/invites/([A-Za-z0-9_-]+)", path)
        if m:
            token = m.group(1)
            conn = db_conn()
            cur = conn.cursor()
            cur.execute(
                """
                SELECT i.assessment_id, i.invited_email, i.role, i.status, i.created_at, i.accepted_at, a.title
                FROM assessment_invites i
                JOIN assessments a ON a.id = i.assessment_id
                WHERE i.token = ?
                """,
                (token,),
            )
            row = cur.fetchone()
            conn.close()
            if not row:
                return self.send_json(404, {"error": "Invite not found"})
            return self.send_json(
                200,
                {
                    "invite": {
                        "assessmentId": row["assessment_id"],
                        "assessmentTitle": row["title"],
                        "invitedEmail": row["invited_email"],
                        "role": row["role"],
                        "status": row["status"],
                        "createdAt": row["created_at"],
                        "acceptedAt": row["accepted_at"],
                    }
                },
            )

        if path == "/api/assessments":
            user = self.require_user()
            if not user:
                return
            conn = db_conn()
            cur = conn.cursor()
            cur.execute(
                """
                SELECT DISTINCT a.id, a.title, a.owner_user_id, a.data_json, a.created_at, a.updated_at
                FROM assessments a
                LEFT JOIN assessment_invites i ON i.assessment_id = a.id
                WHERE a.owner_user_id = ? OR (lower(i.invited_email) = lower(?) AND i.status = 'ACCEPTED')
                ORDER BY a.updated_at DESC
                """,
                (user["id"], user["email"]),
            )
            rows = cur.fetchall()
            items = [self.assessment_summary(conn, r, user) for r in rows]
            conn.close()
            return self.send_json(200, {"items": items})

        m = re.fullmatch(r"/api/assessments/(\d+)", path)
        if m:
            user = self.require_user()
            if not user:
                return
            assessment_id = int(m.group(1))
            conn = db_conn()
            row = self.can_access_assessment(conn, assessment_id, user)
            if not row:
                conn.close()
                return self.send_json(404, {"error": "Assessment not found"})

            cur = conn.cursor()
            cur.execute(
                """
                SELECT id, user_email, control_id, message, status, created_at,
                       delegate_name, delegate_title, delegated_at, delegation_id, delegate_role
                FROM assessment_collaborators WHERE assessment_id = ?
                ORDER BY created_at DESC
                """,
                (assessment_id,),
            )
            delegates = [dict(r) for r in cur.fetchall()]

            cur.execute(
                """
                SELECT id, control_id, delegation_id, original_name, mime_type, size, created_at
                FROM evidence_files WHERE assessment_id = ?
                ORDER BY created_at DESC
                """,
                (assessment_id,),
            )
            files = [
                {
                    "id": r["id"],
                    "controlId": r["control_id"],
                    "delegationId": r["delegation_id"],
                    "name": r["original_name"],
                    "mimeType": r["mime_type"],
                    "size": r["size"],
                    "createdAt": r["created_at"],
                    "downloadUrl": f"/api/files/{r['id']}",
                }
                for r in cur.fetchall()
            ]

            conn.close()
            data = json.loads(row["data_json"])
            return self.send_json(
                200,
                {
                    "assessment": {
                        "id": row["id"],
                        "title": row["title"],
                        "role": "owner" if row["owner_user_id"] == user["id"] else "collaborator",
                        "updatedAt": row["updated_at"],
                        "createdAt": row["created_at"],
                        "data": data,
                        "delegates": delegates,
                        "files": files,
                    }
                },
            )

        m = re.fullmatch(r"/api/assessments/(\d+)/delegations", path)
        if m:
            user = self.require_user()
            if not user:
                return
            assessment_id = int(m.group(1))
            conn = db_conn()
            row = self.can_access_assessment(conn, assessment_id, user)
            if not row:
                conn.close()
                return self.send_json(404, {"error": "Assessment not found"})

            cur = conn.cursor()
            cur.execute(
                """
                SELECT delegation_id, user_email, delegate_name, delegate_title,
                       delegate_role, COALESCE(delegated_at, created_at) AS delegated_at,
                       status, control_id
                FROM assessment_collaborators
                WHERE assessment_id = ? AND delegation_id IS NOT NULL AND delegation_id <> ''
                ORDER BY delegated_at DESC
                """,
                (assessment_id,),
            )
            groups = group_delegation_rows(cur.fetchall())

            for did in groups.keys():
                cur.execute(
                    """
                    SELECT id, control_id, event_type, actor_email, details_json, created_at
                    FROM delegation_events
                    WHERE assessment_id = ? AND delegation_id = ?
                    ORDER BY created_at ASC
                    """,
                    (assessment_id, did),
                )
                history = []
                for e in cur.fetchall():
                    details = {}
                    if e["details_json"]:
                        try:
                            details = json.loads(e["details_json"])
                        except json.JSONDecodeError:
                            details = {"raw": e["details_json"]}
                    history.append(
                        {
                            "id": e["id"],
                            "controlId": e["control_id"],
                            "eventType": e["event_type"],
                            "actorEmail": e["actor_email"],
                            "details": details,
                            "createdAt": e["created_at"],
                        }
                    )
                groups[did]["history"] = history

            conn.close()
            items = list(groups.values())
            items.sort(key=lambda x: x.get("delegatedAt", ""), reverse=True)
            return self.send_json(200, {"items": items})

        m = re.fullmatch(r"/api/files/(\d+)", path)
        if m:
            user = self.require_user()
            if not user:
                return
            file_id = int(m.group(1))
            conn = db_conn()
            cur = conn.cursor()
            cur.execute(
                """
                SELECT f.id, f.assessment_id, f.original_name, f.stored_name, f.mime_type
                FROM evidence_files f WHERE f.id = ?
                """,
                (file_id,),
            )
            row = cur.fetchone()
            if not row:
                conn.close()
                return self.send_json(404, {"error": "File not found"})
            if not self.can_access_assessment(conn, row["assessment_id"], user):
                conn.close()
                return self.send_json(403, {"error": "Forbidden"})
            path_file = UPLOAD_DIR / row["stored_name"]
            conn.close()
            if not path_file.exists():
                return self.send_json(404, {"error": "Stored file missing"})
            data = path_file.read_bytes()
            self.send_binary(
                200,
                data,
                row["mime_type"] or "application/octet-stream",
                content_disposition=f"attachment; filename=\"{row['original_name']}\"",
            )
            return

        return self.send_json(404, {"error": "Not found"})

    def api_post(self, path):
        if path == "/api/auth/request-link":
            body = self.parse_json_body()
            if self.has_body_error(body):
                return self.send_json(413, {"error": body["__error__"]})
            if body is None:
                return self.send_json(400, {"error": "Invalid JSON"})
            name = (body.get("name") or "").strip()
            email = (body.get("email") or "").strip().lower()
            continue_invite = (body.get("continueInviteToken") or "").strip()
            if not name or not email:
                return self.send_json(400, {"error": "Name and email are required"})

            conn = db_conn()
            token = secrets.token_urlsafe(40)
            expires_at = (dt.datetime.now(dt.timezone.utc) + dt.timedelta(minutes=20)).replace(microsecond=0).isoformat().replace("+00:00", "Z")
            conn.execute(
                "INSERT INTO auth_magic_links(token, email, name, created_at, expires_at) VALUES(?,?,?,?,?)",
                (token, email, name, now_iso(), expires_at),
            )
            conn.commit()
            conn.close()

            base_url = os.getenv("APP_BASE_URL", f"http://localhost:{os.getenv('PORT', '8000')}")
            magic_link = f"{base_url}/?magic={token}"
            if continue_invite and re.fullmatch(r"[A-Za-z0-9_-]+", continue_invite):
                magic_link += f"&invite={continue_invite}"
            subject = "Align42 sign-in link"
            body_text = (
                f"Hello {name},\n\n"
                "Use this one-time link to sign in to Align42:\n"
                f"{magic_link}\n\n"
                "The link expires in 20 minutes.\n"
            )
            sent, info, draft_url = send_email(email, subject, body_text)
            return self.send_json(200, build_auth_request_link_response(sent, info, draft_url))

        if path == "/api/auth/verify":
            body = self.parse_json_body()
            if self.has_body_error(body):
                return self.send_json(413, {"error": body["__error__"]})
            if body is None:
                return self.send_json(400, {"error": "Invalid JSON"})
            token = (body.get("token") or "").strip()
            if not token:
                return self.send_json(400, {"error": "Token is required"})

            conn = db_conn()
            cur = conn.cursor()
            cur.execute(
                "SELECT token, email, name, expires_at, used_at FROM auth_magic_links WHERE token = ?",
                (token,),
            )
            row = cur.fetchone()
            if not row:
                conn.close()
                return self.send_json(400, {"error": "Invalid or expired link"})
            if row["used_at"]:
                conn.close()
                return self.send_json(400, {"error": "Link already used"})
            try:
                expires = dt.datetime.fromisoformat(row["expires_at"].replace("Z", "+00:00"))
            except ValueError:
                conn.close()
                return self.send_json(400, {"error": "Invalid link expiry"})
            if dt.datetime.now(dt.timezone.utc) > expires:
                conn.close()
                return self.send_json(400, {"error": "Link expired"})

            email = row["email"].lower()
            name = row["name"]
            cur.execute("SELECT id FROM users WHERE lower(email)=lower(?)", (email,))
            user_row = cur.fetchone()
            if user_row:
                user_id = user_row["id"]
                cur.execute("UPDATE users SET name=? WHERE id=?", (name, user_id))
            else:
                cur.execute("INSERT INTO users(name, email, created_at) VALUES(?,?,?)", (name, email, now_iso()))
                user_id = cur.lastrowid

            session_token, csrf_token = issue_session(conn, user_id)
            cur.execute("UPDATE auth_magic_links SET used_at = ? WHERE token = ?", (now_iso(), token))
            conn.commit()
            conn.close()

            c = cookies.SimpleCookie()
            c[SESSION_COOKIE] = session_token
            c[SESSION_COOKIE]["path"] = "/"
            c[SESSION_COOKIE]["httponly"] = True
            c[SESSION_COOKIE]["max-age"] = 14 * 24 * 3600
            c[SESSION_COOKIE]["samesite"] = "Lax"
            if os.getenv("COOKIE_SECURE", "false").lower() == "true":
                c[SESSION_COOKIE]["secure"] = True
            return self.send_json(200, {"ok": True, "user": {"id": user_id, "name": name, "email": email}, "csrfToken": csrf_token}, set_cookie=c)

        if path == "/api/session/end":
            token = self.session_token()
            if token:
                conn = db_conn()
                conn.execute("DELETE FROM sessions WHERE token = ?", (token,))
                conn.commit()
                conn.close()
                AI_SESSION_KEYS.pop(token, None)
            return self.send_json(200, {"ok": True}, clear_cookie=True)

        if path == "/api/ai/connect":
            user = self.require_user()
            if not user:
                return
            token = self.session_token()
            body = self.parse_json_body()
            if self.has_body_error(body):
                return self.send_json(413, {"error": body["__error__"]})
            if body is None:
                return self.send_json(400, {"error": "Invalid JSON"})
            api_key = (body.get("apiKey") or "").strip()
            if not api_key.startswith("sk-"):
                return self.send_json(400, {"error": "Invalid API key format"})
            AI_SESSION_KEYS[token] = api_key
            return self.send_json(200, {"ok": True, "connected": True})

        if path == "/api/ai/disconnect":
            user = self.require_user()
            if not user:
                return
            token = self.session_token()
            AI_SESSION_KEYS.pop(token, None)
            return self.send_json(200, {"ok": True, "connected": False})

        if path == "/api/ai/analyze":
            user = self.require_user()
            if not user:
                return
            token = self.session_token()
            api_key = AI_SESSION_KEYS.get(token or "")
            if not api_key:
                return self.send_json(400, {"error": "OpenAI not connected. Connect your API key first."})
            body = self.parse_json_body()
            if self.has_body_error(body):
                return self.send_json(413, {"error": body["__error__"]})
            if body is None:
                return self.send_json(400, {"error": "Invalid JSON"})

            mode = (body.get("mode") or "interpret").strip().lower()
            control_title = (body.get("controlTitle") or "").strip()
            control_prompt = (body.get("controlPrompt") or "").strip()
            best_practice = (body.get("bestPractice") or "").strip()
            response_text = (body.get("responseText") or "").strip()
            context = body.get("context") or {}

            sensitive_terms = [
                user.get("name", ""),
                user.get("email", ""),
                context.get("orgName", ""),
                context.get("orgLegalName", ""),
            ]
            masked_context = {}
            for k, v in context.items():
                if isinstance(v, str):
                    masked_context[k] = mask_sensitive_text(v, sensitive_terms=sensitive_terms)
                else:
                    masked_context[k] = v

            masked_control_title = mask_sensitive_text(control_title, sensitive_terms=sensitive_terms)
            masked_control_prompt = mask_sensitive_text(control_prompt, sensitive_terms=sensitive_terms)
            masked_best_practice = mask_sensitive_text(best_practice, sensitive_terms=sensitive_terms)
            masked_response_text = mask_sensitive_text(response_text, sensitive_terms=sensitive_terms)

            if mode == "example":
                system_prompt = (
                    "You are an ISO 42001 audit advisor. Provide practical, relevant examples of strong controls. "
                    "Assume all inputs are masked. Do not ask for identity details."
                )
                user_prompt = (
                    f"Control: {masked_control_title}\n"
                    f"Question: {masked_control_prompt}\n"
                    f"Best practice baseline: {masked_best_practice}\n"
                    f"Current response summary: {masked_response_text}\n"
                    f"Business context: {json.dumps(masked_context)}\n\n"
                    "Generate 2 concise, relevant best-practice examples tailored to this context. "
                    "For each, include why it is relevant and what evidence should exist."
                )
            else:
                system_prompt = (
                    "You are an ISO 42001 audit advisor. Interpret assessment responses and identify likely control strengths/gaps. "
                    "Assume inputs are masked and avoid requesting sensitive details."
                )
                user_prompt = (
                    f"Control: {masked_control_title}\n"
                    f"Question: {masked_control_prompt}\n"
                    f"Best practice baseline: {masked_best_practice}\n"
                    f"Current response: {masked_response_text}\n"
                    f"Business context: {json.dumps(masked_context)}\n\n"
                    "Return:\n"
                    "1) Alignment interpretation (short)\n"
                    "2) Key gaps (bullet list)\n"
                    "3) Suggested follow-up evidence requests (bullet list)"
                )

            ok, text = call_openai(api_key, system_prompt, user_prompt)
            if not ok:
                return self.send_json(502, {"error": text})
            return self.send_json(200, {"ok": True, "mode": mode, "output": text, "masked": True})

        m = re.fullmatch(r"/api/invites/([A-Za-z0-9_-]+)/accept", path)
        if m:
            user = self.require_user()
            if not user:
                return
            token = m.group(1)
            conn = db_conn()
            cur = conn.cursor()
            cur.execute(
                """
                SELECT id, assessment_id, invited_email, role, status
                FROM assessment_invites WHERE token = ?
                """,
                (token,),
            )
            row = cur.fetchone()
            if not row:
                conn.close()
                return self.send_json(404, {"error": "Invite not found"})
            if row["status"] == "ACCEPTED":
                conn.close()
                return self.send_json(200, {"ok": True, "assessmentId": row["assessment_id"], "role": row["role"], "alreadyAccepted": True})
            if row["status"] != "PENDING":
                conn.close()
                return self.send_json(400, {"error": f"Invite is {row['status'].lower()}"})
            if row["invited_email"].lower() != user["email"].lower():
                conn.close()
                return self.send_json(403, {"error": "Signed-in email does not match invited email"})

            cur.execute(
                "UPDATE assessment_invites SET status='ACCEPTED', accepted_at=? WHERE id=?",
                (now_iso(), row["id"]),
            )
            conn.commit()
            conn.close()
            return self.send_json(200, {"ok": True, "assessmentId": row["assessment_id"], "role": row["role"]})

        if path == "/api/assessments":
            user = self.require_user()
            if not user:
                return
            body = self.parse_json_body()
            if self.has_body_error(body):
                return self.send_json(413, {"error": body["__error__"]})
            if body is None:
                return self.send_json(400, {"error": "Invalid JSON"})
            title = (body.get("title") or "Untitled assessment").strip()

            conn = db_conn()
            cur = conn.cursor()
            cur.execute(
                "INSERT INTO assessments(title, owner_user_id, data_json, created_at, updated_at) VALUES(?,?,?,?,?)",
                (title, user["id"], json.dumps(default_assessment_data()), now_iso(), now_iso()),
            )
            aid = cur.lastrowid
            conn.commit()
            conn.close()
            return self.send_json(201, {"assessmentId": aid})

        m = re.fullmatch(r"/api/assessments/(\d+)/delegate", path)
        if m:
            user = self.require_user()
            if not user:
                return
            body = self.parse_json_body()
            if self.has_body_error(body):
                return self.send_json(413, {"error": body["__error__"]})
            if body is None:
                return self.send_json(400, {"error": "Invalid JSON"})
            aid = int(m.group(1))
            to_email = (body.get("delegateEmail") or "").strip().lower()
            delegate_name = (body.get("delegateName") or "").strip()
            delegate_title = (body.get("delegateTitle") or "").strip()
            delegate_role = normalize_delegate_role(body.get("delegateRole") or "CONTRIBUTOR")
            intro = (body.get("intro") or "").strip()
            controls = body.get("controls") or []
            if not to_email or not delegate_name or not delegate_title:
                return self.send_json(400, {"error": "Delegate name, title, and email are required"})
            if not isinstance(controls, list) or len(controls) == 0:
                return self.send_json(400, {"error": "At least one control must be selected"})

            conn = db_conn()
            row = self.can_access_assessment(conn, aid, user)
            if not row:
                conn.close()
                return self.send_json(404, {"error": "Assessment not found"})

            delegation_id = secrets.token_hex(8)
            delegated_at = now_iso()
            cur = conn.cursor()
            for item in controls:
                control_id = (item.get("controlId") or "").strip()
                if not control_id:
                    continue
                cur.execute(
                    """
                    INSERT INTO assessment_collaborators(
                      assessment_id, user_email, invited_by_user_id, control_id, message, status,
                      created_at, delegate_name, delegate_title, delegated_at, delegation_id, delegate_role
                    )
                    VALUES(?,?,?,?,?,?,?,?,?,?,?,?)
                    ON CONFLICT(assessment_id, user_email, control_id)
                    DO UPDATE SET
                      message=excluded.message,
                      status='SENT',
                      delegate_name=excluded.delegate_name,
                      delegate_title=excluded.delegate_title,
                      delegated_at=excluded.delegated_at,
                      delegation_id=excluded.delegation_id,
                      delegate_role=excluded.delegate_role
                    """,
                    (
                        aid,
                        to_email,
                        user["id"],
                        control_id,
                        intro,
                        "SENT",
                        now_iso(),
                        delegate_name,
                        delegate_title,
                        delegated_at,
                        delegation_id,
                        delegate_role,
                    ),
                )
            invite_token = secrets.token_urlsafe(32)
            cur.execute(
                """
                SELECT id, status, token FROM assessment_invites
                WHERE assessment_id=? AND lower(invited_email)=lower(?)
                """,
                (aid, to_email),
            )
            invite_row = cur.fetchone()
            if invite_row:
                effective_token = invite_row["token"] or invite_token
                new_status = invite_row["status"] if invite_row["status"] == "ACCEPTED" else "PENDING"
                cur.execute(
                    """
                    UPDATE assessment_invites
                    SET role=?, status=?, token=?
                    WHERE id=?
                    """,
                    (delegate_role, new_status, effective_token, invite_row["id"]),
                )
            else:
                effective_token = invite_token
                cur.execute(
                    """
                    INSERT INTO assessment_invites(
                      assessment_id, invited_email, role, status, token, invited_by_user_id, created_at
                    ) VALUES(?,?,?,?,?,?,?)
                    """,
                    (aid, to_email, delegate_role, "PENDING", effective_token, user["id"], now_iso()),
                )
            base_url = os.getenv("APP_BASE_URL", f"http://localhost:{os.getenv('PORT', '8000')}")
            invite_link = f"{base_url}/?assessment={aid}"
            accept_link = f"{base_url}/?invite={effective_token}"
            subject = f"ISO 42001 input request: {row['title']}"

            lines = [
                f"Hello {delegate_name},",
                "",
                f"You have been contacted because {user['name']} ({user['email']}) is completing an ISO 42001 AI governance assessment and needs your specialist input.",
                "",
                "What is required from you:",
                "1) Reply to this email.",
                "2) Write your responses under each question below.",
                "3) Attach any supporting documents and reference them in your answers.",
                "",
            ]
            if intro:
                lines.extend([f"Additional context from requester: {intro}", ""])
            lines.extend([
                f"Assessment: {row['title']}",
                f"Assigned role: {delegate_role}",
                f"Access link: {invite_link}",
                f"Accept invite: {accept_link}",
                "",
                "Controls and questions to complete:",
                "",
            ])
            for item in controls:
                title = (item.get("controlTitle") or item.get("controlId") or "Control").strip()
                questions = item.get("questions") or []
                lines.append(f"{title}")
                lines.append("-" * len(title))
                if questions:
                    for i, q in enumerate(questions, 1):
                        lines.append(f"Q{i}. {q}")
                else:
                    lines.append("Q1. Please describe the current control design and operation.")
                    lines.append("Q2. Please list evidence and document references.")
                lines.append("")
            lines.append("Please reply directly to this email so your response reaches the assessment owner.")
            body_text = "\n".join(lines)

            log_delegation_event(
                conn,
                aid,
                delegation_id,
                "SENT",
                user["email"],
                {
                    "delegateEmail": to_email,
                    "delegateName": delegate_name,
                    "delegateTitle": delegate_title,
                    "delegateRole": delegate_role,
                    "controlIds": [((item.get("controlId") or "").strip()) for item in controls if (item.get("controlId") or "").strip()],
                },
            )
            conn.commit()
            conn.close()

            sent, info, draft_url = send_email(to_email, subject, body_text, reply_to=user["email"])
            return self.send_json(
                200,
                {
                    "ok": True,
                    "emailSent": sent,
                    "deliveryInfo": info,
                    "draftUrl": draft_url,
                    "delegatedAt": delegated_at,
                    "delegationId": delegation_id,
                },
            )

        m = re.fullmatch(r"/api/assessments/(\d+)/delegations/([A-Za-z0-9_-]+)/responses", path)
        if m:
            user = self.require_user()
            if not user:
                return
            aid = int(m.group(1))
            delegation_id = m.group(2)
            body = self.parse_json_body()
            if self.has_body_error(body):
                return self.send_json(413, {"error": body["__error__"]})
            if body is None:
                return self.send_json(400, {"error": "Invalid JSON"})
            responses = body.get("responses") or []
            file_ids = body.get("fileIds") or []

            conn = db_conn()
            row = self.can_access_assessment(conn, aid, user)
            if not row:
                conn.close()
                return self.send_json(404, {"error": "Assessment not found"})

            cur = conn.cursor()
            cur.execute(
                """
                SELECT COUNT(*) AS c FROM assessment_collaborators
                WHERE assessment_id = ? AND delegation_id = ?
                """,
                (aid, delegation_id),
            )
            if cur.fetchone()["c"] == 0:
                conn.close()
                return self.send_json(404, {"error": "Delegation not found"})

            for entry in responses:
                control_id = (entry.get("controlId") or "").strip()
                response_text = (entry.get("responseText") or "").strip()
                if not control_id and not response_text:
                    continue
                log_delegation_event(
                    conn,
                    aid,
                    delegation_id,
                    "RESPONDED",
                    user["email"],
                    {"responseText": response_text},
                    control_id=control_id or None,
                )

            if file_ids:
                log_delegation_event(
                    conn,
                    aid,
                    delegation_id,
                    "RESPONSE_FILES_ADDED",
                    user["email"],
                    {"fileIds": file_ids},
                )

            conn.execute(
                """
                UPDATE assessment_collaborators
                SET status = 'RESPONDED'
                WHERE assessment_id = ? AND delegation_id = ?
                """,
                (aid, delegation_id),
            )
            conn.commit()
            conn.close()
            return self.send_json(200, {"ok": True, "status": "RESPONDED"})

        m = re.fullmatch(r"/api/assessments/(\d+)/files", path)
        if m:
            user = self.require_user()
            if not user:
                return
            aid = int(m.group(1))
            conn = db_conn()
            row = self.can_access_assessment(conn, aid, user)
            if not row:
                conn.close()
                return self.send_json(404, {"error": "Assessment not found"})

            ctype, pdict = cgi.parse_header(self.headers.get("content-type", ""))
            if ctype != "multipart/form-data":
                conn.close()
                return self.send_json(400, {"error": "Expected multipart/form-data"})

            form = cgi.FieldStorage(
                fp=self.rfile,
                headers=self.headers,
                environ={"REQUEST_METHOD": "POST", "CONTENT_TYPE": self.headers.get("content-type")},
            )
            control_id = (form.getvalue("controlId") or "").strip()
            delegation_id = (form.getvalue("delegationId") or "").strip()
            file_item = form["file"] if "file" in form else None
            if not control_id or file_item is None or not getattr(file_item, "filename", None):
                conn.close()
                return self.send_json(400, {"error": "controlId and file are required"})

            raw = file_item.file.read()
            if len(raw) > MAX_UPLOAD_BYTES:
                conn.close()
                return self.send_json(413, {"error": f"File too large (max {MAX_UPLOAD_BYTES} bytes)"})
            original_name = os.path.basename(file_item.filename)
            original_name = re.sub(r"[^A-Za-z0-9._ -]", "_", original_name)[:255] or "upload.bin"
            stored_name = hashlib.sha256((original_name + secrets.token_hex(8)).encode("utf-8")).hexdigest()
            UPLOAD_DIR.mkdir(parents=True, exist_ok=True)
            (UPLOAD_DIR / stored_name).write_bytes(raw)

            cur = conn.cursor()
            cur.execute(
                """
                INSERT INTO evidence_files(assessment_id, control_id, delegation_id, original_name, stored_name, mime_type, size, uploaded_by_user_id, created_at)
                VALUES(?,?,?,?,?,?,?,?,?)
                """,
                (
                    aid,
                    control_id,
                    delegation_id or None,
                    original_name,
                    stored_name,
                    file_item.type or "application/octet-stream",
                    len(raw),
                    user["id"],
                    now_iso(),
                ),
            )
            fid = cur.lastrowid
            conn.commit()
            conn.close()
            return self.send_json(
                201,
                {
                    "file": {
                        "id": fid,
                        "controlId": control_id,
                        "name": original_name,
                        "size": len(raw),
                        "mimeType": file_item.type or "application/octet-stream",
                        "downloadUrl": f"/api/files/{fid}",
                    }
                },
            )

        return self.send_json(404, {"error": "Not found"})

    def api_put(self, path):
        user = self.require_user()
        if not user:
            return

        m = re.fullmatch(r"/api/assessments/(\d+)/delegations/([A-Za-z0-9_-]+)/status", path)
        if m:
            aid = int(m.group(1))
            delegation_id = m.group(2)
            body = self.parse_json_body()
            if self.has_body_error(body):
                return self.send_json(413, {"error": body["__error__"]})
            if body is None:
                return self.send_json(400, {"error": "Invalid JSON"})
            target_status = normalize_status(body.get("status") or "")
            if target_status not in {"SENT", "RESPONDED", "CLOSED"}:
                return self.send_json(400, {"error": "Invalid status"})

            conn = db_conn()
            row = self.can_access_assessment(conn, aid, user)
            if not row:
                conn.close()
                return self.send_json(404, {"error": "Assessment not found"})
            cur = conn.cursor()
            cur.execute(
                """
                SELECT status FROM assessment_collaborators
                WHERE assessment_id = ? AND delegation_id = ?
                LIMIT 1
                """,
                (aid, delegation_id),
            )
            existing = cur.fetchone()
            if not existing:
                conn.close()
                return self.send_json(404, {"error": "Delegation not found"})
            current_status = normalize_status(existing["status"])
            allowed = {
                "SENT": {"RESPONDED", "CLOSED"},
                "RESPONDED": {"CLOSED"},
                "CLOSED": set(),
            }
            if target_status == current_status:
                conn.close()
                return self.send_json(200, {"ok": True, "status": current_status})
            if target_status not in allowed.get(current_status, set()):
                conn.close()
                return self.send_json(400, {"error": f"Invalid transition from {current_status} to {target_status}"})

            conn.execute(
                """
                UPDATE assessment_collaborators
                SET status = ?
                WHERE assessment_id = ? AND delegation_id = ?
                """,
                (target_status, aid, delegation_id),
            )
            log_delegation_event(
                conn,
                aid,
                delegation_id,
                "STATUS_CHANGED",
                user["email"],
                {"from": current_status, "to": target_status},
            )
            conn.commit()
            conn.close()
            return self.send_json(200, {"ok": True, "status": target_status})

        m = re.fullmatch(r"/api/assessments/(\d+)", path)
        if not m:
            return self.send_json(404, {"error": "Not found"})

        aid = int(m.group(1))
        body = self.parse_json_body()
        if self.has_body_error(body):
            return self.send_json(413, {"error": body["__error__"]})
        if body is None:
            return self.send_json(400, {"error": "Invalid JSON"})

        conn = db_conn()
        row = self.can_access_assessment(conn, aid, user)
        if not row:
            conn.close()
            return self.send_json(404, {"error": "Assessment not found"})

        title = (body.get("title") or row["title"]).strip()
        data = body.get("data")
        if data is None:
            try:
                data = json.loads(row["data_json"])
            except json.JSONDecodeError:
                data = default_assessment_data()

        conn.execute(
            "UPDATE assessments SET title = ?, data_json = ?, updated_at = ? WHERE id = ?",
            (title, json.dumps(data), now_iso(), aid),
        )
        conn.commit()
        conn.close()
        return self.send_json(200, {"ok": True})


def main():
    init_db()
    UPLOAD_DIR.mkdir(parents=True, exist_ok=True)
    port = int(os.getenv("PORT", "8000"))
    server = ThreadingHTTPServer(("0.0.0.0", port), Handler)
    print(f"Align42 running at http://localhost:{port}")
    server.serve_forever()


if __name__ == "__main__":
    main()

#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
HOOK_DIR="$ROOT_DIR/.git/hooks"

if [[ ! -d "$HOOK_DIR" ]]; then
  echo "No .git/hooks directory found. Run this inside a git repository."
  exit 1
fi

cat > "$HOOK_DIR/pre-commit" <<'HOOK'
#!/usr/bin/env bash
set -euo pipefail
ROOT_DIR="$(git rev-parse --show-toplevel)"
"$ROOT_DIR/scripts/run_tests.sh"
HOOK

cat > "$HOOK_DIR/post-merge" <<'HOOK'
#!/usr/bin/env bash
set -euo pipefail
ROOT_DIR="$(git rev-parse --show-toplevel)"
"$ROOT_DIR/scripts/run_tests.sh" || {
  echo "Tests failed after merge. Please fix before continuing."
  exit 1
}
HOOK

chmod +x "$HOOK_DIR/pre-commit" "$HOOK_DIR/post-merge"

echo "Installed git hooks: pre-commit, post-merge"

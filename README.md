# Align42

Local-first ISO 42001 assessment application.

## Local architecture

- Runs fully in the browser on the local device.
- Default mode requires no backend.
- Optional local server (`server.py`) can be used for localhost hosting and API/security regression tests.
- External dependencies are optional:
  - local default email client (for draft emails)
  - optional AI provider API calls in **Advanced mode** (OpenAI, Anthropic, Gemini, Azure OpenAI)
- Data is stored locally in browser storage.
- Includes a dedicated local **Delegations Audit Trail** page with status transitions (`SENT`, `RESPONDED`, `CLOSED`) and per-delegate response history.

## Run

Run the local server and open Align42 via localhost (recommended for AI providers):

```bash
python3 /Users/amair/Documents/New\ project/server.py
```

Then open:

`http://localhost:8000/Align42.html`

## Automated tests

The project includes two automated suites:

- Core suite: deterministic business logic tests using synthetic assessment data.
- Dependency suite: separate adapter tests with simulated external dependencies (OpenAI request function and speech recognition factory).

Run all tests:

```bash
./scripts/run_tests.sh
```

Run suites individually:

```bash
python3 -m unittest -v tests.test_core
python3 -m unittest -v tests.test_dependencies
```

Standalone browser test page:

- Open `/Users/amair/Documents/New project/tests.html`
- Run `Core`, `Dependency`, or `All` suites and view pass/fail details on screen.

## Run tests automatically after updates

Install local git hooks so tests run after each code update event:

```bash
./scripts/install_git_hooks.sh
```

Installed hooks:

- `pre-commit`: blocks commit if tests fail.
- `post-merge`: runs tests after merges/updates and warns if failing.

## AI settings behavior

- AI features are available only in **Advanced** assessment mode.
- AI settings support provider selection: OpenAI, Anthropic Claude, Gemini, Azure OpenAI.
- Credential storage mode:
  - `Session only (recommended)` keeps keys in-memory and does not persist them in local storage.
  - `Persist on this device` stores keys in local storage.
- AI settings include provider setup documentation links that open in a new tab.
- Diagnostics are hidden by default in an accordion and can be exported as JSON.

## Email behavior

- Align42 creates `mailto:` drafts in the default local email client.
- The user customizes and sends emails manually.
- Used for:
  - delegation requests

## Deprecated distributions

The Windows/macOS installer packages and the clean folder distribution are retained in the repository for future use, but are currently deprecated and should not be rebuilt unless explicitly re-enabled.

If you need to rebuild the legacy installer packages:

```bash
ALLOW_DEPRECATED_DISTRIBUTIONS=1 ./scripts/build_single_file_installers.sh
```

If you need to rebuild the legacy folder distribution:

```bash
ALLOW_DEPRECATED_DISTRIBUTIONS=1 ./scripts/build_folder_distribution.sh
```

Windows `.exe` installer remains separately deprecated inside the legacy installer build flow. To build it explicitly when legacy installers are re-enabled:

```bash
ALLOW_DEPRECATED_DISTRIBUTIONS=1 BUILD_WINDOWS_EXE=1 ./scripts/build_single_file_installers.sh
```

## Notes

- File attachments in responses are stored as local metadata references in the browser state.
- Clearing browser storage will remove saved assessments and settings.

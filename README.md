# Align42

Local-first ISO 42001 assessment application.

## Supported installation options

Align42 supports two installation methods only:

1. Local run
2. Docker run

### Option 1: Local run

Open the app directly in your browser:

```bash
open Align42.html
```

For better AI-provider compatibility, you can also run the bundled local web server:

```bash
python3 server.py
```

Then open:

`http://localhost:8000/Align42.html`

The bundled local server serves static app files only.
User profile, settings, and assessment data are stored locally in the browser with encrypted-at-rest persistence.
Align42 does not use server-side database persistence.

### Option 2: Docker run

Docker is the preferred packaged installation path.

Quick start:

```bash
./scripts/docker_install.sh
```

Then open:

`http://localhost:3000/Align42.html`

Manual Docker commands:

```bash
docker build -t align42 .
docker run -d --name align42 -p 3000:3000 align42
```

Stop the container:

```bash
docker rm -f align42
```

Docker Compose:

```bash
docker compose up --build -d
```

Helper scripts:

- `./scripts/docker_build.sh`
- `./scripts/docker_run.sh`
- `./scripts/docker_stop.sh`
- `./scripts/docker_logs.sh`
- `./scripts/docker_doctor.sh`
- `./scripts/docker_install.sh`

Make shortcuts:

- `make install`
- `make build`
- `make run`
- `make stop`
- `make logs`
- `make doctor`
- `make test`

## Automated tests

Run all tests:

```bash
./scripts/run_tests.sh
```

Run suites individually:

```bash
python3 -m unittest -v tests.test_core
python3 -m unittest -v tests.test_dependencies
python3 -m unittest -v tests.test_server
```

Standalone browser test page:

- Open `/Users/amair/Documents/align42/tests.html`
- Run `Core`, `Dependency`, or `All` suites and view pass/fail details on screen.

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
- Used for delegation requests.

## Notes

- File attachments in responses are stored as local metadata references in the browser state.
- Clearing browser storage will remove saved assessments and settings.
- The legacy SQLite persistence path has been removed from the supported runtime.

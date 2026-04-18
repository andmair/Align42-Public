# Align42

Local-first ISO 42001 assessment application.

## Preferred installation: Docker

Docker is the preferred way to install and run Align42.

### Quick start

Build and run with the bundled helper script:

```bash
./scripts/docker_install.sh
```

Then open:

`http://localhost:3000/Align42.html`

### Manual Docker commands

Build the image:

```bash
docker build -t align42 .
```

Run the container:

```bash
docker run -d --name align42 -p 3000:3000 align42
```

Stop the container:

```bash
docker rm -f align42
```

### Docker Compose

```bash
docker compose up --build -d
```

### Helper scripts

- `./scripts/docker_build.sh`
- `./scripts/docker_run.sh`
- `./scripts/docker_stop.sh`
- `./scripts/docker_logs.sh`
- `./scripts/docker_doctor.sh`
- `./scripts/docker_install.sh`

### Make shortcuts

- `make install`
- `make build`
- `make run`
- `make stop`
- `make logs`
- `make doctor`
- `make test`

## Local architecture

- Runs fully in the browser on the local device.
- Optional local server (`server.py`) can be used for localhost hosting and API/security regression tests.
- External dependencies are optional:
  - local default email client (for draft emails)
  - optional AI provider API calls in **Advanced mode** (OpenAI, Anthropic, Gemini, Azure OpenAI)
- Data is stored locally in browser storage.
- Includes a dedicated local **Delegations Audit Trail** page with status transitions (`SENT`, `RESPONDED`, `CLOSED`) and per-delegate response history.

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

## Deprecated distributions

The Windows/macOS installer packages and the clean folder distribution are retained in the repository for future use, but are currently deprecated and should not be rebuilt unless explicitly re-enabled.

Rebuild legacy installers only if required:

```bash
ALLOW_DEPRECATED_DISTRIBUTIONS=1 ./scripts/build_single_file_installers.sh
```

Rebuild the legacy folder distribution only if required:

```bash
ALLOW_DEPRECATED_DISTRIBUTIONS=1 ./scripts/build_folder_distribution.sh
```

Build the deprecated Windows `.exe` only if legacy installers are explicitly re-enabled:

```bash
ALLOW_DEPRECATED_DISTRIBUTIONS=1 BUILD_WINDOWS_EXE=1 ./scripts/build_single_file_installers.sh
```

## Notes

- File attachments in responses are stored as local metadata references in the browser state.
- Clearing browser storage will remove saved assessments and settings.

.PHONY: help doctor build run stop logs install restart test compose-up compose-down

help:
	@printf 'Align42 make targets:\n'
	@printf '  make doctor       Check Docker availability\n'
	@printf '  make build        Build the Docker image\n'
	@printf '  make run          Start the Docker container\n'
	@printf '  make stop         Stop and remove the Docker container\n'
	@printf '  make logs         Tail Docker container logs\n'
	@printf '  make install      Check Docker, build image, and start container\n'
	@printf '  make restart      Restart the Docker container\n'
	@printf '  make test         Run the automated test suite\n'
	@printf '  make compose-up   Start via docker compose\n'
	@printf '  make compose-down Stop via docker compose\n'

doctor:
	./scripts/docker_doctor.sh

build:
	./scripts/docker_build.sh

run:
	./scripts/docker_run.sh

stop:
	./scripts/docker_stop.sh

logs:
	./scripts/docker_logs.sh

install:
	./scripts/docker_install.sh

restart: stop run

test:
	./scripts/run_tests.sh

compose-up:
	docker compose up --build -d

compose-down:
	docker compose down

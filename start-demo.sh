#!/usr/bin/env bash
# FarmAid demo - run with ./start-demo.sh (macOS / Linux). Needs Docker running.
# Opens http://localhost:8090 when ready. Press Ctrl+C to stop.
set -e
cd "$(dirname "$0")"

if ! docker info >/dev/null 2>&1; then
  echo "Docker is not running. Start Docker Desktop (or the docker service) and try again."
  exit 1
fi

echo
echo "Starting the FarmAid demo... the first run takes a few minutes, later runs are quick."
echo "Your browser opens at http://localhost:8090 when it is ready. Press Ctrl+C to stop."
echo

# Open the browser in the background once the app answers its health check (gives up after ~15 minutes).
(
  for _ in $(seq 1 450); do
    if curl -fs http://localhost:8090/actuator/health >/dev/null 2>&1; then
      if command -v open >/dev/null; then open http://localhost:8090
      elif command -v xdg-open >/dev/null; then xdg-open http://localhost:8090 >/dev/null 2>&1
      else echo "FarmAid is ready: http://localhost:8090"; fi
      break
    fi
    sleep 2
  done
) &

docker compose up --build demo

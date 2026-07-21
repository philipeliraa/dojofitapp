#!/bin/bash
# Sobe/derruba o Dojofit em modo desenvolvimento (banco via Docker, backend e
# frontend rodando direto na máquina, com hot-reload). Uso:
#
#   ./dev.sh up       - sobe banco + backend + frontend
#   ./dev.sh down     - derruba tudo
#   ./dev.sh status   - mostra o que está no ar
#   ./dev.sh logs backend|frontend|db  - acompanha o log ao vivo
#
# Backend em http://localhost:8080 · Frontend em http://localhost:4200

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
STATE_DIR="$ROOT_DIR/.dev"
BACKEND_LOG="$STATE_DIR/backend.log"
FRONTEND_LOG="$STATE_DIR/frontend.log"
BACKEND_PID_FILE="$STATE_DIR/backend.pid"
FRONTEND_PID_FILE="$STATE_DIR/frontend.pid"

export JAVA_HOME="${JAVA_HOME:-/opt/homebrew/opt/openjdk@21/libexec/openjdk.jdk/Contents/Home}"

mkdir -p "$STATE_DIR"

is_running() {
  local pid_file="$1"
  [ -f "$pid_file" ] && kill -0 "$(cat "$pid_file")" 2>/dev/null
}

wait_for_db() {
  echo "Aguardando o banco de dados ficar saudável..."
  for _ in $(seq 1 30); do
    local cid
    cid=$(docker compose -f "$ROOT_DIR/docker-compose.yml" ps -q db)
    if [ -n "$cid" ] && [ "$(docker inspect --format '{{.State.Health.Status}}' "$cid" 2>/dev/null)" = "healthy" ]; then
      echo "Banco pronto."
      return 0
    fi
    sleep 2
  done
  echo "Timeout esperando o banco ficar saudável." >&2
  exit 1
}

wait_for_backend() {
  echo "Aguardando o backend subir (pode levar ~1 min na primeira vez)..."
  for _ in $(seq 1 60); do
    if grep -q "Started DojofitApplication" "$BACKEND_LOG" 2>/dev/null; then
      echo "Backend pronto em http://localhost:8080"
      return 0
    fi
    if grep -qiE "APPLICATION FAILED|BUILD FAILURE" "$BACKEND_LOG" 2>/dev/null; then
      echo "Backend falhou ao subir — veja $BACKEND_LOG" >&2
      exit 1
    fi
    sleep 2
  done
  echo "Timeout esperando o backend subir — veja $BACKEND_LOG" >&2
  exit 1
}

cmd_up() {
  if is_running "$BACKEND_PID_FILE" || is_running "$FRONTEND_PID_FILE"; then
    echo "Já parece estar no ar. Rode './dev.sh status' ou './dev.sh down' primeiro."
    exit 1
  fi

  echo "Subindo o banco (Docker)..."
  (cd "$ROOT_DIR" && docker compose up -d db)
  wait_for_db

  echo "Subindo o backend..."
  (cd "$ROOT_DIR/backend" && nohup ./mvnw spring-boot:run > "$BACKEND_LOG" 2>&1 &)
  # A JVM da aplicação (forkada pelo mvnw -> Maven -> plugin) só existe alguns
  # segundos depois do lançamento — captura o PID só depois de confirmar que
  # subiu, senão o pgrep roda cedo demais e não encontra nada.
  wait_for_backend
  pgrep -f "com.dojofit.api.DojofitApplication" | tail -1 > "$BACKEND_PID_FILE" || true

  echo "Subindo o frontend..."
  (cd "$ROOT_DIR/frontend" && nohup npx ng serve --port 4200 > "$FRONTEND_LOG" 2>&1 &)
  sleep 1
  pgrep -f "ng serve" | tail -1 > "$FRONTEND_PID_FILE" || true

  echo ""
  echo "Tudo no ar:"
  echo "  Backend:  http://localhost:8080"
  echo "  Frontend: http://localhost:4200"
  echo ""
  echo "Logs em $STATE_DIR/*.log — use './dev.sh logs frontend' para acompanhar."
}

cmd_down() {
  echo "Derrubando frontend e backend..."
  for pid_file in "$FRONTEND_PID_FILE" "$BACKEND_PID_FILE"; do
    if is_running "$pid_file"; then
      kill "$(cat "$pid_file")" 2>/dev/null || true
    fi
    rm -f "$pid_file"
  done
  # O mvnw/Maven que lança o backend é um processo à parte da JVM da aplicação
  # (morta acima) — sem isso ele fica órfão rodando em segundo plano.
  pkill -f "spring-boot:run" 2>/dev/null || true
  # Garantia extra: mata qualquer processo remanescente das portas do projeto
  lsof -ti :8080 2>/dev/null | xargs -r kill 2>/dev/null || true
  lsof -ti :4200 2>/dev/null | xargs -r kill 2>/dev/null || true

  echo "Parando o banco (Docker)..."
  (cd "$ROOT_DIR" && docker compose stop db)
  echo "Tudo derrubado."
}

cmd_status() {
  if is_running "$BACKEND_PID_FILE"; then
    echo "Backend:  no ar (pid $(cat "$BACKEND_PID_FILE"))"
  else
    echo "Backend:  parado"
  fi
  if is_running "$FRONTEND_PID_FILE"; then
    echo "Frontend: no ar (pid $(cat "$FRONTEND_PID_FILE"))"
  else
    echo "Frontend: parado"
  fi
  (cd "$ROOT_DIR" && docker compose ps db)
}

cmd_logs() {
  case "${1:-}" in
    backend) tail -f "$BACKEND_LOG" ;;
    frontend) tail -f "$FRONTEND_LOG" ;;
    db) (cd "$ROOT_DIR" && docker compose logs -f db) ;;
    *) echo "Uso: ./dev.sh logs backend|frontend|db" >&2; exit 1 ;;
  esac
}

case "${1:-}" in
  up) cmd_up ;;
  down) cmd_down ;;
  status) cmd_status ;;
  logs) cmd_logs "${2:-}" ;;
  *)
    echo "Uso: ./dev.sh up|down|status|logs [backend|frontend|db]"
    exit 1
    ;;
esac

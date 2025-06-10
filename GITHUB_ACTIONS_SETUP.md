# GitHub Actions Setup - Plemiona Bot Frontend

## Wymagane zmienne i sekrety

Aby workflows działały poprawnie, musisz skonfigurować następujące zmienne w ustawieniach repozytorium GitHub.

### Repository Variables (Settings → Secrets and variables → Actions → Variables)

```bash
FRONTEND_IMAGE=node:20.11.1-alpine
VITE_BACKEND_PLEMIONA=https://bot-plemiona-api.wojciechfalkowski.pl
VITE_PORT=7060
```

### Repository Secrets (Settings → Secrets and variables → Actions → Secrets)

```bash
VITE_CLERK_PUBLISHABLE_KEY=pk_test_b3JnYW5pYy1yYW0tODEuY2xlcmsuYWNjb3VudHMuZGV2JA
```

## Workflows

### 1. `deploy.yml` - Auto Deploy
- **Trigger:** Push do branch `main`
- **Runner:** `self-hosted` (Raspberry Pi)
- **Akcje:**
  - Checkout kodu
  - Generowanie pliku `.env`
  - Zatrzymanie poprzedniej wersji
  - Build i uruchomienie nowej wersji
  - Health check

### 2. `test.yml` - Test Build
- **Trigger:** Pull Request do `main`
- **Runner:** `self-hosted`
- **Akcje:**
  - Checkout kodu
  - Test budowania Docker image
  - Cleanup

## Self-hosted Runner Setup

### 1. Instalacja na Raspberry Pi
```bash
# Pobierz runner z GitHub (Settings → Actions → Runners → New self-hosted runner)
mkdir actions-runner && cd actions-runner
curl -o actions-runner-linux-arm64-2.311.0.tar.gz -L https://github.com/actions/runner/releases/download/v2.311.0/actions-runner-linux-arm64-2.311.0.tar.gz
tar xzf ./actions-runner-linux-arm64-2.311.0.tar.gz
```

### 2. Konfiguracja
```bash
./config.sh --url https://github.com/YOUR_USERNAME/YOUR_REPO --token YOUR_TOKEN
```

### 3. Uruchomienie jako serwis
```bash
sudo ./svc.sh install
sudo ./svc.sh start
```

## Wymagania na serwerze (Raspberry Pi)

### Docker i Docker Compose
```bash
# Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER

# Docker Compose (jeśli nie jest zainstalowany)
sudo apt-get update
sudo apt-get install docker-compose-plugin
```

### Curl (dla health check)
```bash
sudo apt-get install curl
```

## Testowanie

### Ręczne uruchomienie workflow
1. Idź do **Actions** w repozytorium
2. Wybierz workflow
3. Kliknij **Run workflow**

### Lokalne testowanie
```bash
# Test build
docker compose build frontend

# Test run
docker compose up -d
curl http://localhost:7060
docker compose down
```

## Debugging

### Sprawdzenie logów
```bash
# Logi GitHub Actions runner
sudo journalctl -u actions.runner.YOUR-REPO.YOUR-RUNNER.service -f

# Logi Docker
docker compose logs frontend

# Status serwisów
docker compose ps
```

### Częste problemy
1. **Port zajęty** - Zatrzymaj poprzednie instancje: `docker compose down`
2. **Brak uprawnień** - Sprawdź czy user jest w grupie `docker`
3. **Runner offline** - Restart serwisu: `sudo ./svc.sh restart`

## Workflow triggery

- **Auto deploy:** Push do `main`
- **Test build:** Pull Request do `main`
- **Manual:** Workflow dispatch (ręcznie z GitHub UI)

## Health Check

Workflow sprawdza czy aplikacja odpowiada na:
```
GET http://localhost:${VITE_PORT}
```

Jeśli health check failuje, deployment kończy się błędem. 
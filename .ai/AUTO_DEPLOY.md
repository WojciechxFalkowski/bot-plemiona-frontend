# Automatyczne wdrażanie (auto-deploy) Plemiona Bot Frontend na Raspberry Pi

## 1. Konfiguracja self-hosted runnera na Raspberry Pi

### Rejestracja runnera w GitHub

1. Wejdź do repozytorium projektu na GitHub.
2. Przejdź do: **Settings → Actions → Runners**.
3. Kliknij **New self-hosted runner**.
4. Wybierz system: **Linux** oraz architekturę **ARM64** (jeśli Twój Raspberry Pi to ARM64).
5. Skopiuj polecenia wyświetlone przez GitHub (np. pobranie archiwum, rozpakowanie, rejestracja runnera).

### Instalacja i uruchomienie runnera na Raspberry Pi

Na Raspberry Pi, w katalogu runnera, wykonaj poniższe polecenia:

```bash
# Instalacja runnera jako usługa (działa w tle i po restarcie)
sudo ./svc.sh install

# Uruchomienie usługi
sudo ./svc.sh start

# Sprawdzenie statusu runnera
sudo ./svc.sh status
```

Od tej pory runner będzie uruchamiał się automatycznie po restarcie Raspberry Pi i będzie zawsze online, jeśli urządzenie jest włączone.

### Nazwa runnera

Podczas rejestracji runnera możesz nadać mu własną nazwę (np. `raspberrypi`, `plemiona-runner`), która będzie widoczna w repozytorium w zakładce **Actions → Runners**.

---

## 2. Konfiguracja workflow GitHub Actions

W repozytorium znajduje się plik `.github/workflows/deploy.yml`, który automatyzuje proces wdrażania. Workflow uruchamia się automatycznie po każdym pushu do gałęzi `main` lub ręcznie z poziomu GitHub.

### Przykładowy workflow (`plemiona-bot-frontend/.github/workflows/deploy.yml`):

```yaml
name: Deploy Plemiona Bot Frontend to Raspberry Pi

on:
  push:
    branches:
      - main
  workflow_dispatch:

jobs:
  deploy:
    runs-on: self-hosted

    steps:
      - name: Check out code
        uses: actions/checkout@v3

      - name: Generate .env file
        run: |
          echo "FRONTEND_IMAGE=${{ vars.FRONTEND_IMAGE }}" >> .env
          echo "VITE_PORT=${{ vars.VITE_PORT }}" >> .env
          echo "VITE_CLERK_PUBLISHABLE_KEY=${{ secrets.VITE_CLERK_PUBLISHABLE_KEY }}" >> .env
          echo "VITE_BACKEND_PLEMIONA=${{ vars.VITE_BACKEND_PLEMIONA }}" >> .env

      - name: Show generated .env (without secrets)
        run: |
          echo "Generated .env file:"
          grep -v "VITE_CLERK_PUBLISHABLE_KEY" .env || true

      - name: Docker Compose
        run: |
          docker compose down
          docker compose pull
          docker compose up -d --build
```

### Co robi ten workflow?

1. **Pobiera kod z repozytorium**.
2. **Generuje plik `.env`** na podstawie zmiennych i sekretów ustawionych w repozytorium GitHub.
3. **Wyświetla zawartość pliku `.env`** (bez wrażliwych danych).
4. **Uruchamia Docker Compose** – zatrzymuje stare kontenery, pobiera najnowsze obrazy i uruchamia aplikację w tle.

---

## 3. Wymagania

- Raspberry Pi z zainstalowanym Dockerem i Docker Compose.
- Zarejestrowany i uruchomiony self-hosted runner.
- Skonfigurowane zmienne (`vars`) i sekrety (`secrets`) w repozytorium GitHub.

---

## 4. Podsumowanie kroków

- Zarejestruj self-hosted runnera w repozytorium na GitHub.
- Skonfiguruj runnera na Raspberry Pi według instrukcji GitHub.
- Zainstaluj i uruchom runnera jako usługę (`svc.sh`), aby działał w tle i po restarcie.
- Skonfiguruj workflow (`deploy.yml`) oraz wymagane zmienne i sekrety w repozytorium.
- Od teraz każda zmiana na branchu `main` automatycznie wdroży frontend na Raspberry Pi.

---

W razie pytań lub problemów, sprawdź logi workflow w zakładce **Actions** w repozytorium GitHub. 
# Plemiona Bot Frontend - Docker Setup

## Wymagania
- Docker
- Docker Compose
- Plik `.env` z konfiguracją

## Struktura plików
```
.
├── Dockerfile              # Główny kontener z aplikacją Vue.js
├── docker-compose.yml      # Orkiestracja serwisów
├── .env                    # Zmienne środowiskowe
└── .dockerignore          # Pliki wykluczane z buildu
```

## Konfiguracja (.env)
```bash
VITE_CLERK_PUBLISHABLE_KEY=pk_test_...
VITE_PORT=7060
FRONTEND_IMAGE=node:20.11.1-alpine
VITE_BACKEND_PLEMIONA=https://bot-plemiona-api.wojciechfalkowski.pl
```

## Uruchomienie

### Lokalne uruchomienie z docker-compose
```bash
docker-compose up --build
```

### Uruchomienie w tle
```bash
docker-compose up -d --build
```

### Zatrzymanie
```bash
docker-compose down
```

## Porty
- **5555** - Aplikacja Vue.js (VITE_PORT)

## Dostęp
- Frontend: http://localhost:5555

## Debugowanie

### Logi aplikacji
```bash
docker-compose logs frontend
```



### Wejście do kontenera
```bash
docker-compose exec frontend sh
```

## Rebuilding
```bash
docker-compose build --no-cache
docker-compose up
``` 
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
PORT=5555
FRONTEND_IMAGE=node:20.11.1-alpine
BACKEND_BASE_URL=https://bot-plemiona-api.wojciechfalkowski.pl
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
- **5555** - Aplikacja Vue.js
- **80** - Nginx (HTTP)
- **443** - Nginx (HTTPS, wymaga dodatkowej konfiguracji SSL)

## Dostęp
- Frontend: http://localhost (przez nginx)
- Bezpośrednio: http://localhost:5555

## Debugowanie

### Logi aplikacji
```bash
docker-compose logs app
```

### Logi nginx
```bash
docker-compose logs nginx
```

### Wejście do kontenera
```bash
docker-compose exec app sh
```

## Rebuilding
```bash
docker-compose build --no-cache
docker-compose up
``` 
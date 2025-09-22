# Użyj oficjalnego obrazu Node.js z ARG
ARG FRONTEND_IMAGE
FROM ${FRONTEND_IMAGE}

# Ustaw katalog roboczy
WORKDIR /app

# Skopiuj pliki package.json i package-lock.json
COPY package*.json ./

# Zainstaluj wszystkie zależności (potrzebne do build)
RUN npm install

# Skopiuj resztę kodu projektu
COPY . .

# Zbuduj aplikację dla produkcji
RUN npm run build

# Zmień nazwę pliku service workera, aby naprawić błąd z rozszerzeniem .mjs
RUN mv dist/firebase-messaging-sw.mjs dist/firebase-messaging-sw.js

# Użyj serwera "serve" do uruchamiania aplikacji
RUN npm install -g serve

# Expose dynamiczny port
EXPOSE ${VITE_PORT}

# Uruchom aplikację z dynamicznym portem
CMD ["sh", "-c", "serve -s dist -l ${VITE_PORT}"]
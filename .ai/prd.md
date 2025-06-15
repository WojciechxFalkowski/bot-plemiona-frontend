# PRD – Plemiona Bot Frontend

## Cel projektu

Stworzenie prostego panelu webowego do zarządzania automatyzacją wiosek w grze Plemiona, dostępnego tylko dla zalogowanych użytkowników.

## Główne funkcjonalności

### 1. Ekran logowania
- Integracja z Clerk (lub innym providerem) – obsługa logowania, rejestracji, SSO.
- Przekierowanie na dashboard po zalogowaniu.

### 2. Dashboard (strona główna po zalogowaniu)
- Lista wiosek użytkownika (nazwa, koordynaty, status automatyzacji).
- Przełączniki do włączania/wyłączania automatycznego scavengingu i budowy.
- Przycisk do ręcznego odświeżania danych wiosek.
- Informacje o dacie ostatniej synchronizacji.

### 3. Ochrona stron
- Wszystkie strony poza logowaniem chronione wrapperem `ProtectedLayout`.
- Automatyczne przekierowanie niezalogowanych na ekran logowania.

### 4. Powiadomienia
- Snackbar z informacjami o sukcesie/błędach (np. po zmianie statusu automatyzacji).

### 5. Responsywność i prostota
- Prosty, czytelny layout (dashboard, header z logo i przyciskiem użytkownika).
- Brak rozbudowanych podstron – całość w jednym panelu.

## Wymagania techniczne

- Vue 3, TypeScript, Vite
- Pinia (store), Vue Router
- Clerk Vue (autoryzacja)
- Komponenty własne: ProtectedLayout, VillagesList, Logo
- Integracja z backendem przez REST API

## Użytkownicy

- Tylko zalogowani użytkownicy mają dostęp do dashboardu i funkcji zarządzania

## Przypadki użycia

- Użytkownik loguje się i widzi listę swoich wiosek
- Użytkownik włącza/wyłącza automatyzację dla wybranej wioski
- Użytkownik ręcznie odświeża dane wiosek
- Użytkownik zostaje automatycznie wylogowany po utracie sesji 
# ProtectedLayout - Komponent wrapper dla stron chronionych

## Opis

`ProtectedLayout` to komponent wrapper, który chroni strony przed nieautoryzowanym dostępem. Automatycznie zarządza stanem ładowania, sprawdza autoryzację użytkownika i przekierowuje na stronę logowania jeśli jest to potrzebne.

## Funkcjonalności

- **Stan ładowania**: Wyświetla spinner podczas ładowania danych autoryzacji
- **Sprawdzanie autoryzacji**: Automatycznie sprawdza czy użytkownik jest zalogowany
- **Przekierowanie**: Automatycznie przekierowuje na `/sign-in` jeśli użytkownik nie jest zalogowany
- **Zapisywanie ścieżki**: Zapisuje aktualną ścieżkę w query parametrze `redirect` podczas przekierowania
- **Integracja z Clerk**: Współpracuje z istniejącym systemem autoryzacji Clerk
- **Reactive**: Reaguje na zmiany stanu autoryzacji w czasie rzeczywistym

## Sposób użycia

### Podstawowe użycie

```vue
<template>
  <ProtectedLayout>
    <div class="your-protected-content">
      <h1>Ta strona jest chroniona logowaniem</h1>
      <p>Ten content będzie widoczny tylko dla zalogowanych użytkowników</p>
    </div>
  </ProtectedLayout>
</template>

<script setup lang="ts">
import ProtectedLayout from '@/components/ProtectedLayout.vue'
</script>
```

### Przykład z Dashboard

```vue
<template>
  <ProtectedLayout>
    <div class="dashboard">
      <header>
        <h1>Panel użytkownika</h1>
      </header>
      <main>
        <!-- Twoja zawartość dashboardu -->
      </main>
    </div>
  </ProtectedLayout>
</template>
```

## Stany komponentu

### 1. Stan ładowania
- Wyświetlany podczas inicjalizacji Clerk
- Wyświetlany podczas pobierania profilu użytkownika
- Pokazuje spinner z tekstem "Ładowanie..."

### 2. Stan nieautoryzowany
- Krótko wyświetlany tekst "Przekierowywanie do logowania..."
- Automatyczne przekierowanie na `/sign-in`

### 3. Stan autoryzowany
- Wyświetlana zawartość przekazana przez slot
- Użytkownik ma pełny dostęp do strony

## Integracja z routerem

Komponent automatycznie:
- Zapisuje aktualną ścieżkę przed przekierowaniem
- Przekierowuje na stronę logowania z query parametrem `redirect`
- Po zalogowaniu użytkownik może być przekierowany z powrotem na pierwotną stronę

## Zależności

- Vue 3 Composition API
- Vue Router
- Clerk Vue
- Pinia store (`useAuthStore`)

## Konfiguracja

Upewnij się, że masz poprawnie skonfigurowane:

1. **Router** - ścieżka `sign-in` musi istnieć
2. **Auth Store** - store musi implementować metody `isAuthenticated`, `currentUser`, `initialize`
3. **Clerk** - musi być poprawnie zainicjalizowany

## Przykłady dodatkowych stron chronionych

### Strona profilu
```vue
<template>
  <ProtectedLayout>
    <UserProfile />
  </ProtectedLayout>
</template>
```

### Strona ustawień
```vue
<template>
  <ProtectedLayout>
    <div class="settings">
      <h2>Ustawienia</h2>
      <!-- settings content -->
    </div>
  </ProtectedLayout>
</template>
```

## Customization

Jeśli chcesz dostosować wygląd stanów ładowania lub błędów, możesz:

1. Zmodyfikować style w sekcji `<style scoped>`
2. Zmienić teksty wyświetlane użytkownikowi
3. Dodać dodatkowe stany (np. błędy sieciowe)

## Uwagi

- Komponent automatycznie obsługuje wszystkie aspekty autoryzacji
- Nie musisz dodatkowo sprawdzać autoryzacji w komponentach potomnych
- Slot zostanie renderowany tylko gdy użytkownik jest w pełni autoryzowany
- Komponent jest reactive i automatycznie reaguje na zmiany stanu autoryzacji 
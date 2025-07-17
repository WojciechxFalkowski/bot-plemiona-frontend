# NavigationTabs Component

Konfigurowalny komponent tabów nawigacyjnych używający biblioteki `@nuxt/ui` z obsługą routingu Vue Router.

## Funkcje

- ✅ Łatwa konfiguracja przez obiekty TypeScript
- ✅ Automatyczny routing z Vue Router
- ✅ Podświetlanie aktywnego tabu
- ✅ Obsługa ikon z Lucide Icons
- ✅ Różne warianty stylowania (pill, link)
- ✅ Responsywny design
- ✅ Pełna integracja z @nuxt/ui

## Podstawowe użycie

```vue
<template>
  <NavigationTabs :config="myTabsConfig" />
</template>

<script setup lang="ts">
import NavigationTabs from '@/components/NavigationTabs.vue'
import { myTabsConfig } from '@/config/navigationTabs'
</script>
```

## Konfiguracja

### Definicja TabConfig

```typescript
interface TabConfig {
  label: string        // Tekst wyświetlany na tabie
  path: string         // Ścieżka routingu
  icon?: string        // Ikona (opcjonalna, format: 'i-lucide-home')
  disabled?: boolean   // Czy tab jest wyłączony
  description?: string // Opis do tooltipa
}
```

### Definicja NavigationTabsConfig

```typescript
interface NavigationTabsConfig {
  tabs: TabConfig[]                     // Lista tabów
  variant?: 'pill' | 'link'            // Styl tabów
  color?: 'primary' | 'secondary' | ... // Kolor
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' // Rozmiar
  orientation?: 'horizontal' | 'vertical' // Orientacja
}
```

## Przykłady konfiguracji

### Podstawowe taby

```typescript
export const basicTabsConfig: NavigationTabsConfig = {
  tabs: [
    {
      label: 'Home',
      path: '/dashboard',
      icon: 'i-lucide-home'
    },
    {
      label: 'Settings', 
      path: '/settings',
      icon: 'i-lucide-settings'
    }
  ],
  variant: 'pill',
  color: 'primary'
}
```

### Taby z opisami

```typescript
export const detailedTabsConfig: NavigationTabsConfig = {
  tabs: [
    {
      label: 'Wioski',
      path: '/villages',
      icon: 'i-lucide-map-pin',
      description: 'Zarządzanie wioskami'
    },
    {
      label: 'Raporty',
      path: '/reports', 
      icon: 'i-lucide-bar-chart-3',
      description: 'Statystyki i raporty'
    }
  ],
  variant: 'link',
  color: 'neutral',
  size: 'sm'
}
```

### Taby z wyłączonymi opcjami

```typescript
export const tabsWithDisabled: NavigationTabsConfig = {
  tabs: [
    {
      label: 'Dostępne',
      path: '/available',
      icon: 'i-lucide-check'
    },
    {
      label: 'Niedostępne',
      path: '/unavailable',
      icon: 'i-lucide-x',
      disabled: true
    }
  ]
}
```

## Integracja z routingiem

Komponent automatycznie:

1. **Wykrywa aktywny tab** na podstawie obecnej ścieżki URL
2. **Przekierowuje** do nowej ścieżki po kliknięciu tabu  
3. **Podświetla** aktywny tab

### Wymagane route'y

Upewnij się, że route'y w `router/index.ts` są skonfigurowane:

```typescript
const router = createRouter({
  routes: [
    {
      path: '/dashboard',
      name: 'dashboard', 
      component: DashboardView
    },
    {
      path: '/villages',
      name: 'villages',
      component: VillagesView  
    }
    // ... inne route'y
  ]
})
```

## Stylowanie

### Dostępne warianty

- **pill**: Taby w formie pigułek (domyślne)
- **link**: Taby jako linki z podkreśleniem

### Dostępne kolory

- primary, secondary, success, info, warning, error, neutral

### Dostępne rozmiary

- xs, sm, md (domyślne), lg, xl

### Orientacja

- horizontal (domyślne)
- vertical

## Przykłady użycia

### W widoku głównym

```vue
<template>
  <div class="main-view">
    <h1>Panel Administracyjny</h1>
    <NavigationTabs :config="dashboardTabsConfig" />
    <router-view />
  </div>
</template>
```

### Z zagnieżdżonymi tabami

```vue
<template>
  <div class="settings-view">
    <!-- Główne taby -->
    <NavigationTabs :config="mainTabsConfig" />
    
    <!-- Podmenu -->
    <NavigationTabs :config="settingsSubTabsConfig" />
    
    <!-- Zawartość -->
    <router-view />
  </div>
</template>
```

## Najlepsze praktyki

1. **Grupuj taby logicznie** - używaj osobnych konfiguracji dla różnych sekcji
2. **Używaj konsekwentnych ikon** - korzystaj z Lucide Icons
3. **Definiuj route'y w advance** - upewnij się, że wszystkie ścieżki istnieją
4. **Testuj routing** - sprawdź czy aktywne taby są poprawnie podświetlane
5. **Używaj opisów** - dodawaj descriptions dla lepszej dostępności

## Pliki konfiguracyjne

Przygotowane konfiguracje znajdują się w:
- `src/config/navigationTabs.ts` - główne konfiguracje
- `src/types/navigation.ts` - definicje TypeScript

## Komponenty powiązane

- `NavigationTabs.vue` - główny komponent
- `UTabs` z `@nuxt/ui` - bazowy komponent tabów 
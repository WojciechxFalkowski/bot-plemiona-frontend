import type { NavigationTabsConfig, DrawerMenuConfig } from '@/types/navigation'

export const dashboardTabsConfig: NavigationTabsConfig = {
  tabs: [
    {
      label: 'Dashboard',
      path: '/dashboard',
      icon: 'i-lucide-home',
      description: 'Główny panel administracyjny'
    },
    {
      label: 'Wioski',
      path: '/villages',
      icon: 'i-lucide-map-pin',
      description: 'Zarządzanie wioskami'
    },
    {
      label: 'Wioski barbarzynskie',
      path: '/barbarian-villages',
      icon: 'i-lucide-skull',
      description: 'Zarządzanie wioskami barbarzynskimi'
    },
    {
      label: 'Kolejka',
      path: '/queue',
      icon: 'i-lucide-list-ordered',
      description: 'Kolejka budowania we wszystkich wioskach'
    },
    {
      label: 'Kolejka v2',
      path: '/queue-v2',
      icon: 'i-lucide-plus-square',
      description: 'Dodaj budynek do kolejki'
    },
    {
      label: 'Ustawienia',
      path: '/settings',
      icon: 'i-lucide-settings',
      description: 'Konfiguracja systemu'
    },
    {
      label: 'Raporty',
      path: '/reports',
      icon: 'i-lucide-bar-chart-3',
      description: 'Statystyki i raporty'
    }
  ],
  variant: 'pill',
  color: 'primary',
  size: 'md',
  orientation: 'horizontal'
}

export const settingsTabsConfig: NavigationTabsConfig = {
  tabs: [
    {
      label: 'Profil',
      path: '/settings/profile',
      icon: 'i-lucide-user',
      description: 'Ustawienia profilu użytkownika'
    },
    {
      label: 'Bezpieczeństwo',
      path: '/settings/security',
      icon: 'i-lucide-shield',
      description: 'Ustawienia bezpieczeństwa'
    },
    {
      label: 'Powiadomienia',
      path: '/settings/notifications',
      icon: 'i-lucide-bell',
      description: 'Zarządzanie powiadomieniami'
    }
  ],
  variant: 'link',
  color: 'neutral',
  size: 'sm',
  orientation: 'horizontal'
}

export const reportsTabsConfig: NavigationTabsConfig = {
  tabs: [
    {
      label: 'Przegląd',
      path: '/reports/overview',
      icon: 'i-lucide-eye',
      description: 'Ogólny przegląd statystyk'
    },
    {
      label: 'Ataki',
      path: '/reports/attacks',
      icon: 'i-lucide-sword',
      description: 'Raporty z ataków'
    },
    {
      label: 'Zasoby',
      path: '/reports/resources',
      icon: 'i-lucide-coins',
      description: 'Statystyki zasobów'
    },
    {
      label: 'Budowa',
      path: '/reports/construction',
      icon: 'i-lucide-hammer',
      description: 'Raporty budowy'
    }
  ],
  variant: 'pill',
  color: 'info',
  size: 'md',
  orientation: 'horizontal'
}

// Drawer menu configuration
export const drawerMenuConfig: DrawerMenuConfig = {
  items: [
    {
      label: 'Dashboard',
      path: '/dashboard',
      icon: 'i-lucide-home',
      description: 'Główny panel administracyjny'
    },
    {
      label: 'Wioski',
      path: '/villages',
      icon: 'i-lucide-map-pin',
      description: 'Zarządzanie wioskami'
    },
    {
      label: 'Wioski barbarzynskie',
      path: '/barbarian-villages',
      icon: 'i-lucide-skull',
      description: 'Zarządzanie wioskami barbarzynskimi'
    },
    {
      label: 'Kolejka',
      path: '/queue',
      icon: 'i-lucide-list-ordered',
      description: 'Kolejka budowania we wszystkich wioskach'
    },
    {
      label: 'Kolejka v2',
      path: '/queue-v2',
      icon: 'i-lucide-plus-square',
      description: 'Dodaj budynek do kolejki'
    },
    {
      label: 'Ustawienia',
      path: '/settings',
      icon: 'i-lucide-settings',
      description: 'Konfiguracja systemu',
      children: [
        {
          label: 'Profil',
          path: '/settings/profile',
          icon: 'i-lucide-user',
          description: 'Ustawienia profilu użytkownika'
        },
        {
          label: 'Bezpieczeństwo',
          path: '/settings/security',
          icon: 'i-lucide-shield',
          description: 'Ustawienia bezpieczeństwa'
        },
        {
          label: 'Powiadomienia',
          path: '/settings/notifications',
          icon: 'i-lucide-bell',
          description: 'Zarządzanie powiadomieniami'
        }
      ]
    },
    {
      label: 'Raporty',
      path: '/reports',
      icon: 'i-lucide-bar-chart-3',
      description: 'Statystyki i raporty',
      children: [
        {
          label: 'Przegląd',
          path: '/reports/overview',
          icon: 'i-lucide-eye',
          description: 'Ogólny przegląd statystyk'
        },
        {
          label: 'Ataki',
          path: '/reports/attacks',
          icon: 'i-lucide-sword',
          description: 'Raporty z ataków'
        },
        {
          label: 'Zasoby',
          path: '/reports/resources',
          icon: 'i-lucide-coins',
          description: 'Statystyki zasobów'
        },
        {
          label: 'Budowa',
          path: '/reports/construction',
          icon: 'i-lucide-hammer',
          description: 'Raporty budowy'
        }
      ]
    }
  ]
}

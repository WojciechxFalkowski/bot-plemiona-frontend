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
      label: 'Ustawienia',
      path: '/settings',
      icon: 'i-lucide-settings',
      description: 'Konfiguracja systemu',
      children: [
        {
          label: 'Orchestrator',
          path: '/settings/orchestrator',
          icon: 'i-lucide-settings',
          description: 'Orchestrator'
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

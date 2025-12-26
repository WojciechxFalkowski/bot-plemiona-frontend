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
      label: 'Wioski graczy',
      path: '/player-villages',
      icon: 'i-lucide-users',
      description: 'Zarządzanie wioskami graczy'
    },
    {
      label: 'Rekrutacja wojska',
      path: '/army-training-strategies',
      icon: 'i-lucide-dumbbell',
      description: 'Strategie rekrutacji wojska'
    },
    {
      label: 'Kolejka',
      path: '/queue',
      icon: 'i-lucide-list-ordered',
      description: 'Kolejka budowania we wszystkich wioskach'
    },
    {
      label: 'Orchestrator',
      path: '/orchestrator-control',
      icon: 'i-lucide-activity',
      description: 'Sterowanie orchestratora dla wybranego serwera'
    },
    {
      label: 'Limity zbieractwa',
      path: '/scavenging-limits',
      icon: 'i-lucide-target',
      description: 'Zarządzanie limitami pikinierów dla zbieractwa'
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

export const armyTabsConfig: NavigationTabsConfig = {
  tabs: [
    {
      label: 'Przegląd',
      path: '/army/overview',
      icon: 'i-lucide-shield',
      description: 'Przegląd stanów wojskowych we wszystkich wioskach'
    }
  ],
  variant: 'pill',
  color: 'primary',
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
      label: 'Zaplanowane ataki',
      path: '/scheduled-attacks',
      icon: 'i-lucide-calendar-clock',
      description: 'Zarządzanie harmonogramami ataków'
    },
    {
      label: 'Plądrowanie wiosek',
      path: '/barbarian-villages',
      icon: 'i-lucide-sword',
      description: 'Zarządzanie atakami na wioski',
      children: [
        {
          label: 'Wioski barbarzynskie',
          path: '/barbarian-villages',
          icon: 'i-lucide-skull',
          description: 'Zarządzanie wioskami barbarzynskimi'
        },
        {
          label: 'Wioski graczy',
          path: '/player-villages',
          icon: 'i-lucide-users',
          description: 'Zarządzanie wioskami graczy'
        }
      ]
    },
    {
      label: 'Rekrutacja wojska',
      path: '/army-training-strategies',
      icon: 'i-lucide-dumbbell',
      description: 'Strategie rekrutacji wojska',
      children: [
        {
          label: 'Strategie rekrutacji',
          path: '/army-training-strategies',
          icon: 'i-lucide-dumbbell',
          description: 'Strategie rekrutacji wojska'
        }
      ]
    },
    {
      label: 'Kolejka',
      path: '/queue',
      icon: 'i-lucide-list-ordered',
      description: 'Kolejka budowania we wszystkich wioskach',
      children: [
        {
          label: 'Kolejka budowania',
          path: '/queue',
          icon: 'i-lucide-list-ordered',
          description: 'Kolejka budowania we wszystkich wioskach'
        },
        {
          label: 'Stany budynków',
          path: '/queue/building-states',
          icon: 'i-lucide-building',
          description: 'Wyświetl i zarządzaj stanami budynków w wioskach'
        }
      ]
    },
    {
      label: 'Zbieractwo',
      path: '/scavenging-limits',
      icon: 'i-lucide-package',
      description: 'Zarządzanie zbieractwem',
      children: [
        {
          label: 'Limity zbieractwa',
          path: '/scavenging-limits',
          icon: 'i-lucide-target',
          description: 'Zarządzanie limitami pikinierów dla zbieractwa'
        },
        {
          label: 'Konfiguracja jednostek zbieractwa',
          path: '/village-units-config',
          icon: 'i-lucide-list-checks',
          description: 'Zarządzanie konfiguracją jednostek zbieractwa'
        }
      ]
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
        },
        {
          label: 'Powiadomienia',
          path: '/settings/notifications',
          icon: 'i-lucide-bell',
          description: 'Ustawienia powiadomień'
        },
        {
          label: 'Logi wykonania',
          path: '/settings/execution-logs',
          icon: 'i-lucide-file-text',
          description: 'Historia wykonania operacji crawlera'
        }
      ]
    },
    {
      label: 'Wojsko',
      path: '/army',
      icon: 'i-lucide-shield',
      description: 'Zarządzanie wojskiem',
      children: [
        {
          label: 'Przegląd',
          path: '/army/overview',
          icon: 'i-lucide-shield',
          description: 'Przegląd stanów wojskowych we wszystkich wioskach'
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

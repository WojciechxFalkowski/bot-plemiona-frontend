import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
    },
    {
      path: '/about',
      name: 'about',
      component: () => import('../views/AboutView.vue'),
    },
    {
      path: '/sign-in',
      name: 'sign-in',
      component: () => import('../views/LoginView.vue'),
      meta: { requiresGuest: true }
    },
    {
      path: '/sign-in/sso-callback',
      name: 'sso-callback',
      component: () => import('../components/auth/SSOCallback.vue'),
    },
    {
      path: '/dashboard',
      name: 'dashboard',
      component: () => import('../views/DashboardView.vue'),
      meta: { requiresAuth: true, layout: 'app' }
    },
    // Villages routes
    {
      path: '/villages',
      name: 'villages',
      component: () => import('../views/VillagesView.vue'),
      meta: { requiresAuth: true, layout: 'app' }
    },
    // Barbarian Villages routes
    {
      path: '/barbarian-villages',
      name: 'barbarian-villages',
      component: () => import('../views/BarbarianVillagesView.vue'),
      meta: { requiresAuth: true, layout: 'app' }
    },
    // Player Villages routes
    {
      path: '/player-villages',
      name: 'player-villages',
      component: () => import('../views/PlayerVillagesView.vue'),
      meta: { requiresAuth: true, layout: 'app' }
    },
    {
      path: '/player-villages/strategies',
      name: 'attack-strategies',
      component: () => import('../views/AttackStrategiesView.vue'),
      meta: { requiresAuth: true, layout: 'app' }
    },
    // Queue routes
    {
      path: '/army-training-strategies',
      name: 'army-training-strategies',
      component: () => import('../views/ArmyTrainingStrategiesView.vue'),
      meta: { requiresAuth: true, layout: 'app' }
    },
    {
      path: '/queue',
      name: 'queue',
      component: () => import('../views/QueueView.vue'),
      meta: { requiresAuth: true, layout: 'app' }
    },
    // Scavenging Limits routes
    {
      path: '/scavenging-limits',
      name: 'scavenging-limits',
      component: () => import('../views/ScavengingLimitsView.vue'),
      meta: { requiresAuth: true, layout: 'app' }
    },
    // Settings routes
    {
      path: '/settings',
      name: 'settings',
      component: () => import('../views/settings/SettingsView.vue'),
      meta: { requiresAuth: true, layout: 'app' },
      children: [
        {
          path: 'orchestrator',
          name: 'settings-orchestrator',
          component: () => import('../views/settings/OrchestratorView.vue'),
          meta: { requiresAuth: true, layout: 'app' }
        },
        {
          path: 'notifications',
          name: 'settings-notifications',
          component: () => import('../views/settings/NotificationSettingsView.vue'),
          meta: { requiresAuth: true, layout: 'app' }
        }
      ]
    },
    // Reports routes (nested)
    {
      path: '/reports',
      name: 'reports',
      component: () => import('../views/ReportsView.vue'),
      meta: { requiresAuth: true, layout: 'app' },
      children: [
        {
          path: '',
          redirect: '/reports/overview'
        },
        {
          path: 'overview',
          name: 'reports-overview',
          component: () => import('../views/reports/OverviewView.vue'),
          meta: { requiresAuth: true, layout: 'app' }
        },
        {
          path: 'attacks',
          name: 'reports-attacks',
          component: () => import('../views/reports/AttacksView.vue'),
          meta: { requiresAuth: true, layout: 'app' }
        },
        {
          path: 'resources',
          name: 'reports-resources',
          component: () => import('../views/reports/ResourcesView.vue'),
          meta: { requiresAuth: true, layout: 'app' }
        },
        {
          path: 'construction',
          name: 'reports-construction',
          component: () => import('../views/reports/ConstructionView.vue'),
          meta: { requiresAuth: true, layout: 'app' }
        }
      ]
    },
    // Servers management route
    {
      path: '/servers/management',
      name: 'servers-management',
      component: () => import('../views/servers/ServersManagementView.vue'),
      meta: { requiresAuth: true, layout: 'app' }
    },
  ],
})

// Navigation guards są teraz obsługiwane przez ProtectedLayout komponent
// Można je włączyć ponownie jeśli potrzebne, ale nie powinny kolidować
// z logiką ProtectedLayout

export default router

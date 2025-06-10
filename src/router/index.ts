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
      meta: { requiresAuth: true }
    },
  ],
})

// Navigation guards są teraz obsługiwane przez ProtectedLayout komponent
// Można je włączyć ponownie jeśli potrzebne, ale nie powinny kolidować
// z logiką ProtectedLayout

export default router

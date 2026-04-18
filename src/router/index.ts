import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: () => import('@/views/HomeView.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/games',
      name: 'games',
      component: () => import('@/views/GamesView.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/games/tic-tac-toe',
      name: 'tic-tac-toe',
      component: () => import('@/views/TicTacToeView.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/games/maze',
      name: 'maze',
      component: () => import('@/views/MazeView.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/dessin',
      name: 'drawing',
      component: () => import('@/views/DrawingView.vue'),
      meta: { fullWidth: true, requiresAuth: true },
    },
    {
      path: '/login',
      name: 'login',
      component: () => import('@/views/auth/LoginView.vue'),
      meta: { guestOnly: true },
    },
    {
      path: '/register',
      name: 'register',
      component: () => import('@/views/auth/RegisterView.vue'),
      meta: { guestOnly: true },
    },
    {
      path: '/forgot-password',
      name: 'forgot-password',
      component: () => import('@/views/auth/ForgotPasswordView.vue'),
      meta: { guestOnly: true },
    },
    {
      path: '/reset-password',
      name: 'reset-password',
      component: () => import('@/views/auth/ResetPasswordView.vue'),
    },
    {
      path: '/cgu',
      name: 'cgu',
      component: () => import('@/views/auth/CguView.vue'),
    },
    {
      path: '/welcome',
      name: 'welcome',
      component: () => import('@/views/WelcomeView.vue'),
    },
  ],
})

router.beforeEach(async (to) => {
  const auth = useAuthStore()
  if (!auth.initialized) {
    await auth.fetchMe()
  }
  if (to.meta.requiresAuth && !auth.isAuthenticated) {
    return { name: 'welcome', query: { redirect: to.fullPath } }
  }
  if (to.meta.guestOnly && auth.isAuthenticated) {
    return { name: 'home' }
  }
  return true
})

export default router

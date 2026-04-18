import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: () => import('@/views/HomeView.vue'),
    },
    {
      path: '/games',
      name: 'games',
      component: () => import('@/views/GamesView.vue'),
    },
    {
      path: '/games/tic-tac-toe',
      name: 'tic-tac-toe',
      component: () => import('@/views/TicTacToeView.vue'),
    },
    {
      path: '/dessin',
      name: 'drawing',
      component: () => import('@/views/DrawingView.vue'),
      meta: { fullWidth: true },
    },
  ],
})

export default router

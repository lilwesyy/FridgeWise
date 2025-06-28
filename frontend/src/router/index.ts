import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '@/views/HomeView.vue'
import LoginView from '@/views/LoginView.vue'
import IngredientsView from '@/views/IngredientsView.vue'
import RecipesView from '@/views/RecipesView.vue'
import { useAuthStore } from '@/stores/auth'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView
    },
    {
      path: '/login',
      name: 'login',
      component: LoginView
    },
    {
      path: '/register',
      name: 'register',
      component: () => import('@/views/RegisterView.vue')
    },
    {
      path: '/ingredients',
      name: 'ingredients',
      component: IngredientsView,
      meta: { requiresAuth: true }
    },
    {
      path: '/recipes',
      name: 'recipes',
      component: RecipesView,
      meta: { requiresAuth: true }
    },
    {
      path: '/premium',
      name: 'premium',
      component: () => import('@/views/PremiumView.vue')
    },
    {
      path: '/account',
      name: 'account',
      component: () => import('@/views/AccountView.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/:pathMatch(.*)*',
      name: 'notfound',
      component: () => import('@/views/NotFoundView.vue')
    }
  ]
})

// Navigation guard for protected routes
router.beforeEach((to, from, next) => {
  const authStore = useAuthStore()
  
  if (to.meta.requiresAuth && !authStore.user) {
    next('/login')
  } else {
    next()
  }
})

export default router

<template>
  <div id="app">
    <!-- Modern Navbar with Purple/Pink Gradient Theme -->
    <nav v-if="showNavbar" class="fixed top-0 left-0 w-full z-30 bg-transparent text-white shadow-none backdrop-blur-md transition-all duration-300">
      <div class="container mx-auto px-4 sm:px-6 py-3 sm:py-4">
        <div class="flex justify-between items-center">
          <!-- Logo & Hamburger always visible, but color logic adjusted -->
          <RouterLink
            :to="isAuthenticated ? '/ingredients' : '/'"
            class="flex items-center space-x-2 hover:scale-105 transition-transform duration-200"
            style="background:transparent !important; box-shadow:none !important;"
          >
            <span :class="['text-xl sm:text-2xl font-bold transition-colors duration-300', alwaysWhiteBrand ? 'text-white' : (isScrolledPastHeader ? 'text-black' : 'text-white')]" style="background:transparent !important; box-shadow:none !important;">
              {{ $t('navbar.brand', 'FridgeWise') }}
            </span>
          </RouterLink>

          <!-- Hamburger (mobile & tablet < 768px) -->
          <button @click="mobileMenuOpen = !mobileMenuOpen" class="lg:hidden focus:outline-none ml-2">
            <svg v-if="!mobileMenuOpen" class="w-7 h-7" :class="alwaysWhiteBrand ? 'text-white' : (isScrolledPastHeader ? 'text-black' : 'text-white')" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
            <svg v-else class="w-7 h-7" :class="alwaysWhiteBrand ? 'text-white' : (isScrolledPastHeader ? 'text-black' : 'text-white')" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          <!-- Navigation Links (desktop >= 768px) -->
          <div class="hidden lg:flex items-center space-x-6">
            <template v-if="isAuthenticated">
              <RouterLink 
                to="/ingredients" 
                class="px-3 py-2 rounded-lg hover:bg-white/10 transition-all duration-200 font-medium"
              >
                {{ $t('navbar.myIngredients') }}
              </RouterLink>
              <RouterLink 
                to="/recipes" 
                class="px-3 py-2 rounded-lg hover:bg-white/10 transition-all duration-200 font-medium"
              >
                {{ $t('navbar.recipes') }}
              </RouterLink>
              <RouterLink 
                to="/account" 
                class="px-3 py-2 rounded-lg hover:bg-white/10 transition-all duration-200 font-medium"
              >
                {{ $t('navbar.account') }}
              </RouterLink>
              <!-- User Menu -->
              <div class="flex items-center space-x-4 ml-4 pl-4 border-l border-white/20">
                <span class="text-sm text-purple-200 flex items-center gap-2">
                  {{ user?.name || user?.email }}
                  <span v-if="user?.isSupporter" class="inline-flex items-center px-2 py-0.5 rounded bg-yellow-300 text-slate-900 text-xs font-semibold ml-1">Supporter</span>
                </span>
                <button 
                  @click="logout" 
                  class="px-4 py-2 bg-gradient-to-r from-pink-600 to-purple-600 rounded-lg hover:from-pink-500 hover:to-purple-500 transition-all duration-200 font-medium shadow-lg"
                >
                  {{ $t('navbar.logout') }}
                </button>
              </div>
            </template>
            <template v-else>
              <RouterLink 
                to="/login" 
                class="px-6 py-2 bg-gradient-to-r from-pink-600 to-purple-600 rounded-lg hover:from-pink-500 hover:to-purple-500 transition-all duration-200 font-medium shadow-lg"
              >
                {{ $t('navbar.login') }}
              </RouterLink>
            </template>
            <!-- PayPal Donation (PRODUCTION) -->
            <a href="https://www.paypal.com/donate/?hosted_button_id=DU757WK9EXN3Q" target="_blank" rel="noopener" class="ml-6 px-4 py-2 rounded-lg bg-yellow-400 text-slate-900 font-semibold shadow hover:bg-yellow-300 transition-all duration-200">
              {{ $t('navbar.donate') }}
            </a>
            <!-- Language Switcher -->
            <div class="ml-2">
              <select v-model="$i18n.locale" class="bg-transparent text-sm border-none outline-none focus:ring-0 text-purple-300 hover:text-pink-400 cursor-pointer font-semibold">
                <option value="en" class="text-black">EN</option>
                <option value="it" class="text-black">IT</option>
                <option value="fr" class="text-black">FR</option>
                <option value="de" class="text-black">DE</option>
              </select>
            </div>
          </div>
        </div>
        <!-- Mobile Menu -->
        <transition name="fade">
          <div v-if="mobileMenuOpen" class="lg:hidden mt-3 bg-slate-900/95 rounded-xl shadow-lg p-4 flex flex-col gap-2 border border-white/10 animate-fade-up">
            <RouterLink 
              v-if="!isAuthenticated"
              to="/" 
              class="px-3 py-2 rounded-lg hover:bg-white/10 transition-all duration-200 font-medium"
              @click="mobileMenuOpen = false"
            >
              Home
            </RouterLink>
            <template v-if="isAuthenticated">
              <RouterLink 
                to="/ingredients" 
                class="px-3 py-2 rounded-lg hover:bg-white/10 transition-all duration-200 font-medium"
                @click="mobileMenuOpen = false"
              >
                {{ $t('navbar.myIngredients') }}
              </RouterLink>
              <RouterLink 
                to="/recipes" 
                class="px-3 py-2 rounded-lg hover:bg-white/10 transition-all duration-200 font-medium"
                @click="mobileMenuOpen = false"
              >
                {{ $t('navbar.recipes') }}
              </RouterLink>
              <RouterLink 
                to="/account" 
                class="px-3 py-2 rounded-lg hover:bg-white/10 transition-all duration-200 font-medium"
                @click="mobileMenuOpen = false"
              >
                {{ $t('navbar.account') }}
              </RouterLink>
              <div class="flex flex-col gap-2 mt-2 border-t border-white/10 pt-2">
                <span class="text-sm text-purple-200 flex items-center gap-2">
                  {{ user?.name || user?.email }}
                  <span v-if="user?.isSupporter" class="inline-flex items-center px-2 py-0.5 rounded bg-yellow-300 text-slate-900 text-xs font-semibold ml-1">Supporter</span>
                </span>
                <button 
                  @click="logout(); mobileMenuOpen = false" 
                  class="px-4 py-2 bg-gradient-to-r from-pink-600 to-purple-600 rounded-lg hover:from-pink-500 hover:to-purple-500 transition-all duration-200 font-medium shadow-lg"
                >
                  {{ $t('navbar.logout') }}
                </button>
              </div>
            </template>
            <template v-else>
              <RouterLink 
                to="/login" 
                class="px-6 py-2 bg-gradient-to-r from-pink-600 to-purple-600 rounded-lg hover:from-pink-500 hover:to-purple-500 transition-all duration-200 font-medium shadow-lg"
                @click="mobileMenuOpen = false"
              >
                {{ $t('navbar.login') }}
              </RouterLink>
            </template>
            <!-- PayPal Donation mobile (PRODUCTION) -->
            <a href="https://www.paypal.com/donate/?hosted_button_id=DU757WK9EXN3Q" target="_blank" rel="noopener" class="mt-4 px-4 py-2 rounded-lg bg-yellow-400 text-slate-900 font-semibold shadow hover:bg-yellow-300 transition-all duration-200 text-center">
              {{ $t('navbar.donate') }}
            </a>
          </div>
        </transition>
      </div>
    </nav>
    <!-- Main Content -->
    <main>
      <RouterView />
    </main>
    <!-- Notification Toasts -->
    <div class="toast-stack-container">
      <NotificationToast
        v-for="n in notifications"
        :key="n.id"
        :message="n.message"
        :type="n.type"
        :show="true"
        :duration="n.duration"
        @close="removeNotification(n.id)"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { RouterLink, RouterView, useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { storeToRefs } from 'pinia'
import { onMounted, computed, watch, ref } from 'vue'
import { useRouter } from 'vue-router'
import NotificationToast from '@/components/NotificationToast.vue'
import { useNotifications } from '@/composables/useNotifications'

const authStore = useAuthStore()
const { user, isAuthenticated } = storeToRefs(authStore)
const route = useRoute()
const router = useRouter()
const { notifications, removeNotification } = useNotifications()

const mobileMenuOpen = ref(false)
const isScrolledPastHeader = ref(false)

const hideNavbarRoutes = ['/login', '/register']
const showNavbar = computed(() => {
  // Hide navbar on login, register, and 404 (catch-all) routes
  if (hideNavbarRoutes.includes(route.path)) return false
  // Hide on 404 (NotFoundView)
  if (route.name === 'notfound') return false
  return true
})

const alwaysWhiteBrand = computed(() => {
  const whiteRoutes = ['/ingredients', '/recipes', '/account']
  return whiteRoutes.includes(route.path)
})

const logout = () => {
  authStore.logout()
  router.push('/')
}

// Redirect authenticated users away from Home
watch(isAuthenticated, (val) => {
  if (val && route.path === '/') {
    router.replace('/ingredients')
  }
})

onMounted(() => {
  authStore.initAuth()
  if (isAuthenticated.value && route.path === '/') {
    router.replace('/ingredients')
  }
  const onScroll = () => {
    // Adjust 80vh if your header is a different height
    isScrolledPastHeader.value = window.scrollY > window.innerHeight * 0.8
  }
  window.addEventListener('scroll', onScroll)
  onScroll()
})
</script>

<style>
#app {
  min-height: 100vh;
  background: linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #581c87 100%);
}

.router-link-active {
  background: rgba(255, 255, 255, 0.15);
  border-radius: 0.5rem;
}

/* Custom scrollbar for modern look */
::-webkit-scrollbar {
  width: 8px;
}
::-webkit-scrollbar-track {
  background: rgba(15, 23, 42, 0.1);
}
::-webkit-scrollbar-thumb {
  background: linear-gradient(135deg, #a855f7, #ec4899);
  border-radius: 4px;
}
::-webkit-scrollbar-thumb:hover {
  background: linear-gradient(135deg, #9333ea, #db2777);
}
</style>

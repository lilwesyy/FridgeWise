<template>
  <div class="min-h-screen flex flex-col justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 px-2 sm:px-0">
    <div class="flex flex-col items-center justify-center min-h-screen">
      <div class="mb-2 mt-8 text-3xl font-bold text-white text-center select-none">
        FridgeWise
      </div>
      <div class="mb-8 text-center text-base text-purple-200 select-none">
        {{ $t('login.slogan') }}
      </div>
      <div v-if="loading" class="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
        <LoadingSpinner />
      </div>
      <div class="backdrop-blur-xl bg-white/10 border border-white/20 shadow-2xl rounded-3xl p-4 sm:p-8 w-full max-w-md mx-auto animate-fade-up" v-scroll-fade :aria-hidden="loading">
        <h2 class="text-3xl font-bold text-center mb-8 text-white">
          {{ $t('login.title') }}
        </h2>
        <form @submit.prevent="handleLogin" class="space-y-6">
          <div>
            <label for="email" class="block text-sm font-medium text-gray-200 mb-1">
              {{ $t('login.email') }}
            </label>
            <input
              id="email"
              v-model="credentials.email"
              type="email"
              required
              class="w-full px-4 py-3 rounded-xl bg-white/80 border-none focus:ring-2 focus:ring-purple-400 text-gray-900 placeholder-gray-400 shadow-sm"
              :placeholder="$t('login.emailPlaceholder')"
            />
          </div>
          <div>
            <label for="password" class="block text-sm font-medium text-gray-200 mb-1">
              {{ $t('login.password') }}
            </label>
            <input
              id="password"
              v-model="credentials.password"
              type="password"
              required
              class="w-full px-4 py-3 rounded-xl bg-white/80 border-none focus:ring-2 focus:ring-purple-400 text-gray-900 placeholder-gray-400 shadow-sm"
              :placeholder="$t('login.passwordPlaceholder')"
            />
          </div>
          <div v-if="error" class="text-red-500 text-sm text-center">
            {{ error }}
          </div>
          <button
            type="submit"
            :disabled="loading"
            class="w-full py-3 rounded-xl font-bold text-lg bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg hover:from-purple-700 hover:to-pink-700 transition-all duration-300 disabled:opacity-50"
          >
            <span v-if="loading">{{ $t('login.signingIn') }}</span>
            <span v-else>{{ $t('login.signIn') }}</span>
          </button>
        </form>
        <div class="mt-8 text-center">
          <p class="text-sm text-gray-300">
            {{ $t('login.noAccount') }}
            <RouterLink to="/register" class="text-pink-400 hover:text-pink-300 font-semibold underline underline-offset-2">
              {{ $t('login.signUp') }}
            </RouterLink>
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import LoadingSpinner from '@/components/LoadingSpinner.vue'
import { RouterLink, useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { storeToRefs } from 'pinia'

const router = useRouter()
const authStore = useAuthStore()
const { loading, error } = storeToRefs(authStore)

const credentials = ref({
  email: '',
  password: ''
})

const route = useRoute()

const handleLogin = async () => {
  try {
    await authStore.login(credentials.value)
    router.push('/ingredients')
  } catch (err) {
    // Error is handled by the store
  }
}

onMounted(() => {
  setTimeout(() => {
    loading.value = false
  }, 500)
})

watch(route, () => {
  window.scrollTo({ top: 0, left: 0, behavior: 'auto' })
})
</script>

<style scoped>
@keyframes fade-up {
  0% { opacity: 0; transform: translateY(40px); }
  100% { opacity: 1; transform: translateY(0); }
}
.animate-fade-up {
  animation: fade-up 1s cubic-bezier(0.22, 1, 0.36, 1);
}
.fade-enter-active, .fade-leave-active {
  transition: opacity 0.4s;
}
.fade-enter-from, .fade-leave-to {
  opacity: 0;
}
[v-scroll-fade] {
  opacity: 0;
  transition: opacity 0.8s, transform 0.8s;
  transform: translateY(40px);
}
[v-scroll-fade].is-visible {
  opacity: 1;
  transform: none;
}
.backdrop-blur-xl {
  backdrop-filter: blur(24px);
}
</style>

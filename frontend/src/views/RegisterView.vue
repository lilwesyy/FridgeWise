<template>
  <div class="min-h-screen flex flex-col justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 px-2 sm:px-0">
    <div class="flex flex-col items-center justify-center min-h-screen">
      <div class="mb-2 mt-8 text-3xl font-bold text-white text-center select-none">
        FridgeWise
      </div>
      <div class="mb-8 text-center text-base text-purple-200 select-none">
        {{ $t('register.slogan') }}
      </div>
      <div v-if="loading" class="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
        <LoadingSpinner />
      </div>
      <div class="backdrop-blur-xl bg-white/10 border border-white/20 shadow-2xl rounded-3xl p-4 sm:p-8 w-full max-w-md mx-auto animate-fade-up" v-scroll-fade :aria-hidden="loading">
        <h2 class="text-3xl font-bold text-center mb-8 text-white">
          {{ $t('register.title') }}
        </h2>
        <form @submit.prevent="handleRegister" class="space-y-6">
          <div>
            <label for="name" class="block text-sm font-medium text-gray-200 mb-1">
              {{ $t('register.fullName') }}
            </label>
            <input
              id="name"
              v-model="userData.name"
              type="text"
              required
              class="w-full px-4 py-3 rounded-xl bg-white/80 border-none focus:ring-2 focus:ring-purple-400 text-gray-900 placeholder-gray-400 shadow-sm"
              :placeholder="$t('register.fullNamePlaceholder')"
            />
          </div>
          <div>
            <label for="email" class="block text-sm font-medium text-gray-200 mb-1">
              {{ $t('register.email') }}
            </label>
            <input
              id="email"
              v-model="userData.email"
              type="email"
              required
              class="w-full px-4 py-3 rounded-xl bg-white/80 border-none focus:ring-2 focus:ring-purple-400 text-gray-900 placeholder-gray-400 shadow-sm"
              :placeholder="$t('register.emailPlaceholder')"
            />
          </div>
          <div>
            <label for="password" class="block text-sm font-medium text-gray-200 mb-1">
              {{ $t('register.password') }}
            </label>
            <input
              id="password"
              v-model="userData.password"
              type="password"
              required
              minlength="6"
              class="w-full px-4 py-3 rounded-xl bg-white/80 border-none focus:ring-2 focus:ring-purple-400 text-gray-900 placeholder-gray-400 shadow-sm"
              :placeholder="$t('register.passwordPlaceholder')"
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
            <span v-if="loading">{{ $t('register.creating') }}</span>
            <span v-else>{{ $t('register.create') }}</span>
          </button>
        </form>
        <div class="mt-8 text-center">
          <p class="text-sm text-gray-300">
            {{ $t('register.haveAccount') }}
            <RouterLink to="/login" class="text-pink-400 hover:text-pink-300 font-semibold underline underline-offset-2">
              {{ $t('register.signIn') }}
            </RouterLink>
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref, onMounted } from 'vue'
import { RouterLink, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { storeToRefs } from 'pinia'
import LoadingSpinner from '@/components/LoadingSpinner.vue'

const router = useRouter()
const authStore = useAuthStore()
const { loading, error } = storeToRefs(authStore)

const userData = reactive({
  email: '',
  password: '',
  name: ''
})

const handleRegister = async () => {
  try {
    await authStore.register(userData)
    router.push('/')
  } catch (err) {
    // Error is handled by the store
  }
}

onMounted(() => {
  setTimeout(() => {
    loading.value = false
  }, 500)
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

<template>
  <div class="pt-20 px-2 sm:px-4 pb-8 min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
    <div class="max-w-6xl mx-auto">
      <div class="mb-10 text-center">
        <h1 class="text-3xl sm:text-4xl md:text-5xl font-extrabold text-white mb-2 tracking-tight drop-shadow-lg">{{ $t('account.title') }}</h1>
        <p class="text-base sm:text-lg text-purple-200">{{ $t('account.subtitle') }}</p>
      </div>
      <div class="flex flex-col gap-6 lg:flex-row lg:gap-10">
        <!-- Left: Account Info -->
        <div class="w-full lg:w-1/2">
          <div class="bg-white/10 rounded-2xl shadow-2xl p-4 sm:p-8 backdrop-blur-md border border-white/20 animate-fade-up">
            <div class="flex flex-col sm:flex-row justify-between items-center mb-6 gap-2 sm:gap-0">
              <h2 class="text-xl sm:text-2xl font-bold text-white flex items-center gap-2">
                <svg class="w-7 h-7 text-purple-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5.121 17.804A13.937 13.937 0 0112 15c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
                {{ $t('account.details') }}
              </h2>
            </div>
            <div v-if="user" class="text-purple-100 text-left space-y-4">
              <div><span class="font-semibold">{{ $t('account.email') }}:</span> {{ user.email }}</div>
              <div class="mt-6">
                <h3 class="text-lg font-bold text-purple-200 mb-2 flex items-center gap-2">
                  <svg class="w-5 h-5 text-purple-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 17v-2a4 4 0 014-4h4m0 0V7a4 4 0 00-4-4H7a4 4 0 00-4 4v10a4 4 0 004 4h4"/></svg>
                  {{ $t('account.status') }}
                </h3>
                <div class="flex flex-col items-center gap-2 mt-2">
                  <span v-if="user.isSupporter" class="inline-flex items-center px-3 py-1 rounded-full bg-yellow-300 text-slate-900 text-sm font-semibold">{{ $t('account.supporter') }}</span>
                </div>
                <div class="text-[11px] text-purple-300 mt-3 text-center">
                  <span v-if="user.isSupporter">{{ $t('account.thankYou') }}</span>
                  <span v-else>{{ $t('account.freeFeatures') }}</span>
                </div>
              </div>
            </div>
            <div v-else class="text-purple-200 mb-8">{{ $t('account.loading') }}</div>
          </div>
        </div>
        <!-- Right: Change Password -->
        <div class="w-full lg:w-1/2 space-y-6 sm:space-y-8 mt-6 lg:mt-0 flex flex-col">
          <div class="bg-white/10 rounded-2xl shadow-2xl p-4 sm:p-8 backdrop-blur-md border border-white/20 animate-fade-up flex flex-col items-center justify-center mb-8">
            <h3 class="text-xl sm:text-2xl font-bold text-white mb-4 flex items-center gap-2">
              <svg class="w-6 h-6 text-blue-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 11c1.104 0 2-.896 2-2s-.896-2-2-2-2 .896-2 2 .896 2 2 2zm0 0v2m0 4h.01"/></svg>
              {{ $t('account.changePassword') }}
            </h3>
            <form @submit.prevent="handleChangePassword" class="w-full max-w-xs mx-auto space-y-4">
              <input v-model="oldPassword" type="password" :placeholder="$t('account.currentPassword')" class="w-full px-4 py-2 rounded-lg bg-white/20 border border-purple-300 text-white placeholder-purple-200 focus:outline-none focus:ring-2 focus:ring-purple-400" required />
              <input v-model="newPassword" type="password" :placeholder="$t('account.newPassword')" class="w-full px-4 py-2 rounded-lg bg-white/20 border border-purple-300 text-white placeholder-purple-200 focus:outline-none focus:ring-2 focus:ring-purple-400" required />
              <input v-model="confirmPassword" type="password" :placeholder="$t('account.confirmNewPassword')" class="w-full px-4 py-2 rounded-lg bg-white/20 border border-purple-300 text-white placeholder-purple-200 focus:outline-none focus:ring-2 focus:ring-purple-400" required />
              <button type="submit" :disabled="passwordLoading" class="w-full bg-gradient-to-r from-purple-600 to-purple-400 text-white py-2 rounded-xl font-bold text-lg hover:from-purple-700 hover:to-purple-500 transition-all duration-200 shadow-xl disabled:opacity-60">
                <span v-if="passwordLoading">{{ $t('account.saving') }}</span>
                <span v-else>{{ $t('account.changePassword') }}</span>
              </button>
              <div v-if="passwordError" class="text-red-400 text-xs mt-2">{{ passwordError }}</div>
              <div v-if="passwordSuccess" class="text-green-400 text-xs mt-2">{{ $t('account.passwordChanged') }}</div>
            </form>
          </div>
        </div>
      </div>
      <footer class="mt-10 text-center text-xs text-purple-300 opacity-80 select-none">
        © 2025 FridgeWise · {{ $t('account.footer') }}
      </footer>
    </div>
  </div>
</template>

<script setup lang="ts">
import { RouterLink, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { computed, onMounted, ref } from 'vue'

const auth = useAuthStore()
const router = useRouter()
const user = computed(() => auth.user)

// Change password state
const oldPassword = ref('')
const newPassword = ref('')
const confirmPassword = ref('')
const passwordLoading = ref(false)
const passwordError = ref('')
const passwordSuccess = ref(false)

async function handleChangePassword() {
  passwordError.value = ''
  passwordSuccess.value = false
  if (newPassword.value !== confirmPassword.value) {
    passwordError.value = 'Passwords do not match.'
    return
  }
  if (newPassword.value.length < 8) {
    passwordError.value = 'Password must be at least 8 characters.'
    return
  }
  passwordLoading.value = true
  try {
    // Placeholder: implement real API call
    // await api.changePassword({ oldPassword: oldPassword.value, newPassword: newPassword.value })
    await new Promise(r => setTimeout(r, 1000))
    passwordSuccess.value = true
    oldPassword.value = ''
    newPassword.value = ''
    confirmPassword.value = ''
  } catch (e: any) {
    passwordError.value = e.message || 'Error changing password.'
  } finally {
    passwordLoading.value = false
  }
}

function logout() {
  auth.logout()
  router.push('/login')
}

onMounted(() => {
  if (!auth.user) {
    router.push('/login')
  }
})
</script>

<style>
/* Add any component-specific styles here */
</style>

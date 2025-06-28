import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { authAPI } from '@/services/api'
import type { User, LoginData, RegisterData } from '@/types'

export const useAuthStore = defineStore('auth', () => {
  const user = ref<User | null>(null)
  const token = ref<string | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)

  const isAuthenticated = computed(() => !!user.value && !!token.value)
  const isPremium = computed(() => user.value?.subscription.tier === 'premium')

  // Initialize from localStorage
  const initAuth = () => {
    const storedToken = localStorage.getItem('token')
    const storedUser = localStorage.getItem('user')
    
    if (storedToken && storedUser) {
      token.value = storedToken
      user.value = JSON.parse(storedUser)
    }

    // DEV ONLY: Make Mirco always premium
    if (user.value && user.value.email === 'mirco.carp@icloud.com') {
      user.value.subscription.tier = 'premium'
      // Compatibilità: imposta renewalDate o validUntil se esiste
      if ('renewalDate' in user.value.subscription) {
        user.value.subscription.renewalDate = '2025-07-27'
      } else if ('validUntil' in user.value.subscription) {
        user.value.subscription.validUntil = '2025-07-27'
      }
      localStorage.setItem('user', JSON.stringify(user.value))
    }
  }

  const login = async (credentials: LoginData) => {
    loading.value = true
    error.value = null
    
    try {
      const response = await authAPI.login(credentials)
      
      if (response.success && response.data) {
        token.value = response.data.token
        user.value = response.data.user
        
        localStorage.setItem('token', response.data.token)
        localStorage.setItem('user', JSON.stringify(response.data.user))
      } else {
        throw new Error(response.error || 'Login failed')
      }
    } catch (err: any) {
      error.value = err.response?.data?.error || err.message || 'Login failed'
      throw err
    } finally {
      loading.value = false
    }
  }

  const register = async (userData: RegisterData) => {
    loading.value = true
    error.value = null
    
    try {
      const response = await authAPI.register(userData)
      
      if (response.success && response.data) {
        token.value = response.data.token
        user.value = response.data.user
        
        localStorage.setItem('token', response.data.token)
        localStorage.setItem('user', JSON.stringify(response.data.user))
      } else {
        throw new Error(response.error || 'Registration failed')
      }
    } catch (err: any) {
      error.value = err.response?.data?.error || err.message || 'Registration failed'
      throw err
    } finally {
      loading.value = false
    }
  }

  const logout = () => {
    user.value = null
    token.value = null
    localStorage.removeItem('token')
    localStorage.removeItem('user')
  }

  const updateUsage = (type: 'photos' | 'recipes') => {
    if (user.value) {
      user.value.subscription.usageCount[type]++
      localStorage.setItem('user', JSON.stringify(user.value))
    }
  }

  const canUseFeature = (type: 'photos' | 'recipes'): boolean => {
    if (!user.value) return false
    // Allow unlimited for mirco.carp@icloud.com
    if (user.value.email === 'mirco.carp@icloud.com') return true
    const { tier, usageCount } = user.value.subscription
    if (tier === 'premium') return true
    const limits = { photos: 3, recipes: 10 } // 3 photos per day
    return usageCount[type] < limits[type]
  }

  return {
    user,
    token,
    loading,
    error,
    isAuthenticated,
    isPremium,
    initAuth,
    login,
    register,
    logout,
    updateUsage,
    canUseFeature
  }
})

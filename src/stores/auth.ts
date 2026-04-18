import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import { authService, type LoginPayload, type RegisterPayload, type User } from '@/services/auth'

export const useAuthStore = defineStore('auth', () => {
  const user = ref<User | null>(null)
  const loading = ref(false)
  const initialized = ref(false)

  const isAuthenticated = computed(() => user.value !== null)

  async function fetchMe(): Promise<User | null> {
    try {
      loading.value = true
      user.value = await authService.me()
    } catch {
      user.value = null
    } finally {
      loading.value = false
      initialized.value = true
    }
    return user.value
  }

  async function login(payload: LoginPayload): Promise<User> {
    loading.value = true
    try {
      const u = await authService.login(payload)
      user.value = u
      return u
    } finally {
      loading.value = false
    }
  }

  async function register(payload: RegisterPayload): Promise<User> {
    loading.value = true
    try {
      return await authService.register(payload)
    } finally {
      loading.value = false
    }
  }

  async function logout(): Promise<void> {
    try {
      await authService.logout()
    } catch {
      /* ignore */
    } finally {
      user.value = null
    }
  }

  function clear() {
    user.value = null
  }

  return { user, loading, initialized, isAuthenticated, fetchMe, login, register, logout, clear }
})


import { computed, ref } from 'vue'
import { defineStore } from 'pinia'

import { HttpError, httpService } from '@/services/http'

export interface AuthenticatedUser {
  external_id: string
  name: string
  email: string
  is_admin: boolean
}

interface UserResponse {
  data: AuthenticatedUser
}

export interface LoginCredentials {
  email: string
  password: string
}

export interface RegistrationDetails extends LoginCredentials {
  name: string
  password_confirmation: string
}

export const useAuthStore = defineStore('auth', () => {
  const user = ref<AuthenticatedUser | null>(null)
  const initialized = ref(false)
  let initialization: Promise<void> | undefined

  const isAuthenticated = computed(() => user.value !== null)
  const isAdmin = computed(() => user.value?.is_admin ?? false)

  async function initialize(): Promise<void> {
    if (initialized.value) {
      return
    }

    if (!initialization) {
      initialization = loadCurrentUser()
        .catch((error: unknown) => {
          if (!(error instanceof HttpError) || error.status !== 401) {
            throw error
          }
        })
        .finally(() => {
          initialized.value = true
          initialization = undefined
        })
    }

    await initialization
  }

  async function loadCurrentUser(): Promise<void> {
    const response = await httpService.get<UserResponse>('/api/user')
    user.value = response.data
  }

  async function login(credentials: LoginCredentials): Promise<void> {
    await httpService.post<{ two_factor: false }>('/login', credentials)
    await loadCurrentUser()
    initialized.value = true
  }

  async function register(details: RegistrationDetails): Promise<void> {
    await httpService.post<void>('/register', details)
    await loadCurrentUser()
    initialized.value = true
  }

  async function logout(): Promise<void> {
    try {
      await httpService.post<void>('/logout')
      user.value = null
    } catch (error: unknown) {
      if (error instanceof HttpError && [401, 419].includes(error.status)) {
        user.value = null

        return
      }

      throw error
    }
  }

  return {
    initialized,
    isAdmin,
    isAuthenticated,
    user,
    initialize,
    loadCurrentUser,
    login,
    logout,
    register,
  }
})

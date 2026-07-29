import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'

import { HttpError, httpService } from '@/services/http'
import { useAuthStore } from '@/stores/auth'

const rider = {
  external_id: '5f9acda6-69c9-42da-a6c1-83ee4ef42230',
  name: 'Test Rider',
  email: 'rider@example.com',
  is_admin: false,
}

beforeEach(() => {
  setActivePinia(createPinia())
  vi.restoreAllMocks()
})

describe('auth store', () => {
  it('treats an unauthenticated initialization response as a guest session', async () => {
    vi.spyOn(httpService, 'get').mockRejectedValue(new HttpError('Unauthenticated.', 401))
    const authStore = useAuthStore()

    await authStore.initialize()

    expect(authStore.initialized).toBe(true)
    expect(authStore.isAuthenticated).toBe(false)
  })

  it('loads the current user after login', async () => {
    const post = vi.spyOn(httpService, 'post').mockResolvedValue({ two_factor: false })
    vi.spyOn(httpService, 'get').mockResolvedValue({ data: rider })
    const authStore = useAuthStore()

    await authStore.login({
      email: rider.email,
      password: 'password',
    })

    expect(post).toHaveBeenCalledWith('/login', {
      email: rider.email,
      password: 'password',
    })
    expect(authStore.user).toEqual(rider)
    expect(authStore.isAuthenticated).toBe(true)
  })

  it('clears local auth state when logout reports an expired session', async () => {
    vi.spyOn(httpService, 'get').mockResolvedValue({ data: rider })
    vi.spyOn(httpService, 'post').mockRejectedValue(new HttpError('CSRF token mismatch.', 419))
    const authStore = useAuthStore()
    await authStore.loadCurrentUser()

    await authStore.logout()

    expect(authStore.user).toBeNull()
  })
})

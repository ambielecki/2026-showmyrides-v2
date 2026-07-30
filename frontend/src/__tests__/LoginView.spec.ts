import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { defineComponent, nextTick } from 'vue'
import { createMemoryHistory, createRouter } from 'vue-router'

import { flushPromises, mount } from '@vue/test-utils'
import LoginView from '@/views/LoginView.vue'
import { HttpError } from '@/services/http'
import { useAlertStore } from '@/stores/alerts'
import { useAuthStore } from '@/stores/auth'

function createTestRouter() {
  return createRouter({
    history: createMemoryHistory(),
    routes: [
      { path: '/login', name: 'login', component: LoginView },
      { path: '/register', name: 'register', component: defineComponent({ template: '<div />' }) },
      { path: '/rides', name: 'rides', component: defineComponent({ template: '<div />' }) },
    ],
  })
}

beforeEach(() => {
  vi.restoreAllMocks()
})

describe('LoginView', () => {
  it('uses a light elevated card with white form fields', async () => {
    const pinia = createPinia()
    setActivePinia(pinia)
    const router = createTestRouter()
    await router.push('/login')

    const wrapper = mount(LoginView, {
      global: { plugins: [pinia, router] },
    })

    expect(wrapper.get('.card').classes()).toContain('shadow-md')
    expect(wrapper.get('input[name="email"]').classes()).toContain('bg-white')
  })

  it('collects email before revealing and focusing the password field', async () => {
    const pinia = createPinia()
    setActivePinia(pinia)
    const router = createTestRouter()
    await router.push('/login')

    const wrapper = mount(LoginView, {
      attachTo: document.body,
      global: { plugins: [pinia, router] },
    })

    await wrapper.get('input[name="email"]').setValue('rider@example.com')
    await wrapper.get('form').trigger('submit')
    await nextTick()

    const passwordInput = wrapper.get<HTMLInputElement>('input[name="password"]')
    const rememberInput = wrapper.get<HTMLInputElement>('input[name="remember"]')
    const rememberLabel = rememberInput.element.closest('label')

    expect(wrapper.text()).toContain('Step 2 of 2')
    expect(document.activeElement).toBe(passwordInput.element)
    expect(rememberInput.element.checked).toBe(false)
    expect(rememberLabel).not.toBeNull()
    expect(rememberLabel?.classList.contains('flex')).toBe(true)
    expect(rememberLabel?.classList.contains('items-center')).toBe(true)
    expect(rememberLabel?.classList.contains('gap-4')).toBe(true)
    expect(rememberInput.classes()).toContain('bg-white')
    expect(rememberInput.classes()).toContain('checked:bg-primary')
    expect(rememberInput.classes()).toContain('checked:text-primary-content')

    wrapper.unmount()
  })

  it('retains the remember choice when returning to the email step', async () => {
    const pinia = createPinia()
    setActivePinia(pinia)
    const router = createTestRouter()
    await router.push('/login')

    const wrapper = mount(LoginView, {
      global: { plugins: [pinia, router] },
    })

    expect(wrapper.find('input[name="remember"]').exists()).toBe(false)

    await wrapper.get('input[name="email"]').setValue('rider@example.com')
    await wrapper.get('form').trigger('submit')
    await wrapper.get('input[name="remember"]').setValue(true)
    await wrapper.get('button[type="button"]').trigger('click')

    expect(wrapper.find('input[name="remember"]').exists()).toBe(false)

    await wrapper.get('form').trigger('submit')

    expect(wrapper.get<HTMLInputElement>('input[name="remember"]').element.checked).toBe(true)
  })

  it('submits credentials and navigates to rides', async () => {
    const pinia = createPinia()
    setActivePinia(pinia)
    const authStore = useAuthStore()
    const login = vi.spyOn(authStore, 'login').mockResolvedValue()
    const router = createTestRouter()
    await router.push('/login')

    const wrapper = mount(LoginView, {
      global: { plugins: [pinia, router] },
    })

    await wrapper.get('input[name="email"]').setValue('rider@example.com')
    await wrapper.get('form').trigger('submit')
    await wrapper.get('input[name="password"]').setValue('password')
    await wrapper.get('input[name="remember"]').setValue(true)
    await wrapper.get('form').trigger('submit')
    await flushPromises()

    expect(login).toHaveBeenCalledWith({
      email: 'rider@example.com',
      password: 'password',
      remember: true,
    })
    expect(router.currentRoute.value.name).toBe('rides')
  })

  it('shows a warning and inline error for invalid credentials', async () => {
    const pinia = createPinia()
    setActivePinia(pinia)
    const authStore = useAuthStore()
    vi.spyOn(authStore, 'login').mockRejectedValue(
      new HttpError('The provided credentials are incorrect.', 422, {
        email: ['The provided credentials are incorrect.'],
      }),
    )
    const router = createTestRouter()
    await router.push('/login')

    const wrapper = mount(LoginView, {
      global: { plugins: [pinia, router] },
    })

    await wrapper.get('input[name="email"]').setValue('rider@example.com')
    await wrapper.get('form').trigger('submit')
    await wrapper.get('input[name="password"]').setValue('incorrect')
    await wrapper.get('form').trigger('submit')
    await flushPromises()

    expect(wrapper.text()).toContain('The provided credentials are incorrect.')
    expect(useAlertStore().alerts[0]).toMatchObject({
      severity: 'warning',
      message: 'The provided credentials are incorrect.',
    })
  })
})

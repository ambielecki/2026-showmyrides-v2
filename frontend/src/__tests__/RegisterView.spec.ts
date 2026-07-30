import { expect, it, vi } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { defineComponent } from 'vue'
import { createMemoryHistory, createRouter } from 'vue-router'

import { flushPromises, mount } from '@vue/test-utils'
import RegisterView from '@/views/RegisterView.vue'
import { useAuthStore } from '@/stores/auth'

it('uses a light elevated card with white form fields', async () => {
  const pinia = createPinia()
  setActivePinia(pinia)
  const router = createRouter({
    history: createMemoryHistory(),
    routes: [
      { path: '/register', name: 'register', component: RegisterView },
      { path: '/login', name: 'login', component: defineComponent({ template: '<div />' }) },
      { path: '/rides', name: 'rides', component: defineComponent({ template: '<div />' }) },
    ],
  })
  await router.push('/register')

  const wrapper = mount(RegisterView, {
    global: { plugins: [pinia, router] },
  })

  expect(wrapper.get('.card').classes()).toContain('shadow-md')
  expect(wrapper.findAll('input').every((input) => input.classes().includes('bg-white'))).toBe(true)
})

it('registers an account and navigates to rides', async () => {
  const pinia = createPinia()
  setActivePinia(pinia)
  const authStore = useAuthStore()
  const register = vi.spyOn(authStore, 'register').mockResolvedValue()
  const router = createRouter({
    history: createMemoryHistory(),
    routes: [
      { path: '/register', name: 'register', component: RegisterView },
      { path: '/login', name: 'login', component: defineComponent({ template: '<div />' }) },
      { path: '/rides', name: 'rides', component: defineComponent({ template: '<div />' }) },
    ],
  })
  await router.push('/register')

  const wrapper = mount(RegisterView, {
    global: { plugins: [pinia, router] },
  })

  await wrapper.get('input[name="name"]').setValue('Test Rider')
  await wrapper.get('input[name="email"]').setValue('rider@example.com')
  await wrapper.get('input[name="password"]').setValue('correct horse battery staple')
  await wrapper
    .get('input[name="password_confirmation"]')
    .setValue('correct horse battery staple')
  await wrapper.get('form').trigger('submit')
  await flushPromises()

  expect(register).toHaveBeenCalledWith({
    name: 'Test Rider',
    email: 'rider@example.com',
    password: 'correct horse battery staple',
    password_confirmation: 'correct horse battery staple',
  })
  expect(router.currentRoute.value.name).toBe('rides')
})

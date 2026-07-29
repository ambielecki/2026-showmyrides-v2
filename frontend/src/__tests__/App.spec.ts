import { createPinia } from 'pinia'
import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'
import { nextTick } from 'vue'

import { mount } from '@vue/test-utils'
import App from '../App.vue'
import router from '../router'

describe('App', () => {
  beforeAll(() => {
    vi.stubGlobal('scrollTo', vi.fn())
  })

  beforeEach(async () => {
    await router.push('/')
    await router.isReady()
  })

  it('renders the homepage inside the application shell', () => {
    const wrapper = mount(App, {
      global: {
        plugins: [createPinia(), router],
      },
    })

    expect(wrapper.get('h1').text()).toBe('Track every route and see where you have been')
    expect(wrapper.findAll('article')).toHaveLength(3)
    expect(wrapper.get('footer').text()).toContain('© 2026 ShowMyRides')
  })

  it('opens and closes the mobile drawer while restoring focus', async () => {
    const wrapper = mount(App, {
      attachTo: document.body,
      global: {
        plugins: [createPinia(), router],
      },
    })
    const menuButton = wrapper.get<HTMLButtonElement>(
      'button[aria-label="Open navigation"]',
    )

    await menuButton.trigger('click')

    expect(wrapper.get<HTMLInputElement>('input.drawer-toggle').element.checked).toBe(true)
    expect(wrapper.get('aside[aria-label="Mobile navigation"]').text()).toContain('Home')

    await wrapper
      .get('aside[aria-label="Mobile navigation"] button[aria-label="Close navigation"]')
      .trigger('click')
    await nextTick()

    expect(wrapper.get<HTMLInputElement>('input.drawer-toggle').element.checked).toBe(false)
    expect(document.activeElement).toBe(menuButton.element)

    wrapper.unmount()
  })

  it('renders a working placeholder route', async () => {
    await router.push('/login')

    const wrapper = mount(App, {
      global: {
        plugins: [createPinia(), router],
      },
    })

    expect(wrapper.get('h1').text()).toBe('Log In')
    expect(wrapper.text()).toContain('Account login will be available in a future update.')
  })

  it('creates notifications from the manual test route', async () => {
    await router.push('/test/notifications')

    const wrapper = mount(App, {
      global: {
        plugins: [createPinia(), router],
      },
    })

    await wrapper.get('button.btn-success').trigger('click')
    await wrapper.get('button.btn-warning').trigger('click')
    await wrapper.get('button.btn-error').trigger('click')

    const alerts = wrapper.findAll('[data-alert-severity]')

    expect(alerts).toHaveLength(3)
    expect(alerts.map((alert) => alert.attributes('data-alert-severity'))).toEqual([
      'error',
      'warning',
      'success',
    ])

    wrapper.unmount()
  })
})

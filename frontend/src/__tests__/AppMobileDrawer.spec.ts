import { describe, expect, it } from 'vitest'
import { defineComponent, nextTick } from 'vue'
import { createMemoryHistory, createRouter } from 'vue-router'

import { mount } from '@vue/test-utils'
import AppMobileDrawer from '@/components/AppMobileDrawer.vue'

const routeNames = [
  ['home', '/'],
  ['register', '/register'],
  ['login', '/login'],
  ['rides', '/rides'],
  ['add-ride', '/rides/add'],
  ['ride-overlay', '/rides/overlay'],
  ['settings', '/settings'],
  ['admin-tools', '/admin'],
] as const

function createTestRouter() {
  return createRouter({
    history: createMemoryHistory(),
    routes: routeNames.map(([name, path]) => ({
      name,
      path,
      component: defineComponent({ template: '<div />' }),
    })),
  })
}

async function mountDrawer(
  isOpen = false,
  isAuthenticated = false,
  isAdmin = false,
) {
  const router = createTestRouter()
  await router.push('/')

  return mount(AppMobileDrawer, {
    attachTo: document.body,
    props: {
      isOpen,
      isAuthenticated,
      isAdmin,
      toggleId: 'test-drawer-toggle',
    },
    global: {
      plugins: [router],
    },
  })
}

describe('AppMobileDrawer', () => {
  it('separates guest routes and anchors account actions at the bottom', async () => {
    const wrapper = await mountDrawer(true)
    const primaryNavigation = wrapper.get(
      'nav[aria-label="Mobile primary navigation"]',
    )
    const accountNavigation = wrapper.get(
      'nav[aria-label="Mobile account navigation"]',
    )

    expect(primaryNavigation.text()).toContain('Home')
    expect(primaryNavigation.text()).not.toContain('Register')
    expect(primaryNavigation.text()).not.toContain('Rides')
    expect(accountNavigation.text()).toContain('Register')
    expect(accountNavigation.text()).toContain('Log In')
    expect(accountNavigation.classes()).toContain('mt-auto')

    wrapper.unmount()
  })

  it('places authenticated account actions below primary routes', async () => {
    const wrapper = await mountDrawer(true, true, true)
    const primaryNavigation = wrapper.get(
      'nav[aria-label="Mobile primary navigation"]',
    )
    const accountNavigation = wrapper.get(
      'nav[aria-label="Mobile account navigation"]',
    )

    expect(primaryNavigation.text()).toContain('Rides')
    expect(primaryNavigation.text()).toContain('Admin Tools')
    expect(primaryNavigation.text()).not.toContain('Settings')
    expect(accountNavigation.text()).toContain('Settings')
    expect(accountNavigation.text()).toContain('Log Out')
    expect(accountNavigation.text()).not.toContain('Register')

    wrapper.unmount()
  })

  it('focuses the close button when opened and closes on Escape', async () => {
    const wrapper = await mountDrawer()

    await wrapper.setProps({ isOpen: true })
    await nextTick()

    const closeButton = wrapper.get<HTMLButtonElement>(
      'button[aria-label="Close navigation"]',
    )
    expect(document.activeElement).toBe(closeButton.element)

    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }))

    expect(wrapper.emitted('close')).toHaveLength(1)
    wrapper.unmount()
  })

  it('closes from the backdrop and route selection', async () => {
    const wrapper = await mountDrawer(true)

    await wrapper.get('label.drawer-overlay').trigger('click')
    await wrapper
      .get('nav[aria-label="Mobile primary navigation"] a')
      .trigger('click')

    expect(wrapper.emitted('close')).toHaveLength(2)
    wrapper.unmount()
  })
})

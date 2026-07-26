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

async function mountDrawer(isOpen = false) {
  const router = createTestRouter()
  await router.push('/')

  return mount(AppMobileDrawer, {
    attachTo: document.body,
    props: {
      isOpen,
      isAuthenticated: false,
      isAdmin: false,
      toggleId: 'test-drawer-toggle',
    },
    global: {
      plugins: [router],
    },
  })
}

describe('AppMobileDrawer', () => {
  it('lists the routes available to the current visitor', async () => {
    const wrapper = await mountDrawer(true)
    const navigation = wrapper.get('nav[aria-label="Mobile routes"]')

    expect(navigation.text()).toContain('Home')
    expect(navigation.text()).toContain('Register')
    expect(navigation.text()).toContain('Log In')
    expect(navigation.text()).not.toContain('Rides')

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
    await wrapper.get('nav[aria-label="Mobile routes"] a').trigger('click')

    expect(wrapper.emitted('close')).toHaveLength(2)
    wrapper.unmount()
  })
})

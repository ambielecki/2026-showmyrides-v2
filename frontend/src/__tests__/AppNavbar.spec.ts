import { describe, expect, it } from 'vitest'
import { defineComponent } from 'vue'
import { createMemoryHistory, createRouter } from 'vue-router'

import { mount } from '@vue/test-utils'
import AppNavbar from '@/components/AppNavbar.vue'

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

async function mountNavbar(isAuthenticated: boolean, isAdmin = false) {
  const router = createTestRouter()
  await router.push('/')

  return mount(AppNavbar, {
    props: {
      isAuthenticated,
      isAdmin,
      drawerOpen: false,
    },
    global: {
      plugins: [router],
    },
  })
}

describe('AppNavbar', () => {
  it('shows public routes in the account navigation for logged-out visitors', async () => {
    const wrapper = await mountNavbar(false)
    const accountNavigation = wrapper.get('nav[aria-label="Account navigation"]')

    expect(wrapper.find('nav[aria-label="Primary navigation"]').exists()).toBe(false)
    expect(accountNavigation.text()).toContain('Register')
    expect(accountNavigation.text()).toContain('Log In')
    expect(accountNavigation.text()).not.toContain('Rides')
  })

  it('separates primary and account routes for authenticated visitors', async () => {
    const wrapper = await mountNavbar(true)
    const primaryNavigation = wrapper.get('nav[aria-label="Primary navigation"]')
    const accountNavigation = wrapper.get('nav[aria-label="Account navigation"]')

    expect(primaryNavigation.text()).toContain('Rides')
    expect(primaryNavigation.text()).toContain('Add Ride')
    expect(primaryNavigation.text()).toContain('Ride Overlay')
    expect(primaryNavigation.text()).not.toContain('Settings')
    expect(primaryNavigation.text()).not.toContain('Log Out')
    expect(primaryNavigation.text()).not.toContain('Admin Tools')
    expect(accountNavigation.text()).toContain('Settings')
    expect(accountNavigation.text()).toContain('Log Out')
    expect(accountNavigation.text()).not.toContain('Register')
    expect(accountNavigation.text()).not.toContain('Rides')
  })

  it('adds the admin route for administrators', async () => {
    const wrapper = await mountNavbar(true, true)

    expect(wrapper.get('nav[aria-label="Primary navigation"]').text()).toContain('Admin Tools')
  })
})

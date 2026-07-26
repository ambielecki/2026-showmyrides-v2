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
  it('shows public account routes to logged-out visitors', async () => {
    const wrapper = await mountNavbar(false)
    const navigation = wrapper.get('nav[aria-label="Primary navigation"]')

    expect(navigation.text()).toContain('Register')
    expect(navigation.text()).toContain('Log In')
    expect(navigation.text()).not.toContain('Rides')
  })

  it('shows ride and account routes to authenticated visitors', async () => {
    const wrapper = await mountNavbar(true)
    const navigation = wrapper.get('nav[aria-label="Primary navigation"]')

    expect(navigation.text()).toContain('Rides')
    expect(navigation.text()).toContain('Add Ride')
    expect(navigation.text()).toContain('Ride Overlay')
    expect(navigation.text()).toContain('Settings')
    expect(navigation.text()).toContain('Log Out')
    expect(navigation.text()).not.toContain('Register')
    expect(navigation.text()).not.toContain('Admin Tools')
  })

  it('adds the admin route for administrators', async () => {
    const wrapper = await mountNavbar(true, true)

    expect(wrapper.get('nav[aria-label="Primary navigation"]').text()).toContain('Admin Tools')
  })
})

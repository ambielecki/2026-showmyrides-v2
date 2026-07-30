import { expect, it } from 'vitest'
import { RouterLinkStub, mount } from '@vue/test-utils'

import SettingsView from '@/views/SettingsView.vue'

it('links authenticated users to location management', () => {
  const wrapper = mount(SettingsView, {
    global: {
      stubs: {
        RouterLink: RouterLinkStub,
      },
    },
  })

  const link = wrapper.getComponent(RouterLinkStub)

  expect(wrapper.get('h1').text()).toBe('Settings')
  expect(link.text()).toContain('Manage Locations')
  expect(link.props('to')).toEqual({ name: 'settings-locations' })
})

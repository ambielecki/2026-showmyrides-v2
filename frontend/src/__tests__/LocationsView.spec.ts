import { beforeEach, expect, it, vi } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { flushPromises, mount, RouterLinkStub } from '@vue/test-utils'

import { locationService } from '@/services/locations'
import type { PaginatedLocations } from '@/types/locations'
import LocationsView from '@/views/LocationsView.vue'

vi.mock('@/services/locations', () => ({
  locationService: {
    list: vi.fn<(page: number) => Promise<PaginatedLocations>>(),
  },
}))

beforeEach(() => {
  setActivePinia(createPinia())
  vi.mocked(locationService.list).mockReset()
})

it('shows the authenticated user locations and pagination controls', async () => {
  vi.mocked(locationService.list).mockResolvedValue({
    data: [
      {
        external_id: '7b00b503-24fa-4c33-8c81-ec225af68f10',
        name: 'Harold Parker State Forest',
        latitude: 42.614865,
        longitude: -71.095166,
      },
    ],
    meta: {
      current_page: 1,
      from: 1,
      last_page: 2,
      per_page: 10,
      to: 1,
      total: 11,
    },
  })

  const wrapper = mount(LocationsView, {
    global: {
      plugins: [createPinia()],
      stubs: {
        LocationDialog: true,
        RouterLink: RouterLinkStub,
      },
    },
  })

  await flushPromises()

  expect(wrapper.text()).toContain('Harold Parker State Forest')
  expect(wrapper.text()).toContain('42.614865')
  expect(wrapper.text()).toContain('-71.095166')
  expect(wrapper.text()).toContain('11 locations')
  expect(wrapper.text()).toContain('Page 1 of 2')
})

it('shows an empty state that can open the add dialog', async () => {
  vi.mocked(locationService.list).mockResolvedValue({
    data: [],
    meta: {
      current_page: 1,
      from: null,
      last_page: 1,
      per_page: 10,
      to: null,
      total: 0,
    },
  })

  const wrapper = mount(LocationsView, {
    global: {
      plugins: [createPinia()],
      stubs: {
        LocationDialog: true,
        RouterLink: RouterLinkStub,
      },
    },
  })

  await flushPromises()
  await wrapper.get('button').trigger('click')

  expect(wrapper.text()).toContain('No locations yet')
  expect(wrapper.findComponent({ name: 'LocationDialog' }).exists()).toBe(true)
})

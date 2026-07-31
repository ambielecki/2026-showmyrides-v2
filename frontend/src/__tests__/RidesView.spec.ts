import { beforeEach, expect, it, vi } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { flushPromises, mount, RouterLinkStub } from '@vue/test-utils'

import { rideService } from '@/services/rides'
import type { PaginatedRides, RideLocation } from '@/types/rides'
import RidesView from '@/views/RidesView.vue'

vi.mock('@/services/rides', () => ({
  rideService: {
    list: vi.fn<() => Promise<PaginatedRides>>(),
    locations: vi.fn<() => Promise<RideLocation[]>>(),
  },
}))

beforeEach(() => {
  setActivePinia(createPinia())
  vi.clearAllMocks()
  vi.mocked(rideService.locations).mockResolvedValue([])
})

it('renders ride summaries without requiring route data', async () => {
  vi.mocked(rideService.list).mockResolvedValue({
    data: [{
      external_id: 'ride-id',
      name: 'Morning Loop',
      description: 'A steady social ride.',
      ride_datetime: '2026-07-31T12:00:00Z',
      distance: 20,
      moving_time: 3600,
      processing_status: 'complete',
      processing_error: null,
      location: { external_id: 'location-id', name: 'Blue Hills', map_provider: 'openstreetmap' },
    }],
    meta: { current_page: 1, from: 1, last_page: 1, per_page: 10, to: 1, total: 1 },
  })

  const wrapper = mount(RidesView, {
    global: { plugins: [createPinia()], stubs: { RouterLink: RouterLinkStub } },
  })
  await flushPromises()

  expect(wrapper.text()).toContain('Morning Loop')
  expect(wrapper.text()).toContain('20.00 mi')
  expect(wrapper.text()).toContain('1h 0m')
  expect(wrapper.text()).toContain('Blue Hills')
})

it('shows pending rides and indicates that their activity data is processing', async () => {
  vi.mocked(rideService.list).mockResolvedValue({
    data: [{
      external_id: 'pending-id',
      name: 'New Upload',
      description: null,
      ride_datetime: null,
      distance: null,
      moving_time: null,
      processing_status: 'pending',
      processing_error: null,
      location: { external_id: 'location-id', name: 'Watopia', map_provider: 'watopia' },
    }],
    meta: { current_page: 1, from: 1, last_page: 1, per_page: 10, to: 1, total: 1 },
  })

  const wrapper = mount(RidesView, {
    global: { plugins: [createPinia()], stubs: { RouterLink: RouterLinkStub } },
  })
  await flushPromises()

  expect(wrapper.text()).toContain('Pending')
  expect(wrapper.text()).toContain('Awaiting activity data')
  wrapper.unmount()
})

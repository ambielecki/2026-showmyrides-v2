import { beforeEach, expect, it, vi } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { flushPromises, mount, RouterLinkStub } from '@vue/test-utils'

import { rideService } from '@/services/rides'
import type { Ride } from '@/types/rides'
import RideView from '@/views/RideView.vue'

vi.mock('vue-router', async (importOriginal) => ({
  ...(await importOriginal<typeof import('vue-router')>()),
  useRoute: () => ({ params: { rideId: 'ride-id' } }),
  useRouter: () => ({ push: vi.fn<() => Promise<void>>() }),
}))

vi.mock('@/services/rides', () => ({
  rideService: { get: vi.fn<(id: string) => Promise<Ride>>() },
}))

beforeEach(() => {
  setActivePinia(createPinia())
  vi.clearAllMocks()
})

it('lays out a completed ride map and stats', async () => {
  vi.mocked(rideService.get).mockResolvedValue({
    external_id: 'ride-id',
    name: 'Morning Loop',
    description: 'Ride description',
    ride_datetime: '2026-07-31T12:00:00Z',
    distance: 20,
    moving_time: 3600,
    total_time: 3724,
    average_speed: 18,
    max_speed: 30,
    processing_status: 'complete',
    processing_error: null,
    location: { external_id: 'location-id', name: 'Blue Hills', map_provider: 'openstreetmap' },
    route_data: { type: 'LineString', coordinates: [[-71.1, 42.6], [-71.09, 42.61]] },
  })

  const wrapper = mount(RideView, {
    global: {
      plugins: [createPinia()],
      stubs: { RouterLink: RouterLinkStub, RideMap: { template: '<div data-test="ride-map">Map</div>' } },
    },
  })
  await flushPromises()

  expect(wrapper.text()).toContain('Morning Loop')
  expect(wrapper.text()).toContain('Ride details')
  expect(wrapper.text()).toContain('18.00 mph')
  expect(wrapper.find('[data-test="ride-map"]').exists()).toBe(true)
})

it('keeps a failed ride available for editing or deletion', async () => {
  vi.mocked(rideService.get).mockResolvedValue({
    external_id: 'ride-id', name: 'Bad Upload', description: null, ride_datetime: null,
    distance: null, moving_time: null, total_time: null, average_speed: null, max_speed: null,
    processing_status: 'failed', processing_error: 'This FIT file could not be processed.',
    location: { external_id: 'location-id', name: 'Watopia', map_provider: 'watopia' }, route_data: null,
  })

  const wrapper = mount(RideView, {
    global: { plugins: [createPinia()], stubs: { RouterLink: RouterLinkStub } },
  })
  await flushPromises()

  expect(wrapper.text()).toContain('Processing failed')
  expect(wrapper.text()).toContain('This FIT file could not be processed.')
  expect(wrapper.get('button').text()).toBe('Edit')
})

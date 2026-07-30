import { beforeEach, expect, it, vi } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { flushPromises, mount } from '@vue/test-utils'

import LocationDialog from '@/components/LocationDialog.vue'
import { locationService } from '@/services/locations'
import { useAlertStore } from '@/stores/alerts'
import type {
  Location,
  LocationInput,
  LocationSearchResult,
} from '@/types/locations'

vi.mock('@/services/locations', () => ({
  locationService: {
    create: vi.fn<(input: LocationInput) => Promise<Location>>(),
    search: vi.fn<(query: string) => Promise<LocationSearchResult[]>>(),
    update: vi.fn<(externalId: string, input: LocationInput) => Promise<Location>>(),
  },
}))

const LocationMapStub = {
  name: 'LocationMap',
  props: ['latitude', 'longitude'],
  emits: ['coordinatesChanged'],
  template: '<button type="button" data-test="map" @click="$emit(\'coordinatesChanged\', 43.1, -70.9)">Map</button>',
}

beforeEach(() => {
  setActivePinia(createPinia())
  vi.mocked(locationService.create).mockReset()
  vi.mocked(locationService.search).mockReset()
  vi.mocked(locationService.update).mockReset()

  HTMLDialogElement.prototype.showModal = vi.fn<(this: HTMLDialogElement) => void>(
    function (this: HTMLDialogElement) {
      this.setAttribute('open', '')
    },
  )
  HTMLDialogElement.prototype.close = vi.fn<(this: HTMLDialogElement) => void>(
    function (this: HTMLDialogElement) {
      this.removeAttribute('open')
      this.dispatchEvent(new Event('close'))
    },
  )
})

it('uses explicit search and fills a blank name from the selected result', async () => {
  vi.mocked(locationService.search).mockResolvedValue([
    {
      name: 'Harold Parker State Forest',
      display_name: 'Harold Parker State Forest, Andover, Massachusetts',
      latitude: 42.614865,
      longitude: -71.095166,
    },
  ])

  const wrapper = mount(LocationDialog, {
    global: {
      plugins: [createPinia()],
      stubs: {
        LocationMap: LocationMapStub,
      },
    },
  })

  const searchInput = wrapper.get('input[type="search"]')
  await searchInput.setValue('Harold Parker')
  await wrapper.get('button[type="button"].btn').trigger('click')
  await flushPromises()

  expect(locationService.search).toHaveBeenCalledWith('Harold Parker')

  await wrapper
    .get('ul button')
    .trigger('click')

  const textInputs = wrapper.findAll('input[type="text"]')
  const numberInputs = wrapper.findAll('input[type="number"]')

  expect((textInputs[0]!.element as HTMLInputElement).value).toBe(
    'Harold Parker State Forest',
  )
  expect((numberInputs[0]!.element as HTMLInputElement).value).toBe('42.614865')
  expect((numberInputs[1]!.element as HTMLInputElement).value).toBe('-71.095166')
})

it('creates a location with map-synchronized coordinates and shared success messaging', async () => {
  vi.mocked(locationService.create).mockResolvedValue({
    external_id: '7b00b503-24fa-4c33-8c81-ec225af68f10',
    name: 'New Trail System',
    latitude: 43.1,
    longitude: -70.9,
  })

  const wrapper = mount(LocationDialog, {
    global: {
      plugins: [createPinia()],
      stubs: {
        LocationMap: LocationMapStub,
      },
    },
  })

  await wrapper.get('input[type="text"]').setValue('New Trail System')
  await wrapper.get('[data-test="map"]').trigger('click')
  await wrapper.get('form.mt-6').trigger('submit')
  await flushPromises()

  expect(locationService.create).toHaveBeenCalledWith({
    name: 'New Trail System',
    latitude: 43.1,
    longitude: -70.9,
  })
  expect(wrapper.emitted('saved')?.[0]?.[1]).toBe(true)
  expect(useAlertStore().alerts[0]).toMatchObject({
    severity: 'success',
    message: 'Location added successfully.',
  })
})

it('updates an existing location without showing place search', async () => {
  const location = {
    external_id: '7b00b503-24fa-4c33-8c81-ec225af68f10',
    name: 'Existing Forest',
    latitude: 42,
    longitude: -71,
  }
  vi.mocked(locationService.update).mockResolvedValue({
    ...location,
    name: 'Updated Forest',
  })

  const wrapper = mount(LocationDialog, {
    props: { location },
    global: {
      plugins: [createPinia()],
      stubs: {
        LocationMap: LocationMapStub,
      },
    },
  })

  expect(wrapper.find('input[type="search"]').exists()).toBe(false)

  await wrapper.get('input[type="text"]').setValue('Updated Forest')
  await wrapper.get('form.mt-6').trigger('submit')
  await flushPromises()

  expect(locationService.update).toHaveBeenCalledWith(location.external_id, {
    name: 'Updated Forest',
    latitude: 42,
    longitude: -71,
  })
})

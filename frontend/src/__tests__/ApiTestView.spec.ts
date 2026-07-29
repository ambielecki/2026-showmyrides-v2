import { expect, it, vi } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'

import { flushPromises, mount } from '@vue/test-utils'
import ApiTestView from '@/views/ApiTestView.vue'
import { HttpError, httpService } from '@/services/http'
import { useAlertStore } from '@/stores/alerts'

it('warns logged-out users when the authenticated diagnostic request is rejected', async () => {
  const pinia = createPinia()
  setActivePinia(pinia)
  vi.spyOn(httpService, 'get').mockRejectedValue(new HttpError('Unauthenticated.', 401))

  const wrapper = mount(ApiTestView, {
    global: { plugins: [pinia] },
  })

  await wrapper.get('button:nth-of-type(2)').trigger('click')
  await flushPromises()

  expect(wrapper.text()).toContain('Authentication is required for that request.')
  expect(useAlertStore().alerts[0]).toMatchObject({
    severity: 'warning',
    message: 'Log in before calling the authenticated API.',
  })
})

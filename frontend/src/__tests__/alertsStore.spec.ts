import { beforeEach, describe, expect, it } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'

import { useAlertStore } from '@/stores/alerts'

describe('alert store', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('creates typed alerts in newest-first order', () => {
    const alertStore = useAlertStore()

    const successId = alertStore.success('Saved')
    const warningId = alertStore.warning('Review this')
    const errorId = alertStore.error('Save failed')

    expect(alertStore.alerts).toEqual([
      { id: errorId, severity: 'error', message: 'Save failed' },
      { id: warningId, severity: 'warning', message: 'Review this' },
      { id: successId, severity: 'success', message: 'Saved' },
    ])
  })

  it('dismisses only the selected alert', () => {
    const alertStore = useAlertStore()
    const dismissedId = alertStore.success('Saved')
    const remainingId = alertStore.error('Save failed')

    alertStore.dismiss(dismissedId)

    expect(alertStore.alerts).toEqual([
      { id: remainingId, severity: 'error', message: 'Save failed' },
    ])
  })
})

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { mount } from '@vue/test-utils'

import AppAlert from '@/components/AppAlert.vue'
import {
  ALERT_DURATION_MILLISECONDS,
  type AppAlert as AppAlertMessage,
  type AlertSeverity,
} from '@/stores/alerts'

let isDocumentHidden = false

function mountAlert(severity: AlertSeverity = 'success') {
  const alert: AppAlertMessage = {
    id: 1,
    severity,
    message: 'A test notification',
  }

  return mount(AppAlert, {
    props: { alert },
  })
}

describe('AppAlert', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    isDocumentHidden = false
    vi.spyOn(document, 'hidden', 'get').mockImplementation(() => isDocumentHidden)
  })

  afterEach(() => {
    vi.useRealTimers()
    vi.restoreAllMocks()
  })

  it.each([
    ['success', 'Success', 'status', 'alert-success'],
    ['warning', 'Warning', 'alert', 'alert-warning'],
    ['error', 'Error', 'alert', 'alert-error'],
  ] as const)('renders an accessible %s notification', (severity, label, role, alertClass) => {
    const wrapper = mountAlert(severity)
    const alert = wrapper.get(`[role="${role}"]`)

    expect(alert.classes()).toContain(alertClass)
    expect(alert.text()).toContain(label)
    expect(alert.text()).toContain('A test notification')
    expect(
      wrapper.get(`button[aria-label="Dismiss ${label.toLowerCase()} notification"]`),
    ).toBeTruthy()
    expect(wrapper.get('svg').attributes('aria-hidden')).toBe('true')

    wrapper.unmount()
  })

  it('dismisses automatically after 20 active seconds', async () => {
    const wrapper = mountAlert()

    await vi.advanceTimersByTimeAsync(ALERT_DURATION_MILLISECONDS)

    expect(wrapper.emitted('dismiss')).toEqual([[1]])
  })

  it('pauses and resumes the timer while hovered', async () => {
    const wrapper = mountAlert()

    await vi.advanceTimersByTimeAsync(5_000)
    await wrapper.trigger('mouseenter')
    await vi.advanceTimersByTimeAsync(ALERT_DURATION_MILLISECONDS)

    expect(wrapper.emitted('dismiss')).toBeUndefined()

    await wrapper.trigger('mouseleave')
    await vi.advanceTimersByTimeAsync(14_999)
    expect(wrapper.emitted('dismiss')).toBeUndefined()

    await vi.advanceTimersByTimeAsync(1)
    expect(wrapper.emitted('dismiss')).toEqual([[1]])
  })

  it('pauses and resumes the timer while keyboard focus is inside', async () => {
    const wrapper = mountAlert()
    const dismissButton = wrapper.get('button')

    await dismissButton.trigger('focusin')
    await vi.advanceTimersByTimeAsync(ALERT_DURATION_MILLISECONDS)
    expect(wrapper.emitted('dismiss')).toBeUndefined()

    await dismissButton.trigger('focusout')
    await vi.advanceTimersByTimeAsync(ALERT_DURATION_MILLISECONDS)
    expect(wrapper.emitted('dismiss')).toEqual([[1]])
  })

  it('pauses and resumes the timer while the document is hidden', async () => {
    const wrapper = mountAlert()

    isDocumentHidden = true
    document.dispatchEvent(new Event('visibilitychange'))
    await vi.advanceTimersByTimeAsync(ALERT_DURATION_MILLISECONDS)
    expect(wrapper.emitted('dismiss')).toBeUndefined()

    isDocumentHidden = false
    document.dispatchEvent(new Event('visibilitychange'))
    await vi.advanceTimersByTimeAsync(ALERT_DURATION_MILLISECONDS)
    expect(wrapper.emitted('dismiss')).toEqual([[1]])
  })

  it('resumes only after every pause condition clears', async () => {
    const wrapper = mountAlert()

    await vi.advanceTimersByTimeAsync(5_000)
    await wrapper.trigger('mouseenter')
    isDocumentHidden = true
    document.dispatchEvent(new Event('visibilitychange'))

    await wrapper.trigger('mouseleave')
    await vi.advanceTimersByTimeAsync(ALERT_DURATION_MILLISECONDS)
    expect(wrapper.emitted('dismiss')).toBeUndefined()

    isDocumentHidden = false
    document.dispatchEvent(new Event('visibilitychange'))
    await vi.advanceTimersByTimeAsync(14_999)
    expect(wrapper.emitted('dismiss')).toBeUndefined()

    await vi.advanceTimersByTimeAsync(1)
    expect(wrapper.emitted('dismiss')).toEqual([[1]])
  })

  it('dismisses immediately from the circular close button', async () => {
    const wrapper = mountAlert('error')

    await wrapper.get('button[aria-label="Dismiss error notification"]').trigger('click')

    expect(wrapper.emitted('dismiss')).toEqual([[1]])
  })

  it('uses an error icon that is distinct from the dismiss icon', () => {
    const wrapper = mountAlert('error')
    const errorIconPath = wrapper.get('article > svg path').attributes('d')
    const dismissIconPath = wrapper.get('button svg path').attributes('d')

    expect(errorIconPath).toBe('M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z')
    expect(errorIconPath).not.toBe(dismissIconPath)

    wrapper.unmount()
  })
})

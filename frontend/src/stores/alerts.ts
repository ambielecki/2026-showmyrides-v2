import { ref } from 'vue'
import { defineStore } from 'pinia'

export const ALERT_DURATION_MILLISECONDS = 20_000

export type AlertSeverity = 'success' | 'warning' | 'error'

export interface AppAlert {
  id: number
  severity: AlertSeverity
  message: string
}

let nextAlertId = 0

export const useAlertStore = defineStore('alerts', () => {
  const alerts = ref<AppAlert[]>([])

  function addAlert(severity: AlertSeverity, message: string): number {
    const id = ++nextAlertId

    alerts.value.unshift({
      id,
      severity,
      message,
    })

    return id
  }

  function success(message: string): number {
    return addAlert('success', message)
  }

  function warning(message: string): number {
    return addAlert('warning', message)
  }

  function error(message: string): number {
    return addAlert('error', message)
  }

  function dismiss(id: number): void {
    alerts.value = alerts.value.filter((alert) => alert.id !== id)
  }

  return {
    alerts,
    success,
    warning,
    error,
    dismiss,
  }
})

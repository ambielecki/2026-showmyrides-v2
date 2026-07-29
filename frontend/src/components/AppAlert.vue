<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted } from 'vue'

import { ALERT_DURATION_MILLISECONDS, type AppAlert, type AlertSeverity } from '@/stores/alerts'

interface AlertPresentation {
  label: string
  role: 'alert' | 'status'
  alertClass: string
  iconPath: string
}

type PauseReason = 'focus' | 'hidden' | 'hover'

const props = defineProps<{
  alert: AppAlert
}>()

const emit = defineEmits<{
  dismiss: [id: number]
}>()

const presentations: Record<AlertSeverity, AlertPresentation> = {
  success: {
    label: 'Success',
    role: 'status',
    alertClass: 'alert-success',
    iconPath: 'M5 13l4 4L19 7',
  },
  warning: {
    label: 'Warning',
    role: 'alert',
    alertClass: 'alert-warning',
    iconPath:
      'M12 9v4m0 4h.01M10.29 3.86l-7.82 13.55A2 2 0 004.2 20h15.6a2 2 0 001.73-3L13.73 3.86a2 2 0 00-3.44 0z',
  },
  error: {
    label: 'Error',
    role: 'alert',
    alertClass: 'alert-error',
    iconPath: 'M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
  },
}

const presentation = computed(() => presentations[props.alert.severity])
const pauseReasons = new Set<PauseReason>()

let remainingMilliseconds = ALERT_DURATION_MILLISECONDS
let timerStartedAt = 0
let timer: ReturnType<typeof setTimeout> | undefined
let hasDismissed = false

function dismiss(): void {
  if (hasDismissed) {
    return
  }

  hasDismissed = true
  clearDismissalTimer()
  emit('dismiss', props.alert.id)
}

function clearDismissalTimer(): void {
  if (timer === undefined) {
    return
  }

  clearTimeout(timer)
  timer = undefined
}

function startDismissalTimer(): void {
  if (timer !== undefined || pauseReasons.size > 0 || hasDismissed) {
    return
  }

  timerStartedAt = performance.now()
  timer = setTimeout(
    () => {
      timer = undefined
      dismiss()
    },
    Math.max(remainingMilliseconds, 0),
  )
}

function pauseDismissal(reason: PauseReason): void {
  if (pauseReasons.has(reason)) {
    return
  }

  pauseReasons.add(reason)

  if (timer === undefined) {
    return
  }

  remainingMilliseconds = Math.max(remainingMilliseconds - (performance.now() - timerStartedAt), 0)
  clearDismissalTimer()
}

function resumeDismissal(reason: PauseReason): void {
  pauseReasons.delete(reason)

  if (pauseReasons.size === 0) {
    startDismissalTimer()
  }
}

function handleFocusOut(event: FocusEvent): void {
  const alertElement = event.currentTarget as HTMLElement

  if (event.relatedTarget instanceof Node && alertElement.contains(event.relatedTarget)) {
    return
  }

  resumeDismissal('focus')
}

function handleVisibilityChange(): void {
  if (document.hidden) {
    pauseDismissal('hidden')
  } else {
    resumeDismissal('hidden')
  }
}

onMounted(() => {
  document.addEventListener('visibilitychange', handleVisibilityChange)
  handleVisibilityChange()
})

onBeforeUnmount(() => {
  document.removeEventListener('visibilitychange', handleVisibilityChange)
  clearDismissalTimer()
})
</script>

<template>
  <article
    :class="[
      'alert pointer-events-auto grid w-full grid-cols-[auto_1fr_auto] items-start gap-3 shadow-lg sm:w-96',
      presentation.alertClass,
    ]"
    :role="presentation.role"
    aria-atomic="true"
    :data-alert-id="alert.id"
    :data-alert-severity="alert.severity"
    @mouseenter="pauseDismissal('hover')"
    @mouseleave="resumeDismissal('hover')"
    @focusin="pauseDismissal('focus')"
    @focusout="handleFocusOut"
  >
    <svg
      aria-hidden="true"
      class="mt-0.5 size-6 shrink-0"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      stroke-width="2"
    >
      <path stroke-linecap="round" stroke-linejoin="round" :d="presentation.iconPath" />
    </svg>

    <div class="min-w-0">
      <p class="font-bold">{{ presentation.label }}</p>
      <p class="break-words">{{ alert.message }}</p>
    </div>

    <button
      type="button"
      class="btn btn-circle btn-ghost btn-sm -mt-1 -mr-1"
      :aria-label="`Dismiss ${presentation.label.toLowerCase()} notification`"
      @click="dismiss"
    >
      <svg
        aria-hidden="true"
        class="size-4"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        stroke-width="2"
      >
        <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
      </svg>
    </button>
  </article>
</template>

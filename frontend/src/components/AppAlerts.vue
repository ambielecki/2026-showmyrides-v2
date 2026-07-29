<script setup lang="ts">
import AppAlert from '@/components/AppAlert.vue'
import { useAlertStore } from '@/stores/alerts'

const alertStore = useAlertStore()
</script>

<template>
  <aside
    aria-label="Notifications"
    class="toast toast-bottom toast-center pointer-events-none z-50 max-h-[calc(100dvh-2rem)] w-[calc(100vw-2rem)] max-w-none gap-3 overflow-y-auto bottom-[max(1rem,env(safe-area-inset-bottom))] sm:toast-end sm:w-auto sm:max-w-md"
  >
    <TransitionGroup
      enter-active-class="transition duration-200 motion-reduce:transition-none"
      enter-from-class="translate-y-2 opacity-0 motion-reduce:transform-none"
      leave-active-class="transition duration-200 motion-reduce:transition-none"
      leave-to-class="translate-y-2 opacity-0 motion-reduce:transform-none"
      move-class="transition-transform duration-200 motion-reduce:transition-none"
    >
      <AppAlert
        v-for="alert in alertStore.alerts"
        :key="alert.id"
        :alert="alert"
        @dismiss="alertStore.dismiss"
      />
    </TransitionGroup>
  </aside>
</template>

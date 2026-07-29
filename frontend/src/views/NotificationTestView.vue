<script setup lang="ts">
import { useAlertStore } from '@/stores/alerts'

const alertStore = useAlertStore()
</script>

<template>
  <section class="mx-auto w-full max-w-3xl px-4 py-8 md:px-8">
    <div class="space-y-3">
      <p class="text-primary text-sm font-bold tracking-wider uppercase">Manual testing</p>
      <h1 class="text-3xl font-extrabold">Notifications</h1>
      <p class="text-base-content/75 max-w-2xl">
        Create each notification type to verify its color, icon, text, stacking, dismissal, and
        20-second timeout.
      </p>
    </div>

    <div class="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
      <button
        type="button"
        class="btn btn-success"
        @click="alertStore.success('Your changes were saved successfully.')"
      >
        Create success alert
      </button>
      <button
        type="button"
        class="btn btn-warning"
        @click="alertStore.warning('Review the ride details before continuing.')"
      >
        Create warning alert
      </button>
      <button
        type="button"
        class="btn btn-error"
        @click="alertStore.error('The ride could not be saved. Please try again.')"
      >
        Create error alert
      </button>
    </div>
  </section>
</template>

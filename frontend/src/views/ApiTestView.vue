<script setup lang="ts">
import { ref } from 'vue'

import { HttpError, httpService } from '@/services/http'
import { useAlertStore } from '@/stores/alerts'

interface DiagnosticResponse {
  message: string
  authenticated: boolean
}

const alertStore = useAlertStore()
const result = ref('No request has been made.')
const activeRequest = ref<'authenticated' | 'public' | null>(null)

async function callEndpoint(endpoint: 'authenticated' | 'public'): Promise<void> {
  activeRequest.value = endpoint

  try {
    const response = await httpService.get<DiagnosticResponse>(`/api/test/${endpoint}`)
    result.value = response.message
    alertStore.success(response.message)
  } catch (error: unknown) {
    if (error instanceof HttpError && error.status === 401) {
      result.value = 'Authentication is required for that request.'
      alertStore.warning('Log in before calling the authenticated API.')
    } else {
      result.value = 'The request failed.'
      alertStore.error('Something Went Wrong')
    }
  } finally {
    activeRequest.value = null
  }
}
</script>

<template>
  <section class="mx-auto w-full max-w-3xl px-4 py-8 md:px-8">
    <div class="space-y-3">
      <p class="text-primary text-sm font-bold tracking-wider uppercase">Manual testing</p>
      <h1 class="text-3xl font-extrabold">API Requests</h1>
      <p class="text-base-content/75 max-w-2xl">
        Exercise public and Sanctum-protected backend requests from the local frontend.
      </p>
    </div>

    <div class="mt-8 flex flex-col gap-3 sm:flex-row">
      <button
        type="button"
        class="btn"
        :disabled="activeRequest !== null"
        @click="callEndpoint('public')"
      >
        Call public API
      </button>
      <button
        type="button"
        class="btn"
        :disabled="activeRequest !== null"
        @click="callEndpoint('authenticated')"
      >
        Call authenticated API
      </button>
    </div>

    <div class="card card-border bg-base-100 mt-8 shadow-md">
      <div class="card-body">
        <h2 class="card-title">Latest result</h2>
        <p aria-live="polite">{{ result }}</p>
      </div>
    </div>
  </section>
</template>

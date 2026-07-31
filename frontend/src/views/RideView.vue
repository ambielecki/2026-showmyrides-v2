<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import DeleteRideDialog from '@/components/DeleteRideDialog.vue'
import EditRideDialog from '@/components/EditRideDialog.vue'
import RideMap from '@/components/RideMap.vue'
import { rideService } from '@/services/rides'
import { useAlertStore } from '@/stores/alerts'
import type { Ride } from '@/types/rides'
import { formatDistance, formatDuration, formatRideDate, isRideProcessing } from '@/utils/rides'

const route = useRoute()
const router = useRouter()
const alertStore = useAlertStore()
const ride = ref<Ride | null>(null)
const isLoading = ref(true)
const showEditDialog = ref(false)
const showDeleteDialog = ref(false)
let pollTimer: number | undefined

const rideId = computed(() => String(route.params.rideId))

async function loadRide(quiet = false): Promise<void> {
  if (!quiet) isLoading.value = true
  try {
    ride.value = await rideService.get(rideId.value)
    schedulePolling()
  } catch {
    alertStore.error('Something Went Wrong')
  } finally {
    if (!quiet) isLoading.value = false
  }
}

function schedulePolling(): void {
  window.clearTimeout(pollTimer)
  if (!ride.value || !isRideProcessing(ride.value.processing_status)) return
  pollTimer = window.setTimeout(() => loadRide(true), 3000)
}

function rideSaved(updatedRide: Ride): void {
  ride.value = updatedRide
  showEditDialog.value = false
}

async function rideDeleted(): Promise<void> {
  showDeleteDialog.value = false
  await router.push({ name: 'rides' })
}

onMounted(() => loadRide())
onBeforeUnmount(() => window.clearTimeout(pollTimer))
</script>

<template>
  <section class="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 md:py-12">
    <RouterLink :to="{ name: 'rides' }" class="link text-sm">&larr; Back to rides</RouterLink>

    <div v-if="isLoading" class="flex min-h-72 items-center justify-center gap-3" role="status">
      <span class="loading loading-spinner" aria-hidden="true"></span>
      <span>Loading ride</span>
    </div>

    <template v-else-if="ride">
      <div class="mt-4 flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
        <div class="min-w-0">
          <div class="flex flex-wrap items-center gap-3">
            <h1 class="text-3xl font-extrabold sm:text-4xl">{{ ride.name }}</h1>
            <span v-if="ride.processing_status !== 'complete'" class="badge badge-lg" :class="ride.processing_status === 'failed' ? 'badge-error' : 'badge-info'">
              {{ ride.processing_status === 'failed' ? 'Processing failed' : 'Processing' }}
            </span>
          </div>
          <p class="text-base-content/70 mt-2">{{ formatRideDate(ride.ride_datetime) }} · {{ ride.location.name }}</p>
          <p v-if="ride.description" class="mt-3 max-w-3xl whitespace-pre-line">{{ ride.description }}</p>
        </div>
        <div class="flex shrink-0 gap-3">
          <button type="button" class="btn bg-white" @click="showEditDialog = true">Edit</button>
          <button type="button" class="btn btn-error btn-outline bg-white" @click="showDeleteDialog = true">Delete</button>
        </div>
      </div>

      <div v-if="isRideProcessing(ride.processing_status)" class="alert alert-info mt-8" role="status">
        <span class="loading loading-spinner loading-sm" aria-hidden="true"></span>
        <span>Your FIT file is being processed. This page will update automatically.</span>
      </div>

      <div v-else-if="ride.processing_status === 'failed'" class="alert alert-error mt-8" role="alert">
        <span>{{ ride.processing_error ?? 'This FIT file could not be processed.' }}</span>
      </div>

      <div v-else class="mt-8 grid items-start gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(18rem,1fr)]">
        <div class="card card-border bg-base-100 overflow-hidden shadow-md">
          <div class="card-body p-3 sm:p-5">
            <RideMap
              v-if="ride.route_data"
              :location="ride.location"
              :route-data="ride.route_data"
              :ride-name="ride.name"
            />
            <div v-else class="flex min-h-80 items-center justify-center p-8 text-center">
              <div>
                <h2 class="text-xl font-bold">No GPS route available</h2>
                <p class="text-base-content/70 mt-2">This activity was processed successfully but did not contain enough GPS points for a map.</p>
              </div>
            </div>
          </div>
        </div>

        <aside class="card card-border bg-base-100 shadow-md" aria-labelledby="ride-stats-title">
          <div class="card-body">
            <h2 id="ride-stats-title" class="card-title text-2xl">Ride details</h2>
            <dl class="mt-3 divide-y divide-base-300">
              <div class="flex justify-between gap-4 py-3"><dt class="text-base-content/65">Distance</dt><dd class="font-bold">{{ formatDistance(ride.distance) }}</dd></div>
              <div class="flex justify-between gap-4 py-3"><dt class="text-base-content/65">Moving time</dt><dd class="font-bold">{{ formatDuration(ride.moving_time) }}</dd></div>
              <div class="flex justify-between gap-4 py-3"><dt class="text-base-content/65">Total time</dt><dd class="font-bold">{{ formatDuration(ride.total_time) }}</dd></div>
              <div class="flex justify-between gap-4 py-3"><dt class="text-base-content/65">Average speed</dt><dd class="font-bold">{{ ride.average_speed === null ? '—' : `${ride.average_speed.toFixed(2)} mph` }}</dd></div>
              <div class="flex justify-between gap-4 py-3"><dt class="text-base-content/65">Maximum speed</dt><dd class="font-bold">{{ ride.max_speed === null ? '—' : `${ride.max_speed.toFixed(2)} mph` }}</dd></div>
            </dl>
          </div>
        </aside>
      </div>

      <EditRideDialog v-if="showEditDialog" :ride="ride" @close="showEditDialog = false" @saved="rideSaved" />
      <DeleteRideDialog v-if="showDeleteDialog" :ride="ride" @close="showDeleteDialog = false" @deleted="rideDeleted" />
    </template>
  </section>
</template>

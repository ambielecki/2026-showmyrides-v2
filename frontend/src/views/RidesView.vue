<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'

import { rideService } from '@/services/rides'
import { useAlertStore } from '@/stores/alerts'
import type {
  PaginatedRides,
  RideLocation,
  RidePageSize,
  RideRange,
  RideSummary,
} from '@/types/rides'
import { formatDistance, formatDuration, formatRideDate, isRideProcessing } from '@/utils/rides'

const alertStore = useAlertStore()
const rides = ref<RideSummary[]>([])
const locations = ref<RideLocation[]>([])
const locationFilter = ref('')
const rangeFilter = ref<RideRange>('all')
const pageSize = ref<RidePageSize>(10)
const currentPage = ref(1)
const lastPage = ref(1)
const total = ref(0)
const isLoading = ref(true)
let pollTimer: number | undefined

const hasProcessingRides = computed(() => rides.value.some((ride) => isRideProcessing(ride.processing_status)))

function applyResponse(response: PaginatedRides): void {
  rides.value = response.data
  currentPage.value = response.meta.current_page
  lastPage.value = response.meta.last_page
  total.value = response.meta.total
  schedulePolling()
}

async function loadRides(page = currentPage.value, quiet = false): Promise<void> {
  if (!quiet) isLoading.value = true
  try {
    applyResponse(await rideService.list({
      location: locationFilter.value,
      range: rangeFilter.value,
      perPage: pageSize.value,
      page,
    }))
  } catch {
    alertStore.error('Something Went Wrong')
  } finally {
    if (!quiet) isLoading.value = false
  }
}

function schedulePolling(): void {
  window.clearTimeout(pollTimer)
  if (!hasProcessingRides.value) return
  pollTimer = window.setTimeout(async () => {
    await loadRides(currentPage.value, true)
  }, 3000)
}

function applyFilters(): void {
  void loadRides(1)
}

function statusLabel(status: RideSummary['processing_status']): string {
  return status.charAt(0).toUpperCase() + status.slice(1)
}

onMounted(async () => {
  try {
    const [, options] = await Promise.all([loadRides(1), rideService.locations()])
    locations.value = options
  } catch {
    alertStore.error('Something Went Wrong')
  }
})

onBeforeUnmount(() => window.clearTimeout(pollTimer))
</script>

<template>
  <section class="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 md:py-12">
    <div class="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h1 class="text-3xl font-extrabold">Rides</h1>
        <p class="text-base-content/70 mt-2">Browse your uploaded activities and route maps.</p>
      </div>
      <RouterLink :to="{ name: 'add-ride' }" class="btn btn-primary">Add ride</RouterLink>
    </div>

    <form
      class="card card-border bg-base-100 mt-8 grid gap-4 p-5 shadow-sm sm:grid-cols-3"
      aria-label="Ride filters"
      @submit.prevent="applyFilters"
    >
      <fieldset class="fieldset">
        <label for="ride-location-filter" class="fieldset-legend">Location</label>
        <select id="ride-location-filter" v-model="locationFilter" class="select bg-white w-full">
          <option value="">All locations</option>
          <option v-for="location in locations" :key="location.external_id" :value="location.external_id">
            {{ location.name }}
          </option>
        </select>
      </fieldset>
      <fieldset class="fieldset">
        <label for="ride-range-filter" class="fieldset-legend">Date range</label>
        <select id="ride-range-filter" v-model="rangeFilter" class="select bg-white w-full">
          <option value="all">All rides</option>
          <option value="week">Last week</option>
          <option value="month">Last month</option>
          <option value="year">Last year</option>
        </select>
      </fieldset>
      <fieldset class="fieldset">
        <label for="ride-page-size" class="fieldset-legend">Rides per page</label>
        <div class="flex gap-3">
          <select id="ride-page-size" v-model="pageSize" class="select bg-white min-w-24 flex-1">
            <option :value="10">10</option>
            <option :value="25">25</option>
            <option :value="50">50</option>
          </select>
          <button type="submit" class="btn">Apply</button>
        </div>
      </fieldset>
    </form>

    <div v-if="isLoading" class="flex min-h-72 items-center justify-center gap-3" role="status">
      <span class="loading loading-spinner" aria-hidden="true"></span>
      <span>Loading rides</span>
    </div>

    <div v-else-if="rides.length === 0" class="card card-border bg-base-100 mt-8 shadow-md">
      <div class="card-body items-center p-10 text-center">
        <h2 class="text-xl font-bold">No rides found</h2>
        <p class="text-base-content/70">Upload your first FIT activity or change the filters.</p>
        <RouterLink :to="{ name: 'add-ride' }" class="btn btn-primary mt-3">Add your first ride</RouterLink>
      </div>
    </div>

    <ul v-else class="mt-8 grid gap-5 md:grid-cols-2" aria-label="Rides">
      <li v-for="ride in rides" :key="ride.external_id">
        <article class="card card-side card-border bg-base-100 h-full overflow-hidden shadow-md">
          <div
            class="from-primary/30 to-base-300 flex w-28 shrink-0 items-center justify-center bg-gradient-to-br sm:w-40"
            aria-hidden="true"
          >
            <span class="text-4xl">🚲</span>
          </div>
          <div class="card-body min-w-0 gap-3 p-5">
            <div class="flex items-start justify-between gap-3">
              <h2 class="card-title min-w-0">
                <RouterLink
                  :to="{ name: 'ride-detail', params: { rideId: ride.external_id } }"
                  class="link link-hover truncate"
                >
                  {{ ride.name }}
                </RouterLink>
              </h2>
              <span
                v-if="ride.processing_status !== 'complete'"
                class="badge shrink-0"
                :class="ride.processing_status === 'failed' ? 'badge-error' : 'badge-info'"
              >
                {{ statusLabel(ride.processing_status) }}
              </span>
            </div>
            <p class="text-base-content/65 text-sm">{{ formatRideDate(ride.ride_datetime) }}</p>
            <p v-if="ride.description" class="line-clamp-2 text-sm">{{ ride.description }}</p>
            <dl class="mt-auto grid grid-cols-2 gap-x-4 gap-y-1 text-sm">
              <dt class="text-base-content/65">Distance</dt>
              <dd class="font-semibold">{{ formatDistance(ride.distance) }}</dd>
              <dt class="text-base-content/65">Moving time</dt>
              <dd class="font-semibold">{{ formatDuration(ride.moving_time) }}</dd>
              <dt class="text-base-content/65">Location</dt>
              <dd class="font-semibold">{{ ride.location.name }}</dd>
            </dl>
          </div>
        </article>
      </li>
    </ul>

    <div v-if="!isLoading && total > 0" class="mt-7 flex flex-col items-center justify-between gap-3 sm:flex-row">
      <p class="text-base-content/70 text-sm">{{ total }} {{ total === 1 ? 'ride' : 'rides' }}</p>
      <nav class="join" aria-label="Ride pages">
        <button type="button" class="btn join-item" :disabled="currentPage <= 1" @click="loadRides(currentPage - 1)">Previous</button>
        <span class="btn join-item pointer-events-none" aria-current="page">Page {{ currentPage }} of {{ lastPage }}</span>
        <button type="button" class="btn join-item" :disabled="currentPage >= lastPage" @click="loadRides(currentPage + 1)">Next</button>
      </nav>
    </div>
  </section>
</template>

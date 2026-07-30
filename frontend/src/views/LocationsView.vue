<script setup lang="ts">
import { onMounted, ref } from 'vue'

import LocationDialog from '@/components/LocationDialog.vue'
import { locationService } from '@/services/locations'
import { useAlertStore } from '@/stores/alerts'
import type { Location, PaginatedLocations } from '@/types/locations'

const alertStore = useAlertStore()
const locations = ref<Location[]>([])
const currentPage = ref(1)
const lastPage = ref(1)
const total = ref(0)
const isLoading = ref(true)
const selectedLocation = ref<Location | null>(null)
const isDialogOpen = ref(false)

function formatCoordinate(coordinate: number): string {
  return coordinate.toFixed(6)
}

async function loadLocations(page = currentPage.value): Promise<void> {
  isLoading.value = true

  try {
    const response: PaginatedLocations = await locationService.list(page)
    locations.value = response.data
    currentPage.value = response.meta.current_page
    lastPage.value = response.meta.last_page
    total.value = response.meta.total
  } catch {
    alertStore.error('Something Went Wrong')
  } finally {
    isLoading.value = false
  }
}

function openAddDialog(): void {
  selectedLocation.value = null
  isDialogOpen.value = true
}

function openEditDialog(location: Location): void {
  selectedLocation.value = location
  isDialogOpen.value = true
}

function closeDialog(): void {
  isDialogOpen.value = false
  selectedLocation.value = null
}

async function handleSaved(_location: Location, isNew: boolean): Promise<void> {
  await loadLocations(isNew ? 1 : currentPage.value)
}

onMounted(() => loadLocations())
</script>

<template>
  <section class="mx-auto w-full max-w-5xl px-4 py-8 sm:px-6 md:py-12">
    <div class="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
      <div class="space-y-3">
        <RouterLink :to="{ name: 'settings' }" class="link text-sm">
          &larr; Back to settings
        </RouterLink>
        <h1 class="text-3xl font-extrabold">Locations</h1>
        <p class="text-base-content/75 max-w-2xl">
          Manage the parks, forests, and trail systems available for your rides.
        </p>
      </div>
      <button type="button" class="btn btn-primary sm:self-auto" @click="openAddDialog">
        Add location
      </button>
    </div>

    <div class="card card-border bg-base-100 mt-8 shadow-md">
      <div class="card-body p-0 sm:p-6">
        <div
          v-if="isLoading"
          class="flex min-h-56 items-center justify-center gap-3"
          role="status"
        >
          <span class="loading loading-spinner" aria-hidden="true"></span>
          <span>Loading locations</span>
        </div>

        <div v-else-if="locations.length === 0" class="p-8 text-center sm:p-12">
          <h2 class="text-xl font-bold">No locations yet</h2>
          <p class="text-base-content/70 mt-2">
            Add the first place where you ride.
          </p>
          <button type="button" class="btn mt-5" @click="openAddDialog">
            Add your first location
          </button>
        </div>

        <template v-else>
          <div class="hidden overflow-x-auto sm:block">
            <table class="table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Latitude</th>
                  <th>Longitude</th>
                  <th><span class="sr-only">Actions</span></th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="location in locations" :key="location.external_id">
                  <th scope="row">{{ location.name }}</th>
                  <td class="font-mono">{{ formatCoordinate(location.latitude) }}</td>
                  <td class="font-mono">{{ formatCoordinate(location.longitude) }}</td>
                  <td class="text-right">
                    <button
                      type="button"
                      class="btn btn-sm"
                      :aria-label="`Edit ${location.name}`"
                      @click="openEditDialog(location)"
                    >
                      Edit
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <ul class="list sm:hidden">
            <li
              v-for="location in locations"
              :key="location.external_id"
              class="list-row border-base-300 border-b last:border-b-0"
            >
              <div class="list-col-grow space-y-2">
                <h2 class="font-bold">{{ location.name }}</h2>
                <dl class="grid grid-cols-[auto_1fr] gap-x-3 gap-y-1 text-sm">
                  <dt class="text-base-content/65">Latitude</dt>
                  <dd class="font-mono">{{ formatCoordinate(location.latitude) }}</dd>
                  <dt class="text-base-content/65">Longitude</dt>
                  <dd class="font-mono">{{ formatCoordinate(location.longitude) }}</dd>
                </dl>
              </div>
              <button
                type="button"
                class="btn btn-sm self-center"
                :aria-label="`Edit ${location.name}`"
                @click="openEditDialog(location)"
              >
                Edit
              </button>
            </li>
          </ul>
        </template>
      </div>
    </div>

    <div
      v-if="!isLoading && total > 0"
      class="mt-6 flex flex-col items-center justify-between gap-3 sm:flex-row"
    >
      <p class="text-base-content/70 text-sm">
        {{ total }} {{ total === 1 ? 'location' : 'locations' }}
      </p>
      <nav class="join" aria-label="Location pages">
        <button
          type="button"
          class="btn join-item"
          :disabled="currentPage <= 1"
          @click="loadLocations(currentPage - 1)"
        >
          Previous
        </button>
        <span class="btn join-item pointer-events-none" aria-current="page">
          Page {{ currentPage }} of {{ lastPage }}
        </span>
        <button
          type="button"
          class="btn join-item"
          :disabled="currentPage >= lastPage"
          @click="loadLocations(currentPage + 1)"
        >
          Next
        </button>
      </nav>
    </div>

    <LocationDialog
      v-if="isDialogOpen"
      :location="selectedLocation"
      @close="closeDialog"
      @saved="handleSaved"
    />
  </section>
</template>

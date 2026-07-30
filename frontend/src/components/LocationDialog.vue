<script setup lang="ts">
import { computed, nextTick, onMounted, ref } from 'vue'

import LocationMap from '@/components/LocationMap.vue'
import { HttpError, type ValidationErrors } from '@/services/http'
import { locationService } from '@/services/locations'
import { useAlertStore } from '@/stores/alerts'
import type {
  Location,
  LocationInput,
  LocationSearchResult,
} from '@/types/locations'

const props = defineProps<{
  location?: Location | null
}>()

const emit = defineEmits<{
  close: []
  saved: [location: Location, isNew: boolean]
}>()

const alertStore = useAlertStore()
const dialog = ref<HTMLDialogElement | null>(null)
const name = ref(props.location?.name ?? '')
const latitude = ref(props.location ? props.location.latitude.toFixed(6) : '')
const longitude = ref(props.location ? props.location.longitude.toFixed(6) : '')
const searchQuery = ref('')
const searchResults = ref<LocationSearchResult[]>([])
const searchMessage = ref('')
const validationErrors = ref<ValidationErrors>({})
const isSearching = ref(false)
const isSaving = ref(false)

const isEditing = computed(() => props.location !== null && props.location !== undefined)
const parsedLatitude = computed(() => parseCoordinate(latitude.value, -90, 90))
const parsedLongitude = computed(() => parseCoordinate(longitude.value, -180, 180))

function parseCoordinate(value: string, minimum: number, maximum: number): number | null {
  if (value.trim() === '') {
    return null
  }

  const coordinate = Number(value)

  return Number.isFinite(coordinate) && coordinate >= minimum && coordinate <= maximum
    ? coordinate
    : null
}

function fieldError(field: string): string | undefined {
  return validationErrors.value[field]?.[0]
}

function setCoordinates(newLatitude: number, newLongitude: number): void {
  latitude.value = newLatitude.toFixed(6)
  longitude.value = newLongitude.toFixed(6)
  validationErrors.value = {
    ...validationErrors.value,
    latitude: [],
    longitude: [],
  }
}

function selectSearchResult(result: LocationSearchResult): void {
  if (name.value.trim() === '') {
    name.value = result.name
  }

  setCoordinates(result.latitude, result.longitude)
  searchResults.value = []
  searchMessage.value = `Selected ${result.display_name}`
}

function handleCancel(event: Event): void {
  if (isSaving.value) {
    event.preventDefault()
  }
}

async function searchLocations(): Promise<void> {
  const query = searchQuery.value.trim()

  if (query.length < 3 || isSearching.value) {
    return
  }

  isSearching.value = true
  searchMessage.value = ''
  searchResults.value = []

  try {
    searchResults.value = await locationService.search(query)
    searchMessage.value =
      searchResults.value.length === 0
        ? 'No matching places were found.'
        : `${searchResults.value.length} places found.`
  } catch (error: unknown) {
    searchMessage.value =
      error instanceof HttpError ? error.message : 'Location search failed.'
    alertStore.warning(searchMessage.value)
  } finally {
    isSearching.value = false
  }
}

function validateInput(): LocationInput | null {
  const errors: ValidationErrors = {}
  const trimmedName = name.value.trim()

  if (trimmedName === '') {
    errors.name = ['Enter a location name.']
  }

  if (parsedLatitude.value === null) {
    errors.latitude = ['Enter a latitude from -90 to 90.']
  }

  if (parsedLongitude.value === null) {
    errors.longitude = ['Enter a longitude from -180 to 180.']
  }

  validationErrors.value = errors

  if (
    Object.keys(errors).length > 0 ||
    parsedLatitude.value === null ||
    parsedLongitude.value === null
  ) {
    return null
  }

  return {
    name: trimmedName,
    latitude: parsedLatitude.value,
    longitude: parsedLongitude.value,
  }
}

async function saveLocation(): Promise<void> {
  if (isSaving.value) {
    return
  }

  const input = validateInput()

  if (!input) {
    return
  }

  isSaving.value = true

  try {
    const savedLocation =
      isEditing.value && props.location
        ? await locationService.update(props.location.external_id, input)
        : await locationService.create(input)

    alertStore.success(
      isEditing.value ? 'Location updated successfully.' : 'Location added successfully.',
    )
    emit('saved', savedLocation, !isEditing.value)
    dialog.value?.close()
  } catch (error: unknown) {
    if (error instanceof HttpError && error.status === 422) {
      validationErrors.value = error.validationErrors
      return
    }

    alertStore.error('Something Went Wrong')
  } finally {
    isSaving.value = false
  }
}

onMounted(async () => {
  await nextTick()
  dialog.value?.showModal()
})
</script>

<template>
  <dialog
    ref="dialog"
    class="modal modal-bottom sm:modal-middle"
    aria-labelledby="location-dialog-title"
    @cancel="handleCancel"
    @close="emit('close')"
  >
    <div class="modal-box max-h-[calc(100vh-2rem)] max-w-3xl overflow-y-auto">
      <h2 id="location-dialog-title" class="text-2xl font-bold">
        {{ isEditing ? 'Edit location' : 'Add location' }}
      </h2>
      <p class="text-base-content/70 mt-2">
        Name the trail system and choose its map coordinates.
      </p>

      <div v-if="!isEditing" class="bg-base-200 mt-6 rounded-box p-4">
        <fieldset class="fieldset">
          <legend class="fieldset-legend">Find a place with OpenStreetMap</legend>
          <div class="flex flex-col gap-3 sm:flex-row">
            <input
              v-model="searchQuery"
              type="search"
              class="input bg-white w-full"
              placeholder="Park, forest, or trail system"
              aria-label="Search OpenStreetMap"
              aria-describedby="location-search-help location-search-status"
              @keydown.enter.prevent="searchLocations"
            />
            <button
              type="button"
              class="btn sm:self-start"
              :disabled="searchQuery.trim().length < 3 || isSearching"
              @click="searchLocations"
            >
              <span
                v-if="isSearching"
                class="loading loading-spinner loading-sm"
                aria-hidden="true"
              ></span>
              {{ isSearching ? 'Searching' : 'Search' }}
            </button>
          </div>
          <p id="location-search-help" class="label">
            Enter at least three characters, then submit the search.
          </p>
          <p id="location-search-status" class="text-base-content/75 text-sm" aria-live="polite">
            {{ searchMessage }}
          </p>
        </fieldset>

        <ul v-if="searchResults.length > 0" class="list bg-base-100 mt-3 rounded-box">
          <li v-for="result in searchResults" :key="result.display_name" class="list-row">
            <button
              type="button"
              class="hover:bg-base-200 focus-visible:outline-primary w-full rounded-field p-2 text-left focus-visible:outline-2 focus-visible:outline-offset-2"
              @click="selectSearchResult(result)"
            >
              {{ result.display_name }}
            </button>
          </li>
        </ul>

        <p class="mt-3 text-xs">
          Search data &copy;
          <a
            href="https://www.openstreetmap.org/copyright"
            class="link"
            target="_blank"
            rel="noopener noreferrer"
          >
            OpenStreetMap contributors
          </a>
        </p>
      </div>

      <form class="mt-6 space-y-5" novalidate @submit.prevent="saveLocation">
        <fieldset class="fieldset">
          <label for="location-name" class="fieldset-legend">Location name</label>
          <input
            id="location-name"
            v-model="name"
            type="text"
            class="input bg-white w-full"
            :class="{ 'input-error': fieldError('name') }"
            autocomplete="organization"
            maxlength="255"
            required
            :aria-invalid="Boolean(fieldError('name'))"
            aria-describedby="location-name-error"
          />
          <p id="location-name-error" class="text-error text-sm" aria-live="polite">
            {{ fieldError('name') }}
          </p>
        </fieldset>

        <div class="grid gap-5 sm:grid-cols-2">
          <fieldset class="fieldset">
            <label for="location-latitude" class="fieldset-legend">Latitude</label>
            <input
              id="location-latitude"
              v-model="latitude"
              type="number"
              class="input bg-white w-full"
              :class="{ 'input-error': fieldError('latitude') }"
              min="-90"
              max="90"
              step="0.000001"
              required
              :aria-invalid="Boolean(fieldError('latitude'))"
              aria-describedby="location-latitude-error"
            />
            <p id="location-latitude-error" class="text-error text-sm" aria-live="polite">
              {{ fieldError('latitude') }}
            </p>
          </fieldset>

          <fieldset class="fieldset">
            <label for="location-longitude" class="fieldset-legend">Longitude</label>
            <input
              id="location-longitude"
              v-model="longitude"
              type="number"
              class="input bg-white w-full"
              :class="{ 'input-error': fieldError('longitude') }"
              min="-180"
              max="180"
              step="0.000001"
              required
              :aria-invalid="Boolean(fieldError('longitude'))"
              aria-describedby="location-longitude-error"
            />
            <p id="location-longitude-error" class="text-error text-sm" aria-live="polite">
              {{ fieldError('longitude') }}
            </p>
          </fieldset>
        </div>

        <LocationMap
          :latitude="parsedLatitude"
          :longitude="parsedLongitude"
          @coordinates-changed="setCoordinates"
        />

        <div class="modal-action">
          <button
            type="button"
            class="btn btn-ghost"
            :disabled="isSaving"
            @click="dialog?.close()"
          >
            Cancel
          </button>
          <button type="submit" class="btn btn-primary" :disabled="isSaving">
            <span
              v-if="isSaving"
              class="loading loading-spinner loading-sm"
              aria-hidden="true"
            ></span>
            {{ isSaving ? 'Saving' : 'Save location' }}
          </button>
        </div>
      </form>
    </div>

    <form method="dialog" class="modal-backdrop">
      <button :disabled="isSaving">Close location dialog</button>
    </form>
  </dialog>
</template>

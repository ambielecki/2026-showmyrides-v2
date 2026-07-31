<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'

import { HttpError, type ValidationErrors } from '@/services/http'
import { rideService } from '@/services/rides'
import { useAlertStore } from '@/stores/alerts'
import type { RideLocation } from '@/types/rides'

const router = useRouter()
const alertStore = useAlertStore()
const locations = ref<RideLocation[]>([])
const name = ref('')
const description = ref('')
const locationExternalId = ref('')
const fitFile = ref<File | null>(null)
const validationErrors = ref<ValidationErrors>({})
const isLoadingLocations = ref(true)
const isSaving = ref(false)

function fieldError(field: string): string | undefined {
  return validationErrors.value[field]?.[0]
}

function selectFile(event: Event): void {
  fitFile.value = (event.target as HTMLInputElement).files?.[0] ?? null
  validationErrors.value.fit_file = []
}

function validate(): boolean {
  const errors: ValidationErrors = {}

  if (!name.value.trim()) errors.name = ['Enter a ride name.']
  if (!locationExternalId.value) errors.location_external_id = ['Choose a location.']
  if (!fitFile.value) errors.fit_file = ['Choose a Garmin FIT file.']
  if (fitFile.value && fitFile.value.size > 50 * 1024 * 1024) {
    errors.fit_file = ['The FIT file must be 50 MB or smaller.']
  }
  if (fitFile.value && !fitFile.value.name.toLowerCase().endsWith('.fit')) {
    errors.fit_file = ['Choose a file with the .fit extension.']
  }

  validationErrors.value = errors
  return Object.keys(errors).length === 0
}

async function submit(): Promise<void> {
  if (isSaving.value || !validate() || !fitFile.value) return

  isSaving.value = true
  try {
    await rideService.create({
      name: name.value.trim(),
      description: description.value.trim() || null,
      locationExternalId: locationExternalId.value,
      fitFile: fitFile.value,
    })
    alertStore.success('Ride uploaded. Processing has started.')
    await router.push({ name: 'rides' })
  } catch (error: unknown) {
    if (error instanceof HttpError && error.status === 422) {
      validationErrors.value = error.validationErrors
    } else {
      alertStore.error('Something Went Wrong')
    }
  } finally {
    isSaving.value = false
  }
}

onMounted(async () => {
  try {
    locations.value = await rideService.locations()
  } catch {
    alertStore.error('Something Went Wrong')
  } finally {
    isLoadingLocations.value = false
  }
})
</script>

<template>
  <section class="mx-auto w-full max-w-3xl px-4 py-8 sm:px-6 md:py-12">
    <RouterLink :to="{ name: 'rides' }" class="link text-sm">&larr; Back to rides</RouterLink>

    <div class="card card-border bg-base-100 mt-4 shadow-md">
      <div class="card-body p-6 sm:p-8">
        <div>
          <h1 class="text-3xl font-extrabold">Add ride</h1>
          <p class="text-base-content/70 mt-2">
            Upload a Garmin FIT activity. The ride will appear while its details are processed.
          </p>
        </div>

        <form class="mt-6 space-y-5" novalidate @submit.prevent="submit">
          <fieldset class="fieldset">
            <label for="ride-name" class="fieldset-legend">Ride name</label>
            <input
              id="ride-name"
              v-model="name"
              type="text"
              class="input bg-white w-full"
              maxlength="255"
              required
              :aria-invalid="Boolean(fieldError('name'))"
              :aria-describedby="fieldError('name') ? 'ride-name-error' : undefined"
            />
            <p v-if="fieldError('name')" id="ride-name-error" class="text-error text-sm">
              {{ fieldError('name') }}
            </p>
          </fieldset>

          <fieldset class="fieldset">
            <label for="ride-description" class="fieldset-legend">Description (optional)</label>
            <textarea
              id="ride-description"
              v-model="description"
              class="textarea bg-white min-h-28 w-full"
              maxlength="10000"
            ></textarea>
          </fieldset>

          <fieldset class="fieldset">
            <label for="ride-location" class="fieldset-legend">Location</label>
            <select
              id="ride-location"
              v-model="locationExternalId"
              class="select bg-white w-full"
              required
              :disabled="isLoadingLocations"
              :aria-invalid="Boolean(fieldError('location_external_id'))"
            >
              <option value="" disabled>
                {{ isLoadingLocations ? 'Loading locations…' : 'Choose a location' }}
              </option>
              <option
                v-for="location in locations"
                :key="location.external_id"
                :value="location.external_id"
              >
                {{ location.name }}
              </option>
            </select>
            <p v-if="fieldError('location_external_id')" class="text-error text-sm">
              {{ fieldError('location_external_id') }}
            </p>
          </fieldset>

          <fieldset class="fieldset">
            <label for="ride-file" class="fieldset-legend">Garmin FIT file</label>
            <input
              id="ride-file"
              type="file"
              class="file-input bg-white w-full"
              accept=".fit"
              required
              :aria-invalid="Boolean(fieldError('fit_file'))"
              aria-describedby="ride-file-help"
              @change="selectFile"
            />
            <p id="ride-file-help" class="label">FIT activity files up to 50 MB.</p>
            <p v-if="fieldError('fit_file')" class="text-error text-sm">
              {{ fieldError('fit_file') }}
            </p>
          </fieldset>

          <div class="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <RouterLink :to="{ name: 'rides' }" class="btn">Cancel</RouterLink>
            <button type="submit" class="btn btn-primary" :disabled="isSaving">
              <span v-if="isSaving" class="loading loading-spinner loading-sm" aria-hidden="true"></span>
              {{ isSaving ? 'Uploading' : 'Upload ride' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </section>
</template>

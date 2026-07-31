<script setup lang="ts">
import { nextTick, onMounted, ref } from 'vue'

import { HttpError, type ValidationErrors } from '@/services/http'
import { rideService } from '@/services/rides'
import { useAlertStore } from '@/stores/alerts'
import type { Ride } from '@/types/rides'

const props = defineProps<{ ride: Ride }>()
const emit = defineEmits<{ close: []; saved: [ride: Ride] }>()
const alertStore = useAlertStore()
const dialog = ref<HTMLDialogElement | null>(null)
const name = ref(props.ride.name)
const description = ref(props.ride.description ?? '')
const errors = ref<ValidationErrors>({})
const isSaving = ref(false)

async function save(): Promise<void> {
  if (isSaving.value) return
  if (!name.value.trim()) {
    errors.value = { name: ['Enter a ride name.'] }
    return
  }

  isSaving.value = true
  try {
    const ride = await rideService.update(props.ride.external_id, {
      name: name.value.trim(),
      description: description.value.trim() || null,
    })
    alertStore.success('Ride updated successfully.')
    emit('saved', ride)
    dialog.value?.close()
  } catch (error: unknown) {
    if (error instanceof HttpError && error.status === 422) errors.value = error.validationErrors
    else alertStore.error('Something Went Wrong')
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
  <dialog ref="dialog" class="modal modal-bottom sm:modal-middle" aria-labelledby="edit-ride-title" @close="emit('close')">
    <div class="modal-box">
      <h2 id="edit-ride-title" class="text-2xl font-bold">Edit ride</h2>
      <form class="mt-6 space-y-5" novalidate @submit.prevent="save">
        <fieldset class="fieldset">
          <label for="edit-ride-name" class="fieldset-legend">Ride name</label>
          <input id="edit-ride-name" v-model="name" class="input bg-white w-full" maxlength="255" />
          <p v-if="errors.name?.[0]" class="text-error text-sm">{{ errors.name[0] }}</p>
        </fieldset>
        <fieldset class="fieldset">
          <label for="edit-ride-description" class="fieldset-legend">Description (optional)</label>
          <textarea id="edit-ride-description" v-model="description" class="textarea bg-white min-h-28 w-full" maxlength="10000"></textarea>
        </fieldset>
        <div class="modal-action">
          <button type="button" class="btn" :disabled="isSaving" @click="dialog?.close()">Cancel</button>
          <button type="submit" class="btn btn-primary" :disabled="isSaving">
            <span v-if="isSaving" class="loading loading-spinner loading-sm" aria-hidden="true"></span>
            Save
          </button>
        </div>
      </form>
    </div>
    <form method="dialog" class="modal-backdrop"><button :disabled="isSaving">Close</button></form>
  </dialog>
</template>

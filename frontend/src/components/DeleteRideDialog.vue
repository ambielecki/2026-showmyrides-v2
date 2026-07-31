<script setup lang="ts">
import { nextTick, onMounted, ref } from 'vue'

import { rideService } from '@/services/rides'
import { useAlertStore } from '@/stores/alerts'
import type { Ride } from '@/types/rides'

const props = defineProps<{ ride: Ride }>()
const emit = defineEmits<{ close: []; deleted: [] }>()
const alertStore = useAlertStore()
const dialog = ref<HTMLDialogElement | null>(null)
const isDeleting = ref(false)

async function remove(): Promise<void> {
  if (isDeleting.value) return
  isDeleting.value = true
  try {
    await rideService.delete(props.ride.external_id)
    alertStore.success('Ride deleted successfully.')
    emit('deleted')
    dialog.value?.close()
  } catch {
    alertStore.error('Something Went Wrong')
    isDeleting.value = false
  }
}

onMounted(async () => {
  await nextTick()
  dialog.value?.showModal()
})
</script>

<template>
  <dialog ref="dialog" class="modal modal-bottom sm:modal-middle" aria-labelledby="delete-ride-title" @close="emit('close')">
    <div class="modal-box">
      <h2 id="delete-ride-title" class="text-2xl font-bold">Delete ride?</h2>
      <p class="mt-3">This permanently removes <strong>{{ ride.name }}</strong> and its route data.</p>
      <div class="modal-action">
        <button type="button" class="btn" :disabled="isDeleting" @click="dialog?.close()">Cancel</button>
        <button type="button" class="btn btn-error" :disabled="isDeleting" @click="remove">
          <span v-if="isDeleting" class="loading loading-spinner loading-sm" aria-hidden="true"></span>
          Delete ride
        </button>
      </div>
    </div>
    <form method="dialog" class="modal-backdrop"><button :disabled="isDeleting">Close</button></form>
  </dialog>
</template>

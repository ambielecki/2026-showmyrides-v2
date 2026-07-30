<script setup lang="ts">
import { reactive, ref } from 'vue'
import { useRouter } from 'vue-router'

import { HttpError, type ValidationErrors } from '@/services/http'
import { useAlertStore } from '@/stores/alerts'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const alertStore = useAlertStore()
const authStore = useAuthStore()
const isSubmitting = ref(false)
const validationErrors = ref<ValidationErrors>({})
const form = reactive({
  name: '',
  email: '',
  password: '',
  password_confirmation: '',
})

function fieldError(field: keyof typeof form): string | undefined {
  return validationErrors.value[field]?.[0]
}

async function submit(): Promise<void> {
  validationErrors.value = {}
  isSubmitting.value = true

  try {
    await authStore.register(form)
    alertStore.success('Your account was created successfully.')
    await router.push({ name: 'rides' })
  } catch (error: unknown) {
    if (error instanceof HttpError && error.status === 422) {
      validationErrors.value = error.validationErrors
      alertStore.warning('Please correct the highlighted registration fields.')
    } else {
      alertStore.error('Something Went Wrong')
    }
  } finally {
    isSubmitting.value = false
  }
}
</script>

<template>
  <section class="mx-auto w-full max-w-xl px-4 py-8 md:px-8 md:py-12">
    <div class="card card-border bg-base-100 shadow-md">
      <div class="card-body gap-6">
        <div class="space-y-2">
          <p class="text-primary text-sm font-bold tracking-wider uppercase">Create an account</p>
          <h1 class="card-title text-3xl">Register</h1>
          <p class="text-base-content/75">
            Save your rides and start building a map of everywhere you have been.
          </p>
        </div>

        <form class="space-y-4" novalidate @submit.prevent="submit">
          <fieldset class="fieldset">
            <legend id="register-name-label" class="fieldset-legend">Name</legend>
            <input
              v-model="form.name"
              name="name"
              type="text"
              autocomplete="name"
              required
              class="input bg-white w-full"
              :class="{ 'input-error': fieldError('name') }"
              aria-labelledby="register-name-label"
              :aria-invalid="Boolean(fieldError('name'))"
              :aria-describedby="fieldError('name') ? 'register-name-error' : undefined"
            />
            <p v-if="fieldError('name')" id="register-name-error" class="text-error text-sm">
              {{ fieldError('name') }}
            </p>
          </fieldset>

          <fieldset class="fieldset">
            <legend id="register-email-label" class="fieldset-legend">Email</legend>
            <input
              v-model="form.email"
              name="email"
              type="email"
              autocomplete="email"
              required
              class="input bg-white w-full"
              :class="{ 'input-error': fieldError('email') }"
              aria-labelledby="register-email-label"
              :aria-invalid="Boolean(fieldError('email'))"
              :aria-describedby="fieldError('email') ? 'register-email-error' : undefined"
            />
            <p v-if="fieldError('email')" id="register-email-error" class="text-error text-sm">
              {{ fieldError('email') }}
            </p>
          </fieldset>

          <fieldset class="fieldset">
            <legend id="register-password-label" class="fieldset-legend">Password</legend>
            <input
              v-model="form.password"
              name="password"
              type="password"
              autocomplete="new-password"
              required
              class="input bg-white w-full"
              :class="{ 'input-error': fieldError('password') }"
              aria-labelledby="register-password-label"
              :aria-invalid="Boolean(fieldError('password'))"
              :aria-describedby="fieldError('password') ? 'register-password-error' : undefined"
            />
            <p
              v-if="fieldError('password')"
              id="register-password-error"
              class="text-error text-sm"
            >
              {{ fieldError('password') }}
            </p>
          </fieldset>

          <fieldset class="fieldset">
            <legend id="register-password-confirmation-label" class="fieldset-legend">
              Confirm password
            </legend>
            <input
              v-model="form.password_confirmation"
              name="password_confirmation"
              type="password"
              autocomplete="new-password"
              required
              class="input bg-white w-full"
              aria-labelledby="register-password-confirmation-label"
            />
          </fieldset>

          <button type="submit" class="btn btn-primary btn-block" :disabled="isSubmitting">
            <span v-if="isSubmitting" class="loading loading-spinner loading-sm"></span>
            {{ isSubmitting ? 'Creating account…' : 'Create account' }}
          </button>
        </form>

        <p class="text-center text-sm">
          Already have an account?
          <RouterLink :to="{ name: 'login' }" class="link font-semibold">Log In</RouterLink>
        </p>
      </div>
    </div>
  </section>
</template>

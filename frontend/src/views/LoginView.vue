<script setup lang="ts">
import { nextTick, reactive, ref } from 'vue'
import { useRouter } from 'vue-router'

import { HttpError, type ValidationErrors } from '@/services/http'
import { useAlertStore } from '@/stores/alerts'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const alertStore = useAlertStore()
const authStore = useAuthStore()
const step = ref<'email' | 'password'>('email')
const emailInput = ref<HTMLInputElement | null>(null)
const passwordInput = ref<HTMLInputElement | null>(null)
const isSubmitting = ref(false)
const validationErrors = ref<ValidationErrors>({})
const form = reactive({
  email: '',
  password: '',
})

function fieldError(field: keyof typeof form): string | undefined {
  return validationErrors.value[field]?.[0]
}

async function continueToPassword(): Promise<void> {
  if (!emailInput.value?.reportValidity()) {
    return
  }

  validationErrors.value = {}
  step.value = 'password'
  await nextTick()
  passwordInput.value?.focus()
}

async function returnToEmail(): Promise<void> {
  step.value = 'email'
  await nextTick()
  emailInput.value?.focus()
}

async function submit(): Promise<void> {
  if (step.value === 'email') {
    await continueToPassword()

    return
  }

  if (!passwordInput.value?.reportValidity()) {
    return
  }

  validationErrors.value = {}
  isSubmitting.value = true

  try {
    await authStore.login(form)
    await router.push({ name: 'rides' })
  } catch (error: unknown) {
    if (error instanceof HttpError && error.status === 422) {
      validationErrors.value = error.validationErrors
      alertStore.warning('The provided credentials are incorrect.')
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
          <p class="text-primary text-sm font-bold tracking-wider uppercase">
            Step {{ step === 'email' ? '1' : '2' }} of 2
          </p>
          <h1 class="card-title text-3xl">Log In</h1>
          <p class="text-base-content/75">
            {{
              step === 'email'
                ? 'Enter the email address for your account.'
                : 'Enter your password to continue.'
            }}
          </p>
        </div>

        <form class="space-y-5" novalidate @submit.prevent="submit">
          <fieldset v-if="step === 'email'" class="fieldset">
            <legend id="login-email-label" class="fieldset-legend">Email</legend>
            <input
              ref="emailInput"
              v-model="form.email"
              name="email"
              type="email"
              autocomplete="email"
              required
              class="input bg-white w-full"
              :class="{ 'input-error': fieldError('email') }"
              aria-labelledby="login-email-label"
              :aria-invalid="Boolean(fieldError('email'))"
              :aria-describedby="fieldError('email') ? 'login-email-error' : undefined"
            />
            <p v-if="fieldError('email')" id="login-email-error" class="text-error text-sm">
              {{ fieldError('email') }}
            </p>
          </fieldset>

          <template v-else>
            <div class="bg-base-200 rounded-box flex items-center justify-between gap-4 p-3">
              <span class="min-w-0 truncate font-semibold">{{ form.email }}</span>
              <button type="button" class="btn btn-ghost btn-sm" @click="returnToEmail">
                Change
              </button>
            </div>

            <fieldset class="fieldset">
              <legend id="login-password-label" class="fieldset-legend">Password</legend>
              <input
                ref="passwordInput"
                v-model="form.password"
                name="password"
                type="password"
                autocomplete="current-password"
                required
                class="input bg-white w-full"
                :class="{ 'input-error': fieldError('password') || fieldError('email') }"
                aria-labelledby="login-password-label"
                :aria-invalid="Boolean(fieldError('password') || fieldError('email'))"
                :aria-describedby="
                  fieldError('password') || fieldError('email') ? 'login-password-error' : undefined
                "
              />
              <p
                v-if="fieldError('password') || fieldError('email')"
                id="login-password-error"
                class="text-error text-sm"
              >
                {{ fieldError('password') ?? fieldError('email') }}
              </p>
            </fieldset>
          </template>

          <button
            type="submit"
            class="btn btn-primary btn-block"
            :disabled="isSubmitting"
          >
            <span v-if="isSubmitting" class="loading loading-spinner loading-sm"></span>
            {{
              isSubmitting ? 'Logging in…' : step === 'email' ? 'Continue' : 'Log In'
            }}
          </button>
        </form>

        <p class="text-center text-sm">
          Need an account?
          <RouterLink :to="{ name: 'register' }" class="link font-semibold">Register</RouterLink>
        </p>
      </div>
    </div>
  </section>
</template>

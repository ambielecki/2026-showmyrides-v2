<script setup lang="ts">
import { nextTick, ref } from 'vue'
import { storeToRefs } from 'pinia'
import { useRouter } from 'vue-router'

import AppAlerts from '@/components/AppAlerts.vue'
import AppFooter from '@/components/AppFooter.vue'
import AppMobileDrawer from '@/components/AppMobileDrawer.vue'
import AppNavbar from '@/components/AppNavbar.vue'
import { useAlertStore } from '@/stores/alerts'
import { useAuthStore } from '@/stores/auth'

const drawerToggleId = 'mobile-navigation-toggle'
const router = useRouter()
const alertStore = useAlertStore()
const authStore = useAuthStore()
const { isAdmin, isAuthenticated } = storeToRefs(authStore)
const isDrawerOpen = ref(false)
const isLoggingOut = ref(false)
const navbar = ref<{ focusMenuButton: () => void } | null>(null)

function openDrawer(): void {
  isDrawerOpen.value = true
}

async function closeDrawer(): Promise<void> {
  if (!isDrawerOpen.value) {
    return
  }

  isDrawerOpen.value = false
  await nextTick()
  navbar.value?.focusMenuButton()
}

async function handleLogout(): Promise<void> {
  if (isLoggingOut.value) {
    return
  }

  isLoggingOut.value = true

  try {
    await authStore.logout()
    alertStore.success('You have been logged out.')
    await router.push({ name: 'home' })
  } catch {
    alertStore.error('Something Went Wrong')
  } finally {
    isLoggingOut.value = false
  }
}

</script>

<template>
  <a
    href="#main-content"
    class="btn btn-sm fixed top-2 left-2 z-[60] -translate-y-20 focus:translate-y-0"
  >
    Skip to main content
  </a>

  <AppAlerts />

  <div class="drawer drawer-end">
    <input
      :id="drawerToggleId"
      v-model="isDrawerOpen"
      type="checkbox"
      class="drawer-toggle"
      tabindex="-1"
      aria-hidden="true"
    />

    <div class="drawer-content bg-base-100 flex min-h-screen flex-col">
      <AppNavbar
        ref="navbar"
        :is-authenticated="isAuthenticated"
        :is-admin="isAdmin"
        :is-logging-out="isLoggingOut"
        :drawer-open="isDrawerOpen"
        @logout="handleLogout"
        @open-drawer="openDrawer"
      />

      <main id="main-content" class="flex-1 pt-16" tabindex="-1">
        <RouterView />
      </main>

      <AppFooter />
    </div>

    <AppMobileDrawer
      :is-open="isDrawerOpen"
      :is-authenticated="isAuthenticated"
      :is-admin="isAdmin"
      :is-logging-out="isLoggingOut"
      :toggle-id="drawerToggleId"
      @close="closeDrawer"
      @logout="handleLogout"
    />
  </div>
</template>

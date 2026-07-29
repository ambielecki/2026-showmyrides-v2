<script setup lang="ts">
import { nextTick, ref } from 'vue'

import AppAlerts from '@/components/AppAlerts.vue'
import AppFooter from '@/components/AppFooter.vue'
import AppMobileDrawer from '@/components/AppMobileDrawer.vue'
import AppNavbar from '@/components/AppNavbar.vue'

const drawerToggleId = 'mobile-navigation-toggle'
const isDrawerOpen = ref(false)
const isAuthenticated = ref(false)
const isAdmin = ref(false)
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

function handleLogout(): void {
  isAuthenticated.value = false
  isAdmin.value = false
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
      :toggle-id="drawerToggleId"
      @close="closeDrawer"
      @logout="handleLogout"
    />
  </div>
</template>

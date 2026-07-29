<script setup lang="ts">
import { computed, ref } from 'vue'
import { RouterLink } from 'vue-router'

import { getNavigationItems } from '@/data/navigation'

const props = withDefaults(
  defineProps<{
    isAuthenticated: boolean
    isAdmin: boolean
    isLoggingOut?: boolean
    drawerOpen: boolean
  }>(),
  {
    isLoggingOut: false,
  },
)

const emit = defineEmits<{
  logout: []
  openDrawer: []
}>()

const menuButton = ref<HTMLButtonElement | null>(null)
const navigationItems = computed(() =>
  getNavigationItems(props.isAuthenticated, props.isAdmin),
)

function focusMenuButton(): void {
  menuButton.value?.focus()
}

defineExpose({ focusMenuButton })
</script>

<template>
  <header
    class="navbar bg-base-100/95 border-base-300 fixed top-0 z-40 min-h-16 w-full border-b px-4 shadow-sm backdrop-blur-sm md:px-8"
  >
    <div class="navbar-start">
      <RouterLink
        :to="{ name: 'home' }"
        class="btn btn-ghost text-primary px-2 text-lg font-extrabold"
      >
        ShowMyRides
      </RouterLink>
    </div>

    <div class="navbar-end">
      <nav aria-label="Primary navigation" class="hidden md:block">
        <ul class="menu menu-horizontal items-center gap-1 p-0">
          <li v-for="item in navigationItems" :key="item.routeName">
            <RouterLink
              :to="{ name: item.routeName }"
              active-class="menu-active"
              class="font-semibold"
              :class="{ 'btn btn-sm': !isAuthenticated }"
            >
              {{ item.label }}
            </RouterLink>
          </li>
          <li v-if="isAuthenticated">
            <button
              type="button"
              class="font-semibold"
              :disabled="isLoggingOut"
              @click="emit('logout')"
            >
              {{ isLoggingOut ? 'Logging Out…' : 'Log Out' }}
            </button>
          </li>
        </ul>
      </nav>

      <button
        ref="menuButton"
        type="button"
        class="btn btn-ghost btn-square drawer-button md:hidden"
        aria-label="Open navigation"
        aria-controls="mobile-navigation"
        :aria-expanded="drawerOpen"
        @click="emit('openDrawer')"
      >
        <svg
          aria-hidden="true"
          class="size-6"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          stroke-width="2"
        >
          <path stroke-linecap="round" d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>
    </div>
  </header>
</template>

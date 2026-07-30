<script setup lang="ts">
import { computed, ref } from 'vue'
import { RouterLink } from 'vue-router'

import {
  getAccountNavigationItems,
  getPrimaryNavigationItems,
} from '@/data/navigation'

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
const primaryNavigationItems = computed(() =>
  getPrimaryNavigationItems(props.isAuthenticated, props.isAdmin),
)
const accountNavigationItems = computed(() =>
  getAccountNavigationItems(props.isAuthenticated),
)

function focusMenuButton(): void {
  menuButton.value?.focus()
}

defineExpose({ focusMenuButton })
</script>

<template>
  <header
    class="navbar bg-neutral text-neutral-content border-neutral-content/20 fixed top-0 z-40 min-h-16 w-full border-b px-4 shadow-md md:px-8"
  >
    <div class="navbar-start flex-1 gap-2">
      <RouterLink
        :to="{ name: 'home' }"
        class="btn btn-ghost text-neutral-content hover:bg-neutral-content/15 px-2 text-lg font-extrabold"
      >
        ShowMyRides
      </RouterLink>

      <nav
        v-if="primaryNavigationItems.length"
        aria-label="Primary navigation"
        class="hidden lg:block"
      >
        <ul class="menu menu-horizontal items-center gap-1 p-0">
          <li v-for="item in primaryNavigationItems" :key="item.routeName">
            <RouterLink
              :to="{ name: item.routeName }"
              active-class="bg-neutral-content/20"
              class="text-neutral-content hover:bg-neutral-content/15 font-semibold"
            >
              {{ item.label }}
            </RouterLink>
          </li>
        </ul>
      </nav>
    </div>

    <div class="navbar-end w-auto">
      <nav aria-label="Account navigation" class="hidden lg:block">
        <ul class="menu menu-horizontal items-center gap-1 p-0">
          <li v-for="item in accountNavigationItems" :key="item.routeName">
            <RouterLink
              :to="{ name: item.routeName }"
              active-class="bg-neutral-content/20"
              class="text-neutral-content hover:bg-neutral-content/15 font-semibold"
            >
              {{ item.label }}
            </RouterLink>
          </li>
          <li v-if="isAuthenticated">
            <button
              type="button"
              class="text-neutral-content hover:bg-neutral-content/15 font-semibold"
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
        class="btn btn-ghost btn-square drawer-button text-neutral-content hover:bg-neutral-content/15 lg:hidden"
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

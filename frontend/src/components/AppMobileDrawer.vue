<script setup lang="ts">
import { computed, nextTick, onMounted, onUnmounted, ref, watch } from 'vue'
import { RouterLink } from 'vue-router'

import { getNavigationItems, homeNavigationItem } from '@/data/navigation'

const props = withDefaults(
  defineProps<{
    isOpen: boolean
    isAuthenticated: boolean
    isAdmin: boolean
    isLoggingOut?: boolean
    toggleId: string
  }>(),
  {
    isLoggingOut: false,
  },
)

const emit = defineEmits<{
  close: []
  logout: []
}>()

const drawerPanel = ref<HTMLElement | null>(null)
const closeButton = ref<HTMLButtonElement | null>(null)
const navigationItems = computed(() => [
  homeNavigationItem,
  ...getNavigationItems(props.isAuthenticated, props.isAdmin),
])

watch(
  () => props.isOpen,
  async (isOpen) => {
    if (isOpen) {
      await nextTick()
      closeButton.value?.focus()
    }
  },
)

function closeDrawer(): void {
  emit('close')
}

function handleLogout(): void {
  emit('logout')
  closeDrawer()
}

function handleKeydown(event: KeyboardEvent): void {
  if (!props.isOpen) {
    return
  }

  if (event.key === 'Escape') {
    event.preventDefault()
    closeDrawer()
    return
  }

  if (event.key !== 'Tab' || !drawerPanel.value) {
    return
  }

  const focusableElements = Array.from(
    drawerPanel.value.querySelectorAll<HTMLElement>(
      'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])',
    ),
  )

  if (focusableElements.length === 0) {
    return
  }

  const firstElement = focusableElements[0]
  const lastElement = focusableElements[focusableElements.length - 1]

  if (event.shiftKey && document.activeElement === firstElement) {
    event.preventDefault()
    lastElement?.focus()
  } else if (!event.shiftKey && document.activeElement === lastElement) {
    event.preventDefault()
    firstElement?.focus()
  }
}

onMounted(() => document.addEventListener('keydown', handleKeydown))
onUnmounted(() => document.removeEventListener('keydown', handleKeydown))
</script>

<template>
  <div
    class="drawer-side z-50"
    :aria-hidden="!isOpen"
    :inert="!isOpen"
  >
    <label
      :for="toggleId"
      class="drawer-overlay"
      aria-label="Close navigation"
      @click="closeDrawer"
    ></label>

    <aside
      id="mobile-navigation"
      ref="drawerPanel"
      class="bg-base-100 min-h-full w-[min(20rem,88vw)] p-4 shadow-2xl"
      aria-label="Mobile navigation"
    >
      <div class="border-base-300 flex min-h-14 items-center justify-between border-b">
        <RouterLink
          :to="{ name: 'home' }"
          class="btn btn-ghost px-2 text-lg font-extrabold"
          @click="closeDrawer"
        >
          ShowMyRides
        </RouterLink>
        <button
          ref="closeButton"
          type="button"
          class="btn btn-ghost btn-square"
          aria-label="Close navigation"
          @click="closeDrawer"
        >
          <svg
            aria-hidden="true"
            class="size-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            stroke-width="2"
          >
            <path stroke-linecap="round" d="M6 6l12 12M18 6 6 18" />
          </svg>
        </button>
      </div>

      <nav aria-label="Mobile routes" class="pt-4">
        <ul class="menu w-full gap-1 p-0">
          <li v-for="item in navigationItems" :key="item.routeName">
            <RouterLink
              :to="{ name: item.routeName }"
              active-class="menu-active"
              class="min-h-12 text-base font-semibold"
              @click="closeDrawer"
            >
              {{ item.label }}
            </RouterLink>
          </li>
          <li v-if="isAuthenticated">
            <button
              type="button"
              class="min-h-12 text-base font-semibold"
              :disabled="isLoggingOut"
              @click="handleLogout"
            >
              {{ isLoggingOut ? 'Logging Out…' : 'Log Out' }}
            </button>
          </li>
        </ul>
      </nav>
    </aside>
  </div>
</template>

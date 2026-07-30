import { getActivePinia } from 'pinia'
import {
  createRouter,
  createWebHistory,
  type RouteLocationRaw,
  type RouteMeta,
  type RouteRecordRaw,
} from 'vue-router'

import ApiTestView from '@/views/ApiTestView.vue'
import ComingSoonView from '@/views/ComingSoonView.vue'
import HomeView from '@/views/HomeView.vue'
import LoginView from '@/views/LoginView.vue'
import LocationsView from '@/views/LocationsView.vue'
import NotificationTestView from '@/views/NotificationTestView.vue'
import RegisterView from '@/views/RegisterView.vue'
import SettingsView from '@/views/SettingsView.vue'
import { useAlertStore } from '@/stores/alerts'
import { useAuthStore } from '@/stores/auth'

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'home',
    component: HomeView,
    meta: { title: 'ShowMyRides' },
  },
  {
    path: '/register',
    name: 'register',
    component: RegisterView,
    meta: { requiresGuest: true, title: 'Register' },
  },
  {
    path: '/login',
    name: 'login',
    component: LoginView,
    meta: { requiresGuest: true, title: 'Log In' },
  },
  {
    path: '/rides',
    name: 'rides',
    component: ComingSoonView,
    props: {
      title: 'Rides',
      description: 'Your saved rides will be available in a future update.',
    },
    meta: { requiresAuth: true, title: 'Rides' },
  },
  {
    path: '/rides/add',
    name: 'add-ride',
    component: ComingSoonView,
    props: {
      title: 'Add Ride',
      description: 'Ride uploads will be available in a future update.',
    },
    meta: { requiresAuth: true, title: 'Add Ride' },
  },
  {
    path: '/rides/overlay',
    name: 'ride-overlay',
    component: ComingSoonView,
    props: {
      title: 'Ride Overlay',
      description: 'Ride map overlays will be available in a future update.',
    },
    meta: { requiresAuth: true, title: 'Ride Overlay' },
  },
  {
    path: '/settings',
    name: 'settings',
    component: SettingsView,
    meta: { requiresAuth: true, title: 'Settings' },
  },
  {
    path: '/settings/locations',
    name: 'settings-locations',
    component: LocationsView,
    meta: { requiresAuth: true, title: 'Locations' },
  },
  {
    path: '/admin',
    name: 'admin-tools',
    component: ComingSoonView,
    props: {
      title: 'Admin Tools',
      description: 'Administrative tools will be available in a future update.',
    },
    meta: { requiresAdmin: true, requiresAuth: true, title: 'Admin Tools' },
  },
  {
    path: '/test/notifications',
    name: 'notification-test',
    component: NotificationTestView,
    meta: { title: 'Notification Test' },
  },
]

if (import.meta.env.DEV) {
  routes.push({
    path: '/test/api',
    name: 'api-test',
    component: ApiTestView,
    meta: { title: 'API Test' },
  })
}

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
  scrollBehavior: () => ({ top: 0 }),
})

export function getAuthRedirect(
  meta: RouteMeta,
  isAuthenticated: boolean,
  isAdmin: boolean,
): RouteLocationRaw | true {
  if (meta.requiresAuth && !isAuthenticated) {
    return { name: 'login' }
  }

  if (meta.requiresAdmin && !isAdmin) {
    return { name: 'rides' }
  }

  if (meta.requiresGuest && isAuthenticated) {
    return { name: 'rides' }
  }

  return true
}

router.beforeEach(async (to) => {
  const pinia = getActivePinia()

  if (!pinia) {
    return true
  }

  const authStore = useAuthStore(pinia)

  try {
    await authStore.initialize()
  } catch {
    useAlertStore(pinia).error('Something Went Wrong')
  }

  return getAuthRedirect(to.meta, authStore.isAuthenticated, authStore.isAdmin)
})

router.afterEach((to) => {
  const pageTitle = typeof to.meta.title === 'string' ? to.meta.title : 'ShowMyRides'
  document.title = pageTitle === 'ShowMyRides' ? pageTitle : `${pageTitle} | ShowMyRides`
})

export default router

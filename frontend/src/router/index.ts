import { createRouter, createWebHistory } from 'vue-router'

import ComingSoonView from '@/views/ComingSoonView.vue'
import HomeView from '@/views/HomeView.vue'
import NotificationTestView from '@/views/NotificationTestView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
      meta: { title: 'ShowMyRides' },
    },
    {
      path: '/register',
      name: 'register',
      component: ComingSoonView,
      props: {
        title: 'Register',
        description: 'Account registration will be available in a future update.',
      },
      meta: { title: 'Register' },
    },
    {
      path: '/login',
      name: 'login',
      component: ComingSoonView,
      props: {
        title: 'Log In',
        description: 'Account login will be available in a future update.',
      },
      meta: { title: 'Log In' },
    },
    {
      path: '/rides',
      name: 'rides',
      component: ComingSoonView,
      props: {
        title: 'Rides',
        description: 'Your saved rides will be available in a future update.',
      },
      meta: { title: 'Rides' },
    },
    {
      path: '/rides/add',
      name: 'add-ride',
      component: ComingSoonView,
      props: {
        title: 'Add Ride',
        description: 'Ride uploads will be available in a future update.',
      },
      meta: { title: 'Add Ride' },
    },
    {
      path: '/rides/overlay',
      name: 'ride-overlay',
      component: ComingSoonView,
      props: {
        title: 'Ride Overlay',
        description: 'Ride map overlays will be available in a future update.',
      },
      meta: { title: 'Ride Overlay' },
    },
    {
      path: '/settings',
      name: 'settings',
      component: ComingSoonView,
      props: {
        title: 'Settings',
        description: 'Account settings will be available in a future update.',
      },
      meta: { title: 'Settings' },
    },
    {
      path: '/admin',
      name: 'admin-tools',
      component: ComingSoonView,
      props: {
        title: 'Admin Tools',
        description: 'Administrative tools will be available in a future update.',
      },
      meta: { title: 'Admin Tools' },
    },
    {
      path: '/test/notifications',
      name: 'notification-test',
      component: NotificationTestView,
      meta: { title: 'Notification Test' },
    },
  ],
  scrollBehavior: () => ({ top: 0 }),
})

router.afterEach((to) => {
  const pageTitle = typeof to.meta.title === 'string' ? to.meta.title : 'ShowMyRides'
  document.title = pageTitle === 'ShowMyRides' ? pageTitle : `${pageTitle} | ShowMyRides`
})

export default router

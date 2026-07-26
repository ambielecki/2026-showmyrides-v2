export interface NavigationItem {
  label: string
  routeName: string
}

export const homeNavigationItem: NavigationItem = {
  label: 'Home',
  routeName: 'home',
}

const publicNavigationItems: NavigationItem[] = [
  { label: 'Register', routeName: 'register' },
  { label: 'Log In', routeName: 'login' },
]

const authenticatedNavigationItems: NavigationItem[] = [
  { label: 'Rides', routeName: 'rides' },
  { label: 'Add Ride', routeName: 'add-ride' },
  { label: 'Ride Overlay', routeName: 'ride-overlay' },
  { label: 'Settings', routeName: 'settings' },
]

const adminNavigationItem: NavigationItem = {
  label: 'Admin Tools',
  routeName: 'admin-tools',
}

export function getNavigationItems(
  isAuthenticated: boolean,
  isAdmin: boolean,
): NavigationItem[] {
  if (!isAuthenticated) {
    return publicNavigationItems
  }

  return isAdmin
    ? [...authenticatedNavigationItems, adminNavigationItem]
    : authenticatedNavigationItems
}

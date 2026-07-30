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

const authenticatedPrimaryNavigationItems: NavigationItem[] = [
  { label: 'Rides', routeName: 'rides' },
  { label: 'Add Ride', routeName: 'add-ride' },
  { label: 'Ride Overlay', routeName: 'ride-overlay' },
]

const adminNavigationItem: NavigationItem = {
  label: 'Admin Tools',
  routeName: 'admin-tools',
}

const authenticatedAccountNavigationItems: NavigationItem[] = [
  { label: 'Settings', routeName: 'settings' },
]

export function getPrimaryNavigationItems(
  isAuthenticated: boolean,
  isAdmin: boolean,
): NavigationItem[] {
  if (!isAuthenticated) {
    return []
  }

  return isAdmin
    ? [...authenticatedPrimaryNavigationItems, adminNavigationItem]
    : authenticatedPrimaryNavigationItems
}

export function getAccountNavigationItems(
  isAuthenticated: boolean,
): NavigationItem[] {
  return isAuthenticated
    ? authenticatedAccountNavigationItems
    : publicNavigationItems
}

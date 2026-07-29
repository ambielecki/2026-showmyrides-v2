import { describe, expect, it } from 'vitest'

import { getAuthRedirect } from '@/router'

describe('auth route decisions', () => {
  it('sends guests from authenticated routes to login', () => {
    expect(getAuthRedirect({ requiresAuth: true }, false, false)).toEqual({
      name: 'login',
    })
  })

  it('sends authenticated users away from guest routes', () => {
    expect(getAuthRedirect({ requiresGuest: true }, true, false)).toEqual({
      name: 'rides',
    })
  })

  it('allows only administrators into admin routes', () => {
    expect(getAuthRedirect({ requiresAdmin: true, requiresAuth: true }, true, false)).toEqual({
      name: 'rides',
    })
    expect(getAuthRedirect({ requiresAdmin: true, requiresAuth: true }, true, true)).toBe(true)
  })
})

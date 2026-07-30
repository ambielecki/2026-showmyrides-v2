import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'

import {
  expect,
  test,
  type APIRequestContext,
  type APIResponse,
  type Page,
  type Route,
} from '@playwright/test'

const backendEnvPath = fileURLToPath(new URL('../../backend/.env', import.meta.url))

function readLocalEnvironmentValue(name: string): string | undefined {
  try {
    const contents = readFileSync(backendEnvPath, 'utf8')
    const match = contents.match(new RegExp(`^${name}=(.*)$`, 'm'))
    const value = match?.[1]?.trim()

    if (!value) {
      return undefined
    }

    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      return value.slice(1, -1)
    }

    return value
  } catch {
    return undefined
  }
}

const testUserEmail = process.env.TEST_USER_EMAIL ?? readLocalEnvironmentValue('TEST_USER_EMAIL')
const testUserPassword =
  process.env.TEST_USER_PASSWORD ?? readLocalEnvironmentValue('TEST_USER_PASSWORD')

const corsHeaders = {
  'Access-Control-Allow-Credentials': 'true',
  'Access-Control-Allow-Origin': 'http://localhost:5173',
}

async function mockAuthenticationBackend(
  page: Page,
  options: { rejectLogin?: boolean } = {},
): Promise<void> {
  let isAuthenticated = false

  await page.route('http://localhost:8080/**', async (route: Route) => {
    const path = new URL(route.request().url()).pathname

    if (path === '/sanctum/csrf-cookie') {
      await route.fulfill({
        headers: {
          ...corsHeaders,
          'Set-Cookie': 'XSRF-TOKEN=mock-token; Path=/; SameSite=Lax',
        },
        status: 204,
      })

      return
    }

    if (path === '/login') {
      if (options.rejectLogin) {
        await route.fulfill({
          body: JSON.stringify({
            message: 'The provided credentials are incorrect.',
            errors: {
              email: ['The provided credentials are incorrect.'],
            },
          }),
          contentType: 'application/json',
          headers: corsHeaders,
          status: 422,
        })

        return
      }

      isAuthenticated = true
      await route.fulfill({
        body: JSON.stringify({ two_factor: false }),
        contentType: 'application/json',
        headers: corsHeaders,
        status: 200,
      })

      return
    }

    if (path === '/register') {
      isAuthenticated = true
      await route.fulfill({
        headers: corsHeaders,
        status: 201,
      })

      return
    }

    if (path === '/logout') {
      isAuthenticated = false
      await route.fulfill({
        headers: corsHeaders,
        status: 204,
      })

      return
    }

    if (path === '/api/user' && isAuthenticated) {
      await route.fulfill({
        body: JSON.stringify({
          data: {
            external_id: '5f9acda6-69c9-42da-a6c1-83ee4ef42230',
            name: 'Test Rider',
            email: 'rider@example.com',
            is_admin: false,
          },
        }),
        contentType: 'application/json',
        headers: corsHeaders,
        status: 200,
      })

      return
    }

    await route.fulfill({
      body: JSON.stringify({ message: 'Unauthenticated.' }),
      contentType: 'application/json',
      headers: corsHeaders,
      status: 401,
    })
  })
}

async function authenticateConfiguredTestUser(
  request: APIRequestContext,
  csrfHeaders: Record<string, string>,
  email: string,
  password: string,
): Promise<APIResponse> {
  const loginResponse = await request.post('/login', {
    data: {
      email,
      password,
    },
    headers: csrfHeaders,
  })

  if (loginResponse.status() !== 422) {
    return loginResponse
  }

  return request.post('/register', {
    data: {
      name: 'Automated Test Rider',
      email,
      password,
      password_confirmation: password,
    },
    headers: csrfHeaders,
  })
}

test('completes the two-step login and logout flow with mocked auth', async ({ page }) => {
  await mockAuthenticationBackend(page)
  await page.goto('/login')

  await page.getByLabel('Email').fill('rider@example.com')
  await page.getByRole('button', { name: 'Continue' }).click()
  await expect(page.getByText('Step 2 of 2')).toBeVisible()

  await page.getByLabel('Password').fill('password')
  await page.getByRole('button', { name: 'Log In', exact: true }).click()

  await expect(page).toHaveURL('/rides')
  await expect(page.getByRole('link', { name: 'Settings' })).toBeVisible()
  await expect(page.getByRole('link', { name: 'Register' })).toBeHidden()

  const homepageLinkBox = await page
    .locator('header')
    .getByRole('link', { name: 'ShowMyRides' })
    .boundingBox()
  const primaryNavigationBox = await page
    .getByRole('navigation', { name: 'Primary navigation' })
    .boundingBox()
  const accountNavigationBox = await page
    .getByRole('navigation', { name: 'Account navigation' })
    .boundingBox()

  expect(homepageLinkBox).not.toBeNull()
  expect(primaryNavigationBox).not.toBeNull()
  expect(accountNavigationBox).not.toBeNull()
  expect(primaryNavigationBox!.x).toBeGreaterThan(homepageLinkBox!.x)
  expect(accountNavigationBox!.x).toBeGreaterThan(
    primaryNavigationBox!.x + primaryNavigationBox!.width,
  )

  await page.setViewportSize({ width: 390, height: 844 })
  await page.getByRole('button', { name: 'Open navigation' }).click()

  const drawer = page.getByRole('complementary', { name: 'Mobile navigation' })
  await expect(drawer.getByRole('link', { name: 'Settings' })).toBeVisible()
  await expect(drawer.getByRole('link', { name: 'Register' })).toBeHidden()

  const mobilePrimaryNavigationBox = await drawer
    .getByRole('navigation', { name: 'Mobile primary navigation' })
    .boundingBox()
  const mobileAccountNavigationBox = await drawer
    .getByRole('navigation', { name: 'Mobile account navigation' })
    .boundingBox()

  expect(mobilePrimaryNavigationBox).not.toBeNull()
  expect(mobileAccountNavigationBox).not.toBeNull()
  expect(mobileAccountNavigationBox!.y).toBeGreaterThan(
    mobilePrimaryNavigationBox!.y + mobilePrimaryNavigationBox!.height,
  )

  await drawer.getByRole('button', { name: 'Log Out' }).click()

  await expect(page).toHaveURL('/')
  await page.getByRole('button', { name: 'Open navigation' }).click()
  await expect(
    page
      .getByRole('complementary', { name: 'Mobile navigation' })
      .getByRole('link', { name: 'Register' }),
  ).toBeVisible()
})

test('registers an account and enters the authenticated navigation state', async ({ page }) => {
  await mockAuthenticationBackend(page)
  await page.goto('/register')

  await page.getByLabel('Name').fill('Test Rider')
  await page.getByLabel('Email').fill('rider@example.com')
  await page.getByLabel('Password', { exact: true }).fill('correct horse battery staple')
  await page.getByLabel('Confirm password').fill('correct horse battery staple')
  await page.getByRole('button', { name: 'Create account' }).click()

  await expect(page).toHaveURL('/rides')
  await expect(page.getByRole('link', { name: 'Settings' })).toBeVisible()
})

test('shows a warning when login credentials are rejected', async ({ page }) => {
  await mockAuthenticationBackend(page, { rejectLogin: true })
  await page.goto('/login')

  await page.getByLabel('Email').fill('rider@example.com')
  await page.getByRole('button', { name: 'Continue' }).click()
  await page.getByLabel('Password').fill('incorrect')
  await page.getByRole('button', { name: 'Log In', exact: true }).click()

  await expect(page).toHaveURL('/login')
  await expect(page.getByRole('alert')).toContainText('The provided credentials are incorrect.')
})

test('redirects a guest from a protected route to login', async ({ page }) => {
  await mockAuthenticationBackend(page)
  await page.goto('/settings')

  await expect(page).toHaveURL('/login')
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Log In')
})

test.describe('local Docker authentication', () => {
  test.describe.configure({ retries: 0 })

  test('registers or logs in the configured test user, then logs out', async ({ playwright }) => {
    // Local credentials are intentionally optional outside a developer workstation.
    // eslint-disable-next-line playwright/no-skipped-test
    test.skip(
      !testUserEmail || !testUserPassword,
      'Local auth credentials are not configured in backend/.env.',
    )

    const request = await playwright.request.newContext({
      baseURL: 'http://localhost:8080',
      extraHTTPHeaders: {
        Accept: 'application/json',
        Origin: 'http://localhost:5173',
      },
    })

    try {
      const csrfResponse = await request.get('/sanctum/csrf-cookie')
      expect(csrfResponse.status()).toBe(204)

      const csrfCookie = (await request.storageState()).cookies.find(
        (cookie) => cookie.name === 'XSRF-TOKEN',
      )
      expect(csrfCookie).toBeDefined()

      const csrfHeaders = {
        'X-XSRF-TOKEN': decodeURIComponent(csrfCookie!.value),
      }
      const authResponse = await authenticateConfiguredTestUser(
        request,
        csrfHeaders,
        testUserEmail!,
        testUserPassword!,
      )

      expect([200, 201]).toContain(authResponse.status())

      const currentUserResponse = await request.get('/api/user')
      expect(currentUserResponse.status()).toBe(200)

      const currentUser = (await currentUserResponse.json()) as {
        data: Record<string, unknown>
      }
      expect(Object.keys(currentUser.data).sort()).toEqual([
        'email',
        'external_id',
        'is_admin',
        'name',
      ])
      expect(currentUser.data.is_admin).toBe(false)

      expect((await request.get('/sanctum/csrf-cookie')).status()).toBe(204)
      const refreshedCsrfCookie = (await request.storageState()).cookies.find(
        (cookie) => cookie.name === 'XSRF-TOKEN',
      )
      expect(refreshedCsrfCookie).toBeDefined()

      const logoutResponse = await request.post('/logout', {
        headers: {
          'X-XSRF-TOKEN': decodeURIComponent(refreshedCsrfCookie!.value),
        },
      })
      expect(logoutResponse.status()).toBe(204)
      expect((await request.get('/api/user')).status()).toBe(401)
    } finally {
      await request.dispose()
    }
  })
})

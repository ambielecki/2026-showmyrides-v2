import { expect, test, type Page, type Route } from '@playwright/test'

const corsHeaders = {
  'Access-Control-Allow-Credentials': 'true',
  'Access-Control-Allow-Origin': 'http://localhost:5173',
}

interface MockLocation {
  external_id: string
  name: string
  latitude: number
  longitude: number
}

async function mockLocationBackend(page: Page): Promise<void> {
  let locations: MockLocation[] = [
    {
      external_id: 'f13bdd3e-b6a7-4bf9-9e0d-21c2de341144',
      name: 'Existing Trail System',
      latitude: 42.5,
      longitude: -71.2,
    },
  ]

  await page.route('https://tile.openstreetmap.org/**', (route) =>
    route.fulfill({ status: 204 }),
  )

  await page.route('http://localhost:8080/**', async (route: Route) => {
    const request = route.request()
    const url = new URL(request.url())

    if (url.pathname === '/api/user') {
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

    if (url.pathname === '/sanctum/csrf-cookie') {
      await route.fulfill({
        headers: {
          ...corsHeaders,
          'Set-Cookie': 'XSRF-TOKEN=mock-token; Path=/; SameSite=Lax',
        },
        status: 204,
      })

      return
    }

    if (url.pathname === '/api/location-search') {
      await route.fulfill({
        body: JSON.stringify({
          data: [
            {
              name: 'Harold Parker State Forest',
              display_name: 'Harold Parker State Forest, Andover, Massachusetts',
              latitude: 42.614865,
              longitude: -71.095166,
            },
          ],
        }),
        contentType: 'application/json',
        headers: corsHeaders,
        status: 200,
      })

      return
    }

    if (url.pathname === '/api/locations' && request.method() === 'GET') {
      await route.fulfill({
        body: JSON.stringify({
          data: locations,
          links: {},
          meta: {
            current_page: 1,
            from: locations.length > 0 ? 1 : null,
            last_page: 1,
            per_page: 10,
            to: locations.length,
            total: locations.length,
          },
        }),
        contentType: 'application/json',
        headers: corsHeaders,
        status: 200,
      })

      return
    }

    if (url.pathname === '/api/locations' && request.method() === 'POST') {
      const input = request.postDataJSON() as Omit<MockLocation, 'external_id'>
      const createdLocation = {
        external_id: 'b85df3cf-f756-4012-a40b-25ea99a2761f',
        ...input,
      }
      locations = [createdLocation, ...locations]

      await route.fulfill({
        body: JSON.stringify({ data: createdLocation }),
        contentType: 'application/json',
        headers: corsHeaders,
        status: 201,
      })

      return
    }

    if (url.pathname.startsWith('/api/locations/') && request.method() === 'PATCH') {
      const externalId = url.pathname.split('/').at(-1)
      const input = request.postDataJSON() as Omit<MockLocation, 'external_id'>
      locations = locations.map((location) =>
        location.external_id === externalId ? { external_id: location.external_id, ...input } : location,
      )
      const updatedLocation = locations.find(
        (location) => location.external_id === externalId,
      )

      await route.fulfill({
        body: JSON.stringify({ data: updatedLocation }),
        contentType: 'application/json',
        headers: corsHeaders,
        status: 200,
      })

      return
    }

    await route.fulfill({
      body: JSON.stringify({ message: 'Not found.' }),
      contentType: 'application/json',
      headers: corsHeaders,
      status: 404,
    })
  })
}

test('creates and edits locations from authenticated settings', async ({ page }) => {
  await mockLocationBackend(page)
  await page.goto('/settings')

  await page.getByRole('link', { name: /Manage Locations/ }).click()
  await expect(page).toHaveURL('/settings/locations')
  await expect(
    page.getByRole('rowheader', { name: 'Existing Trail System' }),
  ).toBeVisible()

  await page.getByRole('button', { name: 'Add location' }).click()
  const dialog = page.getByRole('dialog', { name: 'Add location' })
  await expect(dialog).toBeVisible()
  const modalInputs = dialog.locator('input')

  await expect(modalInputs).toHaveCount(4)

  for (let inputIndex = 0; inputIndex < 4; inputIndex += 1) {
    await expect(modalInputs.nth(inputIndex)).toHaveCSS(
      'background-color',
      'rgb(255, 255, 255)',
    )
  }

  await dialog.getByPlaceholder('Park, forest, or trail system').fill('Harold Parker')
  await dialog.getByRole('button', { name: 'Search', exact: true }).click()
  await dialog
    .getByRole('button', {
      name: 'Harold Parker State Forest, Andover, Massachusetts',
    })
    .click()
  await dialog.getByRole('button', { name: 'Save location' }).click()

  await expect(page.getByText('Location added successfully.')).toBeVisible()
  await expect(
    page.getByRole('rowheader', { name: 'Harold Parker State Forest' }),
  ).toBeVisible()

  await page.getByRole('button', { name: 'Edit Harold Parker State Forest' }).click()
  const editDialog = page.getByRole('dialog', { name: 'Edit location' })
  await editDialog.getByLabel('Location name').fill('Harold Parker Trails')
  await editDialog.getByRole('button', { name: 'Save location' }).click()

  await expect(page.getByText('Location updated successfully.')).toBeVisible()
  await expect(
    page.getByRole('rowheader', { name: 'Harold Parker Trails' }),
  ).toBeVisible()
})

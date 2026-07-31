import { expect, test, type Page, type Route } from '@playwright/test'

const corsHeaders = {
  'Access-Control-Allow-Credentials': 'true',
  'Access-Control-Allow-Origin': 'http://localhost:5173',
}

const location = {
  external_id: '632de676-3f8b-44d7-a459-c86948555612',
  name: 'Blue Hills',
  map_provider: 'openstreetmap',
}

const completeRide = {
  external_id: '407772ee-29ee-4134-a264-b5ec177b2bfa',
  name: 'Morning Loop',
  description: 'A steady social ride.' as string | null,
  ride_datetime: '2026-07-31T12:00:00Z',
  distance: 20,
  moving_time: 3600,
  total_time: 3724,
  average_speed: 18,
  max_speed: 30,
  processing_status: 'complete',
  processing_error: null,
  location,
  route_data: {
    type: 'LineString',
    coordinates: [[-71.1000, 42.6000], [-71.0900, 42.6100], [-71.0800, 42.6050]],
  },
}

async function mockRideBackend(page: Page): Promise<void> {
  await page.route('https://tile.openstreetmap.org/**', (route) => route.fulfill({ status: 204 }))
  await page.route('http://localhost:8080/**', async (route: Route) => {
    const request = route.request()
    const url = new URL(request.url())

    if (url.pathname === '/api/user') {
      await route.fulfill({
        body: JSON.stringify({ data: { external_id: 'user-id', name: 'Test Rider', email: 'rider@example.com', is_admin: false } }),
        contentType: 'application/json', headers: corsHeaders, status: 200,
      })
      return
    }

    if (url.pathname === '/sanctum/csrf-cookie') {
      await route.fulfill({ headers: { ...corsHeaders, 'Set-Cookie': 'XSRF-TOKEN=mock-token; Path=/; SameSite=Lax' }, status: 204 })
      return
    }

    if (url.pathname === '/api/location-options') {
      await route.fulfill({ body: JSON.stringify({ data: [location] }), contentType: 'application/json', headers: corsHeaders })
      return
    }

    if (url.pathname === '/api/rides' && request.method() === 'GET') {
      await route.fulfill({
        body: JSON.stringify({
          data: [{ ...completeRide, route_data: undefined, total_time: undefined, average_speed: undefined, max_speed: undefined }],
          meta: { current_page: 1, from: 1, last_page: 1, per_page: 10, to: 1, total: 1 },
        }),
        contentType: 'application/json', headers: corsHeaders,
      })
      return
    }

    if (url.pathname === `/api/rides/${completeRide.external_id}` && request.method() === 'GET') {
      await route.fulfill({ body: JSON.stringify({ data: completeRide }), contentType: 'application/json', headers: corsHeaders })
      return
    }

    if (url.pathname === `/api/rides/${completeRide.external_id}` && request.method() === 'PATCH') {
      const input = request.postDataJSON() as { name: string; description: string | null }
      completeRide.name = input.name
      completeRide.description = input.description
      await route.fulfill({ body: JSON.stringify({ data: completeRide }), contentType: 'application/json', headers: corsHeaders })
      return
    }

    if (url.pathname === '/api/rides' && request.method() === 'POST') {
      await route.fulfill({ body: JSON.stringify({ data: { ...completeRide, processing_status: 'pending', route_data: null } }), contentType: 'application/json', headers: corsHeaders, status: 201 })
      return
    }

    await route.fulfill({ body: '{}', contentType: 'application/json', headers: corsHeaders, status: 404 })
  })
}

test('filters rides and presents a responsive route detail with control-free map download', async ({ page }) => {
  await mockRideBackend(page)
  await page.goto('/rides')

  await expect(page.getByRole('heading', { name: 'Rides' })).toBeVisible()
  await expect(page.getByRole('link', { name: 'Morning Loop' })).toBeVisible()
  await expect(page.getByText('20.00 mi')).toBeVisible()

  await page.getByRole('link', { name: 'Morning Loop' }).click()
  await expect(page.getByRole('heading', { name: 'Morning Loop' })).toBeVisible()
  await expect(page.getByRole('application', { name: 'Map of Morning Loop' })).toBeVisible()
  await expect(page.getByText('18.00 mph')).toBeVisible()

  await page.getByLabel('Show route').uncheck()
  await expect(page.getByLabel('Show route')).not.toBeChecked()
  await page.getByLabel('Show route').check()

  const downloadPromise = page.waitForEvent('download')
  await page.getByRole('button', { name: 'Download PNG' }).click()
  const download = await downloadPromise
  expect(download.suggestedFilename()).toBe('morning-loop-map.png')

  await page.setViewportSize({ width: 390, height: 844 })
  const mapBox = await page.getByRole('application', { name: 'Map of Morning Loop' }).boundingBox()
  const statsBox = await page.getByRole('heading', { name: 'Ride details' }).boundingBox()
  expect(mapBox).not.toBeNull()
  expect(statsBox).not.toBeNull()
  expect(mapBox!.y).toBeLessThan(statsBox!.y)
})

test('uploads a FIT activity and returns to the ride list', async ({ page }) => {
  await mockRideBackend(page)
  await page.goto('/rides/add')

  await page.getByLabel('Ride name').fill('New Friday Ride')
  await page.getByLabel('Description (optional)').fill('Uploaded from a Garmin device.')
  await page.getByLabel('Location').selectOption(location.external_id)
  await page.getByLabel('Garmin FIT file').setInputFiles({
    name: 'friday.fit',
    mimeType: 'application/octet-stream',
    buffer: Buffer.from('mock fit contents'),
  })
  await page.getByRole('button', { name: 'Upload ride' }).click()

  await expect(page).toHaveURL('/rides')
  await expect(page.getByText('Ride uploaded. Processing has started.')).toBeVisible()
})

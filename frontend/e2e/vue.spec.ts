import { test, expect } from '@playwright/test'

interface RgbColor {
  red: number
  green: number
  blue: number
}

function parseRgbColor(value: string): RgbColor {
  const channels = value.match(/[\d.]+/g)?.slice(0, 3).map(Number)

  if (!channels || channels.length !== 3) {
    throw new Error(`Unable to parse RGB color: ${value}`)
  }

  return {
    red: channels[0]!,
    green: channels[1]!,
    blue: channels[2]!,
  }
}

function relativeLuminance(color: RgbColor): number {
  const channels = [color.red, color.green, color.blue].map((channel) => {
    const normalized = channel / 255

    return normalized <= 0.04045
      ? normalized / 12.92
      : ((normalized + 0.055) / 1.055) ** 2.4
  })

  return (
    channels[0]! * 0.2126 +
    channels[1]! * 0.7152 +
    channels[2]! * 0.0722
  )
}

function contrastRatio(foreground: string, background: string): number {
  const foregroundLuminance = relativeLuminance(parseRgbColor(foreground))
  const backgroundLuminance = relativeLuminance(parseRgbColor(background))
  const lighter = Math.max(foregroundLuminance, backgroundLuminance)
  const darker = Math.min(foregroundLuminance, backgroundLuminance)

  return (lighter + 0.05) / (darker + 0.05)
}

test('renders and navigates the desktop homepage', async ({ page }) => {
  await page.goto('/')

  await expect(page.getByRole('heading', { level: 1 })).toHaveText(
    'Track every route and see where you have been',
  )
  await expect(page.locator('article')).toHaveCount(3)
  await expect(page.getByRole('contentinfo')).toContainText('© 2026 ShowMyRides')

  const carousel = page.getByRole('region', { name: 'Homepage images' })
  await expect(carousel).toContainText('1 / 3')
  await carousel.getByRole('button', { name: 'Next image' }).click()
  await expect(carousel).toContainText('2 / 3')
  await carousel.getByRole('button', { name: 'Previous image' }).click()
  await expect(carousel).toContainText('1 / 3')

  await page.getByRole('link', { name: 'Log In' }).click()
  await expect(page).toHaveURL('/login')
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Log In')
})

test('opens and closes the mobile route drawer', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto('/')

  const heading = page.getByRole('heading', { level: 1 })
  const carousel = page.getByRole('region', { name: 'Homepage images' })
  const headingBox = await heading.boundingBox()
  const carouselBox = await carousel.boundingBox()

  expect(headingBox).not.toBeNull()
  expect(carouselBox).not.toBeNull()
  expect(headingBox!.y).toBeLessThan(carouselBox!.y)

  const menuButton = page.getByRole('button', { name: 'Open navigation' })
  await expect(menuButton).toBeVisible()
  await menuButton.click()

  const drawer = page.getByRole('complementary', { name: 'Mobile navigation' })
  await expect(drawer).toBeVisible()
  await expect(drawer.getByRole('link', { name: 'Home', exact: true })).toBeVisible()
  await expect(drawer.getByRole('link', { name: 'Register' })).toBeVisible()
  await expect(drawer.getByRole('link', { name: 'Log In' })).toBeVisible()

  const primaryNavigationBox = await drawer
    .getByRole('navigation', { name: 'Mobile primary navigation' })
    .boundingBox()
  const accountNavigationBox = await drawer
    .getByRole('navigation', { name: 'Mobile account navigation' })
    .boundingBox()

  expect(primaryNavigationBox).not.toBeNull()
  expect(accountNavigationBox).not.toBeNull()
  expect(accountNavigationBox!.y).toBeGreaterThan(
    primaryNavigationBox!.y + primaryNavigationBox!.height,
  )

  await page.keyboard.press('Escape')
  await expect(drawer).toBeHidden()
  await expect(menuButton).toBeFocused()

  await menuButton.click()
  await drawer.getByRole('link', { name: 'Register' }).click()
  await expect(page).toHaveURL('/register')
  await expect(drawer).toBeHidden()
})

test('shows the carousel placeholder when backend images fail', async ({ page }) => {
  await page.route('**/storage/*.png', (route) => route.abort())
  await page.goto('/')

  await expect(page.getByText('Ride map preview unavailable')).toBeVisible()
})

test('applies accessible site chrome and distinct page surfaces', async ({ page }) => {
  await page.goto('/')

  const navbarStyles = await page.locator('header.navbar').evaluate((element) => {
    const styles = getComputedStyle(element)

    return {
      backgroundColor: styles.backgroundColor,
      color: styles.color,
    }
  })
  const footerStyles = await page.getByRole('contentinfo').evaluate((element) => {
    const styles = getComputedStyle(element)

    return {
      backgroundColor: styles.backgroundColor,
      color: styles.color,
    }
  })
  const heroBackground = await page.locator('section.hero').evaluate(
    (element) => getComputedStyle(element).backgroundImage,
  )
  const highlightStyles = await page.locator('article').first().evaluate((element) => {
    const styles = getComputedStyle(element)
    const heading = element.querySelector('h3')

    return {
      backgroundColor: styles.backgroundColor,
      headingFontSize: heading ? getComputedStyle(heading).fontSize : '',
    }
  })

  expect(navbarStyles.backgroundColor).toBe(footerStyles.backgroundColor)
  expect(contrastRatio(navbarStyles.color, navbarStyles.backgroundColor)).toBeGreaterThanOrEqual(4.5)
  expect(contrastRatio(footerStyles.color, footerStyles.backgroundColor)).toBeGreaterThanOrEqual(4.5)
  expect(heroBackground).toContain('linear-gradient')
  expect(highlightStyles.headingFontSize).toBe('20px')

  await page.goto('/login')
  await expect(page.getByRole('heading', { level: 1, name: 'Log In' })).toBeVisible()

  const pageBackground = await page
    .locator('.drawer-content')
    .evaluate((element) => getComputedStyle(element).backgroundColor)
  const cardStyles = await page.locator('main .card').evaluate((element) => {
    const styles = getComputedStyle(element)

    return {
      backgroundColor: styles.backgroundColor,
      boxShadow: styles.boxShadow,
    }
  })
  const inputBackground = await page
    .getByLabel('Email')
    .evaluate((element) => getComputedStyle(element).backgroundColor)

  expect(cardStyles.backgroundColor).not.toBe(pageBackground)
  expect(inputBackground).toBe('rgb(255, 255, 255)')
  expect(cardStyles.boxShadow).not.toBe('none')
})

test('publishes browser and mobile favicon assets', async ({ page }) => {
  await page.goto('/')

  await expect(page.locator('link[rel="icon"][type="image/svg+xml"]')).toHaveAttribute(
    'href',
    '/favicon.svg',
  )
  await expect(page.locator('link[rel="apple-touch-icon"]')).toHaveAttribute(
    'href',
    '/apple-touch-icon.png',
  )
  await expect(page.locator('link[rel="manifest"]')).toHaveAttribute(
    'href',
    '/site.webmanifest',
  )
  await expect(page.locator('meta[name="theme-color"]')).toHaveAttribute(
    'content',
    '#355e3b',
  )

  for (const assetPath of [
    '/favicon.svg',
    '/favicon.ico',
    '/favicon-16x16.png',
    '/favicon-32x32.png',
    '/apple-touch-icon.png',
    '/android-chrome-192x192.png',
    '/android-chrome-512x512.png',
  ]) {
    const response = await page.request.get(assetPath)
    expect(response.ok(), `${assetPath} should be available`).toBe(true)
  }

  const manifestResponse = await page.request.get('/site.webmanifest')
  expect(manifestResponse.ok()).toBe(true)
  await expect(manifestResponse.json()).resolves.toMatchObject({
    name: 'ShowMyRides',
    theme_color: '#355e3b',
    icons: [
      { sizes: '192x192', type: 'image/png' },
      { sizes: '512x512', type: 'image/png', purpose: 'any maskable' },
    ],
  })
})

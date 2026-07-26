import { describe, expect, it } from 'vitest'

import { mount } from '@vue/test-utils'
import HomepageCarousel from '@/components/HomepageCarousel.vue'
import type { HomepageCarouselSlide } from '@/data/homepage'

const slides: HomepageCarouselSlide[] = [
  {
    id: 'one',
    filename: 'one.png',
    altText: 'First ride map',
    description: 'First description',
  },
  {
    id: 'two',
    filename: 'two.png',
    altText: 'Second ride map',
    description: 'Second description',
  },
  {
    id: 'three',
    filename: 'three.png',
    altText: 'Third ride map',
    description: 'Third description',
  },
]

describe('HomepageCarousel', () => {
  it('moves forward, backward, and wraps between slides', async () => {
    const wrapper = mount(HomepageCarousel, { props: { slides } })
    const previousButton = wrapper.get('button[aria-label="Previous image"]')
    const nextButton = wrapper.get('button[aria-label="Next image"]')

    expect(wrapper.get('img').attributes('alt')).toBe('First ride map')

    await nextButton.trigger('click')
    expect(wrapper.get('img').attributes('alt')).toBe('Second ride map')
    expect(wrapper.text()).toContain('2 / 3')

    await previousButton.trigger('click')
    await previousButton.trigger('click')
    expect(wrapper.get('img').attributes('alt')).toBe('Third ride map')
    expect(wrapper.text()).toContain('3 / 3')

    await nextButton.trigger('click')
    expect(wrapper.get('img').attributes('alt')).toBe('First ride map')
  })

  it('shows an accessible local fallback when an image fails', async () => {
    const wrapper = mount(HomepageCarousel, { props: { slides } })

    await wrapper.get('img').trigger('error')

    expect(wrapper.find('img').exists()).toBe(false)
    expect(wrapper.get('[role="img"]').attributes('aria-label')).toContain(
      'First ride map. Image unavailable.',
    )
    expect(wrapper.text()).toContain('Ride map preview unavailable')
  })

  it('shows an empty state when no slides are configured', () => {
    const wrapper = mount(HomepageCarousel, { props: { slides: [] } })

    expect(wrapper.get('[role="status"]').text()).toBe('No homepage images are available.')
  })
})

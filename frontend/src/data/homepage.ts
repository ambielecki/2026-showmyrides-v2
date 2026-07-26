export interface HomepageCarouselSlide {
  id: string
  filename: string
  altText: string
  description: string
}

export interface HomepageHighlight {
  title: string
  copy: string
}

export interface HomepageContent {
  eyebrow: string
  headline: string
  introduction: string
  carouselSlides: HomepageCarouselSlide[]
  highlights: HomepageHighlight[]
}

export const homepageContent: HomepageContent = {
  eyebrow: 'ShowMyRides',
  headline: 'Track every route and see where you have been',
  introduction:
    'Keep a clean record of the trails you ride, remember the lines you liked, and build a personal map of every loop, climb, and descent. Even track rides from Zwift in Watopia or Makuri Islands.',
  carouselSlides: [
    {
      id: 'harold-parker',
      filename: 'harold_parker.png',
      altText: 'Map of Harold Parker State Forest with ride overlays',
      description: 'Map real world locations and overlay each ride to see where you have been.',
    },
    {
      id: 'watopia',
      filename: 'watopia.png',
      altText: 'A map of Watopia from Zwift with ride overlays',
      description: 'Map your Zwift rides in Watopia and hit every road.',
    },
    {
      id: 'makuri-islands',
      filename: 'makuri_islands.png',
      altText: 'Map of Makuri Islands from Zwift with a ride overlay',
      description: 'Map rides in Makuri Islands, with more virtual worlds to come.',
    },
  ],
  highlights: [
    {
      title: 'Save routes that matter',
      copy: 'Keep your favorite climbs, descents, and loops in one place instead of digging through old ride files. We only support .FIT files from Garmin at this point.',
    },
    {
      title: 'Track Your Workouts in Watopia',
      copy: 'Load rides from Zwift and plot them on the maps of Watopia and Makuri Islands. Ride every road!',
    },
    {
      title: 'Build your own trail map',
      copy: 'Turn repeated rides into a personal map of where you have been and where you want to ride next.',
    },
  ],
}

export function getHomepageImageUrl(filename: string): string {
  const apiBaseUrl = import.meta.env.VITE_API_URL?.replace(/\/$/, '') ?? ''

  return `${apiBaseUrl}/storage/${filename}`
}

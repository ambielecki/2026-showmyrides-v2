<script setup lang="ts">
import { nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import L, { type Map as LeafletMap, type Polyline } from 'leaflet'
import 'leaflet/dist/leaflet.css'

import makuriMapUrl from '@/assets/maps/makuri-islands.png'
import watopiaMapUrl from '@/assets/maps/watopia.png'
import { useAlertStore } from '@/stores/alerts'
import type { RideLocation, RouteData } from '@/types/rides'

const props = defineProps<{
  location: RideLocation
  routeData: RouteData
  rideName: string
}>()

const alertStore = useAlertStore()
const mapElement = ref<HTMLElement | null>(null)
const mapFrame = ref<HTMLElement | null>(null)
const routeColor = ref('#355e3b')
const routeOpacity = ref(0.8)
const routeVisible = ref(true)
const isFullscreen = ref(false)
let map: LeafletMap | null = null
let routeLine: Polyline | null = null

const tileUrl = import.meta.env.VITE_OSM_TILE_URL ?? 'https://tile.openstreetmap.org/{z}/{x}/{y}.png'
const providers = {
  watopia: {
    url: watopiaMapUrl,
    bounds: [[-11.62597, 166.87747], [-11.74087, 167.03255]] as L.LatLngBoundsExpression,
    background: '#0884e2',
  },
  'makuri-islands': {
    url: makuriMapUrl,
    bounds: [[-10.73746, 165.76591], [-10.85234, 165.88222]] as L.LatLngBoundsExpression,
    background: '#7d9a35',
  },
}

function routeLatLngs(): L.LatLngExpression[] {
  return props.routeData.coordinates.map(([longitude, latitude]) => [latitude, longitude])
}

function updateRouteStyle(): void {
  routeLine?.setStyle({
    color: routeColor.value,
    opacity: routeVisible.value ? routeOpacity.value : 0,
  })
}

async function toggleFullscreen(): Promise<void> {
  if (!mapFrame.value) return

  try {
    if (document.fullscreenElement) {
      await document.exitFullscreen()
    } else {
      await mapFrame.value.requestFullscreen()
    }
  } catch {
    alertStore.warning('Fullscreen is not available in this browser.')
  }
}

function fullscreenChanged(): void {
  isFullscreen.value = document.fullscreenElement === mapFrame.value
  window.setTimeout(() => map?.invalidateSize(), 0)
}

async function downloadMap(): Promise<void> {
  if (!map || !mapElement.value) return

  const bounds = mapElement.value.getBoundingClientRect()
  const scale = Math.min(window.devicePixelRatio || 1, 2)
  const canvas = document.createElement('canvas')
  canvas.width = Math.max(1, Math.round(bounds.width * scale))
  canvas.height = Math.max(1, Math.round(bounds.height * scale))
  const context = canvas.getContext('2d')

  if (!context) return

  context.scale(scale, scale)
  const zwiftProvider = providers[props.location.map_provider as keyof typeof providers]
  context.fillStyle = zwiftProvider?.background ?? '#dce7d4'
  context.fillRect(0, 0, bounds.width, bounds.height)

  try {
    const images = Array.from(
      mapElement.value.querySelectorAll<HTMLImageElement>('.leaflet-tile, .leaflet-image-layer'),
    )

    for (const image of images) {
      if (!image.complete || image.naturalWidth === 0) continue
      const imageBounds = image.getBoundingClientRect()
      context.drawImage(
        image,
        imageBounds.left - bounds.left,
        imageBounds.top - bounds.top,
        imageBounds.width,
        imageBounds.height,
      )
    }

    if (routeVisible.value) {
      context.beginPath()
      props.routeData.coordinates.forEach(([longitude, latitude], index) => {
        const point = map!.latLngToContainerPoint([latitude, longitude])
        if (index === 0) context.moveTo(point.x, point.y)
        else context.lineTo(point.x, point.y)
      })
      context.strokeStyle = routeColor.value
      context.globalAlpha = routeOpacity.value
      context.lineWidth = 4
      context.lineCap = 'round'
      context.lineJoin = 'round'
      context.stroke()
      context.globalAlpha = 1
    }

    const attribution = zwiftProvider ? '© Zwift' : '© OpenStreetMap contributors'
    context.font = '12px sans-serif'
    const textWidth = context.measureText(attribution).width
    context.fillStyle = 'rgba(255, 255, 255, 0.86)'
    context.fillRect(bounds.width - textWidth - 12, bounds.height - 20, textWidth + 12, 20)
    context.fillStyle = '#142013'
    context.fillText(attribution, bounds.width - textWidth - 6, bounds.height - 6)

    const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/png'))
    if (!blob) throw new Error('Unable to create map image.')

    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = `${props.rideName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'ride'}-map.png`
    link.click()
    URL.revokeObjectURL(link.href)
  } catch {
    alertStore.error('The map image could not be downloaded.')
  }
}

onMounted(async () => {
  if (!mapElement.value) return

  map = L.map(mapElement.value, { center: [39.5, -98.35], zoom: 4 })
  const zwiftProvider = providers[props.location.map_provider as keyof typeof providers]

  if (zwiftProvider) {
    L.imageOverlay(zwiftProvider.url, zwiftProvider.bounds, { attribution: '© Zwift' }).addTo(map)
  } else {
    L.tileLayer(tileUrl, {
      attribution: '&copy; OpenStreetMap contributors',
      crossOrigin: true,
      maxZoom: 19,
    }).addTo(map)
  }

  routeLine = L.polyline(routeLatLngs(), {
    color: routeColor.value,
    opacity: routeOpacity.value,
    weight: 4,
  }).addTo(map)
  map.fitBounds(routeLine.getBounds(), { maxZoom: 16, padding: [24, 24] })

  document.addEventListener('fullscreenchange', fullscreenChanged)
  await nextTick()
  window.setTimeout(() => map?.invalidateSize(), 0)
})

watch([routeColor, routeOpacity, routeVisible], updateRouteStyle)

onBeforeUnmount(() => {
  document.removeEventListener('fullscreenchange', fullscreenChanged)
  map?.remove()
  map = null
  routeLine = null
})
</script>

<template>
  <div class="space-y-5">
    <div ref="mapFrame" class="ride-map-frame bg-base-300 relative overflow-hidden rounded-box">
      <div
        ref="mapElement"
        class="ride-map h-[28rem] w-full"
        role="application"
        :aria-label="`Map of ${rideName}`"
      ></div>
      <div class="absolute top-3 right-3 z-[500] flex gap-2" aria-label="Map actions">
        <button type="button" class="btn btn-sm bg-white" @click="downloadMap">Download PNG</button>
        <button type="button" class="btn btn-sm bg-white" @click="toggleFullscreen">
          {{ isFullscreen ? 'Exit fullscreen' : 'Fullscreen' }}
        </button>
      </div>
    </div>

    <fieldset class="bg-base-200 grid gap-5 rounded-box p-4 sm:grid-cols-3">
      <legend class="sr-only">Route appearance</legend>
      <label class="flex items-center gap-4">
        <span class="font-semibold">Route color</span>
        <input v-model="routeColor" type="color" class="h-10 w-14 cursor-pointer rounded-field bg-white p-1" />
      </label>
      <label class="space-y-1">
        <span class="flex justify-between gap-3 font-semibold">
          <span>Opacity</span><span>{{ Math.round(routeOpacity * 100) }}%</span>
        </span>
        <input v-model.number="routeOpacity" type="range" min="0.1" max="1" step="0.1" class="range range-primary range-sm" />
      </label>
      <label class="flex items-center gap-4 font-semibold">
        <input v-model="routeVisible" type="checkbox" class="checkbox checkbox-primary bg-white" />
        Show route
      </label>
    </fieldset>
  </div>
</template>

<style scoped>
.ride-map-frame:fullscreen {
  width: 100vw;
  height: 100vh;
  border-radius: 0;
}

.ride-map-frame:fullscreen .ride-map {
  height: 100vh;
}
</style>

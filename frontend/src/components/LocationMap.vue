<script setup lang="ts">
import { nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import L, { type LeafletMouseEvent, type Map as LeafletMap, type Marker } from 'leaflet'
import 'leaflet/dist/leaflet.css'

const props = defineProps<{
  latitude: number | null
  longitude: number | null
}>()

const emit = defineEmits<{
  coordinatesChanged: [latitude: number, longitude: number]
}>()

const mapElement = ref<HTMLElement | null>(null)
let map: LeafletMap | null = null
let marker: Marker | null = null

const tileUrl =
  import.meta.env.VITE_OSM_TILE_URL ?? 'https://tile.openstreetmap.org/{z}/{x}/{y}.png'

function hasValidCoordinates(latitude: number | null, longitude: number | null): boolean {
  return (
    latitude !== null &&
    longitude !== null &&
    latitude >= -90 &&
    latitude <= 90 &&
    longitude >= -180 &&
    longitude <= 180
  )
}

function createMarker(latitude: number, longitude: number): void {
  if (!map) {
    return
  }

  if (!marker) {
    marker = L.marker([latitude, longitude], {
      draggable: true,
      icon: L.divIcon({
        className: 'location-map-marker bg-primary border-base-100 rounded-full border-2 shadow-md',
        iconAnchor: [10, 10],
        iconSize: [20, 20],
      }),
    }).addTo(map)

    marker.on('dragend', () => {
      const coordinates = marker?.getLatLng()

      if (coordinates) {
        emit('coordinatesChanged', coordinates.lat, coordinates.lng)
      }
    })

    return
  }

  marker.setLatLng([latitude, longitude])
}

function handleMapClick(event: LeafletMouseEvent): void {
  emit('coordinatesChanged', event.latlng.lat, event.latlng.lng)
}

onMounted(async () => {
  if (!mapElement.value) {
    return
  }

  const hasCoordinates = hasValidCoordinates(props.latitude, props.longitude)
  const center: L.LatLngExpression = hasCoordinates
    ? [props.latitude as number, props.longitude as number]
    : [39.5, -98.35]

  map = L.map(mapElement.value, {
    center,
    zoom: hasCoordinates ? 13 : 4,
  })

  L.tileLayer(tileUrl, {
    attribution:
      '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap contributors</a>',
    maxZoom: 19,
  }).addTo(map)

  map.on('click', handleMapClick)

  if (hasCoordinates) {
    createMarker(props.latitude as number, props.longitude as number)
  }

  await nextTick()
  window.setTimeout(() => map?.invalidateSize(), 0)
})

watch(
  () => [props.latitude, props.longitude] as const,
  ([latitude, longitude]) => {
    if (!hasValidCoordinates(latitude, longitude) || !map) {
      return
    }

    createMarker(latitude as number, longitude as number)
    map.panTo([latitude as number, longitude as number])
  },
)

onBeforeUnmount(() => {
  map?.off('click', handleMapClick)
  map?.remove()
  map = null
  marker = null
})
</script>

<template>
  <div class="space-y-2">
    <div
      ref="mapElement"
      class="border-base-300 h-64 w-full overflow-hidden rounded-box border"
      role="application"
      aria-label="Location map. Click to choose coordinates or drag the marker."
    ></div>
    <p class="text-base-content/70 text-sm">
      Click the map or drag the marker to adjust the coordinates. The latitude and
      longitude fields provide a keyboard-accessible alternative.
    </p>
  </div>
</template>

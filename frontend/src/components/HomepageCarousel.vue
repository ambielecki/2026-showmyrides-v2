<script setup lang="ts">
import { computed, ref } from 'vue'

import {
  getHomepageImageUrl,
  type HomepageCarouselSlide,
} from '@/data/homepage'

const props = defineProps<{
  slides: HomepageCarouselSlide[]
}>()

const currentIndex = ref(0)
const failedSlideIds = ref<Set<string>>(new Set())

const currentSlide = computed(() => props.slides[currentIndex.value])
const currentImageUrl = computed(() =>
  currentSlide.value ? getHomepageImageUrl(currentSlide.value.filename) : '',
)
const currentImageFailed = computed(
  () => currentSlide.value && failedSlideIds.value.has(currentSlide.value.id),
)

function showPreviousSlide(): void {
  if (props.slides.length === 0) {
    return
  }

  currentIndex.value = (currentIndex.value - 1 + props.slides.length) % props.slides.length
}

function showNextSlide(): void {
  if (props.slides.length === 0) {
    return
  }

  currentIndex.value = (currentIndex.value + 1) % props.slides.length
}

function handleImageError(): void {
  if (!currentSlide.value) {
    return
  }

  failedSlideIds.value = new Set([...failedSlideIds.value, currentSlide.value.id])
}
</script>

<template>
  <section
    class="card bg-base-100 border-base-300 w-full overflow-hidden border shadow-xl"
    aria-label="Homepage images"
    aria-roledescription="carousel"
  >
    <template v-if="currentSlide">
      <div class="carousel w-full">
        <figure class="carousel-item bg-base-200 aspect-4/3 w-full">
          <img
            v-if="!currentImageFailed"
            :src="currentImageUrl"
            :alt="currentSlide.altText"
            class="h-full w-full object-cover"
            fetchpriority="high"
            @error="handleImageError"
          />
          <div
            v-else
            class="text-base-content/70 flex h-full min-h-64 w-full items-center justify-center p-8 text-center"
            role="img"
            :aria-label="`${currentSlide.altText}. Image unavailable.`"
          >
            <div>
              <svg
                aria-hidden="true"
                class="mx-auto mb-4 size-14"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                stroke-width="1.5"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  d="m3 16 4.5-4.5 3 3L14 11l7 7M14.5 7.5h.01M5 4h14a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2Z"
                />
              </svg>
              <p class="font-semibold">Ride map preview unavailable</p>
            </div>
          </div>
        </figure>
      </div>

      <div class="card-body gap-4 p-5">
        <p class="text-base-content/75 leading-relaxed">{{ currentSlide.description }}</p>
        <div class="card-actions flex-nowrap items-center justify-between">
          <button
            type="button"
            class="btn min-h-11"
            aria-label="Previous image"
            @click="showPreviousSlide"
          >
            Previous
          </button>
          <p class="font-semibold tabular-nums" aria-live="polite" aria-atomic="true">
            <span class="sr-only">Showing image</span>
            {{ currentIndex + 1 }} / {{ slides.length }}
          </p>
          <button
            type="button"
            class="btn min-h-11"
            aria-label="Next image"
            @click="showNextSlide"
          >
            Next
          </button>
        </div>
      </div>
    </template>

    <div
      v-else
      class="bg-base-200 text-base-content/70 flex min-h-80 items-center justify-center p-8 text-center"
      role="status"
    >
      No homepage images are available.
    </div>
  </section>
</template>

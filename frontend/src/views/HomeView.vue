<script setup lang="ts">
import HomepageCarousel from '@/components/HomepageCarousel.vue'
import { homepageContent } from '@/data/homepage'
</script>

<template>
  <div>
    <section
      class="hero bg-base-200 min-h-[calc(100svh-4rem)] bg-linear-to-br from-base-300 via-base-200 to-secondary/35"
    >
      <div
        class="hero-content mx-auto grid w-full max-w-7xl grid-cols-1 gap-10 px-6 py-12 lg:grid-cols-2 lg:gap-16 lg:px-10 lg:py-20"
      >
        <div class="max-w-2xl self-center">
          <p class="text-primary mb-4 text-sm font-extrabold tracking-widest uppercase">
            {{ homepageContent.eyebrow }}
          </p>
          <h1 class="text-4xl leading-tight font-extrabold text-balance sm:text-5xl lg:text-6xl">
            {{ homepageContent.headline }}
          </h1>
          <p class="text-base-content/75 mt-6 max-w-xl text-lg leading-relaxed">
            {{ homepageContent.introduction }}
          </p>
        </div>

        <div class="w-full self-center">
          <HomepageCarousel :slides="homepageContent.carouselSlides" />
        </div>
      </div>
    </section>

    <section class="bg-base-100 px-6 py-14 lg:px-10 lg:py-20" aria-labelledby="highlights-title">
      <div class="mx-auto max-w-7xl">
        <h2 id="highlights-title" class="sr-only">ShowMyRides highlights</h2>
        <div class="grid grid-cols-1 gap-6 md:grid-cols-3">
          <article
            v-for="highlight in homepageContent.highlights"
            :key="highlight.title"
            class="card card-border bg-base-300 h-full shadow-sm"
          >
            <div class="card-body">
              <h3 class="card-title text-xl">{{ highlight.title }}</h3>
              <p class="text-base-content/75 leading-relaxed">{{ highlight.copy }}</p>
            </div>
          </article>
        </div>
      </div>
    </section>
  </div>
</template>

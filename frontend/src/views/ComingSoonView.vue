<script setup lang="ts">
defineProps<{
  title: string
  description: string
}>()
</script>

<template>
  <section class="mx-auto w-full max-w-3xl px-6 py-10 md:py-14">
    <div class="card card-border bg-base-100 shadow-md">
      <div class="card-body">
        <p class="text-primary text-sm font-extrabold tracking-widest uppercase">Coming later</p>
        <h1 class="card-title text-3xl">{{ title }}</h1>
        <p class="text-base-content/75 text-lg leading-relaxed">{{ description }}</p>
        <div class="card-actions mt-2">
          <RouterLink :to="{ name: 'home' }" class="btn">Return home</RouterLink>
        </div>
      </div>
    </div>
  </section>
</template>

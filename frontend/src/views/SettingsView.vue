<template>
  <section class="mx-auto w-full max-w-4xl px-6 py-10 md:py-14">
    <div class="space-y-3">
      <p class="text-primary text-sm font-extrabold tracking-widest uppercase">Your account</p>
      <h1 class="text-3xl font-extrabold">Settings</h1>
      <p class="text-base-content/75 max-w-2xl text-lg">
        Manage the information used to organize and display your rides.
      </p>
    </div>

    <div class="mt-8 grid gap-6 sm:grid-cols-2">
      <RouterLink
        :to="{ name: 'settings-locations' }"
        class="card card-border bg-base-100 shadow-md transition-shadow hover:shadow-lg focus-visible:outline-primary focus-visible:outline-2 focus-visible:outline-offset-4"
      >
        <div class="card-body">
          <h2 class="card-title">Manage Locations</h2>
          <p class="text-base-content/75">
            Add and edit the parks, forests, and trail systems where you ride.
          </p>
          <div class="card-actions mt-2">
            <span class="link font-semibold">View locations</span>
          </div>
        </div>
      </RouterLink>
    </div>
  </section>
</template>

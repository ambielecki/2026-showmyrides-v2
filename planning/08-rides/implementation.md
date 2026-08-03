# Rides Implementation

## Persistence and Processing

- Add explicitly user-owned rides with UUID route keys, location relationships, nullable processed metrics, GeoJSON route
  data, and pending, processing, complete, and failed states.
- Store FIT uploads privately and launch `rides:process-fit` after the response through deferred concurrency and
  `Artisan::call()` without queues or jobs. Always delete the temporary upload.
- Decode exactly one Activity session through a provider-neutral interface backed by `sportlog/fit`, convert metrics to
  imperial units, and allow completed activities without GPS routes.

## API and Frontend

- Add protected ride CRUD, filtered pagination, and an alphabetical ride-location options endpoint. Exclude route data from
  list responses and include it only in owner-authorized detail responses.
- Replace the ride placeholders with responsive add, list, and detail pages, including processing polling, status states,
  edit and delete dialogs, and shared alerts.
- Add a reusable Leaflet route map with OpenStreetMap and Zwift image providers, route color, opacity, and visibility controls,
  native fullscreen behavior, and control-free PNG export with attribution.

## Verification and Delivery

- Add Pest coverage for ownership, validation, filtering, resources, service bindings, FIT conversion, processing states,
  asynchronous launch boundaries, failures, and file cleanup.
- Add Vitest and Playwright coverage for upload, list filtering and polling, detail states, dialogs, maps, and responsive flows.
- Run migrations and the backend and frontend verification suites, update README documentation, and deliver the branch through
  a pull request to `main`.

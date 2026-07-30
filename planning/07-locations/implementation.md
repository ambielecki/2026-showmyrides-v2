# Locations Implementation

## Persistence and API

- Create the locations schema and insert deterministic Watopia and Makuri Islands
  records in a separate data migration.
- Add the Location model, factory, ownership relationship, policy, requests, DTOs,
  resource, services, controllers, and Sanctum-protected routes.
- Add location-management and provider-neutral geocoding contracts, implement them in
  `LocationService` and `NominatimService`, and wire controller injection through the
  Laravel service container.
- Return only the authenticated user's locations from the paginated management API.
- Proxy explicit place searches to Nominatim with configuration, caching, rate limits,
  timeouts, result normalization, and graceful failures.

## Frontend

- Replace the settings placeholder with a settings dashboard and add the protected
  locations route.
- Add a responsive paginated list and a shared create/edit dialog with accessible form
  validation and shared alerts.
- Keep every editable input in the create/edit dialog on the standard white form
  surface, including the OpenStreetMap search input.
- Add a Leaflet map picker with synchronized coordinate fields, a draggable marker, and
  OpenStreetMap attribution.
- Add explicit Nominatim search during creation; selecting a result updates coordinates
  and fills a blank location name.

## Verification and Delivery

- Add Pest feature coverage for persistence, authorization, validation, pagination,
  geocoding behavior, container bindings, and mocked service contracts.
- Add Vitest and Playwright coverage for settings navigation and location management.
- Run the migrations, backend tests and formatter, frontend tests, lint, build, and
  Chromium browser tests.
- Update README documentation, commit the relevant files, push `07-locations`, and open
  a pull request to `main`.

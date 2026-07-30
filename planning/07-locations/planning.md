# Locations

The application will allow users to create and edit locations for rides. A location will
usually be a park, forest, or trail system. The application will also provide
system-defined locations for Zwift rides.

## Table Schema

- Table name: `locations`
- Columns:
  - `id`
  - `external_id` (UUIDv4)
  - `user_id` (nullable unsigned big integer referencing `users.id`)
  - `system_key` (nullable varchar 255) for stable references such as `watopia` and
    `makuri-islands`
  - `map_provider` (varchar 255, default `openstreetmap`) for selecting the ride-display
    basemap
  - `name` (varchar 255)
  - `latitude` (decimal 8,6)
  - `longitude` (decimal 9,6)
  - `created_at`
  - `updated_at`
- Ride creation will eventually show the authenticated user's locations together with
  the Zwift locations, which have no `user_id`.
- Insert the following system locations in a data migration with deterministic UUIDv4
  external IDs:

```sql
INSERT INTO locations (user_id, system_key, map_provider, name, latitude, longitude, created_at, updated_at) VALUES (null, 'watopia', 'watopia', 'Watopia', -11.683420, 166.955010, '2026-07-09 15:43:30', '2026-07-09 15:43:30');
INSERT INTO locations (user_id, system_key, map_provider, name, latitude, longitude, created_at, updated_at) VALUES (null, 'makuri-islands', 'makuri-islands', 'Makuri Islands', -10.780440, 165.829354, '2026-07-12 01:17:44', '2026-07-12 01:17:44');
```

## Backend

- Create the model, controller, requests, DTOs, resources, policies, services, and tests
  needed for authenticated location management.
- Users may list, create, and edit only their own locations. System locations are not
  editable.
- Provide a backend-proxied OpenStreetMap Nominatim search. Public Nominatim does not
  require an API key, but search must be explicitly submitted because its usage policy
  forbids autocomplete.
- Cache search results, identify the application, and enforce provider-compatible rate
  limits.

## UI

- Replace the authenticated settings placeholder with a page containing a Manage
  Locations card linking to `/settings/locations`.
- Show the user's locations 10 per page. Each row displays name, latitude, longitude,
  and an Edit button. Do not show system locations.
- Use the same accessible modal to create and edit locations. Users can edit name,
  latitude, and longitude; `system_key` and `map_provider` remain server-controlled.
- Include a Leaflet map in the modal. Map clicks, marker dragging, coordinate fields,
  and selected search results remain synchronized.
- Search is available while creating a location. Search only after the user explicitly
  submits at least three characters. Selecting a result always fills the coordinates and
  fills the name only when it is blank.
- Deletion and a combined ride-picker API are outside this iteration.

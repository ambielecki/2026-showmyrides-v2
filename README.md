# ShowMyRides v2

ShowMyRides is a Vue 3 single-page application backed by a Laravel 13 API. The local
environment runs Laravel, PHP 8.5, nginx, and MariaDB through Docker Compose while the
frontend runs through Vite.

## Local development

Start the backend services:

```sh
docker compose up -d
```

The API is available at `http://localhost:8080`. Configure `backend/.env` with:

```dotenv
APP_URL=http://localhost:8080
FRONTEND_URL=http://localhost:5173
SANCTUM_STATEFUL_DOMAINS=localhost:5173
SESSION_DOMAIN=null
NOMINATIM_BASE_URL=https://nominatim.openstreetmap.org
NOMINATIM_USER_AGENT="ShowMyRides/2.0 (+https://showmyrides.com)"
```

Install and start the frontend with Node 26:

```sh
cd frontend
npm install
npm run dev
```

The SPA is available at `http://localhost:5173`.

## Authentication

The application uses Laravel Fortify and Sanctum session cookies for registration,
login, logout, and authenticated API requests. The frontend initializes CSRF protection
through `/sanctum/csrf-cookie` and sends all API requests with credentials.

The login page collects email and password in two steps. Authenticated routes are
protected by Vue Router, and the navbar changes between guest, user, and administrator
navigation. On the password step, users can opt in to a 30-day remembered login. The
duration is configured in minutes:

```dotenv
AUTH_REMEMBER_DURATION=43200
```

Optional local Playwright integration credentials can be configured without committing
their values:

```dotenv
TEST_USER_EMAIL=
TEST_USER_PASSWORD=
```

The auth integration test creates this regular, non-administrator test user when it does
not already exist.

## Locations

Authenticated users can manage their parks, forests, and trail systems from
`/settings/locations`. The Laravel API stores user-owned locations and installs Watopia
and Makuri Islands as protected system locations for future ride selection.

The create and edit dialog includes a Leaflet map backed by OpenStreetMap tiles. Location
creation can explicitly search OpenStreetMap Nominatim through the backend proxy; the
proxy identifies the application, caches results for 24 hours, and enforces public
service rate limits. Manual coordinate entry remains available when search is
unavailable.

## Verification

Run backend commands in the deploy container:

```sh
docker exec showmyrides-v2-php-deploy php artisan test --compact
docker exec showmyrides-v2-php-deploy ./vendor/bin/pint --dirty --format agent
```

Run frontend verification from `frontend`:

```sh
npm run test:unit -- --run
npm run lint
npm run build
npm run test:e2e -- --project=chromium
```

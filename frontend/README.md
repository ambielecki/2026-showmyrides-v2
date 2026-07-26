# ShowMyRides Frontend

Vue 3 frontend for ShowMyRides. The application uses Pinia, Vue Router, Tailwind CSS 4,
DaisyUI 5, Vitest, and Playwright.

## Local setup

Use Node 26 and install dependencies:

```sh
npm install
```

Set the Laravel API origin in `.env.local`:

```dotenv
VITE_API_URL=http://localhost:8080
```

The homepage carousel loads `harold_parker.png`, `watopia.png`, and
`makuri_islands.png` from the backend's public storage URL. It displays an accessible
fallback when the backend or an image is unavailable.

Start the Vite development server:

```sh
npm run dev
```

## Verification

```sh
npm run build
npm run test:unit -- --run
npm run lint
npm run test:e2e -- --project=chromium
```

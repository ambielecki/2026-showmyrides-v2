# Add Ride Related Pages and Functionality
Add the ability to create, list, view, edit, and delete rides and show the route on a map.

## Implementation
- Use the installed `sportlog/fit` package to decode uploaded Garmin FIT files.

### Database, Models, Controllers
- Create a rides table
  - id
  - external_id
  - user_id references users.id
  - location_id references location.id
  - name (varchar 255)
  - garmin_name (varchar 255)
  - description (text)
  - ride_datetime (datetime)
  - route_data (longtext)
  - distance (decimal 10,2)
  - total_time (unsigned integer seconds)
  - moving_time (unsigned integer seconds)
  - average_speed (decimal 10,2)
  - max_speed (decimal 10,2)
  - processing_status (varchar 255)
  - processing_error (text, nullable)
  - created_at
  - updated_at
- Create necessary controllers and model following AGENTS.md guidance (create dtos, services, interfaces, requests)
- Create an Artisan command to process Garmin FIT files. The upload controller stores the file privately and creates a pending
  ride, then uses deferred concurrency to call the command asynchronously with `Artisan::call()` after the response. The
  command processes and saves the data and then deletes the file.
- Do not implement queues or jobs at this time. Keep the processing boundary suitable for migration to a queued job later.
- Store data in imperial units, times as integer seconds, and distances and speeds to two decimal places.
- Persist route data as a GeoJSON LineString. A valid activity without GPS data remains a completed ride without a route.
- Persist failed processing attempts with a safe error message so the user can view and delete them.

### Add Ride
- Create frontend page and form to add a ride.
  - Each ride requires a location. Populate the select input with the user's locations and system locations for Zwift in
  alphabetical order.
  - The form accepts name (required), description (optional), location, and a Garmin FIT file upload up to 50 MB.
- After successful upload, redirect user to the rides list page

### Ride List
- Create a paginated list of rides
- This list should be filterable by location, rolling date range (all rides, last week, month, or year), and selectable page
  size (10 by default, 25, or 50).
- The API should only select necessary data from the DB and return that (do not return route_data)
- The list should be cards showing the ride name, description if provided, distance (miles), moving_time (hours and minutes) and location
- We will add the ability to upload an image later, there should be room on the card for a thumbnail image, with a default for now or when
  no image is provided.
- The name of the ride should link to the view ride page

### View ride
- Reference the screenshot from the live site showmyrides.com_rides_1.png
- The view page should show a prominent map with the route displayed on the map (leaflet and openstreetmaps)
- User should be able to control the route color and opacity
- User should be able to download an image of the map with the route
- Route data should be displayed to the right on desktop and below the map on mobile.
- User can edit a ride. Clicking Edit opens a modal that allows editing name and description with Cancel and Save buttons.
- User can delete ride, clicking delete will bring up a confirmation modal
- The map feature should be a reusable component. We will add the map overlay later where multiple routes can be added
- Watopia and Makuri Islands use the matching image-overlay basemaps from the referenced ZwiftMap project.
- Downloaded map PNGs include the current basemap, route styling, and attribution, but no interactive map or form controls.

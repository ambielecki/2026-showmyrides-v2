# Homepage
Create the necessary Vue routing, app shell, and components to recreate the homepage at https://showmyrides.com using daisyUI.
This does not need to be a pixel perfect recreation, but should contain the same elements

## Simple Implementation
- The app should have a fixed top navbar, it will show the site name on the left with a link back to the hompage
Multiple links will live on the right and some links will only show to authenticated users
- There will be a title and some explanatory text in the left column on desktop, and the top of the page on mobile
- There will be an image carousel on the right on desktop and below the title / text section on mobile
- Below will be a section with a configurable number of cards that will have details / callouts about the site. Start with
3, but later we will add the ability to customize the number and text
- The should be a footer with copyright information and a link to the project's github repository

## Other information
- Start with static content, but later we will add the ability to modify the copy on all elements from an admin page
- There are images in ../backend/storage/public that can be used as examples, if these images do not exist default to a placeholder
  - The public storage folder has been symlinked so can be served from the backend

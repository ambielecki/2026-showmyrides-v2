# ShowMyRides v2
This project is a web application running with a Vue 3 frontend, PHP 8.5 backend using the Laravel framework

## General Overview
- The root directory contains the docker-compose.yml file the defines the following services
  - showmyrides-v2: nginx for the PHP backend api
  - showmyrides-v2-php: the php 8.5 fpm service with xdebug that the nginx container uses
  - showmyrides-v2-php-deploy: a separate php container without xdebug for running commands (laravel artisan commands)
  - showmyrides-v2-mariadb: database
- ./backend contains the Laravel API code
- ./frontend contains the Vue frontend code
- ./docker contains Dockerfiles for the containers

## General instructions
- Do not use the PHP installed on the operating system, all PHP commands should be run in the showmyrides-v2-php-deploy container
  - Example for a Laravel migration `docker exec -it showmyrides-v2-php-deploy php artisan migrate`
    - The container working directory is `/var/wwww/html/backend` to match the backend directory

## Branching and Merging
- Create a commit message after any changes
- Please commit any files in ./planning that are relevant to the current work
- never work on main, if we are currently on main, pull changes and create a new branch from main
- create a PR to main after changes with the commit message
- commit and pr messages do not need to describe tests run locally
- If a PR already exists for the branch to main, just push changes
- Update the README.md after major functionality changes
- If we are planning from a document in the planning directory, create an implementation.md with the implementation plan when starting work

## Additional Resources
- The current site lives at https://showmyrides.com and can be used as a resource
- The code for the original repository lives at ../2026-bike
- The code that inspired Zwift maps integration lives at ../zwiftmap

## Additional Instructions
- The backend and frontend directories contain AGENTS.md files with instructions for the relevant portions of the code
# omnifood

Subscription based food delivery web app

## Table of contents
- [Introduction](#introduction)
- [Tech stack](#tech-stack)
- [Project walk-through](#walk-through)
- [Setup/Launch](#setup)
- [status](#status)

# Introduction

This project is a web app made for a fictional subscription based food delivery start up.
It uses Google's Firebase BaaS to store and retrieve data (both json and files), to enable user authentication and role based authorization for certain parts of the app (e.g. user management) and to execute some server-side code (using Firebase Functions service).
The food in "food delivery app" is brought to the useers from [Edamam's API](https://developer.edamam.com/edamam-docs-recipe-api), from where it fetches recipes.
The UI elements that must be available across the app's pages (e.g. error modal, authentication modal) were built as components.

The purpose of this project is to practice my front-end development skills.

# Tech Stack

HTML5
SASS
JavaScript ES6+
Parcel ^2.8.2
Firebase (Authentication, Live Database, Cloud Storage, Cloud Functions)

# Walk Through

You can check the app's pages walk-through down below:
(Recruiter and Admin pages are not avalable in the live version for basic users, you can check them here)
****paused***


# Setup

To run the the app on your machine and play around, just clone the repo and run npm install command in your terminal, then run npm run start command (which is a npm script - can be found in package.json) to start a development server - and you're done.

# Status

The project is still under development, there are features in the backlog, fine-tuning and code refactoring here and there.


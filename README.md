# omnifood

Subscription based food delivery web app

## Table of contents
- [Introduction](#introduction)
- [Tech stack](#tech-stack)
- [Project walk-through](#walk-through)
- [Setup/Launch](#setup)
- [status](#status)
- [General info](#general-info)

#introduction

This project is a web app made for a fictional subscription based food delivery start up.
It uses Google's Firebase BaaS to store and retrieve data (both json and files), to enable user authentication and role based authorization for certain parts of the app (e.g. user management) and to execute some server-side code (using Firebase Functions service).
The food in "food delivery app" is brought to the useers from [Edamam's API](https://developer.edamam.com/edamam-docs-recipe-api), from where it fetches recipes.
The UI elements that must be available across the app's pages (e.g. error modal, authentication modal) were built as components.

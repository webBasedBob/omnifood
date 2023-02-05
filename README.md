# Omnifood

Live version: https://omnifood-custom-version.web.app/

Subscription based food delivery web app

## Table of contents
- [Introduction](#introduction)
- [Tech stack](#tech-stack)
- [Project walk-through](#walk-through)
- [Setup/Launch](#setup)
- [Status](#status)

# Introduction

This project is a web app made for a fictional subscription based food delivery start up.
It uses Google's Firebase BaaS to store and retrieve data (both json and files), to enable user authentication and role based authorization for certain parts of the app (e.g. user management) and to execute some server-side code (using Firebase Functions service).
The food in "food delivery app" is brought to the useers from [Edamam's API](https://developer.edamam.com/edamam-docs-recipe-api), from where it fetches recipes.
The UI elements that must be available across the app's pages (e.g. error modal, authentication modal) were built as components.

The purpose of this project is to practice my front-end development skills.

# Tech Stack

- HTML5
- SASS
- JavaScript ES6+
- Parcel ^2.8.2
- Firebase (Authentication, Live Database, Cloud Storage, Cloud Functions)

# Walk Through

You can check the app's pages walk-through down below:
(Recruiter and Admin pages are not avalable in the live version for basic users, you can check them here)

Project's pages walkthrough:

#### [Home Page](https://omnifood-custom-version.web.app/)

  Landing page created by completing a [HTML and CSS course](https://www.udemy.com/course/design-and-develop-a-killer-website-with-html5-and-css3/)
  
#### [Browse Recipes](https://omnifood-custom-version.web.app/up_/recipes/)

  Here the user (no acc needed) can search for recipes using keywords and filters.
  The recipes are fetched from [Edamam's API](https://developer.edamam.com/edamam-docs-recipe-api). The user can open the full recipe's ingredinets, browse through recipes and save them (log in needed) to favorites (with the help of [Firebase Live Database](https://firebase.google.com/docs/database))
  
#### [Careers](https://omnifood-custom-version.web.app/up_/careers/)

  This page hosts job postings from the fictional company. 
  The data (jobs) is fetched from [Firebase Live Database](https://firebase.google.com/docs/database) and then rendered on the page.
  Main features:
  - job search based on keywords
  - results sorting (based on relevance, date or salary)
  - results filtering (location, field, experience)
  - open job in full screen with full details
  - users can apply to jobs
  - resume upload (drag and drop included)
  
### App's MAIN CONTENT

Mention: The App aims to use AI (spoiler: it doens't) to suggest meals to the user and then deliver them to the user's door. So the way I impelmented it is the following:
- a section that asks the user to evaluate some common ingredients
- a section that asks the user to evaluate recipe suggestions based on previously evaluated ingredients
- a section that lets the user build a plan for the next month with the recipes he previously liked

#### [Ingredients Evaluation](https://omnifood-custom-version.web.app/up_/plan/ingredients/)

  The user can evaluate 40 commom ingredients, stored in [Firebase Cloud Storage](https://firebase.google.com/docs/storage) and fetched from the frontend are then rendered based on status (liked, disliked, not yet evaluated).

#### [Meals Evaluation](https://omnifood-custom-version.web.app/up_/plan/meals/)

  Based on evaluated ingredients, a url query is created and used to fetch recipes from [Edamam's API](https://developer.edamam.com/edamam-docs-recipe-api), the results are checked against the already evaluated recipes of the user (stored in [Firebase Live Database](https://firebase.google.com/docs/database)) and those that were not evaluated before are then rendered in a swiper component(like the Tinder one).
  The user can check liked recipes, can evaluate new recipes, can see the full list of ingredients for any recipe.

#### [Plan Creation](https://omnifood-custom-version.web.app/up_/plan/create-plan/)

  Here the user has acces to previously liked recipes which will be used to create a meal plan for the next 1 month starting from today's date.
  The page has one calendar component to switch between days of the month, a section with the liked recipes and a component with 2 meal placeholders where recipes can be dragged and dropped.
  The plan is stored in [Firebase Live Database](https://firebase.google.com/docs/database).
  
#### [Account Console](https://omnifood-custom-version.web.app/up_/account/)

Here the user can check and change account relevant data (Name, Email, Phone, Adresses, Delivery Times), can manage the account (change password, send password reset email, delete account) and can register complaints and check the Admin's response for each one and it's status.

#### [Admin Console](https://omnifood-custom-version.web.app/up_/admin/)

  This page is not avalable to the users who are not Admins (based on custom claims - a feature of [Firebase Authentication Service](https://firebase.google.com/docs/auth) ).
  All the data is fteched form Firebase if the account has Admin claim. After the data is rendered, the Admin can:
  - see all users(email and type of account - custom claim)
  - delete users
  - assign custom roles (Recruiter, subscriber, admin) or delete existing roles
  - search for user in the ursers list
  - sort users by email/account type
  - export users as CSV
  - the actions described above can be performed both on individual users one at a time, and on multiple users/all users by selecting them
  
  Screens:
  ![image](https://user-images.githubusercontent.com/95532233/216842546-869c1e04-2467-4b83-8d3f-55af10d81fe3.png)

#### [Recruiter Console](http://localhost:1234/up_/recruiter/)

   This page is not avalable to the users who are not Recruiters or Admins.
   All the data is fteched form Firebase if the account has Recruiter/Admin claim. After the data is rendered, the Recruiter/Admin can:
  - see all jobs
  - edit jobs
  - change job's status
  - export aplicants
  - delete jobs
  
  Screens:
  ![image](https://user-images.githubusercontent.com/95532233/216844689-795299ae-2221-4426-9b76-cf944ded53d4.png)

# Setup

To run the the app on your machine and play around, just clone the repo and run npm install command in your terminal, then run npm run start command (which is a npm script - can be found in package.json) to start a development server - and you're done.

# Status

The project is still under development, there are features in the backlog, fine-tuning and code refactoring here and there.


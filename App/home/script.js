import Notification from "../general/components/notification/script.js";
import Navigation from "../general/components/navigation/script.js";
import AuthModal from "../general/components/authModal/script.js";
import {
  ErrorEvent,
  NotificationEvent,
  LogInEvent,
  LogOutEvent,
} from "../general/js/customEvents.js";
import {
  throwError,
  displayNotification,
} from "../general/js/reusableFunctions.js";
import ErrorPopup from "../general/components/errorModal/script.js";
const eventListeners = function () {
  // document.addEventListener("error", ErrorPopup.display.bind(ErrorPopup));
  // document.addEventListener(
  //   "notification",
  //   Notification.display.bind(Notification)
  // );
};
eventListeners();
// console.log("Hello world!");

// const myName = "Jonas Schmedtmann";
// const h1 = document.querySelector(".heading-primary");
// console.log(myName);
// console.log(h1);

// // h1.addEventListener("click", function () {
// //   h1.textContent = myName;
// //   h1.style.backgroundColor = "red";
// //   h1.style.padding = "5x`rem";
// // });

// ///////////////////////////////////////////////////////////
// // Set current year
// const yearEl = document.querySelector(".year");
// const currentYear = new Date().getFullYear();
// yearEl.textContent = currentYear;

// ///////////////////////////////////////////////////////////
// Make mobile navigation work
const mobileNavFunctionality = function () {
  const btnNavEl = document.querySelector(".btn-mobile-nav");
  const headerEl = document.querySelector(".header");

  btnNavEl.addEventListener("click", function () {
    headerEl.classList.toggle("nav-open");
  });
};
mobileNavFunctionality();
// ///////////////////////////////////////////////////////////
// // Smooth scrolling animation

// const allLinks = document.querySelectorAll("a:link");

// allLinks.forEach(function (link) {
//   link.addEventListener("click", function (e) {
//     if (!link.innerHTML.match(new RegExp("Careers|directory"))) {
//       e.preventDefault();
//     }
//     const href = link.getAttribute("href");

//     // Scroll back to top
//     if (href === "#")
//       window.scrollTo({
//         top: 0,
//         behavior: "smooth",
//       });

//     // Scroll to other links
//     if (href !== "#" && href.startsWith("#")) {
//       const sectionEl = document.querySelector(href);
//       sectionEl.scrollIntoView({ behavior: "smooth" });
//     }

//     // Close mobile naviagtion
//     if (link.classList.contains("main-nav-link"))
//       headerEl.classList.toggle("nav-open");
//   });
// });

// ///////////////////////////////////////////////////////////
// // Sticky navigation

// const sectionHeroEl = document.querySelector(".section-hero");

// const obs = new IntersectionObserver(
//   function (entries) {
//     const ent = entries[0];
//     console.log(ent);

//     if (ent.isIntersecting === false) {
//       document.body.classList.add("sticky");
//     }

//     if (ent.isIntersecting === true) {
//       document.body.classList.remove("sticky");
//     }
//   },
//   {
//     // In the viewport
//     root: null,
//     threshold: 0,
//     rootMargin: "-80px",
//   }
// );
// obs.observe(sectionHeroEl);

// ///////////////////////////////////////////////////////////
// // Fixing flexbox gap property missing in some Safari versions
// function checkFlexGap() {
//   var flex = document.createElement("div");
//   flex.style.display = "flex";
//   flex.style.flexDirection = "column";
//   flex.style.rowGap = "1px";

//   flex.appendChild(document.createElement("div"));
//   flex.appendChild(document.createElement("div"));

//   document.body.appendChild(flex);
//   var isSupported = flex.scrollHeight === 1;
//   flex.parentNode.removeChild(flex);
//   console.log(isSupported);

//   if (!isSupported) document.body.classList.add("no-flexbox-gap");
// }
// checkFlexGap();

import { initializeApp } from "firebase/app";
import { getAuth, onAuthStateChanged } from "firebase/auth";
const firebaseConfig = {
  apiKey: "AIzaSyCuCBob9JTkZveeOtZa2oRfLtZKf5aODek",
  authDomain: "omnifood-custom-version.firebaseapp.com",
  databaseURL:
    "https://omnifood-custom-version-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "omnifood-custom-version",
  storageBucket: "omnifood-custom-version.appspot.com",
  messagingSenderId: "1094073505469",
  appId: "1:1094073505469:web:92153bcbde9d51536f49d4",
  measurementId: "G-1DT1EYNVPW",
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
let user;

import { globalEventsHandler } from "../general/js/crossSiteFunctionality.js";
document.addEventListener("click", globalEventsHandler);
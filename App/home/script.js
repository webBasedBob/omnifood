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
import { initializeApp } from "firebase/app";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { globalEventsHandler } from "../general/js/crossSiteFunctionality.js";

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

document.addEventListener("click", globalEventsHandler);

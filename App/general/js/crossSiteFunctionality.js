// import ErrorPopup from "./components/errorComponent.js";
// import Notification from "./components/notificationComponent.js";
// import authModal from "./../js/components/authComponent.js";
// import FullscreenRecipe from "./components/fullscreenRecipe.js";
// import Navigation from "./components/navigationComponent.js";
// import NotAuthorizedScreen from "./components/notAuthorizedComponent.js";
// import NotLoggedInScreen from "./components/notLoggedInComponent.js";
// import { ErrorEvent } from "./customEvents";
// import { NotificationEvent } from "./customEvents";
// import { LogOutEvent } from "./customEvents";

// document.addEventListener("error", ErrorPopup.display.bind(ErrorPopup));
// document.addEventListener(
//   "notification",
//   Notification.display.bind(Notification)
// );
import authComponent from "../components/authModal/script";
import { cleanStrFromSymbolsAndUselessSpaces } from "./reusableFunctions";
import { LogOutEvent } from "./customEvents";
export const globalEventsHandler = (e) => {
  const targetEvent = e.target.dataset.event;
  console.log(targetEvent);
  switch (targetEvent) {
    case "display-auth-modal":
      authComponent.display();
      break;
  }
};

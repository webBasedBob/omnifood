import authComponent from "../components/authModal/script";
import { cleanStrFromSymbolsAndUselessSpaces } from "./reusableFunctions";
import { LogOutEvent } from "./customEvents";
export const handleComponentsRelatedEvents = (e) => {
  const targetEvent = e.target.dataset.event;
  console.log(targetEvent);
  switch (targetEvent) {
    case "display-auth-modal":
      authComponent.display();
      break;
  }
};
document.addEventListener("click", handleComponentsRelatedEvents);

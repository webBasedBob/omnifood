import authComponent from "../components/authModal/script";
import { cleanStrFromSymbolsAndUselessSpaces } from "./reusableFunctions";

export const handleComponentsRelatedEvents = (e) => {
  const targetEvent = e.target.dataset.event;
  console.log(targetEvent);
  switch (targetEvent) {
    case "display-auth-modal":
      authComponent.display();
      break;
    case "log-out":
      authComponent.logOut();
      break;
  }
};
document.addEventListener("click", handleComponentsRelatedEvents);

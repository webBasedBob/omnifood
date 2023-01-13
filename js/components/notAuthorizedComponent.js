import { NotLoggedInScreen } from "./notLoggedInComponent.js";
import { toTitleCase } from "./../reusableFunctions.js";

class NotAuthorizedScreen extends NotLoggedInScreen {
  html = `
  <div class="not-logged-in-screen hidden">
    <h3>You are not logged in</h3>
    <p>Please log in to access this page</p>
    <button data-event="display-auth-modal" class="auth-me">
      Log In / Sign Up
    </button>
</div>`;
  display(roleNeeded) {
    this.screen.innerHTML = `<h3>Access denied</h3>
    <p>You need to be an ${toTitleCase(roleNeeded)} to access this page</p>`;
    super.display();
  }
}

export default new NotAuthorizedScreen();

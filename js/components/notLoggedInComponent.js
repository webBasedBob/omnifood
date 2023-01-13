import BaseComponent from "./baseClassComponent.js";

export class NotLoggedInScreen extends BaseComponent {
  constructor() {
    super();
    this.component = document.querySelector(".not-logged-in-screen");
  }
  getHTML() {
    return `
    <div class="not-logged-in-screen hidden">
      <h3>You are not logged in</h3>
      <p>Please log in to access this page</p>
      <button data-event="display-auth-modal" class="auth-me">
        Log In / Sign Up
      </button>
  </div>`;
  }
}

export default new NotLoggedInScreen();

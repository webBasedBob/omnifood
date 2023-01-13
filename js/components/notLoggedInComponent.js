export class NotLoggedInScreen {
  html = `
  <div class="not-logged-in-screen hidden">
    <h3>You are not logged in</h3>
    <p>Please log in to access this page</p>
    <button data-event="display-auth-modal" class="auth-me">
      Log In / Sign Up
    </button>
</div>`;
  constructor() {
    this.render();
    this.screen = document.querySelector(".not-logged-in-screen");
  }
  render() {
    document.body.insertAdjacentHTML("afterbegin", this.html);
  }
  display() {
    this.screen.classList.remove("hidden");
  }
  hide() {
    this.screen.classList.add("hidden");
  }
}

export default new NotLoggedInScreen();

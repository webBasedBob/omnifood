import BaseComponent from "./baseClassComponent.js";

class ErrorPopup extends BaseComponent {
  errorCodesDictionary = {
    "auth/network-request-failed":
      "Operation failed due to network issues, please check your internet connection",
    "auth/email-already-in-use":
      "The email you entered is already associated with an account, please log in instead",
    "auth/wrong-password": "Wrong password, please try again!",
    "auth/too-many-requests":
      "Access to this account has been temporarily disabled due to many failed login attempts. Reset your password or log in later!",
    "auth/user-not-found":
      "Email adress does not match any account, please make sure it is spelled correctly or create an new account!",
    "auth/quota-exceeded":
      "The maximim number of name changes was exceeded, please try again later!",
    default: "An unexpected error occurred, please try again later",
  };

  constructor() {
    super();
    this.component = document.querySelector(".error-overlay");
    this.errorMessageContainer = this.component.querySelector(".error-message");
  }
  display(errorEvent) {
    const errorCode = errorEvent.detail.errorCode;
    this.errorMessageContainer.innerText =
      this.errorCodesDictionary[errorCode] ||
      errorCode ||
      this.errorCodesDictionary.default;
    super.display();
  }
  getHTML() {
    return `
    <div class="error-overlay hidden">
      <div class="error-modal">
        <svg
          name="alert-circle"
          class="error-icon"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="currentColor"
          class="w-6 h-6"
        >
          <path
            fill-rule="evenodd"
            d="M9.401 3.003c1.155-2 4.043-2 5.197 0l7.355 12.748c1.154 2-.29 4.5-2.599 4.5H4.645c-2.309 0-3.752-2.5-2.598-4.5L9.4 3.003zM12 8.25a.75.75 0 01.75.75v3.75a.75.75 0 01-1.5 0V9a.75.75 0 01.75-.75zm0 8.25a.75.75 0 100-1.5.75.75 0 000 1.5z"
            clip-rule="evenodd"
          />
        </svg>
        <h4>Oops...</h4>
        <p class="error-message">generic error message</p>
        <button data-event= "close-error-popup" class="close-error-modal-btn">Dismiss</button>
      </div>
    </div>`;
  }
}

export default new ErrorPopup();

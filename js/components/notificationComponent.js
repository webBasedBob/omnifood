import BaseComponent from "./baseClassComponent.js";

class Notification extends BaseComponent {
  constructor() {
    super();
    this.component = document.querySelector(
      ".action-result-notification-pop-up"
    );
    this.messageContainer = document.querySelector(".notification-text");
  }
  display(notificationEvent) {
    const notificationText = notificationEvent.detail.notificationText;
    this.messageContainer.innerText = notificationText;
    super.display();
    setTimeout(() => {
      this.hide();
    }, 3000);
  }
  getHTML() {
    return `
  <div class="action-result-notification-pop-up hidden">
  <svg
    name="checkmark-circle"
    class="checkmark-icon"
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="currentColor"
    class="w-6 h-6"
  >
    <path
      fill-rule="evenodd"
      d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12zm13.36-1.814a.75.75 0 10-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 00-1.06 1.06l2.25 2.25a.75.75 0 001.14-.094l3.75-5.25z"
      clip-rule="evenodd"
    />
  </svg>
  <p class="notification-text">Succour profile naSuccessfSSuc</p>
  <svg data-event = "close-notification" 
    name="close"
    class="close-icon"
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="currentColor"
    class="w-6 h-6"
  >
    <path
      fill-rule="evenodd"
      d="M5.47 5.47a.75.75 0 011.06 0L12 10.94l5.47-5.47a.75.75 0 111.06 1.06L13.06 12l5.47 5.47a.75.75 0 11-1.06 1.06L12 13.06l-5.47 5.47a.75.75 0 01-1.06-1.06L10.94 12 5.47 6.53a.75.75 0 010-1.06z"
      clip-rule="evenodd"
    />
  </svg>
</div>`;
  }
}

export default new Notification();

import BaseComponent from "../baseComponent/script";

class Notification extends BaseComponent {
  constructor() {
    super();
    this.component = document.querySelector(
      ".action-result-notification-pop-up"
    );
    this.messageContainer = document.querySelector(".notification-text");
    this.handleEvents();
  }
  handleEvents() {
    this.component.addEventListener("click", (e) => {
      const targetEvent = e.target.dataset.event;
      switch (targetEvent) {
        case "close-notification":
          this.hide();
          break;
      }
    });
    document.addEventListener("notification", this.display.bind(this));
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
  <svg name="checkmark-circle" class="checkmark-icon" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6">
  <path stroke-linecap="round" stroke-linejoin="round" d="M4.5 12.75l6 6 9-13.5" />
  </svg>
  <p class="notification-text"></p>
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

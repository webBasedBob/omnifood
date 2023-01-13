export class ErrorEvent extends CustomEvent {
  constructor(errorCode) {
    super("error", {
      bubbles: true,
      detail: { errorCode: errorCode },
    });
  }
}

export class NotificationEvent extends CustomEvent {
  constructor(notificationText) {
    super("notification", {
      bubbles: true,
      detail: { notificationText: notificationText },
    });
  }
}

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
export class LogOutEvent extends CustomEvent {
  constructor() {
    super("logged-out", {
      bubbles: true,
    });
  }
}
export class LogInEvent extends CustomEvent {
  constructor() {
    super("logged-in", {
      bubbles: true,
    });
  }
}

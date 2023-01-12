import { initializeApp } from "firebase/app";
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
} from "firebase/auth";
class AuthModal {
  firebaseConfig = {
    apiKey: "AIzaSyCuCBob9JTkZveeOtZa2oRfLtZKf5aODek",
    authDomain: "omnifood-custom-version.firebaseapp.com",
    databaseURL:
      "https://omnifood-custom-version-default-rtdb.europe-west1.firebasedatabase.app",
    projectId: "omnifood-custom-version",
    storageBucket: "omnifood-custom-version.appspot.com",
    messagingSenderId: "1094073505469",
    appId: "1:1094073505469:web:92153bcbde9d51536f49d4",
    measurementId: "G-1DT1EYNVPW",
  };

  firebaseApp = initializeApp(this.firebaseConfig);
  firebaseAuth = getAuth(this.firebaseApp);
  user;

  modalHTML = `
    <div class="auth-overlay-container hidden">
    <div class="auth-modal">
      <div class="choose-action-container">
        <button data-event = "switch-auth-method" class="choose-action-btn choose-action-login btn-active">
          LOGIN
        </button>
        <button data-event = "switch-auth-method" class="choose-action-btn choose-action-sign-up">SIGN UP</button>
      </div>

      <form action="" class="action-elements-container login-container">
        <label for="login-email" class="auth-input-label">Email</label>
        <input type="email" id="login-email" class="auth-text-input" required />
        <label for="login-psw" class="auth-input-label">Password</label>
        <input
          type="password"
          id="login-psw"
          class="auth-text-input"
          required
        />
        <div class="remember-me-container">
          <input type="checkbox" id="remember-me" checked />
          <label for="remember-me">Remember me</label>
        </div>
        <input  data-event = "log-in" type="submit" value="LOGIN" class="take-action-btn login-btn" />
        <a href="#" data-event = "display-forgot-psw" class="forgot-psw">Forgot Password?</a>
      </form>
      <form class="action-elements-container sign-up-container hidden">
        <label for="sign-up-email" class="auth-input-label">Email</label>
        <input
          type="email"
          id="sign-up-email"
          class="auth-text-input"
          required
        />
        <label for="sign-up-psw" class="auth-input-label">Password</label>
        <input
          type="password"
          id="sign-up-psw"
          class="auth-text-input"
          required
          pattern="(?=.*\\d)(?=.*[a-z])(?=.*[A-Z]).{8,}"
          title="Password must contain: 1 lowercase, 1 uppercase, 1 number"
        />
        <input
          type="submit"
          value="SIGN UP"
          data-event = "sign-up"
          class="take-action-btn sign-up-btn"
        />
      </form>
      <form class="action-elements-container forgot-psw-container hidden">
        <label for="forgot-psw-email" class="auth-input-label">Email</label>
        <input
          type="email"
          id="forgot-psw-email"
          class="auth-text-input"
          required
        />
        <input
          type="submit"
          value="Send password reset email"
          data-event = "forgot-psw"
          class="take-action-btn reset-psw-btn"
        />
      </form>
    </div>
      <div class="overlay">
        <svg
          name="close-circle-outline"
          data-event = "close-auth-modal"
          class="auth-modal-close-btn"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="currentColor"
          class="w-6 h-6"
        >
          <path
            fill-rule="evenodd"
            d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25zm-1.72 6.97a.75.75 0 10-1.06 1.06L10.94 12l-1.72 1.72a.75.75 0 101.06 1.06L12 13.06l1.72 1.72a.75.75 0 101.06-1.06L13.06 12l1.72-1.72a.75.75 0 10-1.06-1.06L12 10.94l-1.72-1.72z"
            clip-rule="evenodd"
          />
        </svg>
      </div>
    </div>`;
  constructor() {
    this.render();
    this.modal = document.querySelector(`.auth-modal`);
    this.overlay = document.querySelector(`.auth-overlay-container`);
    this.modalFormsContainers = document.querySelectorAll(
      ".action-elements-container"
    );
    this.forgotPswForm = document.querySelector(".forgot-psw-container");
    this.chooseAuthMethodBtns = Array.from(
      document.querySelector(".choose-action-container").children
    );
    document.addEventListener("click", this.handleEvents.bind(this));
  }
  display() {
    this.overlay.classList.remove("hidden");
    // this.modal.classList.remove("hidden");
  }
  hide() {
    this.overlay.classList.add("hidden");
    // this.modal.classList.add("hidden");
  }
  hideForms() {
    this.modalFormsContainers.forEach((formContainer) => {
      if (formContainer.classList.contains("choose-action-container")) return;
      formContainer.classList.add("hidden");
    });
  }
  showForgotPswForm() {
    this.chooseAuthMethodBtns.forEach((btn) =>
      btn.classList.remove("btn-active")
    );
    this.hideForms();
    this.forgotPswForm.classList.remove("hidden");
  }
  render() {
    document.body.insertAdjacentHTML("afterbegin", this.modalHTML);
  }
  handleEvents(e) {
    const targetElmClass = e.target.dataset.event;
    console.log(targetElmClass);
    switch (targetElmClass) {
      case "display-auth-modal":
        this.display();
        break;
      case "forgot-psw":
        this.sendEmailForgotPsw(e);
        break;
      case "switch-auth-method":
        this.handleAuthMethodSwitch(e);
        break;
      case "display-forgot-psw":
        this.showForgotPswForm();
        break;
      case "sign-up":
        this.signUp(e);
        break;
      case "log-in":
        this.logIn(e);
        break;
      case "close-auth-modal":
        this.hide();
        break;
    }
  }
  //event handlers
  handleAuthMethodSwitch(e) {
    const chooseAuthMethodTargetBtn = e.target;
    const neighbourChooseAuthMethodBtn =
      chooseAuthMethodTargetBtn.nextElementSibling ||
      chooseAuthMethodTargetBtn.previousElementSibling;
    const authMethod = chooseAuthMethodTargetBtn.classList.contains(
      "choose-action-login"
    )
      ? "login"
      : "sign-up";
    const formElmToDisplay = document.querySelector(`.${authMethod}-container`);

    chooseAuthMethodTargetBtn.classList.add("btn-active");
    neighbourChooseAuthMethodBtn.classList.remove("btn-active");
    this.hideForms();
    formElmToDisplay.classList.remove("hidden");
  }
  async signUp(e) {
    e.preventDefault();
    const signUpForm = document.querySelector(".sign-up-container");
    if (!signUpForm.reportValidity()) return;

    const email = document.querySelector("#sign-up-email").value;
    const password = document.querySelector("#sign-up-psw").value;
    try {
      await createUserWithEmailAndPassword(this.firebaseAuth, email, password);
      // renderNotification("Account created, you are now logged in!");
    } catch (error) {
      // errorHandler.renderError(error);
    }
  }
  async logIn(e) {
    e.preventDefault();
    const loginForm = document.querySelector(".login-container");
    if (!loginForm.reportValidity()) return;

    const email = document.querySelector("#login-email").value;
    const password = document.querySelector("#login-psw").value;
    try {
      const logIn = await signInWithEmailAndPassword(
        this.firebaeAuth,
        email,
        password
      );
      // user = logIn.user;
      // console.log(user);
    } catch (error) {
      // errorHandler.renderError(error);
    }
  }
  sendEmailForgotPsw(e) {
    e.preventDefault();
    if (!this.forgotPswForm.reportValidity()) return;

    const email = document.querySelector("#forgot-psw-email").value;
    this.sendPswResetEmail(email);
  }
  async sendPswResetEmail(email) {
    try {
      const targetEmail = user?.email || email;
      await sendPasswordResetEmail(this.firebaseAuth, targetEmail);
      // renderNotification("Password reset email sent, check your inbox!");
    } catch (error) {
      // errorHandler.renderError(error);
    }
  }
  // actions
  async logOut() {
    await signOut(this.firebaseAuth);
  }
}

export default new AuthModal();

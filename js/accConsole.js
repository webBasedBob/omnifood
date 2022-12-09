import { initializeApp } from "https://www.gstatic.com/firebasejs/9.14.0/firebase-app.js";
// // import {} from "https://www.gstatic.com/firebasejs/9.14.0/firebase-auth.js";
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  onAuthStateChanged,
  signOut,
  updateProfile,
  updatePhoneNumber,
  updateEmail,
  updatePassword,
  sendPasswordResetEmail,
  deleteUser,
  reauthenticateWithCredential,
  EmailAuthProvider,
} from "https://www.gstatic.com/firebasejs/9.14.0/firebase-auth.js";

const mobileNavFunctionality = function () {
  const btnNavEl = document.querySelector(".btn-mobile-nav");
  const headerEl = document.querySelector(".header");

  btnNavEl.addEventListener("click", function () {
    headerEl.classList.toggle("nav-open");
  });
};
mobileNavFunctionality();

// DOM manipulation code
const renderUserInfo = function () {
  const userName = document.querySelector(".acc-info-cur-data.name");
  const userEmail = document.querySelector(".acc-info-cur-data.email");
  const userPhone = document.querySelector(".acc-info-cur-data.phone");

  userName.innerText = user.displayName || "-";
  userEmail.innerText = user.email || "-";
  userPhone.innerText = user.phoneNumber || "-";
};

const displayNotLoggedInScreen = function () {
  const notLoggedInScreen = document.querySelector(".not-logged-in-screen");
  notLoggedInScreen.classList.remove("hidden");
};

const displayAuthModal = function () {
  const overlay = document.querySelector(".overlay-container");
  const authModal = document.querySelector(".auth-modal");

  overlay.classList.remove("hidden");
  authModal.classList.remove("hidden");
};

const displayAccountConsole = function () {
  const accountConsole = document.querySelector(".console-wrapper");

  accountConsole.classList.remove("hidden");
};

const hideAccountConsole = function () {
  const accountConsole = document.querySelector(".console-wrapper");

  accountConsole.classList.add("hidden");
};

const hideAuthModal = function () {
  const overlay = document.querySelector(".overlay-container");
  const authModal = document.querySelector(".auth-modal");
  const notLoggedInScreen = document.querySelector(".not-logged-in-screen");

  overlay.classList.add("hidden");
  authModal.classList.add("hidden");
  notLoggedInScreen.classList.add("hidden");
};

const openAccountSetting = function (e) {
  if (e.target.localName !== "button") return;

  const allSettingContainers = document.querySelectorAll(
    ".acc-expanded-setting"
  );
  const settingContainerToDisplay = document.querySelector(
    `.${e.target.dataset.elmToDisplayClass}`
  );

  allSettingContainers.forEach((elm) => {
    elm.classList.add("hidden");
  });
  settingContainerToDisplay.classList.remove("hidden");
};

const displayAccInfoEditForm = function (e) {
  const editWindow = e.target.parentElement.nextElementSibling;
  editWindow.classList.remove("closing");
  editWindow.classList.add("opening");
  editWindow.classList.remove("hidden");
  e.target.classList.add("hidden");
};

const hideAccInfoEditForm = function (e) {
  const infoEditForm = e.target.closest(".edit-acc-info-section");
  const editBtn = e.target.closest("li").querySelector(".edit-acc-info");

  infoEditForm.classList.add("closing");
  editBtn.classList.remove("hidden");
};

const renderError = function (errMessage) {
  const errorModalContainer = document.querySelector(".error-overlay");
  const errorMessageContainer =
    errorModalContainer.querySelector(".error-message");

  errorMessageContainer.innerText = errMessage;
  errorModalContainer.classList.remove("hidden");
};

const renderNetworkError = renderError.bind(
  null,
  "Operation failed due to network issues, please check your internet connection"
);

const renderWrongPswError = renderError.bind(
  null,
  "Wrong password, please try again!"
);

const closeErrorModal = function () {
  const errorModalContainer = document.querySelector(".error-overlay");
  errorModalContainer.classList.add("hidden");
};

const renderNotification = function (message) {
  const notificationWindow = document.querySelector(
    ".action-result-notification-pop-up"
  );
  const notifMessageContainer = document.querySelector(".notification-text");

  notifMessageContainer.innerText = message;
  notificationWindow.classList.remove("hidden");
  setTimeout(() => {
    notificationWindow.classList.add("hidden");
  }, 3000);
};
const hideAllAuthForms = function () {
  const allAuthFormContainers = document.querySelectorAll(
    ".action-elements-container"
  );

  allAuthFormContainers.forEach((formContainer) => {
    if (formContainer.classList.contains("choose-action-container")) return;
    formContainer.classList.add("hidden");
  });
};

const switchAuthMethodForm = function (e) {
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
  hideAllAuthForms();
  formElmToDisplay.classList.remove("hidden");
};

const displayForgorPswForm = function () {
  const authFormToDisplay = document.querySelector(".forgot-psw-container");
  const chooseAuthMethodBtns = Array.from(
    document.querySelector(".choose-action-container").children
  );

  chooseAuthMethodBtns.forEach((btn) => btn.classList.remove("btn-active"));
  hideAllAuthForms();
  authFormToDisplay.classList.remove("hidden");
};
const hideLogOutBtn = function () {
  document.querySelector(".log-out-btn").classList.add("hidden");
};

const displayLogOutBtn = function () {
  document.querySelector(".log-out-btn").classList.remove("hidden");
};
////////
/////////
// //////  application logic code
/////////
///////
///////

const firebaseConfig = {
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
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
let user;

onAuthStateChanged(auth, (curUser) => {
  if (curUser) {
    displayAccountConsole();
    hideAuthModal();
    user = auth.currentUser;
    renderUserInfo();
    displayLogOutBtn();
  } else {
    displayNotLoggedInScreen();
    hideLogOutBtn();
  }
});

const promptUserForPsw = function () {
  const promptContainer = document.querySelector(".prompt-for-psw-overlay");
  promptContainer.classList.remove("hidden");
  const psw = document.querySelector("#user-psw-reauth");
  const submitBtn = document.querySelector(".close-psw-prompt-btn");
  return new Promise(function (resolve, reject) {
    submitBtn.addEventListener("click", () => {
      promptContainer.classList.add("hidden");
      resolve(psw.value);
    });
  });
};
const logOutUser = function () {
  signOut(auth)
    .then(() => {
      hideAccountConsole();
      hideLogOutBtn();
    })
    .catch((error) => {
      // An error happened.
    });
};

const signUp = function (e) {
  e.preventDefault();
  const signUpForm = document.querySelector(".sign-up-container");
  if (!signUpForm.reportValidity()) return;

  const email = document.querySelector("#sign-up-email").value;
  const password = document.querySelector("#sign-up-psw").value;
  createUserWithEmailAndPassword(auth, email, password)
    .then((userCredential) => {
      renderNotification("Account created, you are now logged in!");
    })
    .catch((error) => {
      if (error.code === "auth/network-request-failed") renderNetworkError();
      if (error.code === "auth/email-already-in-use")
        renderError(
          "The email you entered is already associated with an account, please log in instead"
        );
    });
};

const logIn = function (e) {
  e.preventDefault();
  const loginForm = document.querySelector(".login-container");
  if (!loginForm.reportValidity()) return;

  const email = document.querySelector("#login-email").value;
  const password = document.querySelector("#login-psw").value;
  signInWithEmailAndPassword(auth, email, password)
    .then((userCredential) => {
      const user = userCredential.user;
    })
    .catch((error) => {
      if (error.code === "auth/network-request-failed") renderNetworkError();
      if (error.code === "auth/wrong-password") renderWrongPswError();
      if (error.code === "auth/too-many-requests")
        renderError(
          `${error.message.slice(10, 97)} Reset your password or log in later!`
        );
      if (error.code === "auth/user-not-found")
        renderError(
          "Email adress does not match any account, please make sure it is spelled correctly or create an new account!"
        );
    });
};

const updateAccName = function (e) {
  e.preventDefault();
  const formContainer = document.querySelectorAll(".edit-acc-info-section")[0];
  if (!formContainer.reportValidity()) return;

  const newName = document.querySelector("#change-acc-name").value;
  const currentNameElm = document.querySelector(".acc-info-cur-data.name");

  updateProfile(auth.currentUser, {
    displayName: newName,
  })
    .then(() => {
      renderNotification("Name updated");
      currentNameElm.innerText = newName || "-";
    })
    .catch((error) => {
      if (error.code === "auth/network-request-failed") {
        renderNetworkError();
        return;
      }
      if (error.code === "auth/quota-exceeded") {
        renderError(
          "The maximim number of name changes was exceeded, please try again later!"
        );
        return;
      }
      renderError(error.message);
    });
};

const updateEmailOnFirebase = async function (newEmail) {
  updateEmail(auth.currentUser, newEmail)
    .then(() => {
      const currentEmailElm = document.querySelector(
        ".acc-info-cur-data.email"
      );
      currentEmailElm.innerText = newEmail;
      renderNotification("Email changed successfully");
    })
    .catch(async function (error) {
      if (error.code === "auth/email-already-in-use")
        renderError(
          "Action denied! This email is already associated with another account"
        );
      if (error.code === "auth/requires-recent-login") {
        const psw = await promptUserForPsw();
        let credentials = EmailAuthProvider.credential(user.email, psw);
        reauthenticateWithCredential(user, credentials)
          .then(() => updateEmailOnFirebase(newEmail))
          .catch((error) => {
            if (error.code === "auth/wrong-password") {
              renderWrongPswError();
              return;
            }
            renderError(error.message);
          });
      }
    });
};

const updatAccEmail = function (e) {
  e.preventDefault();
  const formContainer = document.querySelectorAll(".edit-acc-info-section")[1];
  if (!formContainer.reportValidity()) return;

  const newEmail = document.querySelector("#change-acc-email").value;
  updateEmailOnFirebase(newEmail);
};

const changePswOnFirebase = function (newPassword, oldPsw) {
  updatePassword(user, newPassword)
    .then(() => {
      renderNotification("Password changed successfully!");
    })
    .catch((error) => {
      if (error.code === "auth/requires-recent-login") {
        let credentials = EmailAuthProvider.credential(user.email, oldPsw);
        reauthenticateWithCredential(user, credentials)
          .then(() => {
            changePswOnFirebase(newPassword);
          })
          .catch((error) => {
            if (error.code === "auth/wrong-password") {
              renderWrongPswError();
              return;
            }
            renderError(error.message);
          });
      }
    });
};

const changeAccPsw = function (e) {
  e.preventDefault();
  const formContainer = document.querySelector(".expanded-change-psw");
  if (!formContainer.reportValidity()) return;

  const oldPsw = document.querySelector("#old-psw").value;
  const newPassword = document.querySelector("#new-psw").value;
  const confirmedNewPsw = document.querySelector("#confirm-new-psw");

  if (confirmedNewPsw.value !== newPassword) {
    confirmedNewPsw.setCustomValidity("The passwords don't match");
    return;
  }
  changePswOnFirebase(newPassword, oldPsw);
};

const sendPswResetEmail = function (email) {
  const targetEmail = user?.email || email;

  sendPasswordResetEmail(auth, targetEmail)
    .then(() => {
      renderNotification("Password reset email sent, check your inbox!");
    })
    .catch((error) => {
      if (error.code === "auth/network-request-failed") {
        renderNetworkError();
        return;
      }
      renderError(error.message);
    });
};

const forgotPswSendEmail = function (e) {
  e.preventDefault();
  const formContainer = document.querySelector(".forgot-psw-container");
  if (!formContainer.reportValidity()) return;

  const email = document.querySelector("#forgot-psw-email").value;
  sendPswResetEmail(email);
};

const deleteUserAccount = function (currentPsw) {
  deleteUser(user)
    .then(() => {
      renderNotification("Account deleted successfully");
    })
    .catch((error) => {
      if (error.code === "auth/requires-recent-login") {
        let credentials = EmailAuthProvider.credential(user.email, currentPsw);
        reauthenticateWithCredential(user, credentials)
          .then(() => {
            deleteUserAccount();
          })
          .catch((error) => {
            if (error.code === "auth/wrong-password") {
              renderWrongPswError();
              return;
            }
            renderError(error.message);
          });
      }
    });
};

const deleteAccount = function () {
  const currentPsw = document.querySelector("#delete-acc-psw").value;
  deleteUserAccount(currentPsw);
};

//
//
//
//Event listeners code
//
//
//
const addEventListeners = function () {
  const authMeBtn = document.querySelector(".auth-me");
  const expandedSettingsContainer = document.querySelector(
    ".acc-actions-container"
  );
  const editAccInfoBtns = document.querySelectorAll(".edit-acc-info");
  const editAccInfoCancelBtns = document.querySelectorAll(
    ".edit-acc-info-cancel-btn"
  );
  const changeAccNameBtn = document.querySelector(".change-name-btn");
  const changeAccEmailBtn = document.querySelector(".change-email-btn");
  const changePswBtn = document.querySelector(".change-psw-btn");
  const sendPswResetBtn = document.querySelector(".send-psw-reset-btn");
  const deleteAccBtn = document.querySelector(".delete-acc-btn");
  const closeErrorModalBtn = document.querySelector(".close-error-modal-btn");
  const forgotPswSwndEmail = document.querySelector(
    ".take-action-btn.reset-psw-btn"
  );
  const displaySignUpFormBtn = document.querySelector(".choose-action-sign-up");
  const displayLoginFormBtn = document.querySelector(".choose-action-login");
  const displayForgotPswFormBtn = document.querySelector(".forgot-psw");
  const signUpBtn = document.querySelector(".sign-up-btn");
  const loginBtn = document.querySelector(".login-btn");
  const logOutBtn = document.querySelector(".log-out-btn");
  const authModalCloseBtn = document.querySelector(".auth-modal-close-btn");
  authMeBtn.addEventListener("click", displayAuthModal);
  expandedSettingsContainer.addEventListener("click", openAccountSetting);
  editAccInfoBtns.forEach((btn) => {
    btn.addEventListener("click", displayAccInfoEditForm);
  });
  editAccInfoCancelBtns.forEach((btn) => {
    btn.addEventListener("click", hideAccInfoEditForm);
  });
  document.addEventListener("animationend", function (e) {
    if (e.animationName === "closeEditWindow") e.target.classList.add("hidden");
  });
  changeAccNameBtn.addEventListener("click", updateAccName);
  changeAccEmailBtn.addEventListener("click", updatAccEmail);
  changePswBtn.addEventListener("click", changeAccPsw);
  sendPswResetBtn.addEventListener("click", sendPswResetEmail);
  deleteAccBtn.addEventListener("click", deleteAccount);
  closeErrorModalBtn.addEventListener("click", closeErrorModal);
  forgotPswSwndEmail.addEventListener("click", forgotPswSendEmail);
  displaySignUpFormBtn.addEventListener("click", switchAuthMethodForm);
  displayLoginFormBtn.addEventListener("click", switchAuthMethodForm);

  displayForgotPswFormBtn.addEventListener("click", displayForgorPswForm);
  signUpBtn.addEventListener("click", signUp);
  loginBtn.addEventListener("click", logIn);
  logOutBtn.addEventListener("click", logOutUser);
  authModalCloseBtn.addEventListener("click", () => {
    hideAuthModal();
    displayNotLoggedInScreen();
  });
};
addEventListeners();

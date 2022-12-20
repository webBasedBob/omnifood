// import { initializeApp } from "https://www.gstatic.com/firebasejs/9.14.0/firebase-app.js";
import { initializeApp } from "firebase/app";
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
  verifyIdToken,
} from "firebase/auth";
//"https://www.gstatic.com/firebasejs/9.14.0/firebase-auth.js";

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

class ErrorHandler {
  #errorsDictionary = {
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
  };
  #errorModal = document.querySelector(".error-overlay");
  #errorMessageContainer = this.#errorModal.querySelector(".error-message");
  renderError(error) {
    this.#errorMessageContainer.innerText =
      this.#errorsDictionary[error.code] || error.message;
    this.#errorModal.classList.remove("hidden");
  }
}
const errorHandler = new ErrorHandler();

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

//

// import {
//   getFunctions,
//   httpsCallable,
// } from "https://www.gstatic.com/firebasejs/9.14.0/firebase-functions.js";

//
///
// const functions = getFunctions();
// const addAdminRole = httpsCallable(functions, "addAdminRole");
// const addRecruiterRole = httpsCallable(functions, "addRecruiterRole");
// const addSubscriberRole = httpsCallable(functions, "addSubscriberRole");
// const removeRoles = httpsCallable(functions, "removeRoles");
// addAdminRole("dsds@dsds.co")
//   .then((response) => console.log(response))
//   .catch((error) => console.log(error));
// addRecruiterRole("duhsuid@ggg.com")
//   .then((response) => console.log(response))
//   .catch((error) => console.log(error));
// addSubscriberRole("sdfdds@sd.ro")
//   .then((response) => console.log(response))
//   .catch((error) => console.log(error));
// removeRoles("dsds@dsds.co")
//   .then((response) => console.log(response))
//   .catch((error) => console.log(error));
// removeRoles("parazitu29@gmail.com")
//   .then((response) => console.log(response))
//   .catch((error) => console.log(error));

//
//'Success! duhsuid@ggg.com has been made an recruiter'
//"Success! duhsuid@ggg.com has been made an recruiter"
//'Success! dsds@dsds.co has been made an admin'}
//'Success! sdfdds@sd.ro has been made an subscriber'}
//"Success! parazitu29@gmail.com's roles have been deleted"}
//"Success! dsds@dsds.co's roles have been deleted"}

const isRecruiter = async function () {
  this.getIdTokenResult()
    .then((idTokenResult) => {
      console.log(idTokenResult.claims.recruiter);
      if (!!idTokenResult.claims.admin) {
      } else {
      }
    })
    .catch((error) => {
      console.log(error);
    });
};

const hasCustomRole = async function (claim) {
  const token = await user.getIdTokenResult();
  return token.claims[claim];
};

onAuthStateChanged(auth, async (curUser) => {
  if (curUser) {
    displayAccountConsole();
    hideAuthModal();
    user = auth.currentUser;
    renderUserInfo();
    displayLogOutBtn();
    console.log(user);
    console.log(await hasCustomRole("recruiter"));
  } else {
    displayNotLoggedInScreen();
    hideLogOutBtn();
  }
});

const logOutUser = async function () {
  try {
    await signOut(auth);
    hideAccountConsole();
    hideLogOutBtn();
  } catch (error) {
    errorHandler.renderError(error);
  }
};

const signUp = async function (e) {
  e.preventDefault();
  const signUpForm = document.querySelector(".sign-up-container");
  if (!signUpForm.reportValidity()) return;

  const email = document.querySelector("#sign-up-email").value;
  const password = document.querySelector("#sign-up-psw").value;
  try {
    await createUserWithEmailAndPassword(auth, email, password);
    renderNotification("Account created, you are now logged in!");
  } catch (error) {
    errorHandler.renderError(error);
  }
};

const logIn = async function (e) {
  e.preventDefault();
  const loginForm = document.querySelector(".login-container");
  if (!loginForm.reportValidity()) return;

  const email = document.querySelector("#login-email").value;
  const password = document.querySelector("#login-psw").value;
  try {
    const logIn = await signInWithEmailAndPassword(auth, email, password);
    user = logIn.user;
    console.log(user);
  } catch (error) {
    errorHandler.renderError(error);
  }
};

const updateAccName = async function (e) {
  e.preventDefault();
  const formContainer = document.querySelectorAll(".edit-acc-info-section")[0];
  if (!formContainer.reportValidity()) return;

  const newName = document.querySelector("#change-acc-name").value;
  const currentNameElm = document.querySelector(".acc-info-cur-data.name");
  try {
    await updateProfile(auth.currentUser, {
      displayName: newName,
    });
    renderNotification("Name updated");
    currentNameElm.innerText = newName || "-";
  } catch (error) {
    errorHandler.renderError(error);
  }
};

const promptUserForPsw = function () {
  const promptContainer = document.querySelector(".prompt-for-psw-overlay");
  promptContainer.classList.remove("hidden");
  const psw = document.querySelector("#user-psw-reauth");
  const submitBtn = document.querySelector(".close-psw-prompt-btn");
  return new Promise(function (resolve) {
    submitBtn.addEventListener("click", () => {
      promptContainer.classList.add("hidden");
      resolve(psw.value);
    });
  });
};

const updateEmailOnFirebase = async function (newEmail) {
  try {
    await updateEmail(auth.currentUser, newEmail);
    const currentEmailElm = document.querySelector(".acc-info-cur-data.email");
    currentEmailElm.innerText = newEmail;
    renderNotification("Email changed successfully");
  } catch (error) {
    if (error.code === "auth/requires-recent-login") {
      const psw = await promptUserForPsw();
      let credentials = EmailAuthProvider.credential(user.email, psw);
      try {
        await reauthenticateWithCredential(user, credentials);
        updateEmailOnFirebase(newEmail);
      } catch (error) {
        errorHandler.renderError(error);
      }
    } else errorHandler.renderError(error);
  }
};

const updatAccEmail = function (e) {
  e.preventDefault();
  const formContainer = document.querySelectorAll(".edit-acc-info-section")[1];
  if (!formContainer.reportValidity()) return;

  const newEmail = document.querySelector("#change-acc-email").value;
  updateEmailOnFirebase(newEmail);
};

const changePswOnFirebase = async function (newPassword, oldPsw) {
  try {
    await updatePassword(user, newPassword);
    renderNotification("Password changed successfully!");
  } catch (error) {
    if (error.code === "auth/requires-recent-login") {
      try {
        let credentials = EmailAuthProvider.credential(user.email, oldPsw);
        await reauthenticateWithCredential(user, credentials);
        changePswOnFirebase(newPassword);
      } catch (error) {
        errorHandler.renderError(error);
      }
    } else errorHandler.renderError(error);
  }
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

const sendPswResetEmail = async function (email) {
  try {
    const targetEmail = user?.email || email;
    await sendPasswordResetEmail(auth, targetEmail);
    renderNotification("Password reset email sent, check your inbox!");
  } catch (error) {
    errorHandler.renderError(error);
  }
};

const forgotPswSendEmail = function (e) {
  e.preventDefault();
  const formContainer = document.querySelector(".forgot-psw-container");
  if (!formContainer.reportValidity()) return;

  const email = document.querySelector("#forgot-psw-email").value;
  sendPswResetEmail(email);
};

const deleteUserAccount = async function (currentPsw) {
  try {
    await deleteUser(user);
    renderNotification("Account deleted successfully");
  } catch (error) {
    if (error.code === "auth/requires-recent-login") {
      try {
        let credentials = EmailAuthProvider.credential(user.email, currentPsw);
        await reauthenticateWithCredential(user, credentials);
        deleteUserAccount();
      } catch (error) {
        errorHandler.renderError(error);
      }
    } else errorHandler.renderError(error);
  }
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

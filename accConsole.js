import { initializeApp } from "https://www.gstatic.com/firebasejs/9.14.0/firebase-app.js";
// // import {} from "https://www.gstatic.com/firebasejs/9.14.0/firebase-auth.js";
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  onAuthStateChanged,
  signOut,
} from "https://www.gstatic.com/firebasejs/9.14.0/firebase-auth.js";

// DOM manipulation functions
const renderUserInfo = function () {
  const userName = document.querySelector(".acc-info-cur-data.name");
  const userEmail = document.querySelector(".acc-info-cur-data.email");
  const userPhone = document.querySelector(".acc-info-cur-data.phone");

  userName.innerText = user.displayName || "-";
  userEmail.innerText = user.email || "-";
  userPhone.innerText = user.phoneNumber || "-";
};

const renderNotLoggedInScreen = function () {
  const notLoggedInScreen = document.querySelector(".not-logged-in-screen");
  notLoggedInScreen.classList.remove("hidden");
};

const showAuthModal = function () {
  const overlay = document.querySelector(".overlay");
  const authModal = document.querySelector(".auth-modal");

  overlay.classList.remove("hidden");
  authModal.classList.remove("hidden");
};

const showAccountConsole = function () {
  const accountConsole = document.querySelector(".console-wrapper");

  accountConsole.classList.remove("hidden");
};

const hideAuthModal = function () {
  const overlay = document.querySelector(".overlay");
  const authModal = document.querySelector(".auth-modal");
  const notLoggedInScreen = document.querySelector(".not-logged-in-screen");

  overlay.classList.add("hidden");
  authModal.classList.add("hidden");
  notLoggedInScreen.classList.add("hidden");
};

const showExpandedAccSetting = function (e) {
  if (e.target.localName !== "button") return;

  const allExpandedAccSettings = document.querySelectorAll(
    ".acc-expanded-setting"
  );
  const expandedAccSettingToShow = document.querySelector(
    `.${e.target.dataset.elmToShowClass}`
  );

  allExpandedAccSettings.forEach((elm) => {
    elm.classList.add("hidden");
  });
  expandedAccSettingToShow.classList.remove("hidden");
};

const switchAuthWindow = function () {
  const chooseSignUpBtn = document.querySelector(".choose-action-sign-up");
  const chooseLoginBtn = document.querySelector(".choose-action-login");
  const signUpContainer = document.querySelector(".sign-up-container");
  const loginContainer = document.querySelector(".login-container");

  chooseSignUpBtn.addEventListener("click", function () {
    chooseSignUpBtn.classList.add("btn-active");
    chooseLoginBtn.classList.remove("btn-active");
    signUpContainer.classList.remove("hidden");
    loginContainer.classList.add("hidden");
  });

  chooseLoginBtn.addEventListener("click", function () {
    chooseSignUpBtn.classList.remove("btn-active");
    chooseLoginBtn.classList.add("btn-active");
    loginContainer.classList.remove("hidden");
    signUpContainer.classList.add("hidden");
  });
};
switchAuthWindow();

const openAccInfoEditWindow = function (e) {
  const editWindow = e.target.parentElement.nextElementSibling;
  editWindow.classList.remove("hidden");
  e.target.classList.add("hidden");
};

const closeAccInfoEditWindow = function (e) {
  const editWindow = e.target.closest(".edit-acc-info-section");
  editWindow.classList.add("hidden");
  const editBtn = e.target.closest("li").querySelector(".edit-acc-info");
  editBtn.classList.remove("hidden");
};

const addEventListeners = function () {
  const authMeBtn = document.querySelector(".auth-me");
  const expandedSettingsContainer = document.querySelector(
    ".acc-actions-container"
  );
  const editAccInfoBtns = document.querySelectorAll(".edit-acc-info");
  const editAccInfoCancelBtns = document.querySelectorAll(
    ".edit-acc-info-cancel-btn"
  );

  authMeBtn.addEventListener("click", showAuthModal);
  expandedSettingsContainer.addEventListener("click", showExpandedAccSetting);
  editAccInfoBtns.forEach((btn) => {
    btn.addEventListener("click", openAccInfoEditWindow);
  });
  editAccInfoCancelBtns.forEach((btn) => {
    btn.addEventListener("click", closeAccInfoEditWindow);
  });
};
addEventListeners();

//
//
// application logic code
//
//
//

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
    // User is signed in, see docs for a list of available properties
    // https://firebase.google.com/docs/reference/js/firebase.User
    const uid = curUser.uid;
    console.log("pula mea, cica merge", uid);
    // user.displayName = "bob";
    console.log(curUser);
    // ...
    showAccountConsole();
    hideAuthModal();
    user = auth.currentUser;
    renderUserInfo();
  } else {
    renderNotLoggedInScreen();
    // User is signed out
    // ...
  }
});

// signOut(auth)
//   .then(() => {
//     // Sign-out successful.
//   })
//   .catch((error) => {
//     // An error happened.
//   });
const signUp = function () {
  const signUpBtn = document.querySelector(".sign-up-btn");
  signUpBtn.addEventListener("click", function () {
    const email = document.querySelector("#sign-up-email").value;
    const password = document.querySelector("#sign-up-psw").value;
    createUserWithEmailAndPassword(auth, email, password)
      .then((userCredential) => {
        // Signed in
        const user = userCredential.user;
        console.dir(user);
        // ...
      })
      .catch((error) => {
        const errorCode = error.code;
        const errorMessage = error.message;
        // ..
      });
  });
};
signUp();
const logIn = function () {
  const signUpBtn = document.querySelector(".login-btn");
  signUpBtn.addEventListener("click", function () {
    const email = document.querySelector("#login-email").value;
    const password = document.querySelector("#login-psw").value;
    signInWithEmailAndPassword(auth, email, password)
      .then((userCredential) => {
        // Signed in
        const user = userCredential.user;
        console.log(user);
        // console.log(userCredential);
        // ...
      })
      .catch((error) => {
        const errorCode = error.code;
        const errorMessage = error.message;
        console.log(errorCode, errorMessage);
      });
  });
};
logIn();

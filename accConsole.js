import { initializeApp } from "https://www.gstatic.com/firebasejs/9.14.0/firebase-app.js";
// // import {} from "https://www.gstatic.com/firebasejs/9.14.0/firebase-auth.js";
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  onAuthStateChanged,
} from "https://www.gstatic.com/firebasejs/9.14.0/firebase-auth.js";

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

onAuthStateChanged(auth, (user) => {
  if (user) {
    // User is signed in, see docs for a list of available properties
    // https://firebase.google.com/docs/reference/js/firebase.User
    const uid = user.uid;
    console.log("pula mea, cica merge", uid);
    // ...
  } else {
    // User is signed out
    // ...
  }
});
const switchAuthWindow = function () {
  const chooseSignUpBtn = document.querySelector(".choose-action-sign-up");
  const chooseLoginBtn = document.querySelector(".choose-action-login");
  const signUpContainer = document.querySelector(".sign-up-container");
  const loginContainer = document.querySelector(".login-container");

  chooseSignUpBtn.addEventListener("click", function () {
    signUpContainer.classList.remove("hidden");
    loginContainer.classList.add("hidden");
  });

  chooseLoginBtn.addEventListener("click", function () {
    loginContainer.classList.remove("hidden");
    signUpContainer.classList.add("hidden");
  });
};
switchAuthWindow();

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

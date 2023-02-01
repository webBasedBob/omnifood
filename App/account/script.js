import { initializeApp } from "firebase/app";
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
  updateCurrentUser,
} from "firebase/auth";
import {
  getDatabase,
  set,
  ref,
  get,
  onValue,
  child,
  push,
  update,
} from "firebase/database";
import { getFunctions, httpsCallable } from "firebase/functions";

import Notification from "../general/components/notification/script";
import Navigation from "../general/components/navigation/script.js";
import AuthModal from "../general/components/authModal/script";
import ErrorPopup from "../general/components/errorModal/script";
import NotLoggedInScreen from "../general/components/NotLoggedInScreen/script";
import {
  throwError,
  displayNotification,
} from "../general/js/reusableFunctions";
const mobileNavFunctionality = function () {
  const btnNavEl = document.querySelector(".btn-mobile-nav");
  const headerEl = document.querySelector(".header");

  btnNavEl.addEventListener("click", function () {
    headerEl.classList.toggle("nav-open");
  });
};
mobileNavFunctionality();

// DOM manipulation code
const renderUserInfo = async function () {
  const userName = document.querySelector(".acc-info-cur-data.name");
  const userEmail = document.querySelector(".acc-info-cur-data.email");
  const userPhone = document.querySelector(".acc-info-cur-data.phone");

  userName.innerText = user.displayName || "-";
  userEmail.innerText = user.email || "-";
  userPhone.innerText = (await getPhoneNo()) || "-";
};

const displayAccountConsole = function () {
  const accountConsole = document.querySelector(".console-wrapper");

  accountConsole.classList.remove("hidden");
};

const hideAccountConsole = function () {
  const accountConsole = document.querySelector(".console-wrapper");

  accountConsole.classList.add("hidden");
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

const functions = getFunctions();
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
// const axios = require("axios");
// const fs = require("fs"); // Built-in filesystem package for Node.js
// const fetch = require("node-fetch");
// const { pipeline } = require("node:stream");
// const { promisify } = require("node:util");
// const { createWriteStream } = require("node:fs");

// exports.getImgBlob = functions.https.onCall(async (imgSrc) => {
//   try {
//     const streamPipeline = promisify(pipeline);

//     const response = await fetch(imgSrc);
//     await streamPipeline(response.body, createWriteStream("./octocat.png"));
//   } catch (err) {
//     return { message: "sombapola", datatata: err };
//   }
// });
// const ddddd = httpsCallable(functions, "getImgBlob");
// const pula = async function () {
//   // const puuuullaaa = await ddddd(
//   //   "https://edamam-product-images.s3.amazonaws.com/web-img/596/5967c30d464cad6847a8ae688e100ea9.jpg?X-Amz-Security-Token=IQoJb3JpZ2luX2VjEKX%2F%2F%2F%2F%2F%2F%2F%2F%2F%2FwEaCXVzLWVhc3QtMSJHMEUCIHHSNXAKU9TWzzwOkBKVyvEJpNTvVdkfEljvMrbhwPCJAiEAwaeZGxUtKXBBBSWIc5kThkuZCQeKOFNp%2BFkZ496CvTEqzAQIHhAAGgwxODcwMTcxNTA5ODYiDGBcUGfiU6zL2FetHSqpBHFtQ0wqXxuREhNBrUIjzit26Lh3AS%2BuZZvubMf1wnww%2FejR7t1RhwKF95nGxLXE6S8QY4FIwlGZj2reqEX8Bw3EnWfIe8mxU1HAQToRsbb%2FnlizYm21rH1ULsxnUvqusy9xMiocIdOTivPbPcKnPmTyzzFdzd2TGJN97cOlQPGeFMLCuKk%2FdGSOE184ZZDQx7%2FRoN%2Bnyn2Ar3Q9Uy1MaNK%2FiApt7UTIOzp584fM9FrWcVpeWB2PrUZ85xVwZTHVJKV%2Fu2vnmgGbvBUQd2hGvBwuCok1G6nTpNYYffT5uBW1BjyzXfVD3s3qrWuCueVDV9yfmIXXXGNZn7Z7EZ%2BPZBhery2kwDQLadeu9na8r8D8DMtr7cQjfWnkKxONd4YMzYELRyyJ4YJlF9ZDQRH%2B5VBbC5hapSt%2B5jD3aX2ey1RY431WqGXTSa5tZPfvjkMDvBxNSnTVnGPXtLt0ZSt%2BNBpnRUl%2BFxnvJ69XyEEA5Vy39%2BWYEU9moaQjl08s5YiuiMOD6p%2FSLGUsw6tb%2Bc9WZXw6ost0IqdIvbxCX39zPMKIcWwZANQpoWgqsaAUpiVnq%2FIbZf554SeGpPT15TJB1aJfKu%2BPPlEqEtz0zrz8x%2Fgp0v1Rxo0Vl83yei2voK6YTvo8R910KzLztVXFVMsdPnJRTlXxLmyrYnzAzYy5Ry1IBys4dBNlUkq7AiErWyzW7Qn4wUmAXxY3kQS5Zz8yroTNJBqDPgZ48IAwu6nGngY6qQEoGWLbY5%2FBgMlwhVmA30MofXSqQ9%2Fe18TKBx55wzgqrfStm4xlM5a33tMNBgcz3%2FHsdnPuAone1cngY%2B7bUwUEZtXN2t%2BDQbjbFL%2BrYnoqnPhkW5P2SpCkK3lGOlbsPC2k6PnDbEKcvL1bIWMn8gGZ1S9slcyBpW0nFrp0x0LSoJMIyiRO9tiQSLLvvt6f%2B1vO%2FNMJ1G0vp8DziIVigLIqj3b60xS1IdZh&X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Date=20230125T213905Z&X-Amz-SignedHeaders=host&X-Amz-Expires=3600&X-Amz-Credential=ASIASXCYXIIFJA2PXKHN%2F20230125%2Fus-east-1%2Fs3%2Faws4_request&X-Amz-Signature=2bbad7d8da4af3806dde505260450dc28d6adad217939df7575200eabe365311"
//   // );
//   const puuuullaaa = await ddddd(
//     "https://edamam-product-images.s3.amazonaws.com/web-img/596/5967c30d464cad6847a8ae688e100ea9.jpg?X-Amz-Security-Token=IQoJb3JpZ2luX2VjEKX%2F%2F%2F%2F%2F%2F%2F%2F%2F%2FwEaCXVzLWVhc3QtMSJHMEUCIHHSNXAKU9TWzzwOkBKVyvEJpNTvVdkfEljvMrbhwPCJAiEAwaeZGxUtKXBBBSWIc5kThkuZCQeKOFNp%2BFkZ496CvTEqzAQIHhAAGgwxODcwMTcxNTA5ODYiDGBcUGfiU6zL2FetHSqpBHFtQ0wqXxuREhNBrUIjzit26Lh3AS%2BuZZvubMf1wnww%2FejR7t1RhwKF95nGxLXE6S8QY4FIwlGZj2reqEX8Bw3EnWfIe8mxU1HAQToRsbb%2FnlizYm21rH1ULsxnUvqusy9xMiocIdOTivPbPcKnPmTyzzFdzd2TGJN97cOlQPGeFMLCuKk%2FdGSOE184ZZDQx7%2FRoN%2Bnyn2Ar3Q9Uy1MaNK%2FiApt7UTIOzp584fM9FrWcVpeWB2PrUZ85xVwZTHVJKV%2Fu2vnmgGbvBUQd2hGvBwuCok1G6nTpNYYffT5uBW1BjyzXfVD3s3qrWuCueVDV9yfmIXXXGNZn7Z7EZ%2BPZBhery2kwDQLadeu9na8r8D8DMtr7cQjfWnkKxONd4YMzYELRyyJ4YJlF9ZDQRH%2B5VBbC5hapSt%2B5jD3aX2ey1RY431WqGXTSa5tZPfvjkMDvBxNSnTVnGPXtLt0ZSt%2BNBpnRUl%2BFxnvJ69XyEEA5Vy39%2BWYEU9moaQjl08s5YiuiMOD6p%2FSLGUsw6tb%2Bc9WZXw6ost0IqdIvbxCX39zPMKIcWwZANQpoWgqsaAUpiVnq%2FIbZf554SeGpPT15TJB1aJfKu%2BPPlEqEtz0zrz8x%2Fgp0v1Rxo0Vl83yei2voK6YTvo8R910KzLztVXFVMsdPnJRTlXxLmyrYnzAzYy5Ry1IBys4dBNlUkq7AiErWyzW7Qn4wUmAXxY3kQS5Zz8yroTNJBqDPgZ48IAwu6nGngY6qQEoGWLbY5%2FBgMlwhVmA30MofXSqQ9%2Fe18TKBx55wzgqrfStm4xlM5a33tMNBgcz3%2FHsdnPuAone1cngY%2B7bUwUEZtXN2t%2BDQbjbFL%2BrYnoqnPhkW5P2SpCkK3lGOlbsPC2k6PnDbEKcvL1bIWMn8gGZ1S9slcyBpW0nFrp0x0LSoJMIyiRO9tiQSLLvvt6f%2B1vO%2FNMJ1G0vp8DziIVigLIqj3b60xS1IdZh&X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Date=20230125T213905Z&X-Amz-SignedHeaders=host&X-Amz-Expires=3600&X-Amz-Credential=ASIASXCYXIIFJA2PXKHN%2F20230125%2Fus-east-1%2Fs3%2Faws4_request&X-Amz-Signature=2bbad7d8da4af3806dde505260450dc28d6adad217939df7575200eabe365311"
//   );
//   // const puuuullaaa = await ddddd(
//   //   "https://api.edamam.com/api/recipes/v2?type=public&q=potato&app_id=a5cea2be&app_key=95cea576a8a53c23997c5ec6c40084b7"
//   // );
//   // const pizada = await puuuullaaa.blob();
//   console.log("sss", puuuullaaa);
// };
// pula();
// const addAdminRole = httpsCallable(functions, "addAdminRole");
// addAdminRole("fds@jdksh.com1")
//   .then((response) => console.log(response))
//   .catch((error) => console.log(error));

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
    NotLoggedInScreen.hide();
    user = auth.currentUser;
    renderUserInfo();
    displayLogOutBtn();
    console.log(user);
    console.log(await hasCustomRole("recruiter"));
    renderAdresses();
    renderDeliveryTimes();
    renderComplaints();
  } else {
    NotLoggedInScreen.display();
    hideLogOutBtn();
  }
});

const logOutUser = async function () {
  try {
    await signOut(auth);
    hideAccountConsole();
    hideLogOutBtn();
  } catch (error) {
    throwError(error.code);
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
    displayNotification("Name updated");
    currentNameElm.innerText = newName || "-";
  } catch (error) {
    throwError(error.code);
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
    displayNotification("Email changed successfully");
  } catch (error) {
    if (error.code === "auth/requires-recent-login") {
      const psw = await promptUserForPsw();
      let credentials = EmailAuthProvider.credential(user.email, psw);
      try {
        await reauthenticateWithCredential(user, credentials);
        updateEmailOnFirebase(newEmail);
      } catch (error) {
        throwError(error.code);
      }
    } else throwError(error.code);
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
    displayNotification("Password changed successfully!");
  } catch (error) {
    if (error.code === "auth/requires-recent-login") {
      try {
        let credentials = EmailAuthProvider.credential(user.email, oldPsw);
        await reauthenticateWithCredential(user, credentials);
        changePswOnFirebase(newPassword);
      } catch (error) {
        throwError(error.code);
      }
    } else throwError(error.code);
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
    displayNotification("Password reset email sent, check your inbox!");
  } catch (error) {
    throwError(error.code);
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
    displayNotification("Account deleted successfully");
  } catch (error) {
    if (error.code === "auth/requires-recent-login") {
      try {
        let credentials = EmailAuthProvider.credential(user.email, currentPsw);
        await reauthenticateWithCredential(user, credentials);
        deleteUserAccount();
      } catch (error) {
        throwError(error.code);
      }
    } else throwError(error.code);
  }
};

const deleteAccount = function () {
  const currentPsw = document.querySelector("#delete-acc-psw").value;
  deleteUserAccount(currentPsw);
};

const handleSectionSelection = function (e) {
  //handles the display/hide behavior of the page's section
  const targetBtn = e.target.closest(".console-category");
  if (!targetBtn) return;

  if (window.innerWidth <= 700) {
    targetBtn.parentElement.classList.add("height-auto");
  }
  if (targetBtn.classList.contains("selected")) return;
  //style the clicked button only
  const siblingBtns = document.querySelectorAll(".console-category");
  siblingBtns.forEach((btn) => {
    btn.classList.remove("selected");
  });
  targetBtn.classList.add("selected");

  //display the target section only
  const targetSectionElm = document.querySelector(
    `.${targetBtn.dataset.targetcontent}`
  );
  const sections = document.querySelectorAll(".content > div");
  sections.forEach((section) => {
    section.classList.add("hidden");
  });
  targetSectionElm.classList.remove("hidden");
  if (window.innerWidth <= 700) {
    targetBtn.parentElement.classList.remove("height-auto");
  }
};

const handleComplaintSubmissionModalDisplay = function () {
  const modal = document.querySelector(
    ".complaint-modal__overlay__new-complaint"
  );
  modal.classList.toggle("hidden");
};

const getAdresses = function () {
  return new Promise((resolve, reject) => {
    const db = getDatabase(app);
    const adressesReference = ref(db, `users/${user.uid}/adresses`);
    onValue(adressesReference, (snapshot) => {
      resolve(snapshot.val());
    });
  });
};

const renderAdresses = async function () {
  const adresses = await getAdresses();
  const adressesContainer = document.querySelector(".adresses");
  adressesContainer.innerHTML = "";
  for (let adress in adresses) {
    const html = `
      <div class="adress">
        <input type="checkbox" id="${adress}" ${
      adresses[adress] === "primary" ? "checked" : ""
    }/>
        <label for="${adress}" class="acc-info-cur-data adress"
          >${adress}</label
        >
      </div>`;
    adressesContainer.insertAdjacentHTML("afterbegin", html);
  }
};

const addAdress = async function (e) {
  e.preventDefault();
  const storedAdresses = await getAdresses();
  const db = getDatabase(app);
  const adressesReference = ref(db, `users/${user.uid}/adresses`);
  const adress = document.querySelector("#add-acc-adress").value;
  const dataToStore = { [adress]: storedAdresses ? "secondary" : "primary" };
  update(adressesReference, dataToStore);
  renderAdresses();
};

const getDeliveryTimes = function () {
  return new Promise((resolve, reject) => {
    const db = getDatabase(app);
    const reference = ref(db, `users/${user.uid}/deliveryTimes`);
    onValue(reference, (snapshot) => {
      resolve(snapshot.val());
    });
  });
};

const renderDeliveryTimes = async function () {
  const deliveryTimes = await getDeliveryTimes();
  const deliveryTimesContainer = document.querySelector(".delivery-times");
  deliveryTimesContainer.innerHTML = "";
  for (let key in deliveryTimes) {
    const html = `<p class="acc-info-cur-data delivery-time">${key}</p>`;
    deliveryTimesContainer.insertAdjacentHTML("afterbegin", html);
  }
};

const addDeliveryTime = async function (e) {
  e.preventDefault();
  const db = getDatabase(app);
  const adressesReference = ref(db, `users/${user.uid}/deliveryTimes`);
  const deliveryTime = document.querySelector("#add-delivery-time").value;
  const dataToStore = {
    [deliveryTime]: "placeholder",
  };
  update(adressesReference, dataToStore);
  renderDeliveryTimes();
};

const getPhoneNo = async function () {
  return new Promise((resolve, reject) => {
    const db = getDatabase(app);
    const reference = ref(db, `users/${user.uid}/phone`);
    onValue(reference, (snapshot) => {
      resolve(snapshot.val());
    });
  });
};

const updatePhoneNoFirebase = function (phoneNo) {
  return new Promise((resolve, reject) => {
    const db = getDatabase(app);
    const reference = ref(db, `users/${user.uid}`);
    update(reference, { phone: phoneNo });
    resolve("");
  });
};

const changePhoneNumber = async function (e) {
  e.preventDefault();
  // const formContainer = document.querySelectorAll(".edit-acc-info-section")[2];
  // if (!formContainer.reportValidity()) return;

  const newPhoneNo = document.querySelector("#change-acc-phone").value;
  const currentPhoneNo = document.querySelector(".acc-info-cur-data.phone");
  try {
    await updatePhoneNoFirebase(newPhoneNo);
    displayNotification("Phone number updated");
    currentPhoneNo.innerText = newPhoneNo || "-";
  } catch (error) {
    throwError(error.code);
  }
};

const storeComplaint = function () {
  const subject = document.querySelector(".complaint-modal__subject").value;
  const body = document.querySelector(
    ".complaint-modal__overlay__new-complaint .complaint-modal__text"
  ).value;
  const db = getDatabase(app);
  const reference = ref(db, `complaints/${user.uid}`);
  const dataToStore = { [subject]: { body: body } };
  update(reference, dataToStore);
};

const resetComplaintForm = function () {
  const inputToReset = [
    document.querySelector(
      ".complaint-modal__overlay__new-complaint .complaint-modal__subject"
    ),
    document.querySelector(
      ".complaint-modal__overlay__new-complaint .complaint-modal__text"
    ),
  ];
  inputToReset.forEach((elm) => {
    elm.value = "";
  });
};

const submitComplaint = async function () {
  storeComplaint();
  resetComplaintForm();
  handleComplaintSubmissionModalDisplay();
};

const getComplaints = function () {
  return new Promise((resolve, reject) => {
    const db = getDatabase(app);
    const reference = ref(db, `complaints/${user.uid}`);
    onValue(reference, (snapshot) => {
      resolve(snapshot.val());
    });
  });
};

const renderComplaints = async function () {
  const complaints = await getComplaints();
  const complaintsContainer = document.querySelector(".complaint-table tbody");
  complaintsContainer.innerHTML = "";
  for (let complaint in complaints) {
    const html = `
    <tr>
    <td class="complaint-table__complaint-name">
    ${complaint}
    </td>
    <td class="complaint-table__complaint-status">${
      complaints[complaint].status || "pending"
    }</td>
    </tr>`;
    complaintsContainer.insertAdjacentHTML("afterbegin", html);
  }
};

const getComplaint = function (complainSubject) {
  return new Promise((resolve, reject) => {
    const db = getDatabase(app);
    const reference = ref(db, `complaints/${user.uid}/${complainSubject}`);
    onValue(reference, (snapshot) => {
      resolve(snapshot.val());
    });
  });
};
const renderOldComplaint = function (complaintObj) {
  document.querySelector(".complaint-modal__title").innerText =
    complaintObj.subject || "";
  document.querySelector(".complaint-modal__compaint-text").innerText =
    complaintObj.body || "";
  document.querySelector(".complaint-modal__text__response").innerText =
    complaintObj.adminResponseBody || "No response yet, complaint is pending";
};
const toggleOldComplaintVisibility = function () {
  document
    .querySelector(".complaint-modal__overlay__old-complaint")
    .classList.toggle("hidden");
};
const openComplaint = async function (e) {
  if (!e.target.classList.contains("complaint-table__complaint-name")) return;
  const firebaseComplaint = await getComplaint(e.target.innerText);
  const targetComplaint = { subject: e.target.innerText, ...firebaseComplaint };
  console.log(targetComplaint);
  renderOldComplaint(targetComplaint);
  toggleOldComplaintVisibility();
};
//
//
//
//Event listeners code
//
//
//
const addEventListeners = function () {
  // const authMeBtn = document.querySelector(".auth-me");
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

  const logOutBtn = document.querySelector(".log-out-btn");
  logOutBtn.addEventListener("click", logOutUser);
  //new event listeners

  const pageSubsections = document.querySelector(".console-categories-panel");
  pageSubsections.addEventListener("click", handleSectionSelection);
  const newComplaintVisibilityBtns = [
    document.querySelector(".leave-complaint-btn"),
    document.querySelector(
      ".complaint-modal__overlay__new-complaint .complaint-modal__close-btn"
    ),
  ];
  newComplaintVisibilityBtns.forEach((btn) => {
    btn.addEventListener("click", handleComplaintSubmissionModalDisplay);
  });
  const addAdressBtn = document.querySelector(".add-adress-btn");
  addAdressBtn.addEventListener("click", addAdress);

  const addDeliveryTimeBtn = document.querySelector(".add-delivery-time-btn");
  addDeliveryTimeBtn.addEventListener("click", addDeliveryTime);
  const changePhoneNoBtn = document.querySelector(".change-phone-btn");
  changePhoneNoBtn.addEventListener("click", changePhoneNumber);
  const submitComplaintBtn = document.querySelector(
    ".complaint-modal__submit-btn"
  );
  submitComplaintBtn.addEventListener("click", submitComplaint);
  const complaintsContainer = document.querySelector(".complaint-table tbody");
  complaintsContainer.addEventListener("click", openComplaint);
  const closeOldComplaintModalBtn = document.querySelector(
    ".complaint-modal__overlay__old-complaint .complaint-modal__close-btn"
  );
  closeOldComplaintModalBtn.addEventListener(
    "click",
    toggleOldComplaintVisibility
  );
};
addEventListeners();

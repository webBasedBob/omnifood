import { initializeApp } from "firebase/app";
import {
  getAuth,
  onAuthStateChanged,
  signOut,
  updateProfile,
  updateEmail,
  updatePassword,
  sendPasswordResetEmail,
  deleteUser,
  reauthenticateWithCredential,
  EmailAuthProvider,
} from "firebase/auth";
import { getDatabase, ref, onValue, update } from "firebase/database";

import Notification from "../general/components/notification/script";
import Navigation from "../general/components/navigation/script.js";
import AuthModal from "../general/components/authModal/script";
import ErrorPopup from "../general/components/errorModal/script";
import NotLoggedInScreen from "../general/components/NotLoggedInScreen/script";
import {
  throwError,
  displayNotification,
} from "../general/js/reusableFunctions";
import { globalEventsHandler } from "../general/js/crossSiteFunctionality.js";
import {
  hideBySlidingDown,
  displayBySlidingDown,
} from "../general/js/animations";
//
//
// DOM manipulation code
//
//

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

let editWindowHeights = {};
const getEditFormsHeights = function () {
  const editWindows = document.querySelectorAll(".edit-form-wrapper");
  editWindows.forEach((elm) => {
    editWindowHeights[elm.dataset.id] = elm.offsetHeight;
    elm.classList.add("hidden");
  });
};
const handleInfoEditWindowVisibility = function (e) {
  const editWindow = e.target
    .closest(".edit-section-is-open")
    .querySelector(".edit-form-wrapper");
  const editBtn = e.target
    .closest(".edit-section-is-open")
    .querySelector(".edit-acc-info");
  console.log(editBtn);
  if (editWindow.classList.contains("hidden")) {
    const editWindowId = e.target.dataset.id;
    editWindow.classList.remove("hidden");
    displayBySlidingDown(editWindow, 500, editWindowHeights[editWindowId]);
    editBtn.classList.add("hidden");
  } else {
    hideBySlidingDown(editWindow, 500);
    setTimeout(() => {
      editWindow.classList.add("hidden");
    }, 500);
    editBtn.classList.remove("hidden");
  }
};

const hideLogOutBtn = function () {
  document.querySelector(".log-out-btn").classList.add("hidden");
};

const displayLogOutBtn = function () {
  document.querySelector(".log-out-btn").classList.remove("hidden");
};

//
//
//application logic code
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

onAuthStateChanged(auth, async (curUser) => {
  if (curUser) {
    displayAccountConsole();
    NotLoggedInScreen.hide();
    user = auth.currentUser;
    renderUserInfo();
    displayLogOutBtn();
    renderAdresses();
    renderDeliveryTimes();
    renderComplaints();
    getEditFormsHeights();
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
  renderOldComplaint(targetComplaint);
  toggleOldComplaintVisibility();
};

//
//
//Event listeners code
//
//

const addEventListeners = function () {
  document.addEventListener("click", globalEventsHandler);

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
    btn.addEventListener("click", handleInfoEditWindowVisibility);
  });
  editAccInfoCancelBtns.forEach((btn) => {
    btn.addEventListener("click", handleInfoEditWindowVisibility);
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

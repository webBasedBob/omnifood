import Component from "../baseComponent/script";
import { LogOutEvent } from "../../js/customEvents";
import authModal from "../authModal/script.js";
import { getUserImage } from "../../js/liveDatabaseFunctions.js";
import { hasCustomRole, displayNotification } from "../../js/reusableFunctions";
class Navigation extends Component {
  constructor() {
    super();
    this.component = document.querySelector(".header");
    this.accountOptionsBox = document.querySelector(".account-options");
    this.profilePic = document.querySelector(".header-user-profile__img");
    this.profileName = document.querySelector(".header-user-profile__text");
    this.enableMobileNav();
    this.handleComponentEvents();
    this.accOptionsVisibilityBoundHandler =
      this.accOptionsVisibilityUnboundHandler.bind(this);
  }
  getHTML() {
    return `<p class="hidden"></p`;
  }
  enableMobileNav() {
    const btnNavEl = document.querySelector(".btn-mobile-nav");
    btnNavEl.addEventListener("click", () => {
      this.component.classList.toggle("nav-open");
    });
  }

  accOptionsVisibilityHandler() {
    if (this.accountOptionsBox.classList.contains("hidden")) {
      this.accountOptionsBox.classList.remove("hidden");
      return;
    }
    this.accountOptionsBox.classList.add("acc-options-close");
    const hideOptions = () => {
      this.accountOptionsBox.classList.add("hidden");
      this.accountOptionsBox.classList.remove("acc-options-close");
      this.accountOptionsBox.removeEventListener("animationend", hideOptions);
    };
    this.accountOptionsBox.addEventListener("animationend", hideOptions);
  }
  updateProfilePic(imageSrc) {
    this.profilePic.src = imageSrc
      ? imageSrc
      : "https://firebasestorage.googleapis.com/v0/b/omnifood-custom-version.appspot.com/o/resources%2Fprofile-pic-placeholder.webp?alt=media&token=c7c1f91d-d2c7-4b46-9e21-513fdbda0866";
  }
  updateProfileName(name) {
    this.profileName.innerText = name || "----";
  }
  renderRoleBasedUI(role) {
    switch (role) {
      case "basic":
        break;
      case "subscriber":
        break;
      case "recruiter":
        document
          .querySelector(".main-nav-link recruiter")
          .classList.remove("hidden");
        break;
      case "admin":
        [
          document.querySelector(".main-nav-link.admin"),
          document.querySelector(".main-nav-link.recruiter"),
        ].forEach((elm) => {
          elm.classList.remove("hidden");
        });
        break;
      case "reset":
        [
          document.querySelector(".main-nav-link.admin"),
          document.querySelector(".main-nav-link.recruiter"),
        ].forEach((elm) => {
          elm.classList.add("hidden");
        });
        break;
    }
  }
  handleComponentEvents() {
    document.addEventListener("logged-in", this.renderAuthBasedUI.bind(this));
    document.addEventListener("logged-out", this.renderAuthBasedUI.bind(this));
  }
  accOptionsVisibilityUnboundHandler(e) {
    const event = e.target.dataset.event;
    switch (event) {
      case "toggle-account-box":
        this.accOptionsVisibilityHandler();
        break;
      case "log-out":
        authModal.logOut();
        this.accountOptionsBox.classList.add("hidden");
    }
  }
  async renderAuthBasedUI(e) {
    const authState = e.type;
    if (authState === "logged-in") {
      const user = authModal.user;
      const userName = user.displayName;
      const userImg = await getUserImage();
      const userRole = (await hasCustomRole(user, "admin"))
        ? "admin"
        : (await hasCustomRole(user, "recruiter"))
        ? "recruiter"
        : "basic";

      this.updateProfilePic(userImg);
      this.updateProfileName(userName);
      this.renderRoleBasedUI(userRole);

      this.component.addEventListener(
        "click",
        this.accOptionsVisibilityBoundHandler
      );
      document.querySelector(".header-log-in-btn").classList.add("hidden");
      document.querySelector(".header-user-profile").classList.remove("hidden");
    }
    if (authState === "logged-out") {
      this.renderRoleBasedUI("reset");
      document.querySelector(".header-log-in-btn").classList.remove("hidden");
      document.querySelector(".header-user-profile").classList.add("hidden");
      this.component.removeEventListener(
        "click",
        this.accOptionsVisibilityBoundHandler
      );
    }
  }
}
export default new Navigation();

import Component from "../baseComponent/script";
import { LogOutEvent } from "../../js/customEvents";
class Navigation extends Component {
  constructor() {
    super();
    this.component = document.querySelector(".header");
    this.accountOptionsBox = document.querySelector(".account-options");
    this.profilePic = document.querySelector(".header-user-profile__img");
    this.profileName = document.querySelector(".header-user-profile__text");
    // this.component.addEventListener("click", this.handleClickEvents.bind(this));
  }
  getHTML() {
    return `<p class="hidden"></p`;
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
    if (!imageSrc) return;
    this.profilePic.src = imageSrc;
  }
  updateProfileName(name) {
    this.profileName.innerText = name;
  }
  renderRoleBasedUI(role) {
    switch (role) {
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
    }
  }
  handleComponentEvents() {
    this.component.addEventListener("click", (e) => {
      const event = e.target.dataset.event;
      switch (event) {
        case "toggle-account-box":
          this.accOptionsVisibilityHandler();
          break;
      }
    });
  }
  renderLoggedInUI() {
    document.querySelector(".header-log-in-btn").classList.add("hidden");
  }
  init(loggedIn, userName, userImgSrc, role) {
    if (!loggedIn) return;
    this.renderLoggedInUI();
    this.updateProfilePic(userImgSrc);
    this.updateProfileName(userName);
    this.renderRoleBasedUI(role);
    this.handleComponentEvents();
  }
}
export default new Navigation();

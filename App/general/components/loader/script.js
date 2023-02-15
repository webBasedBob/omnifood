import BaseComponent from "../baseComponent/script";

class Loader extends BaseComponent {
  constructor() {
    super();
    this.component = document.querySelector(".loader__overlay");
  }
  getHTML() {
    return `<div class="loader__overlay hidden"><div class="loader"><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div></div></div>`;
  }
  display(parentElm) {
    if (parentElm) {
      parentElm.insertAdjacentElement("afterbegin", this.component);
      this.component.classList.add("transparent");
    }
    super.display();
  }
}
export default new Loader();

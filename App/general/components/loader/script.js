import BaseComponent from "../baseComponent/script";

class Loader extends BaseComponent {
  constructor() {
    super();
    this.component = document.querySelector(".loader__overlay");
  }
  getHTML() {
    return `<div class="loader__overlay hidden"><div class="loader"><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div></div></div>`;
  }
}
export default new Loader();

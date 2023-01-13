export default class Component {
  constructor() {
    this.render();
  }
  getHTML() {
    return;
  }
  render() {
    document.body.insertAdjacentHTML("afterbegin", this.getHTML());
  }
  display() {
    this.component.classList.remove("hidden");
  }
  hide() {
    this.component.classList.add("hidden");
  }
}

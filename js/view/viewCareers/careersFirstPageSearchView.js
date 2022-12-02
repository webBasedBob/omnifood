class firstPageSearchView {
  addHandlerFirstPageSearch(handler) {
    const searchBtn = document.querySelector(".btn-search");
    searchBtn.addEventListener("click", handler);
    const mainPageIsHidden = document.querySelector(
      ".section-main-content.hidden"
    );
    document.addEventListener("keydown", (e) => {
      if (mainPageIsHidden && e.key === "Enter") handler();
    });
  }
}
export default new firstPageSearchView();

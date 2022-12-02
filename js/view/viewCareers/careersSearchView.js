// to be refactored : split the function and place the resulting functions in corresponding module
// one here for the search keywords
// one in filters module

class searchView {
  getSearchKeywords() {
    const firstPage = document.querySelector(".section-first-interaction");
    const searchInputField = firstPage.classList.contains("hidden")
      ? document.querySelector(".main-search-field")
      : document.querySelector(".first-interaction-search-field");

    let searchKeywordsArr = [];
    searchKeywordsArr = searchInputField.value
      .toLowerCase()
      .trim()
      .split(" ")
      .filter((el) => el !== "");

    return searchKeywordsArr;
  }

  syncSearchInputField() {
    const firstPageSearchField = document.querySelector(
      ".first-interaction-search-field"
    );
    const mainSearchField = document.querySelector(".main-search-field");
    mainSearchField.value = firstPageSearchField.value;
  }

  showMainPage() {
    const firstFrame = document.querySelector(".section-first-interaction");
    const mainPage = document.querySelector(".section-main-content");
    firstFrame.classList.add("hidden");
    mainPage.classList.remove("hidden");
  }
  switchPages() {
    const firstPage = document.querySelector(".section-first-interaction");
    if (firstPage.classList.contains("hidden")) return;
    this.showMainPage();
    this.syncSearchInputField();
  }
  addHandlerJobSearch(handler) {
    const searchBtn = document.querySelector(".btn-search-main");
    searchBtn.addEventListener("click", handler);
    const FirstPageIsHidden = document.querySelector(
      ".section-first-interaction.hidden"
    );
    document.addEventListener("keydown", (e) => {
      if (FirstPageIsHidden && e.key === "Enter") handler();
    });
  }
}
export default new searchView();

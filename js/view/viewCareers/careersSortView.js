class sortView {
  highlightSortingCriterion(sortingCriterion) {
    const sortCriteriaElms = Array.from(
      document.querySelectorAll(".sort-results button")
    );
    sortCriteriaElms.forEach((element) => {
      element.classList.remove("sort-active");
    });
    const elmToHighlight = sortCriteriaElms.find((elm) => {
      return elm.innerText.toLowerCase() === sortingCriterion;
    });
    elmToHighlight.classList.add("sort-active");
  }
  addHandlerSort(handler) {
    const sortContainer = document.querySelector(".sort-results");
    sortContainer.addEventListener("click", function (e) {
      if (e.target.localName !== "button") return;
      handler(e);
    });
  }
}
export default new sortView();

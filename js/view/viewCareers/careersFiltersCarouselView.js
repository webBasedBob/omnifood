import { enableCarouselFunctionality } from "../../reusableFunctions.js";
class filtersCarouselView {
  init() {
    enableCarouselFunctionality(
      "popular-filters-carousel",
      "filters-carousel-item",
      "filter-carousel-arr-left",
      "filter-carousel-arr-right"
    );
  }
  addHandlerSelectFilter(handler) {
    const carousel = document.querySelector(".popular-filters-carousel");
    carousel.addEventListener("click", function (e) {
      if (e.target.localName !== "p") return;
      handler(e);
    });
  }
  unselectAllFilters() {
    const filters = document.querySelectorAll(".filters-carousel-item");
    filters.forEach((filter) => {
      filter.classList.remove("selected");
    });
  }
  filterToggleState(id) {
    const filters = Array.from(
      document.querySelectorAll(".filters-carousel-item")
    );
    const filterToUnselect = filters.find(
      (filter) => filter.dataset.filterId === id
    );
    if (!filterToUnselect) return;
    filterToUnselect.classList.toggle("selected");
  }
}
export default new filtersCarouselView();

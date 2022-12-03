class filtersView {
  getCheckedFilters() {
    const filtersCheckboxes = document.querySelectorAll(
      "input[type ='checkbox']"
    );
    const checkedFiltersObj = {
      location: [],
      category: [],
      experience: [],
    };

    filtersCheckboxes.forEach((checkbox) => {
      if (checkbox.checked) {
        const filterCategory = checkbox.id.slice(0, checkbox.id.indexOf("-"));
        const filterName = checkbox.name;
        checkedFiltersObj[filterCategory].push(filterName);
      }
    });
    return checkedFiltersObj;
  }

  extractFilterLabel(source) {
    let labelMustBeCut = source.innerText.includes("(");
    let filterLabel = labelMustBeCut
      ? source.innerText.slice(0, source.innerText.indexOf("(") - 1)
      : source.innerText;
    return filterLabel;
  }

  toggleAppliedFilterVisibility(e) {
    const targetText = e.target.nextElementSibling;
    const targetFilterLabel = this.extractFilterLabel(targetText);
    const allAppliedFiltersArray = Array.from(
      document.querySelectorAll(".applied-filter")
    );
    const targetFilter = allAppliedFiltersArray.find(
      (filter) => filter.children[0].innerText == targetFilterLabel
    );
    targetFilter.classList.toggle("hidden");
  }

  uncheckFilter(e) {
    const removeFilterBtnIsNotClicked = e.target.localName !== "ion-icon";
    if (removeFilterBtnIsNotClicked) return;
    const allFiltersArray = Array.from(
      document.querySelectorAll(".individual-filter")
    );
    const filterToUncheck = allFiltersArray.find((filter) => {
      let filterLabel = this.extractFilterLabel(filter.children[1]);
      return filterLabel == e.target.previousElementSibling.innerText;
    }).children[0];
    filterToUncheck.click();
  }

  selectFilter(id) {
    const filter = document.querySelector(`#${id}`);
    filter.click();
  }
  addHandlerMainFilters(handler) {
    const filtersContainer = document.querySelector(".filters");
    filtersContainer.addEventListener("input", handler);
  }

  addHandlerApplyedFilters(handler) {
    const appliedFiltersContainer = document.querySelector(".applied-filters");
    appliedFiltersContainer.addEventListener("click", handler);
  }

  addHandlerRemoveAllFilters(handler) {
    const removeAllAppliedFiltersBtn =
      document.querySelector(".remove-filters");

    removeAllAppliedFiltersBtn.addEventListener("click", handler);
  }

  removeAllAppliedFilters() {
    const allAppliedFilters = document.querySelectorAll(".applied-filter");
    const allFilterCheckboxes = document.querySelectorAll(
      "input[type ='checkbox']"
    );
    allAppliedFilters.forEach((appliedFilter) =>
      appliedFilter.classList.add("hidden")
    );
    allFilterCheckboxes.forEach((filter) => (filter.checked = false));
  }
  init() {
    const appliedFiltersContainer = document.querySelector(".applied-filters");
    const filterLabels = document.querySelectorAll("label");
    filterLabels.forEach((label) => {
      const labelText = this.extractFilterLabel(label);
      let html = `<div class="applied-filter hidden">
      <p>${labelText}</p>
      <ion-icon
      class="remove-filter"
      name="close-outline"
      ></ion-icon>
      </div>`;
      appliedFiltersContainer.insertAdjacentHTML("afterbegin", html);
    });
  }
  addHandlerControlMobileFilters(handler) {
    const btns = [
      document.querySelector(".show-mobile-filters-btn"),
      document.querySelector(".mobile-filters-close-btn"),
      document.querySelector(".mobile-filters-search-btn"),
    ];
    btns.forEach((btn) => btn.addEventListener("click", handler));
  }
  toggleMobileFilters() {
    const mobileFiltersContainer = document.querySelector(".filters");
    mobileFiltersContainer.classList.toggle("flex");
  }
}

export default new filtersView();

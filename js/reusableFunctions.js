export const toTitleCase = function (str) {
  const charArray = Array.from(str.trim().toLowerCase());
  const capitalizeNextCharacter = function (currentCharIndex) {
    const nextCharIndex = currentCharIndex + 1;
    charArray[nextCharIndex] = charArray[nextCharIndex].toUpperCase();
  };
  charArray[0] = charArray[0].toUpperCase();
  charArray.forEach((char, i) => {
    if (char === " ") capitalizeNextCharacter(i);
  });
  return charArray.join("");
};

export const enableCarouselFunctionality = function (
  carouselContainerClass,
  carouselItemsClass,
  prevBtnClass,
  nextBtnClass
) {
  const carouselItems = document.querySelectorAll(`.${carouselItemsClass}`);
  const nextBtn = document.querySelector(`.${nextBtnClass}`);
  const prevBtn = document.querySelector(`.${prevBtnClass}`);
  const carouselContainer = document.querySelector(
    `.${carouselContainerClass}`
  );

  const getElmWidth = function (elm) {
    return Number(
      window.getComputedStyle(elm).getPropertyValue("width").slice(0, -2)
    );
  };

  const getCarouselElmsWidthMean = function (elmsClass) {
    const carouselElms = document.querySelectorAll(`.${elmsClass}`);
    let elmsWidthSum = 0;
    let noOfElms = 0;
    carouselElms.forEach((elm) => {
      elmsWidthSum += getElmWidth(elm);
      noOfElms++;
    });
    return elmsWidthSum / noOfElms;
  };

  const carouselContainerWidth = getElmWidth(carouselContainer);
  let distanceToTravel = getCarouselElmsWidthMean(carouselItemsClass) * 1.1;

  const noOfVisibleCarouselElms = function () {
    let result = carouselContainerWidth / distanceToTravel;
    return Math.floor(result);
  };

  let currentItem = 0;
  let carouselFullWidth;

  const navigateCarousel = function () {
    let sumOfPreviousElementsWidth = 0;
    carouselItems.forEach((item) => {
      const widthInPx = getElmWidth(item);
      item.style.transform = `translateX(${
        sumOfPreviousElementsWidth * 1.1 - currentItem * distanceToTravel
      }px)`;
      sumOfPreviousElementsWidth += widthInPx;
    });
    carouselFullWidth = sumOfPreviousElementsWidth * 1.1;
  };

  const carouselNextItem = function () {
    currentItem++;
    if (
      carouselContainerWidth + (currentItem - 1) * distanceToTravel >=
      carouselFullWidth
    )
      currentItem = 0;
    navigateCarousel();
  };

  const carouselPrevItem = function () {
    currentItem--;
    if (currentItem < 0)
      currentItem = carouselItems.length - noOfVisibleCarouselElms();
    navigateCarousel();
  };
  navigateCarousel();
  nextBtn.addEventListener("click", carouselNextItem);
  prevBtn.addEventListener("click", carouselPrevItem);
};

export const cleanStrFromSymbolsAndUselessSpaces = function (str) {
  const lowerCaseTrimmedStr = str.trim().toLowerCase();
  const charArrWithAllSpaces = lowerCaseTrimmedStr
    .split("")
    .filter((char, index) => {
      if (
        lowerCaseTrimmedStr.charCodeAt(index) >= 97 &&
        lowerCaseTrimmedStr.charCodeAt(index) <= 122
      )
        return true;
      if (char === " ") return true;
      return false;
    });
  const trimmedCharArr = charArrWithAllSpaces.filter((char, index) => {
    if (char !== " ") return true;
    if (charArrWithAllSpaces[index - 1] == " ") return false;
    return true;
  });
  return trimmedCharArr.join("");
};

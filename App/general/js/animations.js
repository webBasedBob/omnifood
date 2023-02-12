export const hideBySlidingDown = function (elm, duration) {
  elm.style.overflow = "hidden";
  let timeFromPageLoad = performance.now();
  let done = false;
  const elmHeight = parseInt(window.getComputedStyle(elm).height);
  const elmPadding = parseInt(window.getComputedStyle(elm).padding);
  const callback = (timeStamp) => {
    let millisecondsCounter = timeStamp - timeFromPageLoad;
    let progress = 1 - millisecondsCounter / duration;
    if (millisecondsCounter < duration) {
      elm.style.height = `${Math.min(elmHeight, elmHeight * progress)}px`;
      elm.style.paddingTop = `${Math.min(elmPadding, elmPadding * progress)}px`;
    } else {
      done = true;
      elm.style.height = `${0}px`;
      elm.style.paddingTop = `${0}px`;
    }
    if (!done) {
      requestAnimationFrame(callback);
    }
  };
  requestAnimationFrame(callback);
};

export const displayBySlidingDown = function (elm, duration, heightToReach) {
  elm.style.overflow = "hidden";
  let timeFromPageLoad = performance.now();
  let done = false;
  const elmHeight = heightToReach;
  const callback = (timeStamp) => {
    let millisecondsCounter = timeStamp - timeFromPageLoad;
    let progress = millisecondsCounter / duration;
    if (millisecondsCounter < duration) {
      elm.style.height = `${elmHeight * progress}px`;
    } else {
      done = true;
      elm.style.height = ``;
    }
    if (!done) {
      requestAnimationFrame(callback);
    }
  };
  requestAnimationFrame(callback);
};

export const rotate180deg = function (elm, duration) {
  const elmInitRotation = parseInt(elm.style.transform.slice(7) || 0);
  let timeFromPageLoad = performance.now();
  let done = false;
  const callback = (timeStamp) => {
    let millisecondsCounter = timeStamp - timeFromPageLoad;
    let progress = elmInitRotation
      ? 1 - millisecondsCounter / duration
      : millisecondsCounter / duration;
    if (millisecondsCounter < duration) {
      elm.style.transform = `rotate(${180 * progress}deg)`;
    } else {
      elm.style.transform = `rotate(${180 * progress.toFixed(0)}deg)`;
      done = true;
    }
    if (!done) {
      requestAnimationFrame(callback);
    }
  };
  requestAnimationFrame(callback);
};

import { hasAncestorWithAttribute } from "./checkAttributes.js";

let originalBackgroundColor = new Map();

export function applyHideImages(hide) {
  const elements = document.body.getElementsByTagName("img");

  if (originalBackgroundColor.size === 0) {
    for (let i = 0; i < elements.length; i++) {
      const element = elements[i];
      originalBackgroundColor.set(element, getComputedStyle(element).opacity);
    }
  }

  for (let i = 0; i < elements.length; i++) {
    const element = elements[i];

    if (hasAncestorWithAttribute(element, "data-accessi-none")) {
      continue;
    }

    if (hide) {
      element.style.opacity = 0;
      element.style.visibility = 'hidden';
    } else {
      element.style.opacity = originalBackgroundColor.get(element);
      element.style.visibility = 'visible';
    }
  }
}
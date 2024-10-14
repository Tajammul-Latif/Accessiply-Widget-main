import { hasAncestorWithAttribute } from "./checkAttributes.js";

let originalHeadingColor = new Map();

export function applyHeadingColor(color) {
  const elements = document.querySelectorAll('h1, h2, h3, h4, h5, h6');

  if (originalHeadingColor.size === 0) {
    for (let i = 0; i < elements.length; i++) {
      const element = elements[i];
      originalHeadingColor.set(element, getComputedStyle(element).color);
    }
  }

  for (let i = 0; i < elements.length; i++) {
    const element = elements[i];

    if (hasAncestorWithAttribute(element, "data-accessi-none")) {
      continue;
    } else {
      if (color === "none") {
        // Setze die ursprüngliche Farbe wiederher
        element.style.color = originalHeadingColor.get(element);
      } else {
        element.style.color = `${color}`;
      }
    }
  }

  // Falls color "none" ist, leere die Map, da die ursprünglichen Werte wiederhergestellt wurden
  if (color === "none") {
    originalHeadingColor.clear();
  }
}
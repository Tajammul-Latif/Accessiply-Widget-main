import { hasAncestorWithAttribute } from "./checkAttributes.js";

let originalLinkColor = new Map();

export function applyLinkColor(color) {
  const elements = document.querySelectorAll('a, button');

  if (originalLinkColor.size === 0) {
    for (let i = 0; i < elements.length; i++) {
      const element = elements[i];
      originalLinkColor.set(element, getComputedStyle(element).color);
    }
  }

  for (let i = 0; i < elements.length; i++) {
    const element = elements[i];

    if (hasAncestorWithAttribute(element, "data-accessi-none")) {
      continue;
    } else {
      if (color === "none") {
        // Setze die ursprüngliche Farbe wiederher
        element.style.color = originalLinkColor.get(element);
      } else {
        element.style.color = `${color}`;
      }
    }
  }

  // Falls color "none" ist, leere die Map, da die ursprünglichen Werte wiederhergestellt wurden
  if (color === "none") {
    originalLinkColor.clear();
  }
}
import { hasAncestorWithAttribute } from "./checkAttributes.js";

let originalTextColor = new Map();

export function applyTextColor(color) {
  const elements = document.querySelectorAll('p, span, div');

  if (originalTextColor.size === 0) {
    for (let i = 0; i < elements.length; i++) {
      const element = elements[i];
      originalTextColor.set(element, getComputedStyle(element).color);
    }
  }

  for (let i = 0; i < elements.length; i++) {
    const element = elements[i];

    if (hasAncestorWithAttribute(element, "data-accessi-none")) {
      continue;
    } else {
      if (color === "none") {
        // Setze die ursprüngliche Farbe wiederher
        element.style.color = originalTextColor.get(element);
      } else {
        element.style.color = `${color}`;
      }
    }
  }

  // Falls color "none" ist, leere die Map, da die ursprünglichen Werte wiederhergestellt wurden
  if (color === "none") {
    originalTextColor.clear();
  }
}

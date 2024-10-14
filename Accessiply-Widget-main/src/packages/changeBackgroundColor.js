import { hasAncestorWithAttribute } from "./checkAttributes.js";
import { applySaturation } from "./saturation.js"; // Saturation Funktion importieren

let originalBackgroundColor = new Map();

export function applyBackgroundColor(color) {
  const elements = document.body.getElementsByTagName("*");

  // Bevor wir die Hintergrundfarbe ändern, stellen wir sicher, dass die Sättigung auf "none" gesetzt wird
  applySaturation('none'); // Setze die Sättigung auf "none", um Überschneidungen zu vermeiden

  if (originalBackgroundColor.size === 0) {
    for (let i = 0; i < elements.length; i++) {
      const element = elements[i];
      originalBackgroundColor.set(element, getComputedStyle(element).backgroundColor);
    }
  }

  for (let i = 0; i < elements.length; i++) {
    const element = elements[i];

    if (hasAncestorWithAttribute(element, "data-accessi-none")) {
      continue;
    } else {
      if (color === "none") {
        // Setze die ursprüngliche Hintergrundfarbe wiederher
        element.style.backgroundColor = originalBackgroundColor.get(element);
      } else {
        element.style.backgroundColor = `${color}`;
      }
    }
  }

  // Falls color "none" ist, leere die Map, da die ursprünglichen Werte wiederhergestellt wurden
  if (color === "none") {
    originalBackgroundColor.clear();
  }
}
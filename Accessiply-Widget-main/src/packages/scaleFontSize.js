import { hasAncestorWithAttribute } from "./checkAttributes.js";

let originalFontSizes = new Map();

export function adjustFontSize(zoomFactor) {
  // Holen Sie sich alle Elemente auf der Seite
  const elements = document.body.getElementsByTagName("*");

  // Speichern Sie die ursprünglichen Schriftgrößen, wenn es das erste Mal ist
  if (originalFontSizes.size === 0) {
    for (let i = 0; i < elements.length; i++) {
      const element = elements[i];
      originalFontSizes.set(element, parseFloat(getComputedStyle(element).fontSize));
    }
  }

  // Durchlaufen Sie die Elemente und ändern Sie die Schriftgröße
  for (let i = 0; i < elements.length; i++) {
    const element = elements[i];

    // Überprüfen Sie, ob das Element oder eines seiner übergeordneten Elemente das Attribut "data-accessi-none" hat
    if (hasAncestorWithAttribute(element, "data-accessi-none")) {
      // Überspringen Sie das Element und alle seine Kindelemente, wenn eines seiner übergeordneten Elemente das Attribut hat
      continue;
    } else {
      // Holen Sie die ursprüngliche Schriftgröße des Elements
      const originalFontSize = originalFontSizes.get(element);

      // Berechnen Sie die neue Schriftgröße basierend auf dem extrahierten Zoom-Faktor
      const newFontSize = originalFontSize * parseFloat(zoomFactor);

      // Setzen Sie die neue Schriftgröße für das Element
      element.style.fontSize = `${newFontSize}px`;
    }
  }
}
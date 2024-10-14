import { hasAncestorWithAttribute } from "./checkAttributes.js";

let originalLineHeights = new Map();

export function adjustLineHeight(zoomFactor) {
  // Holen Sie sich alle Elemente auf der Seite
  const elements = document.body.getElementsByTagName("*");

  // Speichern Sie die ursprünglichen Schriftgrößen, wenn es das erste Mal ist
  if (originalLineHeights.size === 0) {
    for (let i = 0; i < elements.length; i++) {
      const element = elements[i];
      originalLineHeights.set(element, parseFloat(getComputedStyle(element).lineHeight));
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
      const originalLineHeight = originalLineHeights.get(element);

      // Berechnen Sie die neue Schriftgröße basierend auf dem extrahierten Zoom-Faktor
      const newLineHeight = originalLineHeight * parseFloat(zoomFactor);

      // Setzen Sie die neue Schriftgröße für das Element
      element.style.lineHeight = `${newLineHeight}px`;
    }
  }
}
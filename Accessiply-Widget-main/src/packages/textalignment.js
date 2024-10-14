import { hasAncestorWithAttribute } from "./checkAttributes.js";

let currentAlignment = "none";
const originalTextAlignments = new Map(); // Map zum Speichern der ursprünglichen Textausrichtungen

export function adjustTextAlignment(alignment) {
  if (currentAlignment === alignment) {
    restoreOldTextAlignment();
    return;
  }

  // Holen Sie sich alle Elemente auf der Seite
  const elements = document.body.getElementsByTagName("*");

  // Durchlaufen Sie alle Elemente und setzen Sie die Textausrichtung je nach Attribut
  for (let i = 0; i < elements.length; i++) {
    const element = elements[i];

    // Überprüfen Sie, ob das Element selbst das Attribut "data-accessi-none" hat
    if (!hasAncestorWithAttribute(element, "data-accessi-none")) {
      
      // Speichern Sie den ursprünglichen textAlign-Wert, falls noch nicht gespeichert
      if (!originalTextAlignments.has(element)) {
        originalTextAlignments.set(element, element.style.textAlign);
      }

      // Setzen Sie die Textausrichtung basierend auf dem übergebenen Wert
      switch (alignment) {
        case "left":
          element.style.textAlign = "left";
          currentAlignment = "left";
          break;
        case "center":
          element.style.textAlign = "center";
          currentAlignment = "center";
          break;
        case "right":
          element.style.textAlign = "right";
          currentAlignment = "right";
          break;
        default:
          break;
      }
    }
  }
}

export function restoreOldTextAlignment() {
  // Wiederherstellung der ursprünglichen Textausrichtungen
  originalTextAlignments.forEach((originalAlignment, element) => {
    element.style.textAlign = originalAlignment;
  });

  // Map leeren, da die ursprünglichen Werte wiederhergestellt wurden
  originalTextAlignments.clear();

  // Reset der aktuellen Ausrichtung
  currentAlignment = "none";
}

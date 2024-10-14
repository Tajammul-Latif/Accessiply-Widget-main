/*// Objekt zum Speichern der ursprünglichen Schriftarten
const originalFonts = new WeakMap();

// Funktion, um Schriftart eines Elements zu ersetzen
function replaceDysFont(element, newFont) {
  // Speichere die ursprüngliche Schriftart, falls noch nicht gespeichert
  if (!originalFonts.has(element)) {
    originalFonts.set(element, window.getComputedStyle(element).fontFamily);
  }
  element.style.fontFamily = newFont;
}

// Funktion, um alle Textelemente auf der Seite zu durchsuchen und die Schriftarten zu ersetzen
export function replaceDyslexiaFont(shouldReplace = true) {
  // Alle Textelemente auf der Seite holen
  const textElements = document.querySelectorAll('p, h1, h2, h3, h4, h5, h6, span, div, a');

  // Durch alle Textelemente iterieren
  textElements.forEach(element => {
    // Aktuelle Schriftart des Elements holen
    const currentFont = window.getComputedStyle(element).fontFamily;

    if (shouldReplace) {
      // Prüfen, ob es sich um eine Serifen-Schriftart handelt
      if (currentFont.includes('serif')) {
        // Schriftart durch OpenDyslexic ersetzen
        replaceDysFont(element, 'Opendyslexic, sans-serif');
      }
    } else {
      // Schriftart auf den ursprünglichen Wert zurücksetzen
      if (originalFonts.has(element)) {
        replaceDysFont(element, originalFonts.get(element));
      } else {
        // Wenn die ursprüngliche Schriftart nicht gespeichert wurde, setze sie auf den aktuellen Wert
        originalFonts.set(element, currentFont);
      }
    }
  });
}

function hasAncestorWithAttribute(element, attribute) {
    // Rekursiv nach einem übergeordneten Element mit dem angegebenen Attribut suchen
    while (element.parentElement) {
      if (element.hasAttribute(attribute)) {
        return true;
      }
      element = element.parentElement;
    }
    return false;
  }*/
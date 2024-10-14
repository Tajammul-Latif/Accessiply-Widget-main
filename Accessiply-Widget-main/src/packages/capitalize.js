import { hasAncestorWithAttribute } from "./checkAttributes.js";

// Map zur Speicherung der ursprünglichen text-transform Werte
const originalTextTransforms = new Map();

// Funktion zur Speicherung der ursprünglichen text-transform Werte
function saveTextTransforms() {
    const textElements = document.querySelectorAll('body :not([data-accessi-widget]) p, body :not([data-accessi-widget]) h1, body :not([data-accessi-widget]) h2, body :not([data-accessi-widget]) h3, body :not([data-accessi-widget]) h4, body :not([data-accessi-widget]) h5, body :not([data-accessi-widget]) h6, body :not([data-accessi-widget]) span, body :not([data-accessi-widget]) div, body :not([data-accessi-widget]) a');

    textElements.forEach(element => {
        if (!element.hasAttribute("data-accessi-none") && !hasAncestorWithAttribute(element, "data-accessi-none")) {
            if (!originalTextTransforms.has(element)) {
                originalTextTransforms.set(element, window.getComputedStyle(element).textTransform || 'none');
            }
        }
    });
}

// Funktion, um die Textumwandlungen durchzuführen
export function applyTextTransform(transformType) {
    // Alle Textelemente auf der Seite holen, außer denen innerhalb des Widgets
    const textElements = document.querySelectorAll('body :not([data-accessi-widget]) p, body :not([data-accessi-widget]) h1, body :not([data-accessi-widget]) h2, body :not([data-accessi-widget]) h3, body :not([data-accessi-widget]) h4, body :not([data-accessi-widget]) h5, body :not([data-accessi-widget]) h6, body :not([data-accessi-widget]) span, body :not([data-accessi-widget]) div, body :not([data-accessi-widget]) a');

    // Durch alle Textelemente iterieren und die Textumwandlung anwenden
    textElements.forEach(element => {
        if (!element.hasAttribute("data-accessi-none") && !hasAncestorWithAttribute(element, "data-accessi-none")) {
            if (transformType === "none") {
                // Ursprünglichen text-transform Wert wiederherstellen
                if (originalTextTransforms.has(element)) {
                    element.style.textTransform = originalTextTransforms.get(element);
                }
            } else {
                if (!originalTextTransforms.has(element)) {
                    originalTextTransforms.set(element, window.getComputedStyle(element).textTransform || 'none');
                }
                element.style.textTransform = transformType;
            }
        }
    });
}

// Funktion zum Umschalten der Groß-/Kleinschreibung
export function toggleCases(type) {
    applyTextTransform(type);
}

// Aufruf der Funktion beim Laden der Seite
document.addEventListener('DOMContentLoaded', () => {
    saveTextTransforms();
});

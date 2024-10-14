// Objekt zum Speichern der ursprünglichen Schriftarten
const originalFonts = new WeakMap();

// Funktion, um die Font-Family der Textelemente zu speichern
function saveFontFamilies() {
    // Alle Textelemente auf der Seite holen
    const textElements = document.querySelectorAll('p, h1, h2, h3, h4, h5, h6, span, div, a');

    // Durch alle Textelemente iterieren und die Font-Family speichern
    textElements.forEach(element => {
        const computedStyle = window.getComputedStyle(element);
        const fontFamily = computedStyle.fontFamily;

        // Speichere die ursprüngliche Schriftart, falls noch nicht gespeichert
        if (!originalFonts.has(element)) {
            originalFonts.set(element, fontFamily);
        }
    });
}

// Funktion, um Schriftart eines Elements zu ersetzen
function replaceFont(element, newFont) {
    element.style.fontFamily = newFont;
}

// Funktion, um die ursprüngliche Schriftart wiederherzustellen
function restoreOriginalFont(element) {
    if (originalFonts.has(element)) {
        const originalFont = originalFonts.get(element);
        element.style.fontFamily = originalFont;
    }
}

// Funktion, um alle Textelemente auf der Seite zu durchsuchen und die Schriftarten zu ersetzen oder wiederherzustellen
export function replaceNonSansSerifFonts(shouldReplace) {
    // Zuerst die ursprünglichen Font-Families speichern
    saveFontFamilies();

    // Alle Textelemente auf der Seite holen
    const textElements = document.querySelectorAll('p, h1, h2, h3, h4, h5, h6, span, div, a');

    // Durch alle Textelemente iterieren
    textElements.forEach(element => {
        if (shouldReplace) {
            // Aktuelle Schriftart des Elements holen
            const currentFont = window.getComputedStyle(element).fontFamily;

            // Prüfen, ob es sich um eine Serifen-Schriftart handelt
            if (currentFont.includes('serif')) {
                // Schriftart durch Helvetica oder Arial ersetzen
                replaceFont(element, 'Helvetica, Arial, sans-serif');
            }
        } else {
            // Schriftart auf den ursprünglichen Wert zurücksetzen
            restoreOriginalFont(element);
        }
    });
}

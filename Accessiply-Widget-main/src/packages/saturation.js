import { hasAncestorWithAttribute } from "./checkAttributes.js";

// WeakMap, um die ursprünglichen Stile zu speichern
let originalStyles = new WeakMap();

// Funktion, um die ursprünglichen Stile zu speichern
function saveOriginalStyles(element) {
    if (!originalStyles.has(element)) {
        const computedStyle = window.getComputedStyle(element);
        originalStyles.set(element, {
            backgroundColor: computedStyle.backgroundColor,
            color: computedStyle.color
        });
    }
}

// Funktion, um die ursprünglichen Stile wiederherzustellen
function restoreOriginalStyles(element) {
    const styles = originalStyles.get(element);
    if (styles) {
        element.style.backgroundColor = styles.backgroundColor;
        element.style.color = styles.color;
    }
}

// Konvertiert RGB in HSL
function rgbToHsl(r, g, b) {
    r /= 255, g /= 255, b /= 255;
    const max = Math.max(r, g, b), min = Math.min(r, g, b);
    let h, s, l = (max + min) / 2;

    if (max === min) {
        h = s = 0; // achromatisch
    } else {
        const d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
        switch (max) {
            case r: h = (g - b) / d + (g < b ? 6 : 0); break;
            case g: h = (b - r) / d + 2; break;
            case b: h = (r - g) / d + 4; break;
        }
        h /= 6;
    }
    return [h * 360, s * 100, l * 100]; // HSL Werte in Prozent zurückgeben
}

// Konvertiert HSL in RGB
function hslToRgb(h, s, l) {
    h /= 360, s /= 100, l /= 100;
    let r, g, b;
    if (s === 0) {
        r = g = b = l; // achromatisch
    } else {
        const hue2rgb = (p, q, t) => {
            if (t < 0) t += 1;
            if (t > 1) t -= 1;
            if (t < 1 / 6) return p + (q - p) * 6 * t;
            if (t < 1 / 2) return q;
            if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
            return p;
        };
        const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
        const p = 2 * l - q;
        r = hue2rgb(p, q, h + 1 / 3);
        g = hue2rgb(p, q, h);
        b = hue2rgb(p, q, h - 1 / 3);
    }
    return `rgb(${Math.round(r * 255)}, ${Math.round(g * 255)}, ${Math.round(b * 255)})`;
}

// Überprüft, ob eine Farbe farbig ist (keine Grautöne, Schwarz oder Weiß)
function isColorful(color) {
    const rgb = color.match(/\d+/g).map(Number);
    const [h, s, l] = rgbToHsl(rgb[0], rgb[1], rgb[2]);
    return !(s === 0 && (l === 100 || l === 0)); // Nicht Weiß oder Schwarz
}

// Erhöht die Sättigung stark
function saturateColor(color, saturationIncrease = 50) {
    const rgb = color.match(/\d+/g).map(Number);
    let [h, s, l] = rgbToHsl(rgb[0], rgb[1], rgb[2]);
    s = Math.min(100, s + saturationIncrease); // Sättigung auf maximal 100% erhöhen
    return hslToRgb(h, s, l);
}

// Verringert die Sättigung stark
function desaturateColor(color, saturationDecrease = 50) {
    const rgb = color.match(/\d+/g).map(Number);
    let [h, s, l] = rgbToHsl(rgb[0], rgb[1], rgb[2]);
    s = Math.max(0, s - saturationDecrease); // Sättigung auf minimal 0% verringern
    return hslToRgb(h, s, l);
}

// Hauptfunktion zur Anwendung der Sättigungsänderungen
export function applySaturation(mode) {
    document.querySelectorAll('*').forEach(element => {
        // Überspringe Elemente, die das Attribut "data-accessi-none" haben oder einen Vorfahren mit diesem Attribut haben
        if (!element.hasAttribute("data-accessi-none") && !hasAncestorWithAttribute(element, "data-accessi-none")) {
            const bgColor = window.getComputedStyle(element).backgroundColor;
            const textColor = window.getComputedStyle(element).color;

            if (mode === 'none') {
                // Stile zurücksetzen
                restoreOriginalStyles(element);
            } else if (isColorful(bgColor) || isColorful(textColor)) {
                // Ursprüngliche Stile speichern
                saveOriginalStyles(element);

                // Sättigung anpassen
                if (mode === 'high') {
                    if (bgColor && bgColor !== 'rgba(0, 0, 0, 0)' && bgColor !== 'transparent') {
                        element.style.backgroundColor = saturateColor(bgColor);
                    }
                    if (textColor) {
                        element.style.color = saturateColor(textColor, 30); // Text auch stärker sättigen
                    }
                } else if (mode === 'low') {
                    if (bgColor && bgColor !== 'rgba(0, 0, 0, 0)' && bgColor !== 'transparent') {
                        element.style.backgroundColor = desaturateColor(bgColor);
                    }
                    if (textColor) {
                        element.style.color = desaturateColor(textColor, 30); // Text weniger stark entsättigen
                    }
                }
            }
        }
    });
}

// Beispielaufrufe
// applySaturation('high');  // Sättigung stark erhöhen
// applySaturation('low');   // Sättigung verringern
// applySaturation('none');  // Ursprüngliche Sättigung wiederherstellen

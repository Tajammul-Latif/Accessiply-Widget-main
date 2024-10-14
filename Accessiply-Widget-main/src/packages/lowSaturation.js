// Speichere die ursprünglichen Farben
let originalStyles = new WeakMap();

function saveOriginalStyles(element) {
    const computedStyle = window.getComputedStyle(element);
    originalStyles.set(element, {
        backgroundColor: computedStyle.backgroundColor,
        color: computedStyle.color
    });
}

function restoreOriginalStyles(element) {
    const styles = originalStyles.get(element);
    if (styles) {
        element.style.backgroundColor = styles.backgroundColor;
        element.style.color = styles.color;
    }
}

function isDescendantOfElementWithAttribute(element, attributeName) {
    while (element) {
        if (element.hasAttribute && element.hasAttribute(attributeName)) {
            return true;
        }
        element = element.parentElement;
    }
    return false;
}

function rgbToHsl(r, g, b) {
    r /= 255, g /= 255, b /= 255;
    const max = Math.max(r, g, b), min = Math.min(r, g, b);
    let h, s, l = (max + min) / 2;

    if (max === min) {
        h = s = 0; // achromatic
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
    return [h, s, l];
}

function hslToRgb(h, s, l) {
    let r, g, b;

    if (s === 0) {
        r = g = b = l; // achromatic
    } else {
        const hue2rgb = (p, q, t) => {
            if (t < 0) t += 1;
            if (t > 1) t -= 1;
            if (t < 1/6) return p + (q - p) * 6 * t;
            if (t < 1/2) return q;
            if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
            return p;
        };

        const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
        const p = 2 * l - q;
        r = hue2rgb(p, q, h + 1/3);
        g = hue2rgb(p, q, h);
        b = hue2rgb(p, q, h - 1/3);
    }

    return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
}

function isDesaturatableColor(color) {
    const rgb = color.match(/\d+/g).map(Number);
    if (rgb.length < 3) return false;

    const [h, s, l] = rgbToHsl(rgb[0], rgb[1], rgb[2]);
    
    // Überprüfe, ob die Farbe nicht bereits völlig entsättigt ist
    return s > 0.1;
}

function desaturateColor(color, saturationDecrease = 0.5) {
    if (!isDesaturatableColor(color)) return color;

    const rgb = color.match(/\d+/g).map(Number);
    let [h, s, l] = rgbToHsl(rgb[0], rgb[1], rgb[2]);
    
    // Verringere die Sättigung
    s = Math.max(0, s - saturationDecrease);
    
    const [r, g, b] = hslToRgb(h, s, l);
    return `rgb(${r}, ${g}, ${b})`;
}

export function applyLowSaturation(isLowSaturation) {
    document.querySelectorAll('*').forEach(element => {
        if (!isDescendantOfElementWithAttribute(element, 'data-accessi-none')) {
            if (isLowSaturation) {
                // Speichere die ursprünglichen Stile
                saveOriginalStyles(element);
                const bgColor = window.getComputedStyle(element).backgroundColor;
                const textColor = window.getComputedStyle(element).color;

                // Wende niedrige Sättigung an
                if (bgColor && bgColor !== 'rgba(0, 0, 0, 0)' && bgColor !== 'transparent') {
                    element.style.backgroundColor = desaturateColor(bgColor);
                }
                if (textColor) {
                    element.style.color = desaturateColor(textColor, 0.3); // Etwas weniger Entsättigung für Text
                }
            } else {
                // Stelle die ursprünglichen Stile wieder her
                restoreOriginalStyles(element);
            }
        }
    });
}

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

export function lightContrast(isLightMode) {
    if (isLightMode) {
        // Speicher die ursprünglichen Farben nur für Elemente, die kein Elternelement mit data-accessi-none haben
        document.querySelectorAll('*').forEach(element => {
            if (!isDescendantOfElementWithAttribute(element, 'data-accessi-none')) {
                saveOriginalStyles(element);
            }
        });

        // Setze alle Hintergrundfarben auf Weiß und Textfarbe auf Schwarz
        document.querySelectorAll('*').forEach(element => {
            if (!isDescendantOfElementWithAttribute(element, 'data-accessi-none')) {
                const bgColor = window.getComputedStyle(element).backgroundColor;
                if (bgColor && bgColor !== 'rgba(0, 0, 0, 0)' && bgColor !== 'transparent') {
                    element.style.backgroundColor = '#FFFFFF'; // Weiß
                }
                element.style.color = '#000000'; // Schwarz
            }
        });
    } else {
        // Stelle das ursprüngliche Styling nur für Elemente wieder her, die kein Elternelement mit data-accessi-none haben
        document.querySelectorAll('*').forEach(element => {
            if (!isDescendantOfElementWithAttribute(element, 'data-accessi-none')) {
                restoreOriginalStyles(element);
            }
        });
    }
}

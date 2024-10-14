export function highlightLinkButtons(applyBorder) {
    // Wähle alle <a>- und <button>-Elemente auf der gesamten Seite aus
    const allLinks = document.querySelectorAll('a');
    const allButtons = document.querySelectorAll('button');
    const combinedList = [...allLinks, ...allButtons];

    combinedList.forEach(element => {
        // Variable, um festzustellen, ob das Element innerhalb eines Elements mit dem Attribut data-accessi-none liegt
        let isInsideAccessiNone = false;
        let currentElement = element;

        // Gehe die Eltern-Elemente durch, bis der Dokumentenkörper erreicht ist
        while (currentElement) {
            if (currentElement.hasAttribute('data-accessi-none')) {
                isInsideAccessiNone = true;
                break;
            }
            currentElement = currentElement.parentElement;
        }

        if (!isInsideAccessiNone) {
            if (applyBorder) {
                // Füge eine 3px Umrandung und 10px Padding hinzu, wenn applyBorder true ist
                element.style.border = '3px solid var(--brand-blue)';
                //element.style.margin = '10px';  
            } else {
                // Entferne die Umrandung und das Padding, falls vorhanden (zur Sicherheit)
                element.style.border = 'none';
                //element.style.padding = '';  // Entferne das Padding
            }
        }
    });
}

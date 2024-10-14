export function highlightHeadings(applyBorder) {
    const headings = document.querySelectorAll('h1, h2, h3, h4, h5, h6');

    headings.forEach(heading => {
        // Überprüfe, ob das Heading ein Kind eines Elements mit der Klasse 'accessi_widget' ist
        if (!heading.closest('.accessi_widget')) {
            if (applyBorder) {
                // Füge eine 3px schwarze Umrandung hinzu, wenn applyBorder true ist
                heading.style.border = '3px solid var(--brand-blue)';
                heading.style.padding = '10px';  
            } else {
                // Entferne die Umrandung, falls vorhanden (zur Sicherheit)
                heading.style.border = 'none';
            }
        }
    });
}


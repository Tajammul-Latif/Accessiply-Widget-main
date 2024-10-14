function toUpperCase(str) {
    // Hilfsfunktion zum Konvertieren eines Strings in Großbuchstaben
    return str.toUpperCase();
}

export function applyUppercase(apply) {
    // Wähle alle Textknoten auf der Seite aus
    const walker = document.createTreeWalker(
        document.body,
        NodeFilter.SHOW_TEXT,
        {
            acceptNode: function(node) {
                // Akzeptiere nur Textknoten innerhalb von Elementen ohne data-accessi-none Attribut
                let parentElement = node.parentElement;
                while (parentElement) {
                    if (parentElement.hasAttribute('data-accessi-none')) {
                        return NodeFilter.FILTER_SKIP; // Überspringe diesen Textknoten
                    }
                    parentElement = parentElement.parentElement;
                }
                return NodeFilter.FILTER_ACCEPT;
            }
        },
        false
    );

    let node;
    while (node = walker.nextNode()) {
        let parentElement = node.parentElement;
        if (parentElement) {
            if (!parentElement.hasAttribute('data-original-text')) {
                // Speichern des Originaltexts im benutzerdefinierten Attribut des Elternelements
                parentElement.setAttribute('data-original-text', node.nodeValue);
            }

            if (apply) {
                // Wende Großbuchstaben an, wenn apply true ist
                node.nodeValue = toUpperCase(node.nodeValue);
            } else {
                // Setze den Text auf den Originaltext zurück, wenn apply false ist
                node.nodeValue = parentElement.getAttribute('data-original-text') || node.nodeValue;
            }
        }
    }
}
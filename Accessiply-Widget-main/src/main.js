import Widget from './Widget.svelte';

// Funktion, um das Widget zu initialisieren
function initWidget() {
    // Suche nach einem Container-Element im DOM
    let targetElement = document.getElementById('widget-container');

    // Wenn das Element nicht existiert, erstelle es
    if (!targetElement) {
        const container = document.createElement('div');
        container.id = 'widget-container';
        container.style.zIndex = 2147483647;
        document.body.appendChild(container);
        targetElement = container;
    }

    // Initialisiere das Widget
    new Widget({
        target: targetElement,
    });
}


// Initialisiere das Widget, sobald das DOM bereit ist
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initWidget);
} else {
    initWidget();
}
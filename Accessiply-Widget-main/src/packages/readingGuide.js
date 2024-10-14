export function loadReadingHelper(show) {
    // Überprüfe, ob das div-Element bereits existiert
    let readingHelper = document.querySelector('.accessi_reading-helper');

    if (show) {
        if (!readingHelper) {
            // Erstelle das div-Element für den Balken
            readingHelper = document.createElement('div');
            readingHelper.className = 'accessi_reading-helper';

            // Füge den CSS-Code zum Dokument hinzu
            const style = document.createElement('style');
            style.textContent = `
                .accessi_reading-helper {
                    position: fixed;
                    z-index: 100000000000;
                    width: 30vw;
                    height: 1.2rem;
                    max-width: 100vw;
                    min-width: 300px;
                    border-top-style: solid;
                    border-top-width: 6px;
                    border-top-color: hsla(0, 0.00%, 0.00%, 1.00);
                    border-right-style: solid;
                    border-right-width: 6px;
                    border-right-color: hsla(0, 0.00%, 0.00%, 1.00);
                    border-bottom-style: solid;
                    border-bottom-width: 6px;
                    border-bottom-color: hsla(0, 0.00%, 0.00%, 1.00);
                    border-left-style: solid;
                    border-left-width: 6px;
                    border-left-color: hsla(0, 0.00%, 0.00%, 1.00);
                    border-top-left-radius: 100rem;
                    border-top-right-radius: 100rem;
                    border-bottom-left-radius: 100rem;
                    border-bottom-right-radius: 100rem;
                    background-color: hsla(0, 100.00%, 50.00%, 1.00);
                    pointer-events: none;
                    margin-top: 15px;
                }
            `;
            document.head.appendChild(style);
            
            // Füge das div zum Dokument hinzu
            document.body.appendChild(readingHelper);

            console.log('readingHelper', readingHelper);

            // Setze eine Startposition für den Balken, damit er sichtbar ist
            readingHelper.style.left = '0px';
            readingHelper.style.top = '0px';

            // Bewegungslogik für den Balken
            document.addEventListener('mousemove', (e) => {
                const helperHeight = readingHelper.offsetHeight / 2;
                readingHelper.style.left = `${e.clientX - readingHelper.offsetWidth / 2}px`;
                readingHelper.style.top = `${e.clientY - helperHeight}px`;
            });
        }
    } else {
        if (readingHelper) {
            readingHelper.remove();
            const style = document.querySelector('style');
            if (style) {
                style.remove();
            }
        }
    }
}

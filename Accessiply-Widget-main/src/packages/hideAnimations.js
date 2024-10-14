// Map zum Speichern der ursprünglichen CSS-Eigenschaften
const originalStylesMap = new Map();

// Arrays zum Speichern von setInterval- und requestAnimationFrame-IDs
let intervalIDs = [];
let animationFrameIDs = [];

// Funktion zum Speichern der ursprünglichen CSS-Eigenschaften
function saveOriginalStyles(element) {
    const computedStyle = window.getComputedStyle(element);
    
    originalStylesMap.set(element, {
        animationPlayState: computedStyle.animationPlayState,
        transition: computedStyle.transition,
        transitionDuration: computedStyle.transitionDuration
    });
}

// Funktion zum Wiederherstellen der ursprünglichen CSS-Eigenschaften
function restoreOriginalStyles() {
    originalStylesMap.forEach((styles, element) => {
        element.style.animationPlayState = styles.animationPlayState || '';
        element.style.transition = styles.transition || '';
    });
}

// Funktion zum Stoppen aller CSS-Animationen und Übergänge
function stopCSSAnimations() {
    document.querySelectorAll('*').forEach(function(element) {
        const computedStyle = window.getComputedStyle(element);

        // Speichert die ursprünglichen Stile, wenn sie noch nicht gespeichert wurden
        if (!originalStylesMap.has(element)) {
            saveOriginalStyles(element);
        }

        // Stoppt CSS-Animationen
        if (computedStyle.animationName !== 'none') {
            element.style.animationPlayState = 'paused';
        }

        // Stoppt CSS-Übergänge
        if (computedStyle.transitionDuration !== '0s') {
            element.style.transition = 'none';
        }
    });
}

// Funktion zum Stoppen von JavaScript-basierten Animationen (Slider und ähnliche)
function stopJavaScriptAnimations() {
    // Pausiere, anstatt Intervalle zu löschen, speichere IDs
    intervalIDs.forEach(id => clearInterval(id));
    intervalIDs = [];

    animationFrameIDs.forEach(id => cancelAnimationFrame(id));
    animationFrameIDs = [];
}

// Funktion zum Wiederherstellen von JavaScript-basierten Animationen
function restoreJavaScriptAnimations() {
    // Hier kannst du deine JavaScript-Animationen manuell neu starten
    // Falls sie mit setInterval oder requestAnimationFrame erstellt wurden, musst du sie hier neu initiieren.
    intervalIDs.forEach(id => clearInterval(id)); // Keine Wiederherstellung möglich
    animationFrameIDs.forEach(id => cancelAnimationFrame(id)); // Keine Wiederherstellung möglich
}

// Funktion zum Pausieren aller Videos
function pauseAllVideos() {
    document.querySelectorAll('video').forEach(function(video) {
        video.pause(); // Pausiere alle laufenden Videos
    });
}

// Funktion zum Wiederherstellen aller Videos
function restoreAllVideos() {
    document.querySelectorAll('video').forEach(function(video) {
        if (video.paused) {
            video.play().catch(error => {
                console.log("Video konnte nicht abgespielt werden:", error);
            });
        }
    });
}

// Funktion zum Stoppen von GIFs (durch Ersetzen mit einem statischen Bild)
function stopGIFAnimations() {
    document.querySelectorAll('img').forEach(function(img) {
        if (img.src.endsWith('.gif')) {
            let staticSrc = img.src; // Hier könntest du einen Ersatz für das GIF-Bild bereitstellen
            img.src = staticSrc; // Das GIF durch das statische Bild ersetzen
        }
    });
}

// Alles zusammenführen in eine Funktion
export function applyHideAnimations(shouldStop) {
    if (shouldStop) {
        stopCSSAnimations();
        stopJavaScriptAnimations(); // Pausiere JS-Animationen
        pauseAllVideos();
        stopGIFAnimations();
    } else {
        restoreOriginalStyles(); // Stile wiederherstellen
        restoreJavaScriptAnimations(); // JavaScript-Animationen manuell wieder starten
        restoreAllVideos(); // Videos wieder abspielen
    }
}

// Optional: Überwachung von neuen DOM-Änderungen (MutationObserver), um dynamische Inhalte zu stoppen oder wiederherzustellen
var observer = new MutationObserver(function(mutationsList) {
    mutationsList.forEach(function(mutation) {
        mutation.addedNodes.forEach(function(node) {
            if (node.nodeType === 1) { // Überprüfen, ob es sich um ein Element handelt
                // Animationen anhalten oder Übergänge stoppen
                if (window.getComputedStyle(node).animationName !== 'none') {
                    if (!originalStylesMap.has(node)) {
                        saveOriginalStyles(node);
                    }
                    node.style.animationPlayState = 'paused';
                }
                if (window.getComputedStyle(node).transitionDuration !== '0s') {
                    node.style.transition = 'none';
                }
                // Videos pausieren
                if (node.tagName === 'VIDEO') {
                    node.pause();
                }
                // GIFs stoppen
                if (node.tagName === 'IMG' && node.src.endsWith('.gif')) {
                    let staticSrc = node.src;
                    node.src = staticSrc;
                }
            }
        });
    });
});

observer.observe(document.body, { childList: true, subtree: true });

// Beispiel zum Starten einer JavaScript-basierten Animation
function startJavaScriptAnimation() {
    let element = document.querySelector('.js-animation');
    let pos = 0;

    function move() {
        pos += 1;
        element.style.left = pos + 'px';
        if (pos < 100) {
            let id = requestAnimationFrame(move);
            animationFrameIDs.push(id); // Speichere requestAnimationFrame-ID
        }
    }

    let intervalId = setInterval(() => {
        pos += 1;
        element.style.left = pos + 'px';
    }, 100);

    intervalIDs.push(intervalId); // Speichere setInterval-ID
}
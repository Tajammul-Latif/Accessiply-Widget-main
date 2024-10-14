export function testScreenReader(isActive) {
    let tabCount = 0;  // Tracks section navigation (Navigation, Footer, Content)
    let customTabActive = true;  // Determines if we are in section navigation mode
    let previousElement = null;  // Keeps track of the last highlighted element
    let sectionElements = [];  // Stores elements within a section
    let elementIndex = -1;  // Tracks the current element inside a section
    let insideSection = false;  // Flag to track if we are reading elements inside a section

    // Add the style for the yellow highlight effect
    const style = document.createElement('style');
    style.textContent = `
        .screen-reader-highlight {
            outline: 2px solid yellow; /* Adds a yellow outline */
            background-color: rgba(255, 255, 0, 0.3); /* Light yellow background */
            transition: background-color 0.3s ease;
        }
    `;
    document.head.appendChild(style);

    document.addEventListener('keydown', function (event) {
        if (event.key === 'Tab') {
            event.preventDefault();

            // Handle Tab for section navigation when not inside a section
            if (!insideSection) {
                handleCustomTabNavigation();
            } else {
                // If inside a section, pressing Tab should move to the next section
                exitSectionAndMoveToNext();
            }
        }

        if (event.key === 'Enter') {
            if (!insideSection && customTabActive && previousElement) {
                // Enter into the section when Enter is pressed the first time
                insideSection = true;
                sectionElements = getSectionElements(previousElement);  // Get the elements inside the section
                elementIndex = -1;  // Reset the index for the elements inside the section
                speakText("Entered section, press Enter to read individual items.");
            } else if (insideSection) {
                // Focus on the next element inside the section on subsequent Enter presses
                focusNextInnerElement();
            }
        }
    });

    // Handles the custom Tab navigation between sections
    function handleCustomTabNavigation() {
        tabCount++;

        if (tabCount === 1) {
            speakText("Jump to navigation");
            highlightElement(document.getElementById('navbar'));
        } else if (tabCount === 2) {
            speakText("Jump to footer");
            highlightElement(document.getElementById('footer'));
        } else if (tabCount === 3) {
            speakText("Jump to content");
            highlightElement(document.getElementById('main-content'));
        } else if (tabCount === 4) {
            // Reset to the beginning of sections (wrap around)
            tabCount = 0;
            handleCustomTabNavigation();  // Recursively call to reset back to navigation
        }
    }

    // Exits the current section and moves to the next one by pressing Tab
    function exitSectionAndMoveToNext() {
        insideSection = false;  // Reset the flag to exit the section
        tabCount++;  // Increment tab count to move to the next section
        if (tabCount > 3) tabCount = 1;  // Wrap around if tab count exceeds sections
        handleCustomTabNavigation();  // Call the section navigation logic
    }

    // Focuses and reads the next element inside a section
    function focusNextInnerElement() {
        if (sectionElements.length === 0) {
            speakText("No items to read in this section.");
            return;
        }

        elementIndex++;

        if (elementIndex >= sectionElements.length) {
            speakText("End of section, press Tab to move to the next section.");
            insideSection = false;  // Reset the section navigation after reading all elements
            return;
        }

        const currentElement = sectionElements[elementIndex];
        currentElement.focus();
        highlightElement(currentElement);
        readElementContent(currentElement);
    }

    // Retrieves all interactive elements inside the currently focused section
    function getSectionElements(section) {
        // Retrieve interactive elements within the section
        return section.querySelectorAll('button, a, img, p, h1, h2, h3, h4, h5, h6, span, div');
    }

    // Highlights the currently focused element and removes the highlight from the previous element
    function highlightElement(element) {
        if (previousElement) {
            previousElement.classList.remove('screen-reader-highlight');
        }

        element.classList.add('screen-reader-highlight');
        previousElement = element;
    }

    // Reads out the content of the focused element using the speech synthesis API
    function readElementContent(element) {
        let content = '';

        if (element.tagName === 'IMG' && element.alt) {
            content = `Image: ${element.alt}`;
        } else {
            content = element.innerText || element.textContent;
        }

        speakText(content);
    }

    // Uses the browser's speech synthesis API to read text aloud
    function speakText(text) {
        if (window.speechSynthesis.speaking) {
            window.speechSynthesis.cancel();
        }

        const speech = new SpeechSynthesisUtterance(text);
        window.speechSynthesis.speak(speech);
    }
}

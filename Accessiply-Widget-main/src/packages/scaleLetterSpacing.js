import { hasAncestorWithAttribute } from "./checkAttributes.js";

let originalLetterSpacings = new Map();
export function adjustLetterSpacing(zoomFactor) {
  const elements = document.body.getElementsByTagName("*");
  
  // Normalisieren des zoomFaktors
  zoomFactor = zoomFactor.toString().toLowerCase().replace('x', '');
  zoomFactor = parseFloat(zoomFactor);

  if (originalLetterSpacings.size === 0) {
    for (let element of elements) {
      const computedStyle = getComputedStyle(element);
      const computedLetterSpacing = computedStyle.letterSpacing;
      
      let originalSpacing;
      if (computedLetterSpacing === "normal") {
        originalSpacing = "normal";
      } else {
        originalSpacing = computedLetterSpacing;
      }
      
      originalLetterSpacings.set(element, originalSpacing);
    }
  }

  for (let element of elements) {
    if (!hasAncestorWithAttribute(element, "data-accessi-none")) {
      const originalLetterSpacing = originalLetterSpacings.get(element);
      
      if (zoomFactor === 1) {
        // Zurücksetzen auf den Originalwert
        element.style.letterSpacing = originalLetterSpacing;
      } else {
        let newLetterSpacing;
        if (originalLetterSpacing === "normal") {
          // Verwenden Sie einen kleinen Standardwert für "normal" (z.B. 0.05em)
          newLetterSpacing = 1.5 * zoomFactor;
        } else {
          newLetterSpacing = parseFloat(originalLetterSpacing) * zoomFactor;
        }
        
        element.style.letterSpacing = `${newLetterSpacing}px`;
      }
    }
  }
}
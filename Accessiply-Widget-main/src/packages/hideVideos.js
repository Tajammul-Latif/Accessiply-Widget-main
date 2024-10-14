import { hasAncestorWithAttribute } from "./checkAttributes.js";

let originalVideoVisibility = new Map();

export function applyHideVideos(hide) {
  const videoFormats = ['.mp4', '.mov', '.webm', '.ogg'];
  const elements = document.querySelectorAll('[src], video');

  if (originalVideoVisibility.size === 0) {
    for (let i = 0; i < elements.length; i++) {
      const element = elements[i];
      const src = element.getAttribute('src');
      
      if (isVideoElement(element) || isVideoSource(src, videoFormats)) {
        originalVideoVisibility.set(element, {
          opacity: getComputedStyle(element).opacity,
          visibility: getComputedStyle(element).visibility
        });
      }
    }
  }

  originalVideoVisibility.forEach((style, element) => {
    if (hasAncestorWithAttribute(element, "data-accessi-none")) {
      return;
    }

    if (hide) {
      element.style.opacity = 0;
      element.style.visibility = 'hidden';
    } else {
      element.style.opacity = style.opacity;
      element.style.visibility = style.visibility;
    }
  });

  if (!hide) {
    originalVideoVisibility.clear();
  }
}

function isVideoSource(src, formats) {
  return src && formats.some(format => src.endsWith(format));
}

function isVideoElement(element) {
  return element.tagName.toLowerCase() === 'video';
}
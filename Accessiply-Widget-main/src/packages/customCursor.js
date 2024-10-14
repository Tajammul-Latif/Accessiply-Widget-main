let isActive = false;
let cursorSize = 40;
let cursorInnnerColor = "#FFFFFF";
let cursorOuterColor = "#000000";

function addCursor() {
  const style = document.createElement('style');
  style.textContent = `
    .accessi_mouse-overlay {
      position: fixed;
      left: 0;
      top: 0;
      width: 100vw;
      height: 100vh;
      pointer-events: none;
      z-index: 100000000000000;
    }
    .accessi_mouse-overlay svg {
      pointer-events: none;
    }
  `;
  document.head.appendChild(style);

  // Erstelle das SVG-Element für den Cursor
  const cursorDiv = document.createElement('div');
  cursorDiv.classList.add('accessi_mouse-overlay');
  cursorDiv.innerHTML = `
    <svg id="customCursorSVG" width="${cursorSize}" height="${cursorSize}" viewBox="0 0 192 192" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path id="inner-cursor-color-accessi" d="M181.66 169L169 181.66C167.5 183.159 165.466 184.001 163.345 184.001C161.224 184.001 159.19 183.159 157.69 181.66L106.38 130.35C105.459 129.426 104.325 128.742 103.079 128.357C101.833 127.972 100.511 127.897 99.229 128.14C97.9471 128.382 96.7441 128.935 95.7246 129.749C94.7051 130.563 93.9002 131.614 93.38 132.81L75.56 179.22C74.8977 180.678 73.813 181.904 72.4463 182.739C71.0796 183.573 69.4938 183.979 67.8942 183.902C66.2945 183.826 64.7546 183.271 63.4738 182.31C62.193 181.348 61.2302 180.025 60.71 178.51L8.41 18.44C7.982 17.05 7.94102 15.5697 8.29146 14.1581C8.6419 12.7466 9.37049 11.4573 10.3989 10.4289C11.4273 9.4005 12.7166 8.6719 14.1281 8.32146C15.5397 7.97102 17.02 8.01201 18.41 8.44L178.51 60.68C180.025 61.2002 181.348 62.163 182.31 63.4438C183.271 64.7246 183.826 66.2645 183.902 67.8642C183.979 69.4638 183.573 71.0496 182.739 72.4163C181.904 73.783 180.678 74.8677 179.22 75.53L132.81 93.35C131.614 93.8702 130.563 94.6751 129.749 95.6946C128.935 96.7141 128.382 97.9171 128.14 99.199C127.897 100.481 127.972 101.803 128.357 103.049C128.742 104.295 129.426 105.429 130.35 106.35L181.66 157.66C182.407 158.403 182.999 159.287 183.404 160.26C183.808 161.233 184.016 162.276 184.016 163.33C184.016 164.384 183.808 165.427 183.404 166.4C182.999 167.373 182.407 168.257 181.66 169Z" fill="${cursorInnnerColor}"/>
      <path d="M136 100.69L182.08 83L182.41 82.87C185.359 81.5622 187.844 79.3935 189.539 76.6483C191.234 73.9032 192.059 70.7098 191.906 67.4873C191.754 64.2648 190.631 61.1637 188.684 58.5908C186.738 56.0179 184.059 54.0935 181 53.07L20.92 0.8C18.1189 -0.116758 15.1185 -0.239455 12.2519 0.445523C9.38528 1.1305 6.76451 2.59636 4.68044 4.68044C2.59636 6.76451 1.1305 9.38528 0.445523 12.2519C-0.239455 15.1185 -0.116758 18.1189 0.8 20.92L53.07 181C54.0551 184.089 55.9657 186.801 58.5431 188.769C61.1205 190.736 64.2403 191.864 67.48 192H68.26C71.3674 192.011 74.4094 191.107 77.0072 189.402C79.605 187.697 81.6439 185.265 82.87 182.41L83 182.08L100.69 136L152 187.31C153.486 188.796 155.25 189.975 157.191 190.779C159.133 191.584 161.214 191.998 163.315 191.998C165.416 191.998 167.497 191.584 169.439 190.779C171.38 189.975 173.144 188.796 174.63 187.31L187.31 174.63C188.796 173.144 189.975 171.38 190.779 169.439C191.584 167.497 191.998 165.416 191.998 163.315C191.998 161.214 191.584 159.133 190.779 157.191C189.975 155.25 188.796 153.486 187.31 152L136 100.69ZM163.31 176L112 124.69C110.157 122.843 107.889 121.475 105.396 120.705C102.903 119.936 100.259 119.787 97.6951 120.273C95.1314 120.76 92.7254 121.865 90.6869 123.494C88.6485 125.124 87.0394 127.226 86 129.62C86 129.73 85.91 129.84 85.87 129.94L68.22 175.94L16 16L175.85 68.2L129.9 85.84L129.58 85.97C127.186 87.0094 125.084 88.6185 123.454 90.6569C121.825 92.6954 120.72 95.1014 120.233 97.6651C119.747 100.229 119.896 102.873 120.665 105.366C121.435 107.859 122.803 110.127 124.65 111.97L176 163.31L163.31 176Z" fill="${cursorOuterColor}"/>
    </svg>
  `;
  document.body.appendChild(cursorDiv);

  // Füge die Maus-Tracking-Funktionalität hinzu
  document.addEventListener('mousemove', (e) => {
    cursorDiv.style.left = e.clientX + 'px';
    cursorDiv.style.top = e.clientY + 'px';
  });

  document.addEventListener('mouseenter', () => {
    cursorDiv.style.display = 'block';
  });

  document.addEventListener('mouseleave', () => {
    cursorDiv.style.display = 'none';
  });
}

// Export-Funktion zum Anpassen der SVG-Größe
export function setCursorSize(scale) {
  const svgElement = document.getElementById('customCursorSVG');
  const baseSize = 40;
  cursorSize = baseSize * parseFloat(scale.replace('x', ''));
  console.log(cursorSize)
  svgElement.setAttribute('width', cursorSize);
  svgElement.setAttribute('height', cursorSize);
}

export function togShowCustomCursor(show) {
  if (show) {
    addCursor();
    isActive = !isActive;
  } else {
    removeCursor();
    isActive = !isActive;
  }
}

function removeCursor() {
  const cursorDiv = document.querySelector('.accessi_mouse-overlay');
  if (cursorDiv) {
    cursorDiv.remove();
  }
}

export function setCursorColor(color) {
  cursorInnnerColor = color;
  const svgElement = document.getElementById('customCursorSVG');
  const innerPath = svgElement.querySelector('#inner-cursor-color-accessi');
  cursorInnnerColor = color;
  if (innerPath) {
    innerPath.setAttribute('fill', cursorInnnerColor);
  }
}
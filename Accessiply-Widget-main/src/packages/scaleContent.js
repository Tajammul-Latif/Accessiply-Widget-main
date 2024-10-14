export function adjustContentSize(zoomLevel) {
    // Überprüfe den übergebenen Zoom-Wert
    switch (zoomLevel) {
      case "1x":
        // 100% Zoom
        document.body.style.zoom = "100%";
        break;
      case "1.5x":
        // 150% Zoom
        document.body.style.zoom = "150%";
        break;
      case "2x":
        // 200% Zoom
        document.body.style.zoom = "200%";
        break;
      case "2.5x":
        // 250% Zoom
        document.body.style.zoom = "250%";
        break;
      default:
        // Ungültiger Zoom-Wert, setze Zoom auf 100%
        document.body.style.zoom = "100%";
    }
  }
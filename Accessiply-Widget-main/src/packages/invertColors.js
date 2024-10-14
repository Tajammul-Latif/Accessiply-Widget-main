export function invertColors(shouldInvert) {
    const css = shouldInvert
      ? 'html {-webkit-filter: invert(100%); -moz-filter: invert(100%); -o-filter: invert(100%); -ms-filter: invert(100%); }'
      : 'html {-webkit-filter: invert(0%); -moz-filter: invert(0%); -o-filter: invert(0%); -ms-filter: invert(0%); }';
  
    const head = document.getElementsByTagName('head')[0];
    const style = document.createElement('style');
  
    style.type = 'text/css';
    if (style.styleSheet) {
      style.styleSheet.cssText = css;
    } else {
      style.appendChild(document.createTextNode(css));
    }
  
    // Entfernen des vorherigen Stils, falls vorhanden
    const existingStyle = document.getElementById('invert-colors-style');
    if (existingStyle) {
      existingStyle.remove();
    }
  
    // Hinzufügen einer ID zum neuen Stil-Element
    style.id = 'invert-colors-style';
    head.appendChild(style);
  }
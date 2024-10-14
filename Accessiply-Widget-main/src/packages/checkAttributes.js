export function hasAncestorWithAttribute(element, attribute) {
  // Überprüfen, ob das aktuelle Element das Attribut besitzt
  if (element.hasAttribute(attribute)) {
      return true;
  }

  // Durch die Elternkette des Elements iterieren
  while (element.parentElement) {
      element = element.parentElement;
      if (element.hasAttribute(attribute)) {
          return true;
      }
  }
  // Wenn weder das Element noch seine Vorfahren das Attribut besitzen, gib false zurück
  return false;
}

import { register, init } from 'svelte-i18n';

// Übersetzungen für jede Sprache dynamisch laden
register('de', () => import('./locales/de.json'));
register('en', () => import('./locales/en.json'));
register('fr', () => import('./locales/fr.json'));

// Funktion zur Bestimmung der Sprache aus der URL
export function setLocaleFromUrl(pathname) {
  const supportedLocales = ['de', 'en', 'fr'];
  const localeFromUrl = pathname.split('/')[1]; // Der erste Teil des Pfads gibt die Sprache an.

  // Überprüfe, ob die Sprache unterstützt wird, sonst Fallback auf Deutsch
  if (supportedLocales.includes(localeFromUrl)) {
    return localeFromUrl;
  } else {
    return 'de'; // Standardmäßig Deutsch
  }
}

// Funktion zur Initialisierung der i18n
export function initializeI18n(locale) {
  init({
    fallbackLocale: 'de',
    initialLocale: locale,
  });
}
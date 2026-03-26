/**
 * Supported locales for the platform.
 * Frontend apps should use these codes for i18n libraries.
 */
export const SUPPORTED_LOCALES = [
  { code: "en", name: "English", nativeName: "English", direction: "ltr" },
  { code: "hi", name: "Hindi", nativeName: "हिन्दी", direction: "ltr" },
  { code: "pa", name: "Punjabi", nativeName: "ਪੰਜਾਬੀ", direction: "ltr" },
];

export const DEFAULT_LOCALE = "en";

export function isValidLocale(code) {
  return SUPPORTED_LOCALES.some((l) => l.code === code);
}

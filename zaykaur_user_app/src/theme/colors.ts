export const colors = {
  // Premium blue palette
  primary: "#2874F0",
  primaryDark: "#1E57B5",
  primaryLight: "#E7F0FF",
  accent: "#F6A500",
  accentLight: "#FFF4D9",

  background: "#F4F8FF",
  backgroundSecondary: "#EEF3FB",
  surface: "#FFFFFF",
  surfaceMuted: "#F8FAFC",

  border: "#DCE6F6",
  borderLight: "#E9F0FA",
  divider: "#ECF1FA",

  text: "#101828",
  textSecondary: "#475467",
  textMuted: "#667085",
  textOnPrimary: "#FFFFFF",

  error: "#D92D20",
  success: "#12B76A",
  warning: "#F79009",

  white: "#FFFFFF",
  black: "#000000",
};

export const darkColors = {
  ...colors,
  background: "#0F172A",
  backgroundSecondary: "#1E293B",
  surface: "#111827",
  surfaceMuted: "#1F2937",
  border: "#334155",
  borderLight: "#334155",
  divider: "#334155",
  text: "#F9FAFB",
  textSecondary: "#CBD5E1",
  textMuted: "#94A3B8",
};

export const gradients = {
  hero: ["#2874F0", "#1E57B5"] as const,
  cta: ["#2874F0", "#3B82F6"] as const,
};

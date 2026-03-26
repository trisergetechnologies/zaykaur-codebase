export default {
  expo: {
    name: "Zaykaur",
    slug: "zaykaur",
    version: "1.0.0",
    orientation: "portrait",
    icon: "./assets/icon.png",
    userInterfaceStyle: "light",
    splash: {
      image: "./assets/splash-icon.png",
      resizeMode: "contain",
      backgroundColor: "#ffffff",
    },
    ios: { supportsTablet: true },
    android: {
      adaptiveIcon: {
        backgroundColor: "#E6F4FE",
        foregroundImage: "./assets/android-icon-foreground.png",
        backgroundImage: "./assets/android-icon-background.png",
        monochromeImage: "./assets/android-icon-monochrome.png",
      },
      predictiveBackGestureEnabled: false,
    },
    web: { favicon: "./assets/favicon.png" },
    extra: {
      // Leave empty by default so runtime can infer LAN host in Expo Go.
      EXPO_PUBLIC_API_URL: process.env.EXPO_PUBLIC_API_URL || "",
    },
  },
};

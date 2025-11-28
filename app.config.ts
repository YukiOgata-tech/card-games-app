// app.config.ts
import type { ExpoConfig, ConfigContext } from '@expo/config';

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: "CardGames",
  slug: "rn-card-games",
  version: "1.0.0",
  orientation: "portrait",
  icon: "./assets/icon.png",
  userInterfaceStyle: "automatic",
  splash: {
    image: "./assets/splash.png",
    resizeMode: "contain",
    backgroundColor: "#ffffff"
  },
  assetBundlePatterns: ["**/*"],
  ios: {
    bundleIdentifier: "com.yukiogata.cardgames",
    supportsTablet: false
  },
  android: {
    package: "com.yukiogata.cardgames",
    adaptiveIcon: {
      foregroundImage: "./assets/adaptive-icon.png",
      backgroundColor: "#FFFFFF"
    }
  },
  extra: {
    // 環境変数やカスタム値をここに入れる
    ENV: process.env.APP_ENV ?? "development"
  }
});

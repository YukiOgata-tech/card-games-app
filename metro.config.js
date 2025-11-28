const { getDefaultConfig } = require("expo/metro-config");

// NativeWind v4 未対応の Tailwind v4 が入っているため、一旦標準設定のみを使用。
const config = getDefaultConfig(__dirname);
module.exports = config;

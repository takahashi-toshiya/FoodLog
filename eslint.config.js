const expoConfig = require("eslint-config-expo/flat");
const { defineConfig } = require("eslint/config");

module.exports = defineConfig([
  expoConfig,
  {
    ignores: ["dist/**", "prototype/**"],
    rules: {
      // SDK 57で追加されたルール。既存の非同期データ取得を別の変更として整理するまで無効化する。
      "react-hooks/set-state-in-effect": "off",
    },
  },
]);

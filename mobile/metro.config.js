const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require("nativewind/metro");

const config = getDefaultConfig(__dirname);

// Bind custom obfuscation transformer for Release builds
config.transformer.babelTransformerPath = require.resolve("./obfuscator-transformer.js");

module.exports = withNativeWind(config, { input: "./global.css" });

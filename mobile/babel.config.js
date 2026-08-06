module.exports = function (api) {
    api.cache(false);
    const isTest = process.env.NODE_ENV === 'test' || process.env.JEST_WORKER_ID !== undefined;
    return {
        presets: isTest
          ? [["babel-preset-expo", { reanimated: false }]]
          : [
              ["babel-preset-expo", { jsxImportSource: "nativewind" }],
              "nativewind/babel",
            ],
        plugins: isTest ? [] : ["react-native-reanimated/plugin"],
    };
};

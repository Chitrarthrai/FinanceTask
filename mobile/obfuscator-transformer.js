const upstreamTransformer = require('@expo/metro-config/babel-transformer');

module.exports.transform = function ({ src, filename, options }) {
  const isNodeModule = filename.indexOf('node_modules') !== -1;
  const isRelease = options.dev === false; // Only obfuscate release APKs
  
  let result = upstreamTransformer.transform({ src, filename, options });

  if (!isNodeModule && isRelease) {
    try {
      const JavaScriptObfuscator = require('javascript-obfuscator');
      
      // Spawns javascript-obfuscator with custom rules to scramble identifiers into hex tokens
      const obfuscationResult = JavaScriptObfuscator.obfuscate(result.code, {
        compact: true,
        controlFlowFlattening: false, // Keep false for RN performance unless needed
        deadCodeInjection: false,
        debugProtection: false,
        disableConsoleOutput: true,
        identifierNamesGenerator: 'hexadecimal',
        log: false,
        numbersToExpressions: true,
        renameGlobals: false,
        selfDefending: false,
        simplify: true,
        splitStrings: true,
        stringArray: true,
        stringArrayCallsTransform: true,
        stringArrayCallsTransformThreshold: 0.5,
        stringArrayEncoding: ['base64'],
        stringArrayIndexShift: true,
        stringArrayRotate: true,
        stringArrayShuffle: true,
        stringArrayWrappersCount: 1,
        stringArrayWrappersChainedCalls: true,
        stringArrayWrappersParametersMaxCount: 2,
        stringArrayWrappersType: 'variable',
        stringArrayThreshold: 0.75,
        unicodeEscapeSequence: false
      });

      return {
        ...result,
        code: obfuscationResult.getObfuscatedCode()
      };
    } catch (err) { 
      console.warn('Obfuscation failed for', filename, err);
    }
  }

  return result;
};

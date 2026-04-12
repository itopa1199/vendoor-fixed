const JavaScriptObfuscator = require('webpack-obfuscator');

module.exports = function override(config, env) {
    config.plugins.push(
      new JavaScriptObfuscator(
        {
          compact: true,
          controlFlowFlattening: true,
          deadCodeInjection: true,
          stringArray: true,
          stringArrayEncoding: ['base64'],
          stringArrayThreshold: 0.75,
          rotateStringArray: true,
          selfDefending: true,
          disableConsoleOutput: true
        },
        ['excluded_bundle_name.js'] // Optional: exclude certain files
      )
    );
  
  return config;
};

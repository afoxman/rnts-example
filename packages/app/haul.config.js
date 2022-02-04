import { makeConfig, withPolyfills } from '@haul-bundler/preset-0.59';
import { HasteResolver } from '@haul-bundler/core';
import fs from 'fs';
import path from 'path';

function getSourceFileExtensions(platform) {
  const platformSpecific = [`.${platform}.tsx`, `.${platform}.ts`, `.${platform}.js`];
  const native = ['.native.tsx', '.native.ts', '.native.js'];
  const windows = ['.win.tsx', '.win.ts', '.win.js'];
  const mobile = ['.mobile.tsx', '.mobile.ts', '.mobile.js'];
  const shared = ['.tsx', '.ts', '.js'];

  return [...platformSpecific, ...(platform === 'win32' || platform === 'windows' ? windows : []), 
    ...(platform === 'ios' || platform === 'android' ? mobile : []), ...native, ...shared];
}

function applyHaulBabelPreset(config, env) {
  const babelLoaderRule = config.module.rules[1];
  if (!babelLoaderRule.use[0].loader.includes('babelWorkerLoader')) {
    throw new Error('Failed to find the haul babel-loader rule in the webpack configuration');
  }

  // Haul's RN 0.59 Babel preset attempts to transform both TS and JS.
  // This means TS files go through ts-loader first, then Babel with `metro-react-native-babel-preset`.
  // The babel preset, or plugin-transform-classes to be specific, breaks down `class`es in compiled TS into the form of `createClass(Class, [{ key: ..., value: ... }])`,
  // and increases bundle size by 10~15%. Since all our supported JS engines have class support, this line excludes TS files from a second round of transform.
  babelLoaderRule.test = /\.jsx?$/;

  // Haul's RN 0.59 Babel preset does not run the babelLoader on the newer @react-native packages, which need at least the flow strip babel transform,
  // So this adds the @react-native packages to the babelRule
  babelLoaderRule.exclude =
    /node_modules(?!.*[\/\\](react|@react-native|@react-navigation|@react-native-community|@expo|pretty-format|@haul-bundler|metro))/;

  const babelLoaderDef = babelLoaderRule.use[0];
  babelLoaderDef.options.presets = [
    [require.resolve('metro-react-native-babel-preset'), { disableImportExportTransform: false }],
  ];
  if (!env.dev) {
    babelLoaderDef.options.plugins.push([require.resolve('babel-plugin-transform-remove-console')]);
  }
}

function rnPackageNameForPlatform(platform) {
  if (platform === 'win32') {
    return '@office-iss/react-native-win32';
  } else if (platform === 'macos') {
    return 'react-native-macos';
  } else if (platform === 'windows') {
    return 'react-native-windows';
  } else {
    return 'react-native';
  }
}

function resolveModule(root, name) {
  const filePath = require.resolve(`${name}/package.json`, { paths: [root] });
  const realPath = fs.realpathSync(filePath);
  return path.dirname(realPath);
}

// function replaceHasteResolver(config, env) {
//   config.resolve.plugins[0] = new HasteResolver({
//     directories: [rnPackageNameForPlatform(env.platform)].map((_) => {
//       if (typeof _ === 'string') {
//         if (_ === 'react-native') {
//           return path.join(resolveModule(env.root, 'react-native'), 'Libraries');
//         }
//         return resolveModule(env.root, _);
//       }
//       return path.join(resolveModule(env.root, _.name), _.directory);
//     }),
//     hasteOptions: {
//       platforms: [env.platform, 'native'],
//     },
//   });
// }

export default makeConfig({
  bundles: {
    index: {
      entry: withPolyfills('./index.js'),
      transform: ({
        bundleName, // string
        config, // webpack.Configuration
        env, // EnvOptions
        runtime // Runtime
      }) => { // webpack.Configuration
        config.resolve.extensions = getSourceFileExtensions(env.platform);
        applyHaulBabelPreset(config, env);
        //replaceHasteResolver(config, env);

        // Add ts-loader as the first loader (webpack executes them in reverse order).
        config.module.rules.push({
          test: /\.tsx?$/,
          loader: 'ts-loader',
          options: {
            onlyCompileBundledFiles: true,
            transpileOnly: env.bundleTarget !== 'file',
            compilerOptions: {
              declaration: false,
              declarationMap: false
            },
          },
        });

        // With the removal of haste maps from the module resolution methods that RN uses, out of tree platforms now
        // contain all the JS from RN too.  So RN needs to be aliased to the specific platform.
        config.resolve.alias = { 
          ...config.resolve.alias,
          "react-native": resolveModule(process.cwd(), rnPackageNameForPlatform(env.platform))
        };

        return config;
      },
    },
  },
  platforms: ['android', 'ios', 'win32', 'windows', 'macos'],
  templates: {
    filename: {
      android: `[bundleName].[platform].jsbundle`,
      win32: `[bundleName].[platform].jsbundle`,
      windows: `[bundleName].[platform].jsbundle`,
      ios: `[bundleName].[platform].jsbundle`,
      macos: `[bundleName].[platform].jsbundle`,
    },
  },
});

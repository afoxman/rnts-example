# React-Native TypeScript Example

This repo shows examples of of areas where react-native would benefit from a deeper integration with TypeScript. The problems areas are described below and expressed in code.

The `Button` package is a react-native-only control, and it is specialized per-platform. The `App` package is a react-native application, which depends on `Button`.

The intent is to provide a playground for developing solutions to these problems.

The repo is currently "broken", meaning it can't run TypeScript builds or provide full IntelliSense. Once the problems are fixed, everything should work.

The repo can, however, be bundled into a react-native app. This is because the bundler has extra logic which TypeScript does not.

Interesting commands (from the repo root):

```
yarn run build
yarn run bundle
```

To see IntelliSense failures, open this repo in VS Code.

## React-Native Platform Extensions

Docs: https://reactnative.dev/docs/platform-specific-code#platform-specific-extensions

In react-native, when building or bundling TS code, or when running IntelliSense, TypeScript
should know how to resolve modules for the target platform (`ios`, `android`, `macos`, `win32`, and `windows`).

For example, when resolving module 'button' for platform `ios`, the TS resolver should look for
`button.ios.ts[x]?`, then `button.native.ts[x]`, and finally `button.ts[x]?`.

The intermediate name *native* is used as a fallback. If found, the implementation
inside will be suitable for any react-native platform. This is useful for projects
that are a mix of react-native and web code. Web code lives in files without a platform
extension: `button.ts[x]?`. Those projects would always have a corresponding "native" file.

You can see an example of this in the button [index.ts](./packages/button/src/index.ts) file.

### Defaults and Overrides

React-native apps are built using *native* as the only fallback:

| Platform | Fallback extensions (ordered) |
|---|---|
| ios | native |
| android | native |
| macos | native |
| win32 | native |
| windows | native |

App developers can change this, as needed. For example, the 1JS/Midgard repo adds a 'win' fallback and a 'mobile' fallback:

| Platform | Fallback extensions (ordered) |
|---|---|
| ios | **mobile**, native |
| android | **mobile**, native |
| macos | native |
| win32 | **win**, native |
| windows | **win**, native |

### Solutions

#### Per-Platform TSConfig

When running a build or parsing for IntelliSense, TypeScript's resolver should be able
to match a set of file-name patterns (the platform and its fallback(s)). This can be 
modeled in tsconfig:

```json
{
  "compilerOptions": {
    // empty string --> match without an extension, e.g. button.ts[x]?
    "moduleFileExtensions": ["ios", "mobile", "native", ""]
  }
}
```

NOTE: The empty string notation is explicit, giving developers control over the behavior. react-native apps will often co-exist alongside web apps, sharing non-UI logic and splitting out UI-specific code using the platform-extension mechanism. For these repos, react-native UI only lives in platform-extended files while web UI only lives in non-extended files.

Developers would have one tsconfig per platform, in an arbitrarily-named file:

* tsconfig.ios.json 
* android-tsconfig.json
* tsconfig-microsoft.json  // win32, windows

Many 3rd-party tools already support specifying a tsconfig file name, explicitly. This
approach would fit nicely into that existing model.

IntelliSense will need additional support to make this work. With multiple tsconfigs in play, IntelliSense will need to be told which one to use, or it will default to loading `tsconfig.json`. For react-native, I'm imagining this will be an IDE extension that exposes a platform selector in its extension config and/or in the UI.

#### Single TSConfig For All Platforms

Alternatively, the collection of *all* module file extension sets could be stored in a
single tsconfig file:

```json
{
  "compilerOptions": {
    "moduleFileExtensionProfiles": {
      "ios": ["ios", "mobile", "native", ""],
      "win32": ["win32", "win", "native", ""],
      ...
    }
  }
}
```

This is less desirable because the target set must be specified with each run of TypeScript. Each 3rd party package that uses TypeScript's API (e.g. webpack plugins, api extractor) would need to expose a way to choose the target set to make this feature usable.

And, like the *Per-Platform TSConfig* solution, IntelliSense will need to be told which target set to use.

## React-Native Module Substitution

React-native is implemented on many platforms which span several packages. `ios` and `android` implementations are in the `react-native` NPM package, which is owned and maintained by Meta (Facebook). `windows` is under `react-native-windows` and `macos` is under `react-native-macos`, both of which are owned and maintained by Microsoft. `win32` is an Office-specific platform under `@office-iss/react-native-win32`.

To avoid having "forked" references to react-native package names in code, developers require/import `react-native` and the bundler substitutes `react-native` with the platform-specific package name. So, `import 'react-native'` is interpreted as `import 'react-native-windows'` for a Windows bundle.

TypeScript should support a similar mechanism in which one module reference is substituted with another. This makes it possible to have type-safety during builds and in IntelliSense sessions:

```json
// Per-Platform TSConfig
{
  "compilerOptions": {
    "moduleNameMap": {
      "react-native": "react-native-windows"
    }
  }
}

// Single TSConfig For All Platforms
{
  "compilerOptions": {
    "moduleNameMapProfiles": {
      "windows": {
        "react-native": "react-native-windows"
      },
      "win32": {
        "react-native": "@office-iss/react-native-win32"
      },
      "macos": {
        "react-native": "react-native-macos"
      }
    }
  }
}
```

You can see an example of this in [button.win32.tsx](./packages/button/src/button.win32.tsx).

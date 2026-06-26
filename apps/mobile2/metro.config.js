const path = require("node:path");
const { getDefaultConfig } = require("expo/metro-config");

const projectRoot = __dirname;
const workspaceRoot = path.resolve(projectRoot, "../..");

const config = getDefaultConfig(projectRoot);

const aliasPackageNames = [
  "@expo/metro-runtime",
  "expo",
  "expo-router",
  "react",
  "react-native",
  "react-native-reanimated",
  "react-native-worklets",
];

const aliasPackageDirs = Object.fromEntries(
  aliasPackageNames.map((name) => [
    name,
    path.dirname(
      require.resolve(`${name}/package.json`, { paths: [projectRoot] }),
    ),
  ]),
);

function resolveAliasedPackage(moduleName) {
  for (const [packageName, packageDir] of Object.entries(aliasPackageDirs)) {
    if (moduleName === packageName) {
      return packageDir;
    }

    if (moduleName.startsWith(`${packageName}/`)) {
      return path.join(packageDir, moduleName.slice(packageName.length + 1));
    }
  }

  return null;
}

const defaultResolveRequest = config.resolver.resolveRequest;

// This repo temporarily contains SDK 56 and SDK 54 apps side-by-side. With pnpm,
// Metro can otherwise resolve SDK-sensitive packages from the workspace root and
// accidentally bundle the SDK 56 React Native into the SDK 54 app.
config.watchFolders = [workspaceRoot];
config.resolver = {
  ...config.resolver,
  resolveRequest(context, moduleName, platform) {
    const aliasedModule = resolveAliasedPackage(moduleName);

    if (aliasedModule) {
      return context.resolveRequest(context, aliasedModule, platform);
    }

    if (defaultResolveRequest) {
      return defaultResolveRequest(context, moduleName, platform);
    }

    return context.resolveRequest(context, moduleName, platform);
  },
};

module.exports = config;

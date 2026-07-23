const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const projectRoot = __dirname;
const workspaceRoot = path.resolve(projectRoot, '..');

const config = getDefaultConfig(projectRoot);

// Let Metro see the doomstack source tree living one level up, so the
// example app can import it directly without a build/publish step.
config.watchFolders = [workspaceRoot];

// Force a single copy of react/react-native (this app's), since src/ physically
// lives outside this directory and would otherwise resolve its own peer deps
// from the workspace root's node_modules, causing duplicate-React errors.
// Everything else still uses normal hierarchical lookup, which nested deps
// like expo/node_modules/expo-asset rely on.
config.resolver.extraNodeModules = {
  react: path.resolve(projectRoot, 'node_modules/react'),
  'react-native': path.resolve(projectRoot, 'node_modules/react-native'),
};

// Watching workspaceRoot also picks up doomstack's own top-level
// node_modules (a second, different-version react-native install), which
// Metro's Haste map can resolve for native module registration instead of
// this app's copy. Block it explicitly rather than relying on the alias
// above to win that race.
config.resolver.blockList = [
  new RegExp(`^${path.join(workspaceRoot, 'node_modules').replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}/.*`),
];

module.exports = config;

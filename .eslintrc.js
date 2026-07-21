module.exports = {
  root: true,
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 2021,
    sourceType: 'module',
    ecmaFeatures: { jsx: true },
    project: './tsconfig.json',
  },
  env: {
    es6: true,
    jest: true,
  },
  plugins: ['@typescript-eslint', 'react', 'react-hooks', 'react-native-a11y'],
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:react/recommended',
    'plugin:react-hooks/recommended',
    'plugin:react-native-a11y/ios',
  ],
  settings: {
    react: { version: 'detect' },
  },
  rules: {
    // Accessibility rules are enforced as errors, not warnings — a11y gaps fail the build.
    'react-native-a11y/has-accessibility-hint': 'off',
    'react-native-a11y/has-accessibility-props': 'error',
    'react-native-a11y/has-valid-accessibility-descriptors': 'error',
    'react-native-a11y/has-valid-accessibility-role': 'error',
    'react-native-a11y/has-valid-accessibility-state': 'error',
    'react-native-a11y/has-valid-accessibility-states': 'error',
    'react-native-a11y/has-valid-accessibility-value': 'error',
    'react-native-a11y/no-nested-touchables': 'error',
    '@typescript-eslint/no-explicit-any': 'error',
    '@typescript-eslint/explicit-module-boundary-types': 'off',
    'react/prop-types': 'off',
  },
  ignorePatterns: ['lib/', 'node_modules/', '*.config.js'],
};

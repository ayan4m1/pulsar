import globals from 'globals';
import eslint from '@eslint/js';
import { flatConfigs as importConfigs } from 'eslint-plugin-import-x';
import eslintPluginPrettier from 'eslint-plugin-prettier/recommended';

export default [
  eslint.configs.recommended,
  importConfigs.recommended,
  {
    languageOptions: {
      globals: globals.node
    },
    settings: { 'import-x/resolver': { node: { paths: ['./'] } } }
  },
  eslintPluginPrettier
];

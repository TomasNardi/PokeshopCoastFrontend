import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { FlatCompat } from '@eslint/eslintrc';

// eslint-config-next 15 todavía publica config "legacy": FlatCompat la pasa a flat config.
const compat = new FlatCompat({ baseDirectory: dirname(fileURLToPath(import.meta.url)) });

const eslintConfig = [
  { ignores: ['.next/**', 'node_modules/**', 'public/**', 'coverage/**'] },
  ...compat.extends('next/core-web-vitals'),
  {
    files: ['tests/**', '**/*.test.{js,jsx}'],
    rules: {
      // Los tests mockean next/image y next/link con <img>/<a> y componentes con funciones anónimas.
      '@next/next/no-img-element': 'off',
      '@next/next/no-html-link-for-pages': 'off',
      'react/display-name': 'off',
    },
  },
];

export default eslintConfig;

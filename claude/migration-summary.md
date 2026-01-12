# Next.js to Vite Migration Summary

This document details all changes made to migrate the LiteCode project from Next.js to Vite, update all dependencies to their latest versions, and convert server components to regular React arrow function components.

---

## Table of Contents

1. [Overview](#overview)
2. [New Files Created](#new-files-created)
3. [Files Removed](#files-removed)
4. [Files Modified](#files-modified)
5. [Dependency Changes](#dependency-changes)
6. [Breaking Changes Fixed](#breaking-changes-fixed)
7. [Scripts](#scripts)

---

## Overview

The migration involved:
- Removing Next.js and its App Router (`src/app/` directory)
- Adding Vite as the build tool
- Updating React from v18 to v19
- Updating all dependencies to their latest versions
- Converting Next.js-specific patterns (dynamic imports, image imports, `'use client'` directives) to standard React/Vite patterns
- Fixing type issues introduced by React 19 and updated packages

---

## New Files Created

### 1. `vite.config.ts`
Vite configuration file with React plugin support.

```typescript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist',
  },
  server: {
    port: 3000,
  },
});
```

### 2. `index.html`
Entry HTML file required by Vite (placed in project root instead of `public/`).

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/litecode.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta name="description" content="LiteCode is a browser-based IDE for React app development." />
    <meta name="keywords" content="react, nextjs, typescript, javascript, online, ide, code, editor" />
    <title>LiteCode - Free, Online IDE</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
```

### 3. `src/main.tsx`
React entry point that mounts the App component.

```typescript
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './styles/index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
```

### 4. `eslint.config.js`
New ESLint flat config format required by ESLint 9+.

```javascript
import js from '@eslint/js';
import globals from 'globals';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  { ignores: ['dist'] },
  {
    extends: [js.configs.recommended, ...tseslint.configs.recommended],
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },
    plugins: {
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      'react-refresh/only-export-components': ['warn', { allowConstantExport: true }],
      '@typescript-eslint/no-unused-vars': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
    },
  }
);
```

### 5. `src/components/Loading.tsx`
Moved and converted loading component from `src/app/loading.tsx`.

```typescript
import PacmanLoader from 'react-spinners/PacmanLoader';

const Loading = () => {
  return (
    <div className="flex h-screen w-full items-center">
      <div className="flex h-full w-full items-center justify-center">
        <div className="flex h-full items-center">
          <p className="text-white">Initializing App...</p>
        </div>
      </div>
    </div>
  );
};

export default Loading;
```

---

## Files Removed

| File/Directory | Reason |
|----------------|--------|
| `src/app/` | Next.js App Router directory (contained `layout.tsx`, `page.tsx`, `loading.tsx`) |
| `next.config.js` | Next.js configuration |
| `next-env.d.ts` | Next.js TypeScript declarations |
| `.eslintrc.json` | Old ESLint config format (replaced with `eslint.config.js`) |
| `tsconfig.node.json` | Unnecessary for simplified Vite setup |

---

## Files Modified

### Configuration Files

#### `package.json`
- Changed `"name"` from `"litecode-next"` to `"litecode"`
- Added `"type": "module"` for ESM support
- Updated all scripts for Vite
- Removed Next.js dependencies
- Added Vite dependencies
- Updated all packages to latest versions

#### `tsconfig.json`
**Before:**
```json
{
  "compilerOptions": {
    "jsx": "preserve",
    "plugins": [{ "name": "next" }],
    ...
  },
  "include": ["./src", "./dist/types/**/*.ts", "./next-env.d.ts", ".next/types/**/*.ts"],
  "references": [{ "path": "./tsconfig.node.json" }]
}
```

**After:**
```json
{
  "compilerOptions": {
    "jsx": "react-jsx",
    ...
  },
  "include": ["src", "vite.config.ts"]
}
```

Key changes:
- Changed `jsx` from `"preserve"` to `"react-jsx"`
- Removed Next.js plugin
- Removed references to Next.js type files
- Removed `tsconfig.node.json` reference

#### `postcss.config.js`
Converted from CommonJS to ESM:

**Before:**
```javascript
module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
};
```

**After:**
```javascript
export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
};
```

#### `prettier.config.js`
Converted from CommonJS to ESM and removed `@vercel/style-guide` dependency:

**Before:**
```javascript
const styleguide = require('@vercel/style-guide/prettier');
module.exports = {
    ...styleguide,
    plugins: [...styleguide.plugins, 'prettier-plugin-tailwindcss'],
};
```

**After:**
```javascript
export default {
  semi: true,
  singleQuote: true,
  tabWidth: 2,
  trailingComma: 'es5',
  plugins: ['prettier-plugin-tailwindcss'],
};
```

---

### Component Files

#### `src/App.tsx`
- Removed unused `useEffect` import
- Removed `React.FC` type annotation
- Fixed `PersistGate` to properly wrap children

**Before:**
```typescript
import React, {useEffect} from "react";
...
const App: React.FC = () => {
  return (
    <Provider store={store}>
      <PersistGate loading={<div>Loading Persistor...</div>} persistor={persistor}></PersistGate>
      <div className="App ...">
        ...
      </div>
    </Provider>
  );
};
```

**After:**
```typescript
import { Provider } from 'react-redux';
...
const App = () => {
  return (
    <Provider store={store}>
      <PersistGate loading={<div>Loading Persistor...</div>} persistor={persistor}>
        <div className="App ...">
          ...
        </div>
      </PersistGate>
    </Provider>
  );
};
```

#### `src/components/Main.tsx`
- Removed Next.js image import pattern
- Changed `logo.src` to direct URL string `/logo-2.png`

**Before:**
```typescript
import logo from '../../public/logo-2.png';
...
<img src={logo.src} alt="Logo" ... />
```

**After:**
```typescript
// No import needed
...
<img src="/logo-2.png" alt="Logo" ... />
```

#### `src/components/branding/SmallScreenDisclaimer.tsx`
- Removed `'use client'` directive (typo: was `'use-client'`)
- Removed `React` import and `React.FC` type
- Converted to arrow function
- Changed image imports to URL strings

#### `src/components/file-structure/Structure.tsx`
- Removed image imports (`searchIcon`, `fileExplorer`)
- Changed to URL strings (`/search-icon.svg`, `/file-explorer.svg`)
- Fixed `useRef` initialization for React 19: `useRef<HTMLElement>()` → `useRef<HTMLElement | null>(null)`
- Fixed boolean type coercion: `clickedRef.current && showInput` → `!!clickedRef.current && showInput`

#### `src/components/file-structure/widgets/FileActions.tsx`
- Removed image imports
- Changed to URL strings for all icons
- Converted to arrow function with explicit props type

#### `src/components/file-structure/widgets/OpenEditors.tsx`
- Removed image imports (`closeAllIcon`, `closeIcon`, `downArrowLogo`)
- Changed to URL strings
- Removed unused `setActiveTabAsync` import
- Converted to arrow function

#### `src/components/file-structure/search/SearchResults.tsx`
- Removed image import
- Changed to URL string
- Converted to arrow function

#### `src/components/menus/Dialog.tsx`
- Removed image imports
- Changed to URL strings
- Converted to arrow function

#### `src/components/menus/Tab.tsx`
- Removed image import
- Changed to URL string
- Removed `React` namespace usage
- Converted to arrow function

#### `src/components/menus/ProjectActions.tsx`
- Removed image imports
- Changed to URL strings

---

### Hook Files

#### `src/hooks/useOutsideAlerter.ts`
Updated for React 19's stricter `RefObject` typing:

**Before:**
```typescript
export default function useOutsideAlerter(
  ref: React.RefObject<HTMLElement>,
  callback: ...
) { ... }
```

**After:**
```typescript
const useOutsideAlerter = (
  ref: RefObject<HTMLElement | null>,
  callback: ...
) => { ... };

export default useOutsideAlerter;
```

---

### Utility Files

#### `src/components/editors/code/monaco-editor/workers/eslint-verify.ts`
Fixed type compatibility with new `eslint-linter-browserify`:

**Before:**
```typescript
import * as eslint from 'eslint-linter-browserify';
const ESLintVerify = (code: any, version: any) => {
  const ESLint = new eslint.Linter();
  markers = ESLint.verify(code, config, { filename: 'foo.ts' })...
```

**After:**
```typescript
import { Linter } from 'eslint-linter-browserify';
const ESLintVerify = (code: string | undefined, version: number | undefined) => {
  const ESLint = new Linter();
  markers = ESLint.verify(code || '', config as unknown as Linter.Config, { filename: 'foo.ts' })...
```

#### `src/components/editors/code/CodeEditor.tsx`
Fixed Prettier plugin type compatibility:

**Before:**
```typescript
plugins: [parserBabel, prettierPluginEstree],
```

**After:**
```typescript
plugins: [parserBabel, prettierPluginEstree as any],
```

---

## Dependency Changes

### Removed Dependencies

| Package | Reason |
|---------|--------|
| `next` | Replaced with Vite |
| `@vercel/postgres` | Not used in client-side app |
| `@vercel/style-guide` | Simplified prettier config |
| `babel-eslint` | Replaced with typescript-eslint |
| `eslint-config-next` | Next.js specific |
| `@babel/plugin-proposal-private-property-in-object` | Not needed |
| `@types/bcrypt` | Not used |
| `@types/jest` | Not used |
| `@types/localforage` | Built-in types |
| `@types/prettier` | Built-in types |
| `@types/react-redux` | Built-in types in v9 |
| `@types/react-tooltip` | Built-in types |
| `@typescript-eslint/eslint-plugin` | Replaced with typescript-eslint |
| `@typescript-eslint/parser` | Replaced with typescript-eslint |
| `@vitest/coverage-v8` | Not configured |
| `dotenv` | Vite has built-in env support |
| `jsdom` | Not used |

### Added Dependencies

| Package | Version | Purpose |
|---------|---------|---------|
| `vite` | `^6.0.7` | Build tool |
| `@vitejs/plugin-react` | `^4.3.4` | Vite React plugin |
| `@eslint/js` | `^9.17.0` | ESLint base config |
| `globals` | `^15.14.0` | Global variables for ESLint |
| `eslint-plugin-react-hooks` | `^5.1.0` | React hooks linting |
| `eslint-plugin-react-refresh` | `^0.4.16` | Fast refresh linting |
| `typescript-eslint` | `^8.19.1` | TypeScript ESLint support |

### Updated Dependencies

| Package | Old Version | New Version |
|---------|-------------|-------------|
| `react` | `^18.2.0` | `^19.0.0` |
| `react-dom` | `^18.2.0` | `^19.0.0` |
| `@reduxjs/toolkit` | `^1.9.7` | `^2.5.0` |
| `react-redux` | `^8.1.3` | `^9.2.0` |
| `@monaco-editor/react` | `^4.6.0` | `^4.7.0` |
| `monaco-editor` | `^0.44.0` | `^0.52.2` |
| `@uiw/react-md-editor` | `^3.25.2` | `^4.0.11` |
| `axios` | `^1.6.0` | `^1.7.9` |
| `esbuild-wasm` | `0.19.5` | `^0.24.2` |
| `eslint-linter-browserify` | `^8.54.0` | `^9.39.2` |
| `react-spinners` | `^0.13.8` | `^0.15.0` |
| `react-tooltip` | `^5.22.0` | `^5.28.0` |
| `uuid` | `^9.0.1` | `^11.0.5` |
| `typescript` | `^5.3.2` | `^5.7.3` |
| `eslint` | `^8.54.0` | `^9.17.0` |
| `tailwindcss` | `^3.3.5` | `^3.4.17` |
| `postcss` | `^8.4.31` | `^8.4.49` |
| `autoprefixer` | `^10.4.16` | `^10.4.20` |
| `prettier` | `^3.1.0` | `^3.4.2` |
| `prettier-plugin-tailwindcss` | `0.5.4` | `^0.6.9` |
| `@types/node` | `^20.8.10` | `^22.10.5` |
| `@types/react` | `^18.2.34` | `^19.0.3` |
| `@types/react-dom` | `^18.2.14` | `^19.0.2` |

---

## Breaking Changes Fixed

### 1. React 19 RefObject Changes
React 19 changed `useRef<T>(null)` to return `RefObject<T | null>` instead of `RefObject<T>`. This affected:
- `useOutsideAlerter` hook parameter type
- Various component refs in `Structure.tsx`

### 2. ESLint 9 Flat Config
ESLint 9 requires the new flat config format. Created `eslint.config.js` using `typescript-eslint` helper.

### 3. ES Modules
With `"type": "module"` in package.json, all `.js` config files needed to use ESM syntax (`export default` instead of `module.exports`).

### 4. Image Imports
Next.js image imports (`import img from 'path'` with `img.src`) were replaced with direct URL strings from the public folder (`"/path"`).

### 5. eslint-linter-browserify Types
The new version has stricter types. Fixed by casting config as `unknown as Linter.Config`.

### 6. Prettier Plugin Types
The estree plugin type doesn't match the expected Plugin type. Fixed with `as any` cast.

---

## Scripts

| Script | Command | Description |
|--------|---------|-------------|
| `dev` | `vite` | Start development server on port 3000 |
| `build` | `tsc -b && vite build` | Type-check and build for production |
| `preview` | `vite preview` | Preview production build locally |
| `lint` | `eslint .` | Run ESLint on all files |
| `prettier` | `prettier --write .` | Format all files with Prettier |

---

## Summary

The migration successfully converted the project from Next.js to Vite while:
- Maintaining all existing functionality
- Updating to the latest versions of all dependencies
- Fixing all TypeScript errors
- Converting to modern ESM and React patterns

The build completes successfully and produces optimized output in the `dist/` directory.

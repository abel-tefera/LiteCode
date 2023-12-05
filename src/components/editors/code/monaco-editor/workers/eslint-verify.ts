import config from '../config/eslint.json';
import * as eslint from 'eslint-linter-browserify';

const ESLintVerify = (code: any, version: any) => {
  const ESLint = new eslint.Linter();
  let markers;
  
  try {
    markers = ESLint.verify(code, config, { filename: 'foo.ts' }).map(
      (err: any) => {
        return {
          startLineNumber: err.line,
          endLineNumber: err.line,
          startColumn: err.column,
          endColumn: err.column,
          message: `${err.message}.`,
          severity: 3,
          source: 'eslint',
        };
      },
    );
  } catch (e) {
    /* Ignore error */
    console.error(e);
  }
  return { markers, version };
};
export default ESLintVerify;

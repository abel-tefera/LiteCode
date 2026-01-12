import config from '../config/eslint.json';
import { Linter } from 'eslint-linter-browserify';

const ESLintVerify = (code: string | undefined, version: number | undefined) => {
  const ESLint = new Linter();
  let markers;

  try {
    markers = ESLint.verify(code || '', config as unknown as Linter.Config, {
      filename: 'foo.ts',
    }).map((err) => {
      return {
        startLineNumber: err.line,
        endLineNumber: err.line,
        startColumn: err.column,
        endColumn: err.column,
        message: `${err.message}.`,
        severity: 3,
        source: 'eslint',
      };
    });
  } catch (e) {
    console.error(e);
  }
  return { markers, version };
};

export default ESLintVerify;

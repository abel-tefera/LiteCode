/* eslint-disable no-restricted-globals */

import config from "../config/eslint.json";
import * as eslint from "eslint-linter-browserify";

const ESLintWorker = () => {
  // self.addEventListener("message", (event) => {
  //   console.log("ESLINT WORKER EVENT LISTENER");

  //   const { code, version } = event.data;
  //   const ESLint = new eslint.Linter();
  //   try {
  //     // @ts-ignore
  //     const markers = ESLint.verify(code, config).map((err) => ({
  //       startLineNumber: err.line,
  //       endLineNumber: err.line,
  //       startColumn: err.column,
  //       endColumn: err.column,
  //       message: `${err.message} (${err.ruleId})`,
  //       severity: 3,
  //       source: "ESLint",
  //     }));

  //     self.postMessage({ markers, version });
  //   } catch (e) {
  //     /* Ignore error */
  //   }
  // });
};
export default ESLintWorker;

import React, { useRef, useCallback, useEffect } from 'react';
import MonacoEditor, {
  type OnChange as MonacoOnChange,
} from '@monaco-editor/react';
import { type editor } from 'monaco-editor';
import type * as monaco from 'monaco-editor/esm/vs/editor/editor.api';
import { useTypedSelector } from '../../../state/hooks';
import { getCurrentEditor } from '../../../state/features/editor/editorSlice';
import Breadcrumbs from '../navigation/Breadcrumbs';
import type * as Monaco from 'monaco-editor'; // only for typescript types

import * as prettier from 'prettier/standalone';
import parserBabel from 'prettier/plugins/babel';
import * as prettierPluginEstree from 'prettier/plugins/estree';
// import DarkTheme from "./monaco-editor/themes/dark";
// import ESLintVerify from "./monaco-editor/workers/eslint.worker";
import Loading from './Loading';
import ESLintVerify from './monaco-editor/workers/eslint-verify';
import { pkgInfoService } from './pkgInfo';
import {
  MonacoJsxSyntaxHighlight,
  getWorker,
} from 'monaco-jsx-syntax-highlight';
import '../../../styles/editor.css';

// const controller = new MonacoJsxSyntaxHighlight(getWorker(), monaco)

interface PkgInfo {
  name: string;
  description?: string;
  version?: string;
  repository?: {
    url?: string;
  };
  repo?: string;
  homepage?: string;
}

interface APIError {
  error: boolean;
  status?: number;
  message?: string;
}

const importsPattern =
  /(import\s+?(?:(?:(?:[\w*\s{},\$]*)\s+from\s+?)|))((?:".*?")|(?:'.*?'))([\s]*?(?:;|$|))/g;

const dynamicImportsPattern = /(import\s*?\(\s*?((?:".*?")|(?:'.*?'))\s*?\))/g;

export const removeComments = /* @__PURE__ */ (src: string) =>
  src.replace(/\/\*[\s\S]*?\*\/|([^\\:]|^)\/\/.*$/gm, '$1');

export const isBare = /* @__PURE__ */ (mod: string) =>
  !mod.startsWith('https://') &&
  !mod.startsWith('http://') &&
  !mod.startsWith('.') &&
  !mod.startsWith('/') &&
  !mod.startsWith('data:') &&
  !mod.startsWith('blob:');
// const ESLint = new eslint.Linter();

// const options = {
//   autoIndent: 'full',
//   contextmenu: true,
//   fontFamily: 'monospace',
//   fontSize: 13,
//   lineHeight: 24,
//   hideCursorInOverviewRuler: true,
//   matchBrackets: 'always',
//   minimap: {
//     enabled: true,
//   },
//   scrollbar: {
//     horizontalSliderSize: 4,
//     verticalSliderSize: 18,
//   },
//   selectOnLineNumbers: true,
//   roundedSelection: false,
//   readOnly: false,
//   cursorStyle: 'line',
//   automaticLayout: true,
// };

type Monaco = typeof monaco;

interface CodeEditorProps {
  onChange: (value: string, id: string) => void;
}

const CodeEditor: React.FC<CodeEditorProps> = ({ onChange }) => {
  const editorRef = useRef<editor.IStandaloneCodeEditor | null>(null);
  const monacoRef = useRef<Monaco | null>(null);
  const editorData = useTypedSelector(getCurrentEditor);
  // const linterWorkerRef = useRef<any>(null);
  // const ESLintWorker: Worker = useMemo(
  //   () =>
  //     new Worker(
  //       new URL("./monaco-editor/workers/eslint.worker.ts", import.meta.url)
  //     ),
  //   []
  // );

  const updateMarkers = ({ markers, version }: any) => {
    requestAnimationFrame(() => {
      if (!editorRef.current || !monacoRef.current) return;
      const model = editorRef.current.getModel();

      if (model && model.getVersionId() === version) {
        monacoRef.current.editor.setModelMarkers(model, 'eslint', markers);
      }
    });
  };

  const lintCode = () => {
    const model = editorRef.current?.getModel();

    monacoRef.current?.editor.setModelMarkers(
      model as editor.ITextModel,
      'eslint',
      [],
    );
    const { markers, version } = ESLintVerify(
      model?.getValue(),
      model?.getVersionId(),
    );
    updateMarkers({ markers, version });
  };

  const handleEditorDidMount = useCallback(
    async (editor: editor.IStandaloneCodeEditor, monacoEditor: Monaco) => {
      editorRef.current = editor;
      monacoRef.current = monacoEditor;
      // linterWorkerRef.current = ESLintWorker;
      // linterWorkerRef.current.addEventListener("message", ({ data }: any) =>
      //   updateMarkers(data)
      // );
      // monacoEditor.editor.defineTheme("ayu-dark", DarkTheme);
      // monacoEditor.editor.setTheme("ayu-dark");
      // monacoEditor.editor.setModelMarkers(
      //   editor.getModel() as editor.ITextModel,
      //   "eslint",
      //   []
      // );
      monacoEditor.languages.registerDocumentFormattingEditProvider(
        'javascript',
        {
          async provideDocumentFormattingEdits(model, options, token) {
            const text = await prettier.format(model.getValue(), {
              parser: 'babel',
              plugins: [parserBabel, prettierPluginEstree],
              useTabs: false,
              semi: true,
              singleQuote: true,
            });

            return [
              {
                range: model.getFullModelRange(),
                text,
              },
            ];
          },
        },
      );
      registerShowPackageInfo();
      // monacoEditor.languages.typescript.typescriptDefaults.setCompilerOptions({
      //   jsx: monacoEditor.languages.typescript.JsxEmit.Preserve,
      //   target: monacoEditor.languages.typescript.ScriptTarget.ES2020,
      //   esModuleInterop: true,
      // });

      monacoEditor.languages.typescript.typescriptDefaults.setCompilerOptions({
        jsx: monacoEditor.languages.typescript.JsxEmit.Preserve,
        target: monacoEditor.languages.typescript.ScriptTarget.ES2020,
        esModuleInterop: true,
      });

      const monacoJsxSyntaxHighlight = new MonacoJsxSyntaxHighlight(
        getWorker(),
        monacoEditor,
      );

      // editor is the result of monaco.editor.create
      const { highlighter, dispose } =
        monacoJsxSyntaxHighlight.highlighterBuilder({
          editor: editor,
        });
      // init highlight
      highlighter();

      editor.onDidChangeModelContent(() => {
        // content change, highlight
        console.log('CONTENT CHANGE');
        highlighter();
      });

      editor.onDidChangeModelOptions(() => {
        // model change, highlight
        console.log('MODEL CHANGE');
        highlighter();
      });

      return dispose;
    },
    [],
  );

  // const configureEmmet = (enabled: boolean) => {
  //   if (!enabled && !(window as any).emmetMonaco) return;

  //   loadScript(emmetMonacoUrl, 'emmetMonaco').then((emmetMonaco: any) => {
  //     if (enabled) {
  //       if (!disposeEmmet.html || disposeEmmet.disabled) {
  //         disposeEmmet.html = emmetMonaco.emmetHTML(monaco, [
  //           'html',
  //           'php',
  //           'astro',
  //           'markdown',
  //           'mdx',
  //         ]);
  //         disposeEmmet.css = emmetMonaco.emmetCSS(monaco, ['css', 'scss', 'less']);
  //         disposeEmmet.jsx = emmetMonaco.emmetJSX(monaco, [
  //           'javascript',
  //           'typescript',
  //           'jsx',
  //           'tsx',
  //         ]);
  //         disposeEmmet.disabled = false;
  //       }
  //     } else {
  //       disposeEmmet.html?.();
  //       disposeEmmet.css?.();
  //       disposeEmmet.jsx?.();
  //       disposeEmmet.disabled = true;
  //     }
  //   });
  // };

  const onChangeLocal: MonacoOnChange = (
    value: string | undefined,
    e: editor.IModelContentChangedEvent,
  ) => {
    if (value !== null && value !== undefined) {
      onChange(editorData.id, value);
      lintCode();
    }
  };

  const getImports = (code: string, removeSpecifier = false) =>
    [
      ...[...removeComments(code).matchAll(new RegExp(importsPattern))],
      ...[...removeComments(code).matchAll(new RegExp(dynamicImportsPattern))],
    ]
      .map((arr) => arr[2].replace(/"/g, '').replace(/'/g, ''))
      .map((mod) => {
        if (!removeSpecifier || !isBare(mod) || !mod.includes(':')) {
          return mod;
        }
        return mod.split(':')[1];
      });

  const registerShowPackageInfo = () => {
    // from https://github.com/snowpackjs/astro-repl/blob/main/src/editor/modules/monaco.ts
    if (!monacoRef.current) return;
    const pkgCache = new Map<string, PkgInfo>();

    const npmPackageHoverProvider: Monaco.languages.HoverProvider = {
      provideHover(model, position) {
        const content = model.getLineContent(position.lineNumber);
        let pkg = getImports(content, /* removeSpecifier= */ true)[0];
        if (!pkg) return;
        if (
          pkg.startsWith('https://') ||
          pkg.startsWith('http://') ||
          pkg.startsWith('.') ||
          pkg.startsWith('data:') ||
          pkg.startsWith('blob:')
        ) {
          return;
        }
        // remove version
        // pkg = pkg.replace(/(^@?([^@])+)(.*)/g, `$1`);

        // remove sub-directories
        const parts = pkg.split('/');
        const end = parts[0].startsWith('@') ? 2 : 1;
        pkg = parts.slice(0, end).join('/');

        return (async () => {
          let pkgInfo: PkgInfo | APIError | undefined;

          if (!pkgCache.has(pkg)) {
            pkgInfo = await pkgInfoService.getPkgInfo(pkg);
            if ('error' in pkgInfo) return;
            pkgCache.set(pkg, pkgInfo);
          } else {
            pkgInfo = pkgCache.get(pkg);
          }
          if (!pkgInfo || 'error' in pkgInfo) return;

          const { name, description = '', repo = '' } = pkgInfo;

          return {
            contents: [
              {
                value: `## [${name}](https://www.npmjs.com/package/${name})\n${description}\n\n\n${
                  repo ? `[GitHub](${repo}) |` : ''
                } [Skypack](https://skypack.dev/view/${name}) | [jsDelivr](https://www.jsdelivr.com/package/npm/${name}) | [Unpkg](https://unpkg.com/browse/${name}/) | [Snyk](https://snyk.io/advisor/npm-package/${name}) | [Bundlephobia](https://bundlephobia.com/package/${name})\n\nDocs: [Importing modules](${
                  new URL(process.env.DOCS_BASE_URL as string, location.href)
                    .href
                }features/module-resolution)`,
              },
            ],
          };
        })();
      },
    };
    monacoRef.current?.languages.registerHoverProvider(
      'javascript',
      npmPackageHoverProvider,
    );
    // monacoRef.current?.languages.registerHoverProvider(
    //   'typescript',
    //   npmPackageHoverProvider,
    // );
  };

  // const formatCode = async () => {
  //   if (!editorRef.current) return;
  //   const unformatted = editorRef.current.getValue();
  //   const formatted = await prettier.format(unformatted, {
  //     parser: "babel",
  //     plugins: [parserBabel, prettierPluginEstree],
  //     useTabs: false,
  //     semi: true,
  //     singleQuote: true,
  //   });
  //   formatted.replace(/\n$/, "");
  //   editorRef.current.setValue(formatted);
  // };

  return (
    <div className="editor-wrapper pl-3 pr-[0.87rem]">
      {/* <button
        onClick={formatCode}
        className="button button-format is-primary is-small"
      >
        Format
      </button> */}
      <div className="flex h-full flex-col items-center justify-start rounded-lg bg-monaco-vs overflow-x-clip">
        <Breadcrumbs
          editorObj={{
            id: editorData.id,
            path: editorData.path,
            unmappedPath: editorData.unmappedPath,
          }}
        />

        <MonacoEditor
          className="editor"
          path={`${editorData.id}.${editorData.ext}`}
          value={editorData.content}
          language={editorData.language}
          line={editorData.line}
          theme={'vs-dark'}
          height={'100%'}
          width={'100%'}
          loading={<Loading isForEditor={true} />}
          options={{
            // wordWrap: "on",
            minimap: { enabled: true },
            showUnused: true,
            // folding: true,
            lineNumbersMinChars: 3,
            fontSize: 16,
            scrollBeyondLastLine: true,
            automaticLayout: true,
            tabSize: 2,
            autoClosingBrackets: 'always',
            autoIndent: 'full',
            contextmenu: true,
            fixedOverflowWidgets: true,
            fontFamily: 'monospace',
            // lineHeight: 24,
            hideCursorInOverviewRuler: true,
            matchBrackets: 'always',
            // scrollbar: {
            //   horizontalSliderSize: 4,
            //   verticalSliderSize: 18,
            // },
            selectOnLineNumbers: true,
            roundedSelection: false,
            readOnly: false,
            cursorStyle: 'line',
          }}
          
          onChange={onChangeLocal}
          onMount={handleEditorDidMount}
          beforeMount={(monaco) => {
            monaco.languages.typescript.javascriptDefaults.setDiagnosticsOptions(
              {
                noSemanticValidation: true,
                noSyntaxValidation: true,
              },
            );
            monaco.languages.typescript.typescriptDefaults.setEagerModelSync(
              true,
            );
            monaco.languages.typescript.javascriptDefaults.setEagerModelSync(
              true,
            );
            const compilerOptions = {
              allowJs: true,
              allowSyntheticDefaultImports: true,
              allowNonTsExtensions: true,
              alwaysStrict: true,
              jsx: 2,
              target: monaco.languages.typescript.ScriptTarget.Latest,
              jsxFactory: 'React.createElement',
            };
            monaco.languages.typescript.typescriptDefaults.setCompilerOptions(
              compilerOptions,
            );
            monaco.languages.typescript.javascriptDefaults.setCompilerOptions(
              compilerOptions,
            );
          }}
          onValidate={(markers) => {
            // console.log("ON VALIDATE MARKERS", markers);
            // ESLintVerify(markers);
            // console.log("ONVALIDATE", markers);
          }}
        />
      </div>
    </div>
  );
};

export default CodeEditor;

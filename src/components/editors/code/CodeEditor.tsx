import React, { useRef, useCallback, useEffect, useMemo } from "react";
import MonacoEditor, { OnChange } from "@monaco-editor/react";
import { editor } from "monaco-editor";
import * as monaco from "monaco-editor/esm/vs/editor/editor.api";
import { useTypedSelector } from "../../../state/hooks";
import { getCurrentEditor } from "../../../state/features/editor/editorSlice";
import Breadcrumbs from "../navigation/Breadcrumbs";
import { OnChange as MonacoOnChange } from "@monaco-editor/react";

import * as prettier from "prettier/standalone";
import parserBabel from "prettier/plugins/babel";
import * as prettierPluginEstree from "prettier/plugins/estree";
import DarkTheme from "./monaco-editor/themes/dark";
// @ts-ignore
// import ESLintWorker from "./monaco-editor/workers/eslint.worker";

const options = {
  autoIndent: "full",
  contextmenu: true,
  fontFamily: "monospace",
  fontSize: 13,
  lineHeight: 24,
  hideCursorInOverviewRuler: true,
  matchBrackets: "always",
  minimap: {
    enabled: true,
  },
  scrollbar: {
    horizontalSliderSize: 4,
    verticalSliderSize: 18,
  },
  selectOnLineNumbers: true,
  roundedSelection: false,
  readOnly: false,
  cursorStyle: "line",
  automaticLayout: true,
};

type Monaco = typeof monaco;

interface CodeEditorProps {
  onChange: (value: string, id: string) => void;
}

const CodeEditor: React.FC<CodeEditorProps> = ({ onChange }) => {
  const editorRef = useRef<editor.IStandaloneCodeEditor | null>(null);
  const monacoRef = useRef<Monaco | null>(null);
  const editorData = useTypedSelector(getCurrentEditor);
  const linterWorkerRef = useRef<any>(null);
  // const ESLintWorker: Worker = useMemo(
  //   () =>
  //     new Worker(
  //       new URL("./monaco-editor/workers/eslint.worker.ts", import.meta.url)
  //     ),
  //   []
  // );

  const lintCode = (value: string) => {
    const model = editorRef.current?.getModel();
    
    monacoRef.current?.editor.setModelMarkers(model as editor.ITextModel, 'eslint', []);
    linterWorkerRef.current.postMessage({
      code: value,
      language: "javascript",
    });
  };

  useEffect(() => {
    return () => {
      linterWorkerRef.current && linterWorkerRef.current.terminate();
    };
  }, []);

  const updateMarkers = ({ markers, version }: any) => {
    requestAnimationFrame(() => {
      const model = editorRef.current?.getModel();

      if (model && model.getVersionId() === version) {
        monaco.editor.setModelMarkers(model, "eslint", markers);
      }
    });
  };
  // console.log("ABCD", eslintWorker);

  const handleEditorDidMount = useCallback(
    async (editor: editor.IStandaloneCodeEditor, monacoEditor: Monaco) => {
      editorRef.current = editor;
      monacoRef.current = monacoEditor;
      // @ts-ignore
      // linterWorkerRef.current = ESLintWorker;
      // linterWorkerRef.current.addEventListener("message", ({ data }: any) =>
      //   updateMarkers(data)
      // );
      monacoEditor.editor.defineTheme("ayu-dark", DarkTheme);
      monacoEditor.editor.setTheme("ayu-dark");
      monacoEditor.editor.setModelMarkers(
        editor.getModel() as editor.ITextModel,
        "eslint",
        []
      );
      monacoEditor.languages.registerDocumentFormattingEditProvider(
        "javascript",
        {
          async provideDocumentFormattingEdits(model, options, token) {
            const text = await prettier.format(model.getValue(), {
              parser: "babel",
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
        }
      );
    },
    []
  );

  const onChangeLocal: MonacoOnChange = (
    value: string | undefined,
    e: editor.IModelContentChangedEvent
  ) => {
    if (value) {
      onChange(editorData.id, value);
      // lintCode(value)
    }
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
    <div className="editor-wrapper pl-2 pr-0">
      {/* <button
        onClick={formatCode}
        className="button button-format is-primary is-small"
      >
        Format
      </button> */}
      <Breadcrumbs
        editorObj={{
          id: editorData.id,
          path: editorData.path,
          unmappedPath: editorData.unmappedPath,
        }}
      />

      <MonacoEditor
        path={editorData.id}
        value={editorData.content}
        line={editorData.line}
        // theme={"vs-dark"}
        language={editorData.language}
        height={"100%"}
        width={"100%"}
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
        }}
        onChange={onChangeLocal}
        onMount={handleEditorDidMount}
        beforeMount={(monaco) => {
          monaco.languages.typescript.javascriptDefaults.setDiagnosticsOptions({
            noSemanticValidation: true,
            noSyntaxValidation: true,
          });
          monaco.languages.typescript.typescriptDefaults.setEagerModelSync(
            true
          );
          monaco.languages.typescript.javascriptDefaults.setEagerModelSync(
            true
          );
          const compilerOptions = {
            allowJs: true,
            allowSyntheticDefaultImports: true,
            alwaysStrict: true,
            target: monaco.languages.typescript.ScriptTarget.ES2016,
            allowNonTsExtensions: true,
            jsx: 5,
            jsxFactory: "React.createElement",
          };
          monaco.languages.typescript.typescriptDefaults.setCompilerOptions(
            compilerOptions
          );
          monaco.languages.typescript.javascriptDefaults.setCompilerOptions(
            compilerOptions
          );
          // monaco.languages.typescript.typescriptDefaults.setCompilerOptions({
            // target: monaco.languages.typescript.ScriptTarget.ES2016,
            // allowNonTsExtensions: true,
          //   jsx: 4,
          // });
          // monaco.languages.typescript.javascriptDefaults.setCompilerOptions({
          //   target: monaco.languages.typescript.ScriptTarget.ES2016,
          //   allowNonTsExtensions: true,
          //   jsx: 4,
          // });

          // monaco.languages.typescript.typescriptDefaults.setDiagnosticsOptions({
          //   noSemanticValidation: false,
          //   noSyntaxValidation: false,
          // });
          // monaco.languages.typescript.javascriptDefaults.setDiagnosticsOptions({
          //   noSemanticValidation: false,
          //   noSyntaxValidation: false,
          // });
          // monaco.languages.typescript.typescriptDefaults.setEagerModelSync(
          //   true
          // );
          // monaco.languages.typescript.javascriptDefaults.setEagerModelSync(
          //   true
          // );
        }}
        onValidate={(markers) => {
          // console.log("ONVALIDATE", markers);
        }}
      />
    </div>
  );
};

export default CodeEditor;

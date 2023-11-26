import React, { useRef, useCallback, useEffect, useMemo } from "react";
import MonacoEditor, {
  OnChange,
  type OnChange as MonacoOnChange,
} from "@monaco-editor/react";
import { type editor } from "monaco-editor";
import type * as monaco from "monaco-editor/esm/vs/editor/editor.api";
import { useTypedSelector } from "../../../state/hooks";
import { getCurrentEditor } from "../../../state/features/editor/editorSlice";
import Breadcrumbs from "../navigation/Breadcrumbs";

import * as prettier from "prettier/standalone";
import parserBabel from "prettier/plugins/babel";
import * as prettierPluginEstree from "prettier/plugins/estree";
import DarkTheme from "./monaco-editor/themes/dark";
import ESLintVerify from "./monaco-editor/workers/eslint.worker";
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

    monacoRef.current?.editor.setModelMarkers(
      model as editor.ITextModel,
      "eslint",
      [],
    );
    linterWorkerRef.current.postMessage({
      code: value,
      language: "javascript",
    });
  };

  useEffect(() => {
    return () => {
      linterWorkerRef.current?.terminate();
    };
  }, []);

  // const updateMarkers = ({ markers, version }: any) => {
  //   requestAnimationFrame(() => {
  //     const model = editorRef.current?.getModel();
  //     console.log("HERER")
  //     if (model && model.getVersionId() === version) {
  //       console.log("YASS")
  //       monaco.editor.setModelMarkers(model, "eslint", markers);
  //     }
  //   });
  // };
  // console.log("ABCD", eslintWorker);

  const handleEditorDidMount = useCallback(
    async (editor: editor.IStandaloneCodeEditor, monacoEditor: Monaco) => {
      editorRef.current = editor;
      monacoRef.current = monacoEditor;
      // linterWorkerRef.current = ESLintWorker;
      // linterWorkerRef.current.addEventListener("message", ({ data }: any) =>
      //   updateMarkers(data)
      // );
      monacoEditor.editor.defineTheme("ayu-dark", DarkTheme);
      monacoEditor.editor.setTheme("ayu-dark");
      // monacoEditor.editor.setModelMarkers(
      //   editor.getModel() as editor.ITextModel,
      //   "eslint",
      //   []
      // );
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
        },
      );
    },
    [],
  );

  const onChangeLocal: MonacoOnChange = (
    value: string | undefined,
    e: editor.IModelContentChangedEvent,
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
    <div className="editor-wrapper pl-2 pr-3">
      {/* <button
        onClick={formatCode}
        className="button button-format is-primary is-small"
      >
        Format
      </button> */}
      <div className="bg-editor-bg rounded-lg overflow-clip flex flex-col items-center justify-start h-full">
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

            autoIndent: "full",
            contextmenu: true,
            fontFamily: "monospace",
            // lineHeight: 24,
            hideCursorInOverviewRuler: true,
            matchBrackets: "always",
            // scrollbar: {
            //   horizontalSliderSize: 4,
            //   verticalSliderSize: 18,
            // },
            selectOnLineNumbers: true,
            roundedSelection: false,
            readOnly: false,
            cursorStyle: "line",
          }}
          onChange={onChangeLocal}
          onMount={handleEditorDidMount}
          beforeMount={monaco => {
            const compilerOptions = {
              allowJs: true,
              allowSyntheticDefaultImports: true,
              alwaysStrict: true,
              allowNonTsExtensions: true,
              target: monaco.languages.typescript.ScriptTarget.ES2016,
              jsx: 5,
              jsxFactory: "React.createElement",
            };
            monaco.languages.typescript.typescriptDefaults.setCompilerOptions(
              compilerOptions,
            );
            monaco.languages.typescript.javascriptDefaults.setCompilerOptions(
              compilerOptions,
            );

            monaco.languages.typescript.typescriptDefaults.setDiagnosticsOptions(
              {
                noSemanticValidation: false,
                noSyntaxValidation: false,
              },
            );
            monaco.languages.typescript.javascriptDefaults.setDiagnosticsOptions(
              {
                noSemanticValidation: false,
                noSyntaxValidation: false,
              },
            );
            monaco.languages.typescript.typescriptDefaults.setEagerModelSync(
              true,
            );
            monaco.languages.typescript.javascriptDefaults.setEagerModelSync(
              true,
            );
          }}
          onValidate={markers => {
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

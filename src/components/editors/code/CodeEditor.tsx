import React, { useRef, useCallback, useEffect } from "react";
import MonacoEditor, { OnChange } from "@monaco-editor/react";
import { editor } from "monaco-editor";
import * as monaco from "monaco-editor/esm/vs/editor/editor.api";
import { useTypedSelector } from "../../../state/hooks";
import { getCurrentEditor } from "../../../state/features/editor/editorSlice";
// import * as prettier from "prettier/standalone";
// import parserBabel from "prettier/plugins/babel";
// import * as prettierPluginEstree from "prettier/plugins/estree";

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
  initialValue: string;
  onChange: OnChange;
}

const CodeEditor: React.FC<CodeEditorProps> = ({ initialValue, onChange }) => {
  const editorRef = useRef<editor.IStandaloneCodeEditor | null>(null);
  const editorData = useTypedSelector(getCurrentEditor);

  const handleEditorDidMount = useCallback(
    async (editor: editor.IStandaloneCodeEditor, monacoEditor: Monaco) => {
      editorRef.current = editor;
      console.log("EDITORDIDMOUNT", editor, monacoEditor);
    },
    []
  );

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
    <div className="editor-wrapper">
      {/* <button
        onClick={formatCode}
        className="button button-format is-primary is-small"
      >
        Format
      </button> */}
      <div className="flex flex-row">
        {editorData.path.map((path, i) => (
          <div>
            {path} {i !== editorData.path.length - 1 && "/"}{" "}
          </div>
        ))}
      </div>

      <MonacoEditor
        path={editorData.id}
        // defaultLanguage={editorData.language}
        // defaultValue={editorData.value}
        theme="vs-dark"
        language={editorData.language}
        value={editorData.content}
        height={"100%"}
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
        onChange={onChange}
        onMount={handleEditorDidMount}
        beforeMount={(monaco) => {
          console.log("BEFOREMOUNT", monaco);
          monaco.languages.typescript.typescriptDefaults.setCompilerOptions({
            target: monaco.languages.typescript.ScriptTarget.ES2016,
            allowNonTsExtensions: true,
          });
          monaco.languages.typescript.javascriptDefaults.setCompilerOptions({
            target: monaco.languages.typescript.ScriptTarget.ES2016,
            allowNonTsExtensions: true,
          });
          monaco.languages.typescript.typescriptDefaults.setDiagnosticsOptions({
            noSemanticValidation: false,
            noSyntaxValidation: false,
          });
          monaco.languages.typescript.javascriptDefaults.setDiagnosticsOptions({
            noSemanticValidation: false,
            noSyntaxValidation: false,
          });
          monaco.languages.typescript.typescriptDefaults.setEagerModelSync(
            true
          );
          // monaco.languages.typescript.javascriptDefaults.setEagerModelSync(true);
        }}
        onValidate={(markers) => {
          console.log("ONVALIDATE", markers);
        }}
      />
    </div>
  );
};

export default CodeEditor;

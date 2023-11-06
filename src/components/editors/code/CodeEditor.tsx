import React, { useRef, useCallback } from "react";
import MonacoEditor, { OnChange } from "@monaco-editor/react";
import { editor } from "monaco-editor";
import * as monaco from "monaco-editor/esm/vs/editor/editor.api";
// import * as prettier from "prettier/standalone";
// import parserBabel from "prettier/plugins/babel";
// import * as prettierPluginEstree from "prettier/plugins/estree";

type Monaco = typeof monaco;

interface CodeEditorProps {
  initialValue: string;
  onChange: OnChange;
}

const CodeEditor: React.FC<CodeEditorProps> = ({ initialValue, onChange }) => {
  const editorRef = useRef<editor.IStandaloneCodeEditor | null>(null);

  const handleEditorDidMount = useCallback(
    async (editor: editor.IStandaloneCodeEditor, monacoEditor: Monaco) => {
      editorRef.current = editor;
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
      <MonacoEditor
        defaultValue={initialValue}
        theme="vs-dark"
        defaultLanguage="javascript"
        options={{
          wordWrap: "on",
          minimap: { enabled: false },
          showUnused: true,
          folding: true,
          lineNumbersMinChars: 3,
          fontSize: 16,
          scrollBeyondLastLine: true,
          automaticLayout: true,
          tabSize: 2,
        }}
        onChange={onChange}
        onMount={handleEditorDidMount}
      />
    </div>
  );
};

export default CodeEditor;

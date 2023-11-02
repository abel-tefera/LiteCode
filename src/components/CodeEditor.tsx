import React, { useRef, useCallback } from "react";
import Monaco, { OnChange } from "@monaco-editor/react";
import * as prettier from "prettier/standalone";
import parserBabel from "prettier/plugins/babel";
import * as prettierPluginEstree from "prettier/plugins/estree";

interface CodeEditorProps {
  initialValue: string;
  onChange: OnChange;
}

const CodeEditor: React.FC<CodeEditorProps> = ({ initialValue, onChange }) => {
  const editorRef = useRef<any>(null);

  const handleEditorDidMount = useCallback(
    async (editor: any, monacoEditor: any) => {
      editorRef.current = editor;
    },
    []
  );

  const formatCode = () => {
    const unformatted = editorRef.current.getValue();
    prettier
      .format(unformatted, {
        parser: "babel",
        plugins: [parserBabel, prettierPluginEstree],
        useTabs: false,
        semi: true,
        singleQuote: true,
      })
      .then((formatted: string) => {
        formatted.replace(/\n$/, "");
        editorRef.current.setValue(formatted);
      });
    // .replace(/\n$/, "");
    // editorRef.current.setValue(formatted);
    // onChange(formatted);
  };

  return (
    <div className="editor-wrapper">
      <button
        onClick={formatCode}
        className="button button-format is-primary is-small"
      >
        Format
      </button>
      <Monaco
        defaultValue={initialValue}
        theme="vs-dark"
        height="30vh"
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

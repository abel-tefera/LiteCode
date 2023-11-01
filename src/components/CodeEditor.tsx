import React from "react";
import Monaco, { OnChange } from "@monaco-editor/react";

interface CodeEditorProps {
  initialValue: string;
  onChange: OnChange;
}

const CodeEditor: React.FC<CodeEditorProps> = ({ initialValue, onChange }) => {
  return (
    <div>
      <Monaco
        value={initialValue}
        theme="vs-dark"
        height="30vh"
        language="javascript"
        options={{
          wordWrap: "on",
          minimap: { enabled: false },
          showUnused: true,
          folding: true,
          lineNumbersMinChars: 3,
          fontSize: 16,
          scrollBeyondLastLine: true,
          automaticLayout: true,
        }}
        onChange={onChange}
      />
    </div>
  );
};

export default CodeEditor;

import { useState, useEffect, useRef } from "react";
import startService from "../bundler/plugins/startService";

import CodeEditor from "./CodeEditor";
import { OnChange as MonacoOnChange } from "@monaco-editor/react";
import { editor } from "monaco-editor";
import CodePreview from "./CodePreview";
import bundle from "../bundler";
import Resizable from "./Resizable";

const CodeCell = () => {
  const [input, setInput] = useState("");
  const [code, setCode] = useState("");

  const esbuildRef = useRef<any>(null);

  useEffect(() => {
    async function serviceStart() {
      const serviceRef = await startService();
      esbuildRef.current = serviceRef;
    }
    serviceStart();
  }, []);

  const onClick = async () => {
    if (!esbuildRef.current) return;

    const resCode = await bundle(esbuildRef, input);
    setCode(resCode);
  };

  const onEditorChange: MonacoOnChange = (
    value: string | undefined,
    e: editor.IModelContentChangedEvent
  ) => {
    if (value) {
      setInput(value);
    }
  };

  return (
    <Resizable direction="vertical">
      <div className="code-cell">
        <div>
          <CodeEditor
            initialValue="console.log(123);"
            onChange={onEditorChange}
          />
          <div>
            <button onClick={onClick}>Submit</button>
          </div>
        </div>
        <CodePreview code={code} />
      </div>
    </Resizable>
  );
};

export default CodeCell;

import { useState, useEffect, useRef } from "react";
import startService from "./bundler/plugins/startService";

import CodeEditor from "./components/CodeEditor";
import { OnChange as MonacoOnChange } from "@monaco-editor/react";
import { editor } from "monaco-editor";
import CodePreview from "./components/CodePreview";
import bundle from "./bundler";

const App = () => {
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
    <div className="App">
      <h1>XYZ Code</h1>
      <CodeEditor initialValue="console.log(123);" onChange={onEditorChange} />
      <div>
        <button onClick={onClick}>Submit</button>
      </div>
      {/* <pre>{code}</pre> */}
      <CodePreview code={code} />
    </div>
  );
};

export default App;

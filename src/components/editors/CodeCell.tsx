import React, { useState, useEffect, useRef } from "react";
import { OnChange as MonacoOnChange } from "@monaco-editor/react";
import { editor } from "monaco-editor";
import startService from "../../bundler/plugins/startService";
import CodeEditor from "./code/CodeEditor";
import CodePreview from "./code/CodePreview";
import bundle from "../../bundler";
import Resizable from "../Resizable";
import throttle from "../../utils/throttle";

const CodeCell = () => {
  const [input, setInput] = useState("");
  const [code, setCode] = useState("");
  const [err, setErr] = useState("");
  const [direction, setDirection] = useState<
    "horizontal" | "vertical" | null
  >();

  const esbuildRef = useRef<any>(null);

  const findWidth = () => {
    const width = window.innerWidth;
    if (width >= 768) {
      return "horizontal";
    } else {
      return "vertical";
    }
  };

  const handleResize = throttle((e: UIEvent) => {
    setDirection(findWidth());
  }, 500);

  useEffect(() => {
    setDirection(findWidth());
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    async function serviceStart() {
      const serviceRef = await startService();
      esbuildRef.current = serviceRef;
    }
    serviceStart();
  }, []);

  useEffect(() => {
    const timer = setTimeout(async () => {
      if (!esbuildRef.current) return;
      const resCode = await bundle(esbuildRef, input);
      setCode(resCode.code);
      setErr(resCode.err);
    }, 1000);

    return () => {
      clearTimeout(timer);
    };
  }, [input]);

  const onEditorChange: MonacoOnChange = (
    value: string | undefined,
    e: editor.IModelContentChangedEvent
  ) => {
    if (value) {
      setInput(value);
    }
  };

  return (
    <div className="code-cell flex flex-col md:flex-row">
      {direction && (
        <Resizable direction={direction}>
          <CodeEditor
            initialValue="console.log(123);"
            onChange={onEditorChange}
          />
        </Resizable>
      )}

      <CodePreview code={code} err={err} />
    </div>
  );
};

export default CodeCell;

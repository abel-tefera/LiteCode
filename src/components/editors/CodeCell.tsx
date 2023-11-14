import React, { useState, useEffect, useRef } from "react";
import { OnChange as MonacoOnChange } from "@monaco-editor/react";
import { editor } from "monaco-editor";
import startService from "../../bundler/plugins/startService";
import CodeEditor from "./code/CodeEditor";
import CodePreview from "./code/CodePreview";
import bundle from "../../bundler";
import Resizable from "../Resizable";
import throttle from "../../utils/throttle";
import { ResizableBox } from "react-resizable";
import Structure from "../file-structure/Structure";
import logo from "../../assets/logo-2.png";
import Tabs from "../menus/Tabs";

// import { Resizable } from "re-resizable";
const CodeCell = () => {
  const [input, setInput] = useState("");
  const [code, setCode] = useState("");
  const [err, setErr] = useState("");
  const [direction, setDirection] = useState<
    "horizontal" | "vertical" | null
  >();
  const [widthAdjusted, setWidthAdjusted] = useState(0);

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
    <div className="flex w-full h-full mt-4">
      <div className="mt-3">
        <Resizable
          minRatio={0.05}
          maxRatio={0.3}
          initialRatio={0.15}
          resizableCall={(width: number) => {
            setWidthAdjusted(window.innerWidth * 0.15 - width);
          }}
        >
          <div className="h-full flex flex-col">
            <div className="flex items-center mb-[7px] px-4 py-2 justify-between">
              <img src={logo} alt="Logo" className="w-[7.5rem] select-none" />
            </div>

            <Structure />
            <div className="ml-2 text-base relative">
              <div className={`absolute top-10 inline-flex items-center select-none`}>
                Developed by&nbsp;
                <a
                  href="https://www.abeltb.xyz/"
                  target="_blank"
                  rel="noreferrer"
                  className="font-medium text-blue-600 dark:text-blue-500 hover:underline"
                >
                  {" "}
                  Abel
                </a>
              </div>
            </div>
          </div>
        </Resizable>
      </div>

      <div className="w-full h-full flex flex-col">
        <Tabs />
        <div className="w-full h-4/5 flex flex-row">
          <Resizable
            minRatio={0.2}
            maxRatio={0.7}
            initialRatio={0.65}
            widthAdjusted={widthAdjusted}
            resizableCall={(width: number) => {
              // console.log("CODE CELL", width)
              // setCodeCellWidth(width);
            }}
          >
            <CodeEditor
              initialValue="console.log(123);"
              onChange={onEditorChange}
            />
          </Resizable>
          <CodePreview code={code} err={err} />
        </div>
      </div>
    </div>
  );
};

export default CodeCell;

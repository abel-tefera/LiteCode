import React, { useState, useEffect, useRef } from "react";
import { OnChange as MonacoOnChange } from "@monaco-editor/react";
import { editor } from "monaco-editor";
import startService from "../../bundler/plugins/startService";
import CodeEditor from "./code/CodeEditor";
import CodePreview from "./code/CodePreview";
import bundle from "../../bundler";
import Resizable from "../resizable/Resizable";
import throttle from "../../utils/throttle";
import { updateFileContents } from "../../state/features/structure/structureSlice";
import { useTypedDispatch } from "../../state/hooks";
import { storeOutput } from "../../state/features/bundler/bundlerSlice";

interface CodeCellProps {
  // currentTab: string;
}
// import { Resizable } from "re-resizable";
const CodeCell: React.FC<CodeCellProps> = () => {
  const [input, setInput] = useState("");
  const [currentEditorId, setCurrentEditorId] = useState("");
  const [direction, setDirection] = useState<
    "horizontal" | "vertical" | null
  >();

  const esbuildRef = useRef<any>(null);
  const dispatch = useTypedDispatch();

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
      if (input === "") return;
      dispatch(updateFileContents({ id: currentEditorId, value: input }));
      const resCode = await bundle(esbuildRef);
      dispatch(storeOutput({ code: resCode.code, err: resCode.err }));
    }, 1000);

    return () => {
      clearTimeout(timer);
    };
  }, [input]);

  const onEditorChange = (id: string, value: string) => {
    if (currentEditorId !== id) {
      setCurrentEditorId(id);
    }
    setInput(value);
  };

  return (
    <div className="w-full h-full flex flex-row">
      <Resizable
        minRatio={0.2}
        maxRatio={0.7}
        initialRatio={0.65}
        haveWidthAdjusted={true}
        resizableCall={(width: number) => {
          // setCodeCellWidth(width);
        }}
        resizeStopCall={(width: number) => {
          // setCodeCellWidth(width);
        }}
      >
        <CodeEditor onChange={onEditorChange} />
      </Resizable>
      <div className="w-full h-full mr-2">
        <CodePreview />
      </div>
    </div>
  );
};

export default CodeCell;

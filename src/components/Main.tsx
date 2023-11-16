import React from "react";
import Resizable from "./Resizable";
import Structure from "./file-structure/Structure";
import Tabs from "./menus/Tabs";
import logo from "../assets/logo-2.png";
import CodeCell from "./editors/CodeCell";
import { useTypedDispatch, useTypedSelector } from "../state/hooks";
import { setEditorWidthAdjusted } from "../state/features/editor/editorSlice";
import throttle from "../utils/throttle";
import { activeTabs } from "../state/features/tabs/tabsSlice";
// import { activeTabs } from "../state/features/structure/structureSlice";

const Main = () => {
  const dispatch = useTypedDispatch();
  const tabs = useTypedSelector(activeTabs);
  const setWidthAdjusted = throttle((width: number) => {
    dispatch(setEditorWidthAdjusted(width));
  }, 500);

  return (
    <div className="flex w-full h-full mt-4">
      <div className="mt-3">
        <div className="flex items-center mb-[7px] px-4 py-2 justify-between">
          <img src={logo} alt="Logo" className="w-[7.5rem] select-none" />
        </div>
        <Resizable
          minRatio={0.05}
          maxRatio={0.3}
          initialRatio={0.15}
          haveWidthAdjusted={false}
          resizableCall={(width: number) => {
            setWidthAdjusted(window.innerWidth * 0.15 - width);
          }}
        >
          <div className="h-full flex flex-col">
            <Structure />
            <div className="ml-2 text-base relative">
              <div className={`absolute inline-flex items-center select-none`}>
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
        <CodeCell />
        {/* {tabs.length > 0 && } */}
      </div>
    </div>
  );
};

export default Main;

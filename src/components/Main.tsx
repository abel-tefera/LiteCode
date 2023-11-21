import React from "react";
import Resizable from "./resizable/Resizable";
import Structure from "./file-structure/Structure";
import Tabs from "./menus/Tabs";
import logo from "../assets/logo-2.png";
import CodeCell from "./editors/CodeCell";
import { useTypedDispatch, useTypedSelector } from "../state/hooks";
import { setEditorWidthAdjusted } from "../state/features/editor/editorSlice";
import throttle from "../utils/throttle";
import { activeTabs } from "../state/features/tabs/tabsSlice";
import Brand from "./branding/Brand";
import ProjectActions from "./menus/ProjectActions";
// import { activeTabs } from "../state/features/structure/structureSlice";

const Main = () => {
  const dispatch = useTypedDispatch();
  const tabs = useTypedSelector(activeTabs);
  const setWidthAdjusted = throttle((width: number) => {
    dispatch(setEditorWidthAdjusted(width));
  }, 500);

  return (
    <div className="flex flex-col w-full h-full">
      <div className="flex flex-col h-full w-full">
        <div className="flex h-fit items-center px-4 pt-2 w-full">
          <div className="flex flex-row w-fit">
            <img
              src={logo}
              alt="Logo"
              className="w-[7.5rem] select-none border pt-6 pb-8 border-transparent"
            />
            {tabs.length > 0 && (
              <div className="select-none border-r border-slate-400 mt-2 ml-4 h-12 mr-2">
                &nbsp;
              </div>
            )}
          </div>

          <div className="w-10/12 flex ml-3">
            <div className="w-10/12">
              <Tabs />
            </div>
            <div className="w-2/12 flex justify-end">
              <ProjectActions />
            </div>
          </div>
        </div>
        <div className="flex flex-row w-full h-full">
          <Resizable
            minRatio={0.15}
            maxRatio={0.3}
            initialRatio={0.15}
            haveWidthAdjusted={false}
            resizableCall={(width: number) => {
              setWidthAdjusted(window.innerWidth * 0.15 - width);
            }}
            resizeStopCall={(width: number) => {
              setWidthAdjusted(window.innerWidth * 0.15 - width);
            }}
          >
            <div className="h-full flex flex-col">
              <Structure />
              {/* <Brand /> */}
            </div>
          </Resizable>

          {tabs.length > 0 && <CodeCell />}
        </div>
      </div>
      <div className="flex h-fit items-end">
        <Brand />
      </div>
    </div>
  );
};

export default Main;

import React, { useEffect, useState } from 'react';
import Resizable from './resizable/Resizable';
import Structure from './file-structure/Structure';
import Tabs from './menus/Tabs';
import CodeCell from './editors/CodeCell';
import { useTypedDispatch, useTypedSelector } from '../state/hooks';
import { setEditorWidthAdjusted } from '../state/features/editor/editorSlice';
import throttle from '../utils/throttle';
import { activeTabs } from '../state/features/tabs/tabsSlice';
import Contact from './branding/Contact';
// import ProjectActions from "./menus/ProjectActions";
import SmallScreenDisclaimer from './branding/SmallScreenDisclaimer';
import Reception from './branding/Reception';
// import { activeTabs } from "../state/features/structure/structureSlice";

const Main: React.FC = () => {
  const dispatch = useTypedDispatch();
  const tabs = useTypedSelector(activeTabs);
  const setWidthAdjusted = throttle((width: number) => {
    dispatch(setEditorWidthAdjusted(width));
  }, 500);

  const isSmall = (): boolean => {
    const width = window.innerWidth;
    if (width < 768) {
      return true;
    }
    return false;
  };
  const [isSmallScreen, setIsSmallScreen] = useState(isSmall());

  useEffect(() => {
    const userAgent = navigator.userAgent;
    const isMobile = userAgent.includes('Mobile');
    const isTablet = userAgent.includes('Tablet');
    const isComputer = !isMobile && !isTablet;

    if (!isComputer) {
      setIsSmallScreen(true);
    }
  }, []);

  return (
    <div className="flex h-full w-full flex-col">
      {!isSmallScreen ? (
        <div className="flex h-full w-full flex-col">
          <div className="flex h-fit w-full items-center px-4 pt-2">
            <div className="flex w-fit flex-row">
              <img
                src="/logo-2.png"
                alt="Logo"
                className="w-[7.5rem] select-none border border-transparent pb-8 pt-6"
              />
              {tabs.length > 0 && (
                <div className="mb-2 ml-4 mr-2 h-8 select-none self-center border-r border-slate-400">
                  &nbsp;
                </div>
              )}
            </div>

            <div className="ml-3 flex w-10/12">
              <div className="w-10/12">
                <Tabs />
              </div>
              {/* <div className="w-2/12 flex justify-end">
                <ProjectActions />
              </div> */}
            </div>
          </div>
          <div className="flex h-full w-full flex-row">
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
              <div className="flex h-full flex-col">
                <Structure />
                {/* <Brand /> */}
              </div>
            </Resizable>

            {tabs.length > 0 ? <CodeCell /> : <Reception />}
          </div>
        </div>
      ) : (
        <SmallScreenDisclaimer />
      )}

      <div className="flex h-fit items-end">
        <Contact />
      </div>
    </div>
  );
};

export default Main;

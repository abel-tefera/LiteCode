import React, { useEffect, useRef } from 'react';
import {
  activeTabs,
  closeAllTabs,
  closeTab,
  selectTab,
  selectedTab,
  setActiveTabAsync,
} from '../../../state/features/tabs/tabsSlice';
import { useTypedDispatch, useTypedSelector } from '../../../state/hooks';
import { Tooltip } from 'react-tooltip';
import closeAllIcon from '../../../../public/close-all.svg';
import closeIcon from '../../../../public/cross.svg';
import downArrowLogo from '../../../../public/left-arrow.svg';

import ItemTitle from './ItemTitle';
import { setSelected } from '../../../state/features/structure/structureSlice';
import { setActiveEditorAsync } from '../../../state/features/editor/editorSlice';
import useOutsideAlerter from '../../../hooks/useOutsideAlerter';

interface OpenEditorsProps {
  collapsed: boolean;
  structureCollapsed: boolean;
  setCollapseArea: () => void;
}

const OpenEditors: React.FC<OpenEditorsProps> = ({
  collapsed,
  structureCollapsed,
  setCollapseArea,
}) => {
  const dispatch = useTypedDispatch();
  const tabs = useTypedSelector(activeTabs);
  const tabsArea = useRef<HTMLDivElement>(null);
  const selected = useTypedSelector(selectedTab);
  const tabHeight = 34.24;
  const tabsRatio = Math.floor(window.innerHeight / (tabHeight + 16) / 2) - 1;

  const containerRef = useRef<HTMLDivElement>(null);

  useOutsideAlerter(containerRef, () => {
    containerRef.current?.classList.remove('border-vscode-blue');
  });

  useEffect(() => {
    if (!tabsArea.current) return;
    if (!collapsed) {
      const timeout = setTimeout(() => {
        tabsArea.current!.classList.remove('hidden-scrollbar');
      }, 300);
      return () => clearTimeout(timeout);
    } else {
      tabsArea.current!.classList.add('hidden-scrollbar');
    }
  }, [collapsed]);

  const getHeight = (noRestriction?: true) => {
    let height = tabs.length * tabHeight;
    if (noRestriction) {
      return height + 16;
    }
    if (!structureCollapsed) {
      if (tabs.length > tabsRatio) {
        height = window.innerHeight * 0.25;
      }
    } else {
      if (height > window.innerHeight * 0.5) {
        height = window.innerHeight * 0.5;
      }
    }
    return height + 16;
  };

  useEffect(() => {
    if (!tabsArea.current) return;
    tabsArea.current.style.height = `${getHeight()}px`;
    tabsArea.current.scrollTop = tabsArea.current.scrollHeight;
  }, [tabs.length]);

  useEffect(() => {
    if (!tabsArea.current) return;
    tabsArea.current.style.height = `${getHeight()}px`;
  }, [structureCollapsed]);

  return (
    <div className="mt-2 flex select-none flex-col items-start">
      <div className="w-full pl-2">
        <div
          ref={containerRef}
          onClick={() => {
            containerRef.current?.classList.add('border-vscode-blue');
            setCollapseArea();
          }}
          className="flex w-full cursor-pointer select-none flex-row items-center border border-transparent p-1 transition-[border-color]"
        >
          <img
            src={downArrowLogo.src}
            className={`${
              !collapsed ? 'rotate-[270deg]' : 'rotate-180'
            } mr-2 h-3 w-3 self-center transition-transform`}
            alt="Down Arrow"
          />
          <span className="flex w-full flex-row justify-between">
            <span className="flex self-center text-white">Open Editors</span>
            <span className="flex self-center text-white">
              <Tooltip
                className="z-50"
                id="close-all"
                style={{ backgroundColor: 'rgb(60 60 60)' }}
              />
              <button
                type="button"
                onClick={(e) => {
                  // TODO: Close all Editors
                  e.stopPropagation();
                  dispatch(closeAllTabs());
                }}
                className="cursor-pointer rounded-sm p-[2px] hover:bg-dark-hover "
              >
                <img
                  data-tooltip-id="close-all"
                  data-tooltip-content={'Close All Editors'}
                  src={closeAllIcon.src}
                  className="h-5 w-5"
                  alt="Close All Editors"
                />
              </button>
            </span>
          </span>
        </div>
      </div>

      <div
        ref={tabsArea}
        className={`list-container custom-scrollbar-2 relative w-full overflow-x-clip pr-[6px] transition-[height] duration-300 ease-out ${
          collapsed || tabs.length === 0 ? 'no-height' : ''
        } ${
          tabs.length > tabsRatio
            ? 'overflow-y-auto'
            : 'hidden-scrollbar overflow-y-hidden'
        } `}
      >
        <div
          style={{
            minHeight:
              tabs.length > tabsRatio ? `${getHeight(true)}px` : 'auto',
          }}
          className={`absolute flex h-full w-full flex-col justify-center pl-4 `}
        >
          {tabs.map((tab) => (
            <div
              onClick={() => {
                if (selected !== tab.id) {
                  dispatch(selectTab(tab.id));
                  dispatch(setActiveEditorAsync({ id: tab.id, line: 0 }));
                }
              }}
              key={`open-editor-${tab.id}`}
              className={`hover-show flex w-full flex-col rounded-sm transition-colors  hover:cursor-pointer  ${
                selected === tab.id
                  ? 'bg-slate-700 hover:bg-slate-600'
                  : 'hover:bg-dark-hover'
              }`}
            >
              <div className={`flex w-fit flex-row justify-between`}>
                <span className="flex min-w-[2rem] items-center text-white">
                  {/* <Tooltip
                className="z-50"
                id="close-editor"
                style={{ backgroundColor: 'rgb(60 60 60)' }}
              /> */}
                  <div
                    className={`flex h-full items-center rounded-l-sm hover:bg-slate-500`}
                  >
                    <button
                      type="button"
                      className="show-on-hover mx-auto h-full transition-opacity p-1"
                      onClick={(e) => {
                        // TODO: Close Editor
                        dispatch(closeTab(tab.id));
                        dispatch(setActiveEditorAsync({ id: '', line: 0 }));
                      }}
                    >
                      <img
                        //   data-tooltip-id="close-editor"
                        //   data-tooltip-content={'Close Editor'}
                        src={closeIcon.src}
                        className="h-5 w-5 cursor-pointer"
                        alt="Right Arrow"
                      />
                    </button>
                  </div>
                </span>
                <div className="ml-[-8px] w-fit cursor-pointer">
                  <ItemTitle
                    item={{
                      ...tab,
                      name: tab.wholeName.substring(
                        0,
                        tab.wholeName.lastIndexOf('.'),
                      ),
                      type: 'file',
                    }}
                    onClickE={(e) => {
                      // TODO: Open Editor
                      // e.stopPropagation();
                      // dispatch(setSelected({ id: tab.id, type: 'file' }));
                    }}
                  />
                </div>
                <div className="flex w-fit justify-start self-center">
                  <span className="whitespace-nowrap text-sm text-gray-400">
                    {tab.path}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default OpenEditors;

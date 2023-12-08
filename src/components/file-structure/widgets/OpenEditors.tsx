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
import closeIcon from '../../../../public/close-tab.svg';
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

  const getHeight = () => {
    let height = tabs.length * 6.08170515097691;
    if (!structureCollapsed) {
      if (tabs.length > 4) {
        height = 25;
      }
    } else {
      if (height > 50) {
        height = 50;
      }
    }
    return height;
  };

  useEffect(() => {
    if (!tabsArea.current) return;
    tabsArea.current.style.height = `${getHeight()}vh`;
    tabsArea.current.scrollTop = tabsArea.current.scrollHeight;
  }, [tabs.length]);

  useEffect(() => {
    if (!tabsArea.current) return;
    tabsArea.current.style.height = `${getHeight()}vh`;
  }, [structureCollapsed]);

  return (
    <div className="my-2 flex select-none flex-col items-start">
      <div className="pl-2 w-full">
        <div
          ref={containerRef}
          onClick={() => {
            containerRef.current?.classList.add('border-vscode-blue');
            setCollapseArea();
          }}
          className="transition-[border-color] mb-3 mt-2 flex w-full cursor-pointer select-none flex-row items-center border border-transparent p-1"
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
        className={`list-container custom-scrollbar-2 w-full transition-[height] duration-300 ease-out ${
          collapsed ? 'no-height' : ''
        } ${
          tabs.length > 4
            ? 'overflow-y-auto'
            : 'hidden-scrollbar overflow-y-hidden'
        } `}
      >
        {tabs.map((tab) => (
          <div
            key={`open-editor-${tab.id}`}
            className="flex w-full flex-col px-1"
          >
            <div
              className={`hover-show flex w-full flex-row justify-between rounded-sm transition-colors hover:cursor-pointer ${
                selected === tab.id
                  ? 'bg-slate-700 hover:bg-slate-600'
                  : 'hover:bg-dark-hover'
              }`}
            >
              <span className="flex items-center text-white">
                {/* <Tooltip
                className="z-50"
                id="close-editor"
                style={{ backgroundColor: 'rgb(60 60 60)' }}
              /> */}
                <div
                  className={`flex h-full items-center rounded-sm px-1 hover:bg-slate-500`}
                >
                  <button
                    type="button"
                    className="show-on-hover mx-auto transition-opacity"
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
              <div className="w-full cursor-pointer">
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
                    e.stopPropagation();
                    // dispatch(setSelected({ id: tab.id, type: 'file' }));
                    if (selected !== tab.id) {
                      dispatch(selectTab(tab.id));
                      dispatch(setActiveEditorAsync({ id: tab.id, line: 0 }));
                    }
                  }}
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default OpenEditors;

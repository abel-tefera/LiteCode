import React, { useEffect } from "react";
import { getLogo, trimName } from "./StructureUtils";
import {
  collapseOrExpand,
  contextSelectedItem,
  selectedItem,
  contextClick,
  clipboard,
  setSelected,
  Directory,
  NormalizedFolder,
  FileStructure,
  FileInFolder,
} from "../../state/features/structure/structureSlice";
import useOutsideAlerter from "../../hooks/useOutsideAlerter";
import { RootState } from "../../state/store";
import { useTypedDispatch, useTypedSelector } from "../../state/hooks";
import { setActiveTabAsync } from "../../state/features/tabs/tabsSlice";
import { setActiveEditorAsync } from "../../state/features/editor/editorSlice";

interface FolderProps {
  data: (Directory | FileInFolder)[];
}

const Folder: React.FC<FolderProps> = ({ data }) => {
  const dispatch = useTypedDispatch();
  const selected = useTypedSelector(selectedItem);
  const contextSelected = useTypedSelector(contextSelectedItem);
  const cutItem = useTypedSelector(clipboard);
  const children = useTypedSelector((state: RootState) => {
    const allData = data.map(({ id: itemId, type }) => {
      return state.structure.normalized[`${type}s`].byId[itemId];
    });
    return allData;
  });

  const findLogo = (item: FileStructure | NormalizedFolder) => {
    if (item.type === "folder") {
      return item.collapsed ? "closed-folder" : "opened-folder";
    } else if (item.type === "file") {
      return getLogo(item.extension);
    }
  };

  return (
    <div className={`${children.length > 0 && "w-full"}`}>
      {children.map((item) => {
        return (
          <div key={item.id} className={`flex flex-col`}>
            <div
              id={item.id}
              typeof-item={item.type}
              className={`transition-colors flex flex-row hover:cursor-pointer rounded-r-sms clickable hover:bg-dark-hover rounded-r-sm justify-between  ${
                selected === item.id
                  ? "bg-vscode-overlay hover:bg-vscode-blue"
                  : contextSelected === item.id
                  ? "bg-slate-700 hover:bg-slate-600"
                  : ""
              }  ${
                cutItem?.isCut && cutItem.id === item.id ? "opacity-50" : ""
              } }`}
            >
              <div
                onClick={() => {
                  dispatch(setSelected({ id: item.id, type: item.type }));
                  if (item.type === "file") {
                    // @ts-ignore
                    dispatch(setActiveTabAsync(item.id));
                    // @ts-ignore
                    dispatch(setActiveEditorAsync(item.id));
                  } else {
                    dispatch(
                      collapseOrExpand({
                        item: { id: item.id, type: item.type },
                        collapse: true,
                      })
                    );
                  }
                }}
                parent-id={item.id}
                typeof-item={item.type}
                className="w-full py-[0.32rem] pl-3 flex flex-row justify-start items-center collapsable"
              >
                {
                  <span
                    typeof-item={item.type}
                    parent-id={item.id}
                    className={`span-logo span-logo-width ${findLogo(item)}`}
                  >
                    &nbsp;
                  </span>
                }
                <span
                  typeof-item={item.type}
                  parent-id={item.id}
                  className="px-1 mx-1 "
                >
                  {trimName(item)}
                </span>
              </div>
              <button
                typeof-item={item.type}
                parent-id={item.id}
                onClick={(e) =>
                  dispatch(
                    contextClick({
                      id: item.id,
                      type: item.type,
                      threeDot: { x: e.clientY, y: e.clientX },
                    })
                  )
                }
                className={`three-dots px-2 transition-opacity rounded-r-sm ${
                  selected === item.id
                    ? "hover:bg-blue-400"
                    : "hover:bg-slate-500"
                }`}
              >
                &nbsp;
              </button>
            </div>
            <>
              <div id={`ghost-input-${item.id}`}></div>
              {item.type === "folder" && !item.collapsed && (
                <div className="flex flex-row sub-folder">
                  <button
                    parent-id={item.id}
                    typeof-item={item.type}
                    onClick={() => {
                      dispatch(setSelected({ id: item.id, type: item.type }));
                      dispatch(
                        collapseOrExpand({
                          item: { id: item.id, type: item.type },
                          collapse: true,
                        })
                      );
                    }}
                    className="transition-colors w-[14px] border-r hover:border-vscode-blue border-monaco-color"
                  ></button>
                  <Folder
                    data={(() => {
                      const childFolder = data.find((newItem) => {
                        return newItem.id === item.id;
                      });
                      return childFolder?.childrenIdsAndType as Directory[];
                    })()}
                  />
                </div>
              )}
            </>
          </div>
        );
      })}
    </div>
  );
};

export default Folder;

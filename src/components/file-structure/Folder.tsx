// @ts-nocheck
import React, { useEffect } from "react";
import { getLogo, trimName } from "./StructureUtils";
import {
  addNode,
  collapseOrExpand,
  removeNode,
  renameNode,
  contextSelectedItem,
  selectedItem,
  contextClick,
  clipboard,
  setSelected,
} from "../../state/features/structure/structureSlice";
import { useDispatch } from "react-redux";
import { useSelector } from "react-redux";
import useOutsideAlerter from "../../hooks/useOutsideAlerter";

const Folder: any = ({ data }) => {
  const dispatch = useDispatch();
  const selected = useSelector(selectedItem);
  const contextSelected = useSelector(contextSelectedItem);
  const cutItem = useSelector(clipboard);
  const children = useSelector((state) => {
    const allData = data.map(({id: itemId, type}) => {
      return state.structure.normalized[`${type}s`].byId[itemId];
    })
    return allData;
  });

  const findLogo = (item) => {
    if (item.type === "folder") {
      return item.collapsed ? "closed-folder" : "opened-folder";
    } else if (item.type === "file") {
      return getLogo(item.extension);
    }
  };

  return (
    <div className="w-full">
      {children.map((item) => {
        return (
          <div key={item.id} className={`flex flex-col`}>
            <div
              id={item.id}
              typeof-item={item.type}
              className={`transition-colors flex flex-row hover:cursor-pointer rounded-r-sms clickable hover:bg-dark-hover rounded-r-sm justify-between  ${
                selected === item.id
                  ? "bg-vscode-overlay hover:bg-vscode-blue"
                  : ""
              } ${
                contextSelected === item.id
                  ? "bg-slate-700 hover:bg-slate-600"
                  : ""
              } ${
                cutItem.isCut && cutItem.id === item.id
                  ? "bg-slate-700 hover:bg-slate-600 opacity-50"
                  : ""
              } }`}
            >
              <div
                onClick={() =>
                  dispatch(collapseOrExpand({ item, collapse: true }))
                }
                parent-id={item.id}
                typeof-item={item.type}
                className="py-[0.32rem] pl-3 flex flex-row justify-between items-center collapsable"
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
                  {trimName(item.name, false)}
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
            {item.childrenFlat && !item.collapsed && (
              <div className="flex flex-row sub-folder">
                <button
                  parent-id={item.id}
                  typeof-item={item.type}
                  onClick={() =>
                    dispatch(collapseOrExpand({ item, collapse: true }))
                  }
                  className="transition-colors w-[14px] border-r hover:border-vscode-blue border-monaco-color"
                ></button>
                <Folder data={(() => {
                  const childFolder = data.find((newItem) => {
                    return newItem.id === item.id
                  });
                  return childFolder.childrenIdsAndType;
                })()} />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default Folder;

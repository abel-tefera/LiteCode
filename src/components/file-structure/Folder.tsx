// @ts-nocheck
import React from "react";
import { getLogo, trimName } from "./StructureUtils";
import {
  addNode,
  collapseOrExpand,
  removeNode,
  renameNode,
  selectedItem,
} from "../../state/features/structure/structureSlice";
import { useDispatch } from "react-redux";
import { useSelector } from "react-redux";
import useOutsideAlerter from "../../hooks/useOutsideAlerter";

const Folder: any = ({ data }) => {
  const dispatch = useDispatch();
  const selected = useSelector(selectedItem);

  const findLogo = (item) => {
    if (item.type === "folder") {
      return item.collapsed ? "closed-folder" : "opened-folder";
    } else if (item.type === "file") {
      return getLogo(item.extension);
    }
  };

  return (
    <div className="w-full">
      {data.map((item) => {
        return (
          <div key={item.id} className={`flex flex-col`}>
            <div
              id={item.id}
              onClick={() =>
                dispatch(collapseOrExpand({ item, collapse: true }))
              }
              typeof-item={item.type}
              className={`transition-colors flex flex-row hover:cursor-pointer rounded-r-sms clickable hover:bg-dark-hover rounded-r-sm  ${
                selected === item.id && "bg-vscode-overlay hover:bg-vscode-blue"
              }`}
            >
              <div className="w-full py-[0.32rem] pl-3 flex flex-row justify-between items-center ">
                {<span className={`span-logo ${findLogo(item)}`}>&nbsp;</span>}
                <span className="w-full px-1 mx-1 ">
                  {trimName(item.name, false)}
                </span>
              </div>
              <button
                className={`three-dots px-2 hover:bg-slate-600 transition-opacity rounded-r-sm ${
                  selected === item.id && "hover:bg-blue-400"
                }`}
              >
                &nbsp;
              </button>
            </div>
            {item.children && !item.collapsed && (
              <div className="flex flex-row w-full sub-folder">
                <button
                  onClick={() =>
                    dispatch(collapseOrExpand({ item, collapse: true }))
                  }
                  className="transition-colors w-[14px] border-r hover:border-vscode-blue border-monaco-color"
                ></button>
                <Folder data={item.children} />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default Folder;

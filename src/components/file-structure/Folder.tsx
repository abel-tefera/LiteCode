// @ts-nocheck
import React from "react";
import { getLogo, trimName } from "./StructureUtils";
import { addNode, collapseOrExpand, removeNode, renameNode, selectedItem } from "../../state/features/structure/structureSlice";
import { useDispatch } from "react-redux";
import { useSelector } from "react-redux";

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
              onClick={() => dispatch(collapseOrExpand(item))}
              className={`transition-colors flex flex-row hover:cursor-pointer rounded-r-sms clickable hover:bg-dark-hover rounded-r-sm  ${selected === item.id && 'bg-vscode-overlay hover:bg-vscode-blue'}`}
            >
              <div className="w-full py-1 pl-3 flex flex-row justify-between items-center ">
                {<span className={`span-logo ${findLogo(item)}`}>&nbsp;</span>}
                <span className="w-full px-1 mx-1 ">
                  {trimName(item.name, false)}
                </span>
              </div>
              <button className={`three-dots px-2 hover:bg-slate-600 transition-opacity rounded-r-sm ${selected === item.id && 'hover:bg-blue-400'}`}>
                &nbsp;
              </button>
            </div>
            {item.children && !item.collapsed && (
              <div className="flex flex-row w-full">
                <button
                  onClick={() => dispatch(renameNode(item))}
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

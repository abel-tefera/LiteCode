import React, { useState, useRef, useEffect } from "react";
import { useTypedDispatch, useTypedSelector } from "../../../state/hooks";
import {
  collapseMiniStructure,
  selectMiniStructure,
  setMiniStructureAsync,
} from "../../../state/features/structure/miniStructureSlice";
import MiniFolder from "../../file-structure/MiniFolder";
import { createPortal } from "react-dom";
import {
  ItemType,
  ValidExtensions,
  setSelected,
} from "../../../state/features/structure/structureSlice";
import useOutsideAlerter from "../../../hooks/useOutsideAlerter";
import { setActiveTabAsync } from "../../../state/features/tabs/tabsSlice";
import { setActiveEditorAsync } from "../../../state/features/editor/editorSlice";
import "../../../styles/breadcrumbs.css";
import { getLogo } from "../../file-structure/utils";
interface BreadcrumbsProps {
  editorObj: { id: string; path: string[]; unmappedPath: string[] };
}
const Breadcrumbs: React.FC<BreadcrumbsProps> = ({ editorObj }) => {
  const [clickedIndex, setClickedIndex] = useState(0);
  const [showMiniStructure, setShowMiniStructure] = useState(false);
  const miniStructure = useTypedSelector(selectMiniStructure);
  const breadcrumbsRef = useRef<HTMLDivElement>(null);
  const miniStructurePortalRef = useRef<HTMLDivElement>(null);
  const dispatch = useTypedDispatch();

  useOutsideAlerter(miniStructurePortalRef, setShowMiniStructure);

  return (
    <>
      <div
        id={"breadcrumbs"}
        ref={breadcrumbsRef}
        className="mb-3 mt-1 select-none w-full"
      >
        <div className="flex items-center justify-start ">
          {editorObj.path.map((path, i) => (
            <div
              id={`${editorObj.path
                .map((path) => path.replaceAll(/[\.|\s]+/g, "-"))
                .join("")}-${i}`}
              key={`${editorObj.path
                .map((path) => path.replaceAll(/[\.|\s]+/g, "-"))
                .join("")}-${i}`}
            >
              <div className={`text-base text-zinc-300 flex flex-row`}>
                {i === editorObj.path.length - 1 && (
                  <span
                    className={`span-logo self-center w-4 h-4 ml-1 mr-[0.375rem] ${getLogo(
                      path.split(".").reverse()[0]
                    )}`}
                  ></span>
                )}
                <span
                  onClick={() => {
                    setClickedIndex(i);
                    setShowMiniStructure(true);
                    dispatch(setMiniStructureAsync(editorObj.unmappedPath[i]));
                  }}
                  className={
                    "cursor-pointer hover:underline hover:text-blue-400"
                  }
                >
                  {path}
                </span>
                {i < editorObj.path.length - 1 && (
                  <span className="text-base text-zinc-200 mx-2">{`/`}</span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
      {breadcrumbsRef.current && showMiniStructure && (
        <>
          {(() => {
            const id = `${editorObj.path
              .map((path) => path.replaceAll(/[\.|\s]+/g, "-"))
              .join("")}-${clickedIndex}`;

            const element = breadcrumbsRef.current.querySelector(
              `#${id}`
            ) as HTMLElement;
            if (element) {
              return createPortal(
                <div
                  ref={miniStructurePortalRef}
                  className="rounded-lg bg-slate-950 border border-slate-600 absolute w-60 z-10 mt-2 max-h-60 overflow-y-auto custom-scrollbar-3"
                >
                  <MiniFolder
                    init={true}
                    data={miniStructure}
                    onClickItem={(item) => {
                      if (item.type === "folder") {
                        dispatch(collapseMiniStructure(item.id));
                      } else {
                        dispatch(setSelected({ id: id, type: "file" }));
                        dispatch(setActiveTabAsync(item.id));
                        dispatch(setActiveEditorAsync(item.id));
                        setShowMiniStructure(false);
                      }
                    }}
                    onCollapseMiniStructure={(id) => {
                      dispatch(collapseMiniStructure(id));
                    }}
                  />
                </div>,
                element
              );
            }
          })()}
        </>
      )}
    </>
  );
};

export default Breadcrumbs;

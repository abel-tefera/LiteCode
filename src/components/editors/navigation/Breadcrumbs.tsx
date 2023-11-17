import React, { useState, useRef } from "react";
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
  setSelected,
} from "../../../state/features/structure/structureSlice";
import useOutsideAlerter from "../../../hooks/useOutsideAlerter";
import { setActiveTabAsync } from "../../../state/features/tabs/tabsSlice";
import { setActiveEditorAsync } from "../../../state/features/editor/editorSlice";

interface BreadcrumbsProps {
  editorObj: { id: string; path: string[]; unmappedPath: string[] };
}
const Breadcrumbs: React.FC<BreadcrumbsProps> = ({ editorObj }) => {
  const [clickedIndex, setClickedIndex] = useState(0);
  const [showMiniStructure, setShowMiniStructure] = useState(true);
  const miniStructure = useTypedSelector(selectMiniStructure);
  const breadcrumbsRef = useRef<HTMLDivElement>(null);
  const miniStructurePortalRef = useRef<HTMLDivElement>(null)
  const dispatch = useTypedDispatch();

  useOutsideAlerter(miniStructurePortalRef, setShowMiniStructure);

  return (
    <>
      <div
        id={"breadcrumbs"}
        ref={breadcrumbsRef}
        className="flex flex-row items-center justify-start mb-3 mt-1 select-none"
      >
        {" "}
        {editorObj.path.map((path, i) => (
          <div
            id={`${editorObj.path.join("-").replaceAll(".", "-")}-${i}`}
            key={`${editorObj.path.join("-").replaceAll(".", "-")}-${i}`}
          >
            <span
              onClick={() => {
                if (i < editorObj.path.length - 1) {
                  setClickedIndex(i);
                  setShowMiniStructure(true);
                  dispatch(setMiniStructureAsync(editorObj.unmappedPath[i]));
                }
              }}
              className={`text-base text-zinc-300 ${
                i < editorObj.path.length - 1 &&
                "cursor-pointer hover:underline hover:text-blue-400"
              }`}
            >
              {path}
            </span>
            {i < editorObj.path.length - 1 && (
              <span className="text-base text-zinc-200 px-2">{`/`}</span>
            )}
          </div>
        ))}
      </div>
      {breadcrumbsRef.current && showMiniStructure && (
        <>
          {(() => {
            const id = `${editorObj.path
              .join("-")
              .replaceAll(".", "-")}-${clickedIndex}`;

            const element = breadcrumbsRef.current.querySelector(
              `#${id}`
            ) as HTMLElement;
            if (element) {
              return createPortal(
                <div ref={miniStructurePortalRef} className="rounded-lg bg-dark-bg border border-slate-600 absolute w-60 z-10 mt-2">
                  <MiniFolder
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

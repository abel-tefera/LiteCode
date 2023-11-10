import React, { useRef, forwardRef, PropsWithRef, useEffect } from "react";
import "../../styles/structure.css";
import parse from "html-react-parser";
// import structureData from "./structureData";
import {
  contextClick,
  fileIds,
  folderIds,
  getInitialSet,
  setSelected,
} from "../../state/features/structure/structureSlice";
import { useSelector } from "react-redux";
// import { mapStructureRecursively } from "../../state/features/structure/utils/traversal";
import FolderStructure from "./Folder";
import useOutsideAlerter from "../../hooks/useOutsideAlerter";
import { useDispatch } from "react-redux";
// import { useTypedSelector, useTypedDispatch } from '../../state/hooks';

const Structure = forwardRef<any>((props, fileSysRef) => {
  // const fileSysRef = useRef<HTMLDivElement>(null);
  // const count = useTypedSelector((state) => state.counter.value)
  // const dispatch = useTypedDispatch()
  const structureData = useSelector(getInitialSet);
  // const structure = mapStructureRecursively(structureData);
  const dispatch = useDispatch();
  const allFileIds = useSelector(fileIds);
  const allFolderIds = useSelector(folderIds);

  useOutsideAlerter(fileSysRef, () => {
    dispatch(setSelected({ id: "head" }));
  });

  const emptyHandler = (e: any) => {
    dispatch(setSelected({ id: "head" }));
    dispatch(
      contextClick({
        id: "head",
        type: "folder",
        threeDot: { x: e.clientY, y: e.clientX },
      })
    );
  };

  return (
    <div
      id="structure-container"
      className="pl-1 pr-2"
      ref={fileSysRef}
      // onClick={(e) => fileStructureClickHandler(e, fileSysRef)}
    >
      <FolderStructure data={structureData} />

      {allFileIds.length === 0 && allFolderIds.length === 0 && (
        <div
          id="welcome"
          onContextMenu={(e) => emptyHandler(e)}
          className="flex h-[40vh] w-full items-center px-4"
        >
          <span className="text-base text-center w-fit mx-auto p-3 rounded-lg border">
            Start developing with LiteCode...
          </span>
        </div>
      )}
    </div>
  );
});

export default Structure;

import React, { useRef, forwardRef, PropsWithRef, useEffect } from "react";
import "../../styles/structure.css";
import parse from "html-react-parser";
// import structureData from "./structureData";
import {
  fileStructureClickHandler,
  mapObjectRecursively,
} from "./StructureUtils";
import { getInitialSet } from "../../state/features/structure/structureSlice";
import { useSelector } from "react-redux";
// import { mapStructureRecursively } from "../../state/features/structure/utils/traversal";
import FolderStructure from "./FolderStructure";
// import { useTypedSelector, useTypedDispatch } from '../../state/hooks';

const Structure = forwardRef<any>((props, fileSysRef) => {
  // const fileSysRef = useRef<HTMLDivElement>(null);
  // const count = useTypedSelector((state) => state.counter.value)
  // const dispatch = useTypedDispatch()
  const structureData = useSelector(getInitialSet);
  // const structure = mapStructureRecursively(structureData);

  useEffect(() => {
    console.log("STRUCT", structureData)
  }, [structureData]);

  return (
    <div
      className="pl-1 pr-2"
      ref={fileSysRef}
      // onClick={(e) => fileStructureClickHandler(e, fileSysRef)}
    >
      <FolderStructure data={structureData}/>
      {/* {structure.map((item) => item)} */}
    </div>
  );
});

export default Structure;

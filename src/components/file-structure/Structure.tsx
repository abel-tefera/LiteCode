import React, { useRef, forwardRef, PropsWithRef } from "react";
import "../../styles/structure.css";
import parse from "html-react-parser";
import structureData from "./structureData";
import { fileStructureClickHandler, mapObjectRecursively } from "./StructureUtils";
// import { useTypedSelector, useTypedDispatch } from '../../state/hooks';

const Structure = forwardRef<any>((props, fileSysRef) => {
  // const fileSysRef = useRef<HTMLDivElement>(null);
  // const count = useTypedSelector((state) => state.counter.value)
  // const dispatch = useTypedDispatch()

  return (
    <div
      className="file-sys-container custom-scrollbar-2"
      ref={fileSysRef}
      onClick={(e) => fileStructureClickHandler(e, fileSysRef)}
    >
      {parse(mapObjectRecursively(structureData))}
    </div>
  );
});

export default Structure;

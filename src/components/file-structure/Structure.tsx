import React, { useRef, forwardRef, PropsWithRef, useEffect } from "react";
import "../../styles/structure.css";
import parse from "html-react-parser";
// import structureData from "./structureData";
import {
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

  useOutsideAlerter(fileSysRef, () => {
    dispatch(setSelected({ id: null }));
  });

  return (
    <div
      className="pl-1 pr-2"
      ref={fileSysRef}
      // onClick={(e) => fileStructureClickHandler(e, fileSysRef)}
    >
      <FolderStructure data={structureData} />
    </div>
  );
});

export default Structure;

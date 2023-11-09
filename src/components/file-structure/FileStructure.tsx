import React from "react";
import { trimName } from "./StructureUtils";

interface FileStructureProps {
  fileName: string;
  // depth: number;
  logo: string;
  // nested: boolean;
}

const FileStructure: React.FC<FileStructureProps> = ({
  fileName,
  // depth,
  logo,
  // nested,
}) => {
  return (
    <div
      // className={`file clickable measurable span-text ${
      //   nested && depth !== 0 && `not-seen`
      // } ${nested && `parent-collapsed`}`}
    >
      <span>
        <span></span>
        <span>{trimName(fileName, true)}</span>
      </span>
    </div>
  );
};

export default FileStructure;

import React from "react";
import downArrowLogo from "../../assets/left-arrow.svg";
import newFileIcon from "../../assets/new-file.svg";
import newFolderIcon from "../../assets/new-folder.svg";
import downloadIcon from "../../assets/download.svg";

import { Tooltip } from "react-tooltip";

const FileActions = () => {
  return (
    <div className="flex flex-col items-start my-2 px-2">
      <input
        placeholder="Search"
        className="self-center rounded-lg w-full bg-dark-bg-2 p-2 hover:bg-dark-hover active:outline-none focus:outline-none mb-2"
      />
      <div className="flex flex-row items-center mt-2 w-full select-none">
        <img
          src={downArrowLogo}
          className="w-3 h-3 mr-2 -rotate-90"
          alt="Down Arrow"
        />
        <span className="flex flex-row justify-between w-full">
          <span className="text-white">Files</span>
          <span className="flex items-center">
            <span className="text-white">
              <Tooltip id="new-file" />
              <img
                data-tooltip-id="new-file"
                data-tooltip-content={"New File"}
                src={newFileIcon}
                className="w-6 h-6 p-[2px] mx-[2px] cursor-pointer hover:bg-dark-hover rounded-sm"
                alt="New File"
              />
            </span>
            <span className="text-white">
              <Tooltip id="new-folder" />
              <img
                data-tooltip-id="new-folder"
                data-tooltip-content={"New Folder"}
                src={newFolderIcon}
                className="w-6 h-6 p-[2px] mx-[2px] cursor-pointer hover:bg-dark-hover rounded-sm"
                alt="New Folder"
              />
            </span>
            <span className="text-white">
              <Tooltip id="download-project" />
              <img
                data-tooltip-id="download-project"
                data-tooltip-content={"Download Project"}
                src={downloadIcon}
                className="w-6 h-6 p-[2px] mx-[2px] cursor-pointer hover:bg-dark-hover rounded-sm"
                alt="Download Project"
              />
            </span>
          </span>
        </span>
      </div>
    </div>
  );
};

export default FileActions;

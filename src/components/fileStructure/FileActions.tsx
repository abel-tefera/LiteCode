import React from "react";
import downArrowLogo from "../../assets/left-arrow.svg";
import newFileLogo from "../../assets/new-file.svg";
import { Tooltip } from "react-tooltip";

const FileActions = () => {
  return (
    <div className="flex flex-col items-start my-2 px-2">
      <input
        placeholder="Search"
        className="self-center rounded-lg bg-dark-bg-2 p-2 w-[160px] hover:bg-dark-hover active:outline-none focus:outline-none"
      />
      <div className="flex flex-row items-center mt-2 w-full">
        <img
          src={downArrowLogo}
          className="w-3 h-3 -rotate-90 mr-2"
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
                src={newFileLogo}
                className="w-5 h-5 mr-2 cursor-pointer"
                alt="New File"
              />
            </span>
            <span className="text-white">
              <Tooltip id="new-folder" />
              <img
                data-tooltip-id="new-folder"
                data-tooltip-content={"New Folder"}
                src={newFileLogo}
                className="w-5 h-5 mr-2 cursor-pointer"
                alt="New Folder"
              />
            </span>
          </span>
        </span>
      </div>
    </div>
  );
};

export default FileActions;

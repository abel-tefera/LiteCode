import React, { PropsWithChildren, useState, useRef, useEffect } from "react";
import downArrowLogo from "../../../assets/left-arrow.svg";
import newFileIcon from "../../../assets/new-file.svg";
import newFolderIcon from "../../../assets/new-folder.svg";
import downloadIcon from "../../../assets/download.svg";

import { Tooltip } from "react-tooltip";
import SearchContainer from "../search/SearchContainer";
import { useTypedDispatch, useTypedSelector } from "../../../state/hooks";
import {
  getSearchTerm,
  searchFocus,
  setSearchFocused,
} from "../../../state/features/structure/structureSlice";

interface FileActionProps {
  searchFiles: (searchTerm: string) => void;
  newFile: () => void;
  newFolder: () => void;
  download: () => void;
  isSearching: boolean;
}

const FileActions: React.FC<FileActionProps> = ({
  searchFiles,
  newFile,
  newFolder,
  download,
  isSearching,
}) => {
  const shouldSearchFocus = useTypedSelector(searchFocus);
  const search = useTypedSelector(getSearchTerm);
  const [searchTerm, setSearchTerm] = useState(search);
  const searchInputRef = useRef<any>(null);
  const dispatch = useTypedDispatch();
  useEffect(() => {
    if (!searchInputRef.current) return;
    if (shouldSearchFocus) {
      searchInputRef.current.focus();
      dispatch(setSearchFocused(false));
    }
  }, []);
  return (
    <div className="flex flex-col items-start mb-2 pl-2">
      <div className="w-full pr-2 mb-2">
        <input
          ref={searchInputRef}
          onInput={e => {
            const searchTerm = e.currentTarget.value;
            setSearchTerm(searchTerm);
            searchFiles(searchTerm);
          }}
          value={searchTerm}
          placeholder="Search"
          className="self-center rounded-lg w-full bg-dark-bg-2 p-2 hover:bg-dark-hover active:outline-none focus:outline-none focus:bg-dark-hover"
        />
      </div>

      {!isSearching ? (
        <div className="flex flex-row items-center mt-2 w-full select-none">
          <img
            src={downArrowLogo}
            className="w-3 h-3 mr-2 -rotate-90 self-center mb-[6px]"
            alt="Down Arrow"
          />
          <span className="flex flex-row justify-between w-full">
            <span className="text-white">Files</span>
            <span className="flex items-center">
              <span className="text-white">
                <Tooltip className="z-50" id="new-file" style={{ backgroundColor: "rgb(60 60 60)" }} />
                <button
                  type="button"
                  onClick={e => {
                    newFile();
                  }}>
                  <img
                    data-tooltip-id="new-file"
                    data-tooltip-content={"New File"}
                    src={newFileIcon}
                    className="w-6 h-6 p-[2px] mx-[2px] cursor-pointer hover:bg-dark-hover rounded-sm"
                    alt="New File"
                  />
                </button>
              </span>
              <span className="text-white">
                <Tooltip className="z-50" id="new-folder" style={{ backgroundColor: "rgb(60 60 60)" }}/>
                <button
                  type="button"
                  onClick={e => {
                    newFolder();
                  }}>
                  <img
                    data-tooltip-id="new-folder"
                    data-tooltip-content={"New Folder"}
                    src={newFolderIcon}
                    className="w-6 h-6 p-[2px] mx-[2px] cursor-pointer hover:bg-dark-hover rounded-sm"
                    alt="New Folder"
                  />
                </button>
              </span>
              <span className="text-white">
                <Tooltip className="z-50" id="download-project" style={{ backgroundColor: "rgb(60 60 60)" }} />
                <button
                  type="button"
                  onClick={e => {
                    download();
                  }}>
                  <img
                    data-tooltip-id="download-project"
                    data-tooltip-content={"Download Project"}
                    src={downloadIcon}
                    className="w-6 h-6 p-[2px] mx-[2px] cursor-pointer hover:bg-dark-hover rounded-sm"
                    alt="Download Project"
                  />
                </button>
              </span>
            </span>
          </span>
        </div>
      ) : (
        <div className="w-full h-[25rem] custom-scrollbar-3 overflow-y-auto">
          <SearchContainer />
        </div>
      )}
    </div>
  );
};

export default FileActions;

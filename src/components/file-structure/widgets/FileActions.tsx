import React, { PropsWithChildren, useState, useRef, useEffect } from 'react';
import downArrowLogo from '../../../../public/left-arrow.svg';
import newFileIcon from '../../../../public/new-file.svg';
import newFolderIcon from '../../../../public/new-folder.svg';
import downloadIcon from '../../../../public/download.svg';

import { Tooltip } from 'react-tooltip';
import SearchContainer from '../search/SearchContainer';

interface FileActionProps {
  newFile: () => void;
  newFolder: () => void;
  download: () => void;
}

const FileActions: React.FC<FileActionProps> = ({
  newFile,
  newFolder,
  download,
}) => {
  return (
      <div className="mt-2 flex w-full select-none flex-row items-center">
        <img
          src={downArrowLogo.src}
          className="mb-[6px] mr-2 h-3 w-3 -rotate-90 self-center"
          alt="Down Arrow"
        />
        <span className="flex w-full flex-row justify-between">
          <span className="text-white">Files</span>
          <span className="flex items-center">
            <span className="text-white">
              <Tooltip
                className="z-50"
                id="new-file"
                style={{ backgroundColor: 'rgb(60 60 60)' }}
              />
              <button
                type="button"
                onClick={(e) => {
                  newFile();
                }}
              >
                <img
                  data-tooltip-id="new-file"
                  data-tooltip-content={'New File'}
                  src={newFileIcon.src}
                  className="mx-[2px] h-6 w-6 cursor-pointer rounded-sm p-[2px] hover:bg-dark-hover"
                  alt="New File"
                />
              </button>
            </span>
            <span className="text-white">
              <Tooltip
                className="z-50"
                id="new-folder"
                style={{ backgroundColor: 'rgb(60 60 60)' }}
              />
              <button
                type="button"
                onClick={(e) => {
                  newFolder();
                }}
              >
                <img
                  data-tooltip-id="new-folder"
                  data-tooltip-content={'New Folder'}
                  src={newFolderIcon.src}
                  className="mx-[2px] h-6 w-6 cursor-pointer rounded-sm p-[2px] hover:bg-dark-hover"
                  alt="New Folder"
                />
              </button>
            </span>
            <span className="text-white">
              <Tooltip
                className="z-50"
                id="download-project"
                style={{ backgroundColor: 'rgb(60 60 60)' }}
              />
              <button
                type="button"
                onClick={(e) => {
                  download();
                }}
              >
                <img
                  data-tooltip-id="download-project"
                  data-tooltip-content={'Download Project'}
                  src={downloadIcon.src}
                  className="mx-[2px] h-6 w-6 cursor-pointer rounded-sm p-[2px] hover:bg-dark-hover"
                  alt="Download Project"
                />
              </button>
            </span>
          </span>
        </span>
      </div>
  );
};

export default FileActions;

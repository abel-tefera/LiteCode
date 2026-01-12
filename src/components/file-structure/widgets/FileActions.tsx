import { useRef } from 'react';
import { Tooltip } from 'react-tooltip';
import useOutsideAlerter from '../../../hooks/useOutsideAlerter';

interface FileActionProps {
  newFile: () => void;
  newFolder: () => void;
  download: () => void;
  collapseArea: () => void;
  collapsed: boolean;
}

const FileActions = ({
  newFile,
  newFolder,
  download,
  collapseArea,
  collapsed,
}: FileActionProps) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useOutsideAlerter(containerRef, () => {
    // collapseArea(true);
    const hr = document.querySelector('.left-wrapper-hr');
    hr?.classList.add('border-t-slate-600');
    hr?.classList.remove('border-t-transparent');
    containerRef.current?.classList.remove('border-vscode-blue');
  });

  return (
    <div
      ref={containerRef}
      onClick={() => {
        const hr = document.querySelector('.left-wrapper-hr');
        hr?.classList.remove('border-t-slate-600');
        hr?.classList.add('border-t-transparent');
        containerRef.current?.classList.add('border-vscode-blue');
        collapseArea();
      }}
      className="flex w-full cursor-pointer select-none flex-row items-center border border-transparent px-1 pt-1 transition-[border-color]"
    >
      <img
        src="/left-arrow.svg"
        className={`${
          !collapsed ? 'rotate-[270deg]' : 'rotate-180'
        } mb-1 mr-2 h-3 w-3 self-center transition-transform`}
        alt="Down Arrow"
      />
      <span className="flex w-full flex-row justify-between">
        <span className="text-center text-white">Files</span>
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
                e.stopPropagation();
                newFile();
              }}
              className="mr-[2px] cursor-pointer rounded-sm p-[2px] hover:bg-dark-hover "
            >
              <img
                data-tooltip-id="new-file"
                data-tooltip-content={'New File'}
                src="/new-file.svg"
                className="h-5 w-5"
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
                e.stopPropagation();
                newFolder();
              }}
              className="mx-[2px] cursor-pointer rounded-sm p-[2px] hover:bg-dark-hover "
            >
              <img
                data-tooltip-id="new-folder"
                data-tooltip-content={'New Folder'}
                src="/new-folder.svg"
                className="h-5 w-5"
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
                e.stopPropagation();
                download();
              }}
              className="ml-[2px] cursor-pointer rounded-sm p-[2px] hover:bg-dark-hover "
            >
              <img
                data-tooltip-id="download-project"
                data-tooltip-content={'Download Project'}
                src="/download.svg"
                className="h-5 w-5"
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

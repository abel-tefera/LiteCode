import React, { useRef } from "react";
import useOutsideAlerter from "../../hooks/useOutsideAlerter";

interface DialogProps {
  close: (show: boolean) => void;
}

const Dialog: React.FC<DialogProps> = ({ close }) => {
  const dialogRef = useRef<HTMLDivElement>(null);
  useOutsideAlerter(dialogRef, close);
  return (
    <div className="absolute top-0 z-50 flex w-full h-full justify-start items-start transition-all">
      <div
        ref={dialogRef}
        className="ml-[230px] mt-[275px] dialog-content bg-dark-bg p-4 rounded-lg flex flex-col my-2 h-fit"
      >
        <div className="text-lg my-2 w-72 select-none text-white">
          Are you sure you want to delete this file?
        </div>
        <div className="flex justify-evenly my-2">
          <button
            onClick={() => close(false)}
            className="bg-red-600 hover:bg-red-500 text-white px-4 py-2 rounded-lg transition-colors"
          >
            Delete
          </button>
          <button
            onClick={() => close(false)}
            className="text-white px-4 py-2 rounded-lg bg-slate-600 hover:bg-slate-500 transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default Dialog;

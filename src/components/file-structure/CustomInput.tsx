import React, { useState, useRef } from "react";
import newFileIcon from "../../assets/new-file.png";
import useOutsideAlerter from "../../hooks/useOutsideAlerter";

interface CustomInputProps {
  closeCallback: React.Dispatch<React.SetStateAction<boolean>>;
  padding: number;
}

const CustomInput: React.FC<CustomInputProps> = ({
  closeCallback,
  padding,
}) => {
  const [value, setValue] = useState("");
  const inputRef = useRef<HTMLDivElement>(null);

  useOutsideAlerter(inputRef, closeCallback);

  return (
    <div className={`py-1 bg-dark-bg w-full`} ref={inputRef}>
      <div className={`flex`} style={{paddingLeft: `${padding + 16}px`}}>
        <img
          className="w-5 h-5 self-center"
          src={newFileIcon}
          alt="new file icon"
        />
        <input
          className="border w-32 border-dark-bg focus:border-cyan-500 bg-monaco-color text-white ml-1 focus:outline-none"
          value={value}
          autoFocus
          onChange={(e) => setValue(e.target.value)}
        />
      </div>
    </div>
  );
};

export default CustomInput;

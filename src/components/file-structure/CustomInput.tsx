import React, { useState, useRef } from "react";
import newFileIcon from "../../assets/new-file.png";
import useOutsideAlerter from "../../hooks/useOutsideAlerter";

interface CustomInputProps {
  closeCallback: React.Dispatch<React.SetStateAction<boolean>>;
  submit: (value: string) => void;
  padding: number;
}

const CustomInput: React.FC<CustomInputProps> = ({
  closeCallback,
  submit,
  padding,
}) => {
  const [value, setValue] = useState("");
  const inputRef = useRef<HTMLDivElement>(null);
  const [error, setError] = useState(true);

  useOutsideAlerter(inputRef, closeCallback);

  return (
  <div
      className={`py-1 bg-dark-bg relative`}
      ref={inputRef}
      style={{ marginLeft: `${padding + 16}px`, wordWrap: "break-word" }}
    >
      <div className={`flex`}>
        <img
          className="w-5 h-5 self-center"
          src={newFileIcon}
          alt="new file icon"
        />
        <input
          className={`border w-32 border-dark-bg bg-monaco-color text-white ml-1 focus:outline-none ${
            error ? "focus:border-red-500" : "focus:border-cyan-500"
          }`}
          value={value}
          autoFocus
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              submit(value);
            }
          }}
        />
      </div>
      {error && (
        <div className="absolute w-32 flex items-start p-1 bg-red-400" style={{whiteSpace: "pre-wrap", marginLeft: `24px`}}>
          You have an error somewhere in your code please fix
        </div>
      )}
    </div>
  );
};

export default CustomInput;

import React, { useState, useRef, useEffect } from "react";
import newFileIcon from "../../assets/new-file.png";
import useOutsideAlerter from "../../hooks/useOutsideAlerter";
import jsLogo from "../../assets/js.svg";
import cssLogo from "../../assets/css.svg";
import mdLogo from "../../assets/readme.png";
import jsxLogo from "../../assets/jsx.svg";

interface CustomInputProps {
  closeCallback: React.Dispatch<React.SetStateAction<boolean>>;
  submit: (value: string) => void;
  padding: number;
  show: boolean | undefined;
  type: "file" | "folder" | "";
  container: HTMLDivElement | null;
}

const CustomInput: React.FC<CustomInputProps> = ({
  closeCallback,
  submit,
  padding,
  show,
  type,
  container,
}) => {
  const [value, setValue] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const errorRef = useRef<HTMLDivElement>(null);

  const [error, setError] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [extension, setExtension] = useState("");
  const [logo, setLogo] = useState(newFileIcon);
  const [position, setPosition] = useState<"top" | "bottom">("bottom");

  const direction = (
    ele: HTMLElement,
    container: HTMLDivElement | null
  ): 'top' | 'bottom' | '' => {
    if (!container) return '';
    const eleTop = ele.offsetTop;
    
    const containerTop = container.scrollTop;
    let pos = containerTop;
    if (containerTop > 450) {
      pos = containerTop % 450
    }

    if (pos >= 100 && pos <= 195){
      return 'top'
    } else if (pos < 100 || pos > 195){
      return 'bottom'
    }


    return ''
  };

  useEffect(() => {
    if (!errorRef.current || !error || errorMessage === "" || !container)
      return;
    const changeDirection = direction(errorRef.current, container);
    if (changeDirection !== '' && changeDirection !== position) {
      if (position === "top") {
        setPosition("bottom");
      } else if (position === "bottom") {
        setPosition("top");
      }
    }
  }, [error, errorMessage, container]);

  useOutsideAlerter(containerRef, (e: boolean) => {
    if (!error && value.length > 0) {
      submit(value);
    }
    closeCallback(e);
  });

  useEffect(() => {
    if (!inputRef.current) return;
    setTimeout(() => {
      inputRef.current?.focus();
    }, 0);
  }, [show]);

  const validate = () => {
    // const regexp = new RegExp(/^(.*?)(\.[^.]*)?$/);
    const regex = /^([^\\]*)\.(\w+)$/;
    const regexFileName =
      /^[a-zA-Z0-9](?:[a-zA-Z0-9 ._-]*[a-zA-Z0-9])?\.[a-zA-Z0-9_-]+$/;

    const isValid = value.match(regexFileName);
    const matches = value.match(regex);
    // const matches = value.match(regex);

    if (isValid && matches) {
      const validFiles = ["js", "jsx", "css", "md"];

      const filename = matches[1];
      const extension = matches[2];
      setExtension(extension);
      if (validFiles.includes(extension)) {
        switch (extension) {
          case "js":
            setLogo(jsLogo);
            break;
          case "css":
            setLogo(cssLogo);
            break;
          case "jsx":
            setLogo(jsxLogo);
            break;
          case "md":
            setLogo(mdLogo);
            break;
        }
        setError(false);
        setErrorMessage("");
      } else if (extension !== "") {
        setError(true);
        setLogo(newFileIcon);
        setErrorMessage("File type is not supported");
      }
    } else if (extension !== "") {
      setError(true);
      setLogo(newFileIcon);
      setErrorMessage("Invalid file format");
    } else {
      setError(true);
    }
  };

  useEffect(() => {
    // if (value.length > 3) {
    //   setError(true)
    // } else {
    //   setError(false)
    // }
    if (type === "file") {
      validate();
    }
  }, [value, type]);

  return (
    <div
      className={`py-1 bg-dark-bg relative ${show ? "block" : "hidden"}`}
      ref={containerRef}
      style={{ marginLeft: `${padding + 14}px`, wordWrap: "break-word" }}
    >
      <div className={`flex flex-col`}>
        <div className="flex flex-row">
          <img
            className="w-4 h-4 mr-2 ml-[0.125rem] self-center"
            src={logo}
            alt="new file icon"
          />
          <input
            className={`border w-32 border-dark-bg bg-monaco-color text-white focus:outline-none ${
              error && errorMessage !== ""
                ? "focus:border-red-500"
                : "focus:border-cyan-500"
            }`}
            value={value}
            autoFocus
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                if (!error && value.length > 0) {
                  submit(value);
                }
              }
            }}
            ref={inputRef}
          />
        </div>

        {error && errorMessage !== "" && (
          <div
            ref={errorRef}
            className={`w-32 absolute flex items-start p-1 border border-red-500 bg-red-900 text-sm ${
              position !== "top" ? "top-8" : "bottom-8"
            }`}
            style={{ whiteSpace: "pre-wrap", marginLeft: `26px` }}
          >
            {errorMessage}
          </div>
        )}
      </div>
    </div>
  );
};

export default CustomInput;

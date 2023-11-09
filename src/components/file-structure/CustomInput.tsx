import React, { useState, useRef, useEffect } from "react";
import newFileIcon from "../../assets/new-file-colored.svg";
import useOutsideAlerter from "../../hooks/useOutsideAlerter";
import jsLogo from "../../assets/js.svg";
import cssLogo from "../../assets/css.svg";
import mdLogo from "../../assets/readme.svg";
import jsxLogo from "../../assets/jsx.svg";
import errorIcon from "../../assets/cross.png";
import addFolderIcon from "../../assets/folder.svg";
import renameIcon from "../../assets/rename.svg";

interface CustomInputProps {
  closeCallback: React.Dispatch<React.SetStateAction<boolean>>;
  submit: (value: string | false) => void;
  padding: number;
  show: boolean | undefined;
  item: {
    type: "file" | "folder" | "";
    rename: boolean;
  };
  container: HTMLDivElement | null;
}

const CustomInput: React.FC<CustomInputProps> = ({
  closeCallback,
  submit,
  padding,
  show,
  item,
  container,
}) => {
  const [value, setValue] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const errorRef = useRef<HTMLDivElement>(null);
  const [error, setError] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [extension, setExtension] = useState("");
  const [originalLogo, setOriginalLogo] = useState(
    item.rename ? renameIcon : item.type === "file" ? newFileIcon : addFolderIcon
  );
  const [logo, setLogo] = useState(originalLogo);

  const [position, setPosition] = useState<"top" | "bottom">("bottom");

  const direction = (
    container: HTMLDivElement | null
  ): "top" | "bottom" | "" => {
    if (!container) return "";
    if (!containerRef.current) return "";
    const containerTop = container.offsetTop;
    const containerScrollTop = container.scrollTop;

    const elementTop = containerRef.current.offsetTop;
    const elementRelativeTop = elementTop - containerTop;

    if (
      !(
        elementRelativeTop - containerScrollTop < 393 &&
        containerScrollTop < elementRelativeTop
      )
    ) {
      return "";
    } else if (elementRelativeTop - containerScrollTop < 196) {
      return "bottom";
    } else if (containerScrollTop - 196 < elementRelativeTop) {
      return "top";
    } else {
      return ""
    }
  };

  useEffect(() => {
    if (!errorRef.current || !error || errorMessage === "" || !container)
      return;
    const changeDirection = direction(container);
    if (changeDirection !== "" && changeDirection !== position) {
      setPosition(changeDirection);
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

  const validateFile = (preValidate: true | undefined) => {
    // const regexp = new RegExp(/^(.*?)(\.[^.]*)?$/);
    const regex = /^([^\\]*)\.(\w+)$/;
    const regexFileName =
      /^[a-zA-Z0-9](?:[a-zA-Z0-9 ._-]*[a-zA-Z0-9])?\.[a-zA-Z0-9_-]+$/;
    const lettersNumbersSymbols = /^[a-z0-9._]+$/i;

    const isValid = value.match(regexFileName);
    const matches = value.match(regex);
    const isLns = value.match(lettersNumbersSymbols);
    // const matches = value.match(regex);

    // console.log(isValid, matches, isLns);
    if (matches && isLns) {
      const validFiles = ["js", "jsx", "css", "md"];

      const filename = matches[1];
      const ext = matches[2];
      setExtension(ext);
      if (isValid && isLns && validFiles.includes(ext)) {
        switch (ext) {
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
      } else if (extension !== "" || !isValid) {
        setError(true);
        setLogo(errorIcon);
        if (validFiles.includes(ext)) {
          setErrorMessage(
            "The file name cannot be empty. Please enter a valid file name."
          );
        } else {
          setErrorMessage(
            "This file type is not supported. Please choose a different file extension."
          );
        }
      }
    } else if (!isLns && value !== "") {
      setError(true);
      setLogo(errorIcon);
      setErrorMessage(
        `This name is not valid as a file name. Please choose a different name.`
      );
    } else if (preValidate) {
      setError(true);
      setLogo(errorIcon);
      setErrorMessage(
        "The file type cannot be empty. Please choose a valid file extension."
      );
    } else {
      setError(true);
      setLogo(originalLogo);
      setErrorMessage("");
    }
  };

  const validateFolder = () => {
    const regex = /^[\w\s ']{1,}$/g;
    const isValid = value.match(regex);

    if (isValid || value === "") {
      setError(false);
      setErrorMessage("");
      setLogo(originalLogo)
    } else {
      setError(true);
      setLogo(errorIcon);
      setErrorMessage(
        `This name is not valid as a folder name. Please choose a different name.`
      );
    }
  };
  const validate = (preValidate: true | undefined) => {
    

    if (item.type === "file") {
      validateFile(preValidate);
    } else if (item.type === "folder") {
      validateFolder();
    }
  };

  useEffect(() => {
    validate(undefined);
  }, [value]);

  return (
    <div
      className={`py-1 relative ${show ? "block" : "hidden"}`}
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
            className={`border w-[80%] max-w-[10rem] border-monaco-color bg-monaco-color text-white focus:outline-none ${
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
                } else if (value.length === 0) {
                  setError(true);
                  setLogo(errorIcon)
                  setErrorMessage(
                    `The ${item.type} name cannot be empty. Please enter a valid name.`
                  );
                } else {
                  validate(true);
                }
              } else if (e.key === "Escape") {
                submit(false);
              }
            }}
            ref={inputRef}
          />
        </div>

        {error && errorMessage !== "" && (
          <div
            ref={errorRef}
            className={`w-[80%] max-w-[10rem] absolute flex items-start p-1 border border-red-500 bg-red-900 text-sm ${
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

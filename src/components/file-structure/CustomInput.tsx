import React, { useState, useRef, useEffect } from "react";
import useOutsideAlerter from "../../hooks/useOutsideAlerter";

const newFileIcon = "new-file-logo";
const jsLogo = "js-logo";
const cssLogo = "css-logo";
const mdLogo = "readme-logo";
const jsxLogo = "jsx-logo";
const errorIcon = "error-logo";
const addFolderIcon = "closed-folder";
const renameIcon = "rename-logo";

interface CustomInputProps {
  closeCallback: React.Dispatch<React.SetStateAction<boolean>>;
  submit: (value: string | false) => void;
  padding: number;
  show: boolean | undefined;
  item: {
    type: "file" | "folder" | "";
    rename: any;
  };
  container: HTMLDivElement | null;
  existingItems: any[];
}

const CustomInput: React.FC<CustomInputProps> = ({
  closeCallback,
  submit,
  padding,
  show,
  item,
  container,
  existingItems,
}) => {
  const [value, setValue] = useState(item.rename ? item.rename.name : "");
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const errorRef = useRef<HTMLDivElement>(null);
  const [error, setError] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [extension, setExtension] = useState("");
  const originalLogo = item.rename
    ? renameIcon
    : item.type === "file"
    ? newFileIcon
    : addFolderIcon;
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
      return "";
    }
  };

  useEffect(() => {
    if (!errorRef.current || !error || errorMessage === "" || !container)
      return;
    const changeDirection = direction(container);
    if (changeDirection !== "" && changeDirection !== position) {
      setPosition(changeDirection);
    }
  }, [error, errorMessage, container, position]);

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
      if (item.rename) {
        const idx = item.rename.name.lastIndexOf(".");
        inputRef.current?.select();
        if (idx !== -1) {
          inputRef.current?.setSelectionRange(0, idx);
        }
      }
    }, 0);
  }, [show, item.rename]);

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
        for (let { name, type } of existingItems) {
          if (
            name === value &&
            type === item.type &&
            name.split(".").reverse()[0] === ext
          ) {
            setError(true);
            setLogo(errorIcon);
            setErrorMessage(
              `A file with this name already exists in this directory. Please choose a different name.`
            );
            return;
          }
        }
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
      for (let { name, type } of existingItems) {
        if (name === value && type === "folder") {
          setError(true);
          setLogo(errorIcon);
          setErrorMessage(
            `A folder with this name already exists. Please choose a different name.`
          );
          return;
        }
      }
      setError(false);
      setErrorMessage("");
      setLogo(originalLogo);
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

  // useEffect(() => {
  //   if (!containerRef.current) return;
  //   console.log("STARTED");
  //   return () => {
  //     console.log("ENDED");
  //   };
  // }, []);

  return (
    <div
      className={`py-[0.32rem] ${show ? "block" : "hidden"} ${
        padding === 0 ? "mx-1 pr-1 pl-[0.3rem]" : "pl-[1.3rem]"
      }`}
      ref={containerRef}
      style={{ wordWrap: "break-word" }}
    >
      <div className="flex flex-row">
        {/* <img
          className="w-4 h-4 self-center"
          src={logo}
          alt="new file icon"
        /> */}
        <span className={`span-logo ml-[3px] ${logo} w-[14px] mr-[6px]`}>
          &nbsp;
        </span>
        <div className="flex mx-1 relative flex-col w-[80%] max-w-[10rem]">
          <input
            className={`outline outline-monaco-color w-full bg-monaco-color text-white ${
              error && errorMessage !== ""
                ? "focus:outline-red-500"
                : "focus:outline-cyan-500"
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
                  setLogo(errorIcon);
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

          {error && errorMessage !== "" && (
            <div
              ref={errorRef}
              className={`w-fit absolute flex items-start p-1 border border-red-500 bg-red-900 text-sm ${
                position !== "top" ? "top-8" : "bottom-8"
              }`}
            >
              {errorMessage}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CustomInput;

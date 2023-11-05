import React, { useRef } from "react";
import useOutsideAlerter from "../hooks/useOutsideAlerter";

// @ts-ignore
const MenuContext = ({ top, left, clicked, setClicked }) => {
  const contextRef = useRef(null);
  useOutsideAlerter(contextRef, setClicked);

  const actions = [
    {
      title: "New File",
      handler: () => {},
    },
    {
      title: "New Folder",
      handler: () => {},
    },
    {
      type: "hr",
    },
    {
      title: "Cut",
      handler: () => {},
    },
    {
      title: "Copy",
      handler: () => {},
    },
    {
      title: "Paste",
      handler: () => {},
    },
    {
      type: "hr",
    },
    {
      title: "Rename",
      handler: () => {},
    },
    {
      title: "Delete",
      handler: () => {},
    },
  ]

  return (
    <div
      ref={contextRef}
      className={`absolute bg-monaco-color rounded-md px-1 py-2 w-48 box-border text-sm ${
        clicked ? `flex` : `hidden`
      }`}
      style={{ top: `${top}px`, left: `${left}px` }}
    >
      <ul className="w-full">
        {
          actions.map((action, index) => {
            if (action.type === "hr") {
              return <hr key={index} className="my-2 border-t border-t-zinc-600" />
            } else {
              return <li key={index} className="hover:bg-hover-blue rounded-md px-7 py-1 cursor-pointer">
                <span className="select-none">{action.title}</span>
                </li>
            }
          })
        }
      </ul>
    </div>
  );
};

export default MenuContext;

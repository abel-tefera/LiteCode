import React, { useRef } from "react";
import useOutsideAlerter from "../../hooks/useOutsideAlerter";

interface MenuContextProps {
  top: number;
  left: number;
  clicked: boolean;
  setClicked: React.Dispatch<React.SetStateAction<boolean>>;
  actions: (
    | {
        title: string;
        handler: () => void;
        type?: undefined;
      }
    | {
        type: string;
        handler: () => void;
        title?: undefined;
      }
  )[];
}

const MenuContext: React.FC<MenuContextProps> = ({
  top,
  left,
  clicked,
  setClicked,
  actions,
}) => {
  const contextRef = useRef<HTMLDivElement>(null);
  useOutsideAlerter(contextRef, setClicked);

  return (
    <div
      ref={contextRef}
      className={`absolute bg-monaco-color rounded-md px-1 py-2 w-48 box-border text-sm ${
        clicked ? `flex` : `hidden`
      }`}
      style={{ top: `${top}px`, left: `${left}px` }}
    >
      <ul className="w-full">
        {actions.map((action, index) => {
          if (action.type === "hr") {
            return (
              <hr key={index} className="my-2 border-t border-t-zinc-600" />
            );
          } else {
            return (
              <li
                key={index}
                onClick={() => {
                  action.handler();
                  setClicked(false);
                }}
                className="hover:bg-hover-blue rounded-md px-7 py-1 cursor-pointer"
              >
                <span className="select-none">{action.title}</span>
              </li>
            );
          }
        })}
      </ul>
    </div>
  );
};

export default MenuContext;

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
        disabled: boolean;
        type?: undefined;
      }
    | {
        type: string;
        handler: () => void;
        title?: undefined;
        disabled?: undefined;
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
                  if (!action.disabled) {
                    action.handler();
                    setClicked(false);
                  }
                }}
                className={`rounded-md px-7 py-1 ${
                  !action.disabled
                    ? "hover:bg-hover-blue cursor-pointer"
                    : "text-zinc-500"
                } `}
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

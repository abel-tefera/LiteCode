import React, { useEffect, useState, useRef } from "react";
import classNames from "classnames";
import {
  ChevronDoubleLeftIcon,
  ChevronDoubleRightIcon,
} from "@heroicons/react/24/outline";
import Structure from "../file-structure/Structure";
import FileActions from "../file-structure/FileActions";
import logo from "../../assets/logo-2.png";
import MenuContext from "../menus/MenuContext";
import CustomInput from "../file-structure/CustomInput";
import { createPortal } from "react-dom";
import { collapseOrExpand } from "../file-structure/StructureUtils";
import { getStyle } from "../../utils/getStyle";

type SidebarProps = {
  collapsed: boolean;
  setCollapsed(collapsed: boolean): void;
  shown: boolean;
};

const Sidebar: React.FC<SidebarProps> = ({
  collapsed,
  shown,
  setCollapsed,
}) => {
  const [visibility, setVisibility] = useState(collapsed);
  const Icon = collapsed ? ChevronDoubleRightIcon : ChevronDoubleLeftIcon;

  const [clicked, setClicked] = useState(false);
  const clickedRef = useRef<HTMLElement>();
  const [points, setPoints] = useState({
    x: 0,
    y: 0,
  });

  const structureRef = useRef<HTMLDivElement>(null);
  const [showInput, setShowInput] = useState(false);
  const [inputPadding, setInputPadding] = useState(0);

  const actions = [
    {
      title: "New File",
      handler: () => {
        if (clickedRef.current == null) return;
        // console.log("XXX", structureRef)
        // clickedRef.current.parentElement?.classList.add(
        //   "folder-container-reverse"
        // );
        const padding = getStyle(
          clickedRef.current.getElementsByClassName(
            "transformer"
          )[0] as HTMLElement,
          "padding-left"
        );
        const type = clickedRef.current.classList.contains("folder")
          ? "folder"
          : "file";
        if (type === "folder") {
          setInputPadding(parseInt(padding));
        } else {
          setInputPadding(parseInt(padding) - 16);
        }
        collapseOrExpand(clickedRef.current, structureRef, false);
        setShowInput(true);
      },
    },
    {
      title: "New Folder",
      handler: () => {},
    },
    {
      type: "hr",
      handler: () => {},
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
      handler: () => {},
    },
    {
      title: "Rename",
      handler: () => {},
    },
    {
      title: "Delete",
      handler: () => {},
    },
  ];

  useEffect(() => {
    const timeout = setTimeout(() => {
      setVisibility(!collapsed);
    }, 300);

    return () => clearTimeout(timeout);
  }, [collapsed]);

  const contextHandler = (e: React.MouseEvent<HTMLElement, MouseEvent>) => {
    e.preventDefault();
    // if (fileSysRef.current == null) return;
    const elem = e.target as HTMLElement;
    clickedRef.current = elem;
    // console.log("XXXX", clickedRef.current.parentElement);
    // const type = elem.classList.contains("folder") ? "folder" : "file";
    // if (elem !== event.currentTarget) {
    //   if (type === "file") {
    //     alert("File accessed");
    //   } else if (type === "folder") {
    // @ts-ignore
    if (e.clientY > 300) {
      setPoints({
        x: e.clientY - 265,
        y: e.clientX,
      });
    } else {
      setPoints({
        x: e.clientY,
        y: e.clientX,
      });
    }

    setClicked(true);
    // console.log("Right Click", points.x, points.y, e.target.innerHTML);
  };

  return (
    <div
      className={classNames({
        "fixed bg-dark-bg md:static md:translate-x-0 z-20 ": true,
        "transition-all duration-300 ease-in-out": true,
        "w-[250px] max-w-[250px] ": !collapsed,
        "w-20 min-w-[80px]": collapsed,
        "-translate-x-full ": !shown,
      })}
    >
      <div className="h-[18px]">&nbsp;</div>
      <div
        className={classNames({
          "flex flex-col justify-between h-[95vh] sticky inset-0 w-full": true,
        })}
      >
        <div
          className={classNames({
            "flex items-center mb-[7px]": true,
            "px-4 py-2 justify-between": !collapsed,
            "py-2 justify-center": collapsed,
          })}
        >
          {!collapsed && (
            <img src={logo} alt="Logo" className="w-[7.5rem] select-none" />
          )}
          <button
            className="grid place-content-center hover:bg-dark-hover w-10 h-10 rounded-full opacity-0 md:opacity-100"
            onClick={() => setCollapsed(!collapsed)}
          >
            <Icon className="w-5 h-5" />
          </button>
        </div>
        <nav
          className="flex select-none flex-col flex-grow"
          onContextMenu={contextHandler}
        >
          <div className={!collapsed && visibility ? "block" : "display-none"}>
            <FileActions />
            <Structure ref={structureRef} />
          </div>
        </nav>
        <MenuContext
          top={points.x}
          left={points.y}
          clicked={clicked}
          setClicked={setClicked}
          actions={actions}
        />
        {clickedRef.current &&
          showInput &&
          createPortal(
            <CustomInput
              closeCallback={() => {
                // if (clickedRef.current) {
                //   clickedRef.current.parentElement?.classList.remove(
                //     "folder-container-reverse"
                //   );
                // }
                setShowInput(false);
              }}
              padding={inputPadding + 1}
            />,
            (() => {
              // const clickable =
              //   clickedRef.current.parentElement?.getElementsByClassName(
              //     "clickable"
              //   )[0] as HTMLElement;
              // console.log("ABC", clickable, clickedRef.current.parentElement);
              return clickedRef.current.parentElement as HTMLElement;
            })()
          )}

        {!collapsed && (
          <div className="ml-4 text-base" id="my-d">
            <div
              className={
                visibility
                  ? `inline-flex items-center -mb-2 select-none`
                  : `hidden`
              }
            >
              Developed by&nbsp;
              <a
                href="https://www.abeltb.xyz/"
                target="_blank"
                rel="noreferrer"
                className="font-medium text-blue-600 dark:text-blue-500 hover:underline"
              >
                Abel
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
export default Sidebar;

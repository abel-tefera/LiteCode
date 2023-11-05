import React, { useEffect, useRef, useState } from "react";
import classNames from "classnames";
import {
  ChevronDoubleLeftIcon,
  ChevronDoubleRightIcon,
} from "@heroicons/react/24/outline";
import Structure from "../fileStructure/Structure";
import FileActions from "../fileStructure/FileActions";
import logo from "../../assets/logo-2.png";
import MenuContext from "../MenuContext";

// add NavItem prop to component prop
type Props = {
  collapsed: boolean;
  setCollapsed(collapsed: boolean): void;
  shown: boolean;
};
const Sidebar = ({ collapsed, shown, setCollapsed }: Props) => {
  const [visibility, setVisibility] = useState(collapsed);
  const Icon = collapsed ? ChevronDoubleRightIcon : ChevronDoubleLeftIcon;

  const [clicked, setClicked] = useState(false);
  const [points, setPoints] = useState({
    x: 0,
    y: 0,
  });

  useEffect(() => {
    const timeout = setTimeout(() => {
      setVisibility(!collapsed);
    }, 300);

    return () => clearTimeout(timeout);
  }, [collapsed]);

  const contextHandler = (e: any) => {
    e.preventDefault(); // prevent the default behaviour when right clicked
    setPoints({
      x: e.clientY,
      y: e.clientX,
    });
    setClicked(true);
    // console.log("XXX", e);
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
        {/* logo and collapse button */}
        <div
          className={classNames({
            "flex items-center mb-[7px] transition-none": true,
            "px-4 py-2 justify-between": !collapsed,
            "py-2 justify-center": collapsed,
          })}
        >
          {!collapsed && (
            <span className={`text-lg`}>
              {collapsed && <>&nbsp;</>}
              <span className={!collapsed ? `block` : `hidden`}>
                <img src={logo} alt="Logo" className="w-[7.5rem]" />
              </span>
            </span>
          )}
          <button
            className="grid place-content-center hover:bg-dark-hover w-10 h-10 rounded-full opacity-0 md:opacity-100"
            onClick={() => setCollapsed(!collapsed)}
          >
            <Icon className="w-5 h-5" />
          </button>
        </div>
        <nav className="flex flex-col flex-grow" onContextMenu={contextHandler}>
          <div className={!collapsed && visibility ? "block" : "display-none"}>
            <FileActions />
            <Structure />
          </div>
        </nav>
        <MenuContext top={points.x} left={points.y} clicked={clicked} setClicked={setClicked} />

        {!collapsed && (
          <div className="ml-4 text-base">
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

import React, { useEffect, useRef, useState } from "react";
import classNames from "classnames";
import { defaultNavItems, NavItem } from "./defaultNavItems";
import {
  ChevronDoubleLeftIcon,
  ChevronDoubleRightIcon,
} from "@heroicons/react/24/outline";
import Structure from "../fileStructure/Structure";

// add NavItem prop to component prop
type Props = {
  collapsed: boolean;
  navItems?: NavItem[];
  setCollapsed(collapsed: boolean): void;
  shown: boolean;
};
const Sidebar = ({
  collapsed,
  navItems = defaultNavItems,
  shown,
  setCollapsed,
}: Props) => {
  const [visibility, setVisibility] = useState(collapsed);
  const Icon = collapsed ? ChevronDoubleRightIcon : ChevronDoubleLeftIcon;

  useEffect(() => {
    const timeout = setTimeout(() => {
      setVisibility(!collapsed);
    }, 300);

    return () => clearTimeout(timeout);
  }, [collapsed]);
  return (
    <div
      className={classNames({
        "fixed md:static md:translate-x-0 z-20": true,
        "transition-all duration-300 ease-in-out": true,
        "w-[180px]": !collapsed,
        "w-16": collapsed,
        "-translate-x-full": !shown,
      })}
    >
      <div
        className={classNames({
          "flex flex-col justify-between h-screen sticky inset-0 w-full": true,
        })}
      >
        {/* logo and collapse button */}
        <div
          className={classNames({
            "flex items-center border-b border-b-white transition-none": true,
            "p-4 justify-between": !collapsed,
            "py-4 justify-center": collapsed,
          })}
        >
          {!collapsed && (
            <span className={`text-lg`}>
              {!visibility && <>&nbsp;</>}
              <span className={visibility ? `block` : `hidden`}>
                LiteCode IDE
              </span>
            </span>
          )}
          <button
            className="grid place-content-center hover:bg-indigo-800 w-10 h-10 rounded-full opacity-0 md:opacity-100"
            onClick={() => setCollapsed(!collapsed)}
          >
            <Icon className="w-5 h-5" />
          </button>
        </div>
        <nav className="flex-grow">
          <div className={collapsed ? "display-none" : "block w-full"}>
            <Structure />
          </div>
        </nav>
        {!collapsed && (
          <div className="ml-4">
            <div className={visibility ? `block` : `hidden`}>
              Built by{" "}
              <a
                href="https://www.abeltb.xyz/"
                className="font-medium text-blue-600 dark:text-blue-500 hover:underline"
              >
                Abel
              </a>{" "}
              in 2023
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
export default Sidebar;

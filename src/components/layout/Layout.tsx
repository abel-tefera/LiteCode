import classNames from "classnames";
import React, { PropsWithChildren, useState } from "react";
import Navbar from "./Navbar";
import Sidebar from "./Sidebar";
const Layout = (props: PropsWithChildren) => {
  const [collapsed, setSidebarCollapsed] = useState(false);
  const [showSidebar, setShowSidebar] = useState(true);
  return (
    <div
      // className={classNames({
      //   "grid min-h-screen": true,
      //   "grid-cols-sidebar": !collapsed,
      //   "grid-cols-sidebar-collapsed": collapsed,
      //   "transition-[grid-template-columns] duration-300 ease-in-out": true,
      // })}
      className={classNames({
        "flex min-h-screen md:overflow-y-hidden": true,
        // "min-w-[200px]": !collapsed,
        // "min-w-[64px]": collapsed,
        // "transition-width duration-300 ease-in-out": true,
      })}
    >
      <Sidebar
        collapsed={collapsed}
        setCollapsed={setSidebarCollapsed}
        shown={showSidebar}
      />
      <div className="w-full">
        <Navbar onMenuButtonClick={() => setShowSidebar((prev) => !prev)} />
        {props.children}
      </div>
    </div>
  );
};

export default Layout;
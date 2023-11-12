import classNames from "classnames";
import React, { PropsWithChildren, useState, useEffect } from "react";
import Navbar from "./Navbar";
import Sidebar from "./Sidebar";
import { useDispatch } from "react-redux";
// import { normalizeState } from "../../state/features/structure/structureSlice";

const Layout: React.FC<PropsWithChildren> = (props) => {
  const [collapsed, setSidebarCollapsed] = useState(false);
  const [showSidebar, setShowSidebar] = useState(true);

  // const dispatch = useDispatch();

  // useEffect(() => {
  //   dispatch(normalizeState());
  // }, [dispatch]);

  return (
    <div
      className={classNames({
        "flex min-h-screen md:overflow-y-hidden": true,
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
import React from "react";
import { Bars3Icon } from "@heroicons/react/24/outline";
import classNames from "classnames";

type NavbarProps = {
  onMenuButtonClick(): void;
};

const Navbar: React.FC<NavbarProps> = (props) => {
  return (
    <nav
      className={classNames({
        "flex items-center": true,
        "w-screen md:w-full px-4 shadow-sm h-[18px] top-0 justify-end":
          true,
      })}
    >
      <div className="md:hidden z-10">
        <button onClick={props.onMenuButtonClick} className="inline-flex mt-[4.75rem]">
          <Bars3Icon className="h-6 w-6" />
        </button>
      </div>
    </nav>
  );
};

export default Navbar;

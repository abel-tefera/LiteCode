import React from "react";
import { Bars3Icon } from "@heroicons/react/24/outline";
import classNames from "classnames";
type Props = {
  /**
   * Allows the parent component to modify the state when the
   * menu button is clicked.
   */
  onMenuButtonClick(): void;
};
const Navbar = (props: Props) => {
  return (
    <nav
      className={classNames({
        // "flex items-center": true, // layout
        "w-screen md:w-full z-10 px-4 shadow-sm h-[18px] top-0 ": true, //positioning & styling
      })}
    >
      {/* <div className="font-bold text-lg">LiteCode IDE</div>
      <div className="flex-grow"></div>
      <button className="md:hidden" onClick={props.onMenuButtonClick}>
        <Bars3Icon className="h-6 w-6" />
      </button> */}
    </nav>
  );
};

export default Navbar;

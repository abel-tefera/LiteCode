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
        "flex items-center": true, // layout
        "w-screen md:w-full z-10 px-4 shadow-sm h-[18px] top-0 justify-end":
          true, //positioning & styling
      })}
    >
      <div className="md:hidden">
        <button onClick={props.onMenuButtonClick} className="inline-flex mt-20">
          <Bars3Icon className="h-6 w-6" />
        </button>
      </div>
    </nav>
  );
};

export default Navbar;

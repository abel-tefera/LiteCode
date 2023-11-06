import React, { useEffect } from "react";
import jsLogo from "../../assets/js.svg";
import cssLogo from "../../assets/css.svg";
import mdLogo from "../../assets/readme.png";
import jsxLogo from "../../assets/jsx.svg";

import cross from "../../assets/cross.svg";

interface TabProps {
  id: number;
  name: string;
  type: string;
  selected: boolean;
  onSelect: (id: number) => void;
}

const Tab: React.FC<TabProps> = ({ id, name, type, selected, onSelect }) => {
  const [logo, setLogo] = React.useState<string | null>();

  useEffect(() => {
    switch (type) {
      case "js":
        setLogo(jsLogo);
        break;
      case "css":
        setLogo(cssLogo);
        break;
      case "md":
        setLogo(mdLogo);
        break;
      case "jsx":
        setLogo(jsxLogo);
        break;
      default:
        setLogo(jsLogo);
        break;
    }
  }, [type]);
  
  return (
    <div
      onClick={() => onSelect(id)}
      className={`p-2 px-2 flex flex-row flex-shrink-0 cursor-pointer select-none items-center rounded-sm ${
        selected
          ? `bg-dark-hover border-t border-t-slate-200`
          : `hover:bg-dark-hover`
      }`}
    >
      <img src={logo ? logo : ''} alt="file-logo" className="w-4 h-4" />
      <span className="text-lg mx-2">{name}</span>
      <span className="self-start">
        <img
          src={cross}
          alt="close"
          className="h-3 w-3 cursor-pointer hover:opacity-30 align-baseline"
        />
      </span>
    </div>
  );
};

export default Tab;

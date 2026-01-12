import { useEffect, useState } from 'react';
import { getLogo } from '../file-structure/utils';

interface TabProps {
  id: string;
  name: string;
  type: string;
  selected: boolean;
  onSelect: (id: string) => void;
  onClose: (id: string) => void;
}

const Tab = ({ id, name, type, selected, onSelect, onClose }: TabProps) => {
  const fileType = name.substring(name.lastIndexOf('.') + 1);
  const [logo, setLogo] = useState<string>(getLogo(fileType));

  useEffect(() => {
    setLogo(getLogo(type));
  }, [type]);

  return (
    <div
      id={`tab-${id}`}
      onClick={() => {
        if (!selected) onSelect(id);
      }}
      className={`hover-show border-t transition-colors py-2 pl-3 pr-2 flex flex-row flex-shrink-0 cursor-pointer select-none items-center rounded-sm mx-[1px] ${
        selected
          ? 'bg-dark-hover border-t-slate-200'
          : 'hover:bg-slate-700 border-t-dark-bg'
      }`}
    >
      <span className={`span-logo w-4 h-4 ${logo}`}>&nbsp;</span>
      <span className="text-lg mx-2">{name}</span>
      <span className="self-start">
        <button
          type="button"
          className="show-on-hover transition-opacity"
          onClick={(e) => {
            e.stopPropagation();
            onClose(id);
          }}
        >
          <img
            src="/cross.svg"
            alt="close"
            className="transition-colors p-1 h-5 w-5 cursor-pointer hover:bg-slate-500 rounded-md align-baseline"
          />
        </button>
      </span>
    </div>
  );
};

export default Tab;

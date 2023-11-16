import React from "react";

interface BreadcrumbsProps {
  editorPath: string[];
}
const Breadcrumbs: React.FC<BreadcrumbsProps> = ({ editorPath }) => {
  return (
    <div className="flex flex-row items-center justify-start mb-3 mt-1">
      {editorPath.map((path, i) => (
        <div>
          <span
            className={`text-base text-zinc-300 ${
              i < editorPath.length - 1 &&
              "cursor-pointer hover:underline hover:text-blue-400"
            }`}
          >
            {path}
          </span>
          {i < editorPath.length - 1 && (
            <span className="text-base text-zinc-200 px-2">{`/`}</span>
          )}
        </div>
      ))}
    </div>
  );
};

export default Breadcrumbs;

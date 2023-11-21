import React from "react";

const Brand = () => {
  return (
    <div className="ml-2 text-base">
      <div className={`flex items-center select-none`}>
        Developed by&nbsp;
        <a
          href="https://www.abeltb.xyz/"
          target="_blank"
          rel="noreferrer"
          className="font-medium text-blue-600 dark:text-blue-500 hover:underline"
        >
          {" "}
          Abel
        </a>
      </div>
    </div>
  );
};

export default Brand;

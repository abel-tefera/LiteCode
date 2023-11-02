import React from "react";
import { ResizableBox } from "react-resizable";
import "./resizable.css";

interface ResizableProps {
  direction: "horizontal" | "vertical";
  children: React.ReactNode;
}

const Resizable: React.FC<ResizableProps> = ({ direction, children }) => {
  return (
    <ResizableBox
      className={`resize-horizontal`}
      width={window.innerWidth * 0.75}
      height={600}
      draggableOpts={{}}
      resizeHandles={["e"]}
      minConstraints={[window.innerWidth * 0.2, Infinity]} 
      maxConstraints={[window.innerWidth * 0.75, Infinity]}
    >
      {children}
    </ResizableBox>
  );
};

export default Resizable;

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
      width={200}
      height={200}
      draggableOpts={{}}
      resizeHandles={["s"]}
      minConstraints={[100, 100]}
      maxConstraints={[900, 900]}
    >
      {children}
    </ResizableBox>
  );
};

export default Resizable;

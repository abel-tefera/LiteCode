import React, { useEffect, useRef, useState } from "react";
import { ResizableBox } from "react-resizable";
import "../styles/resizable.css";
import throttle from "../utils/throttle";

interface ResizableProps {
  direction: "horizontal" | "vertical";
  children: React.ReactNode;
}

const Resizable: React.FC<ResizableProps> = ({ direction, children }) => {
  const [innerWidth, setInnerWidth] = useState(window.innerWidth);
  const [resizableWidth, setResizableWidth] = useState(
    window.innerWidth * 0.75
  );

  const containerRef = useRef<any>(null);

  const handleResize = throttle((e: any) => {
    const width = window.innerWidth;
    setInnerWidth(width);

    if (window.innerWidth * 0.75 < resizableWidth) {
      setResizableWidth(window.innerWidth * 0.75);
    }
  }, 1000);

  useEffect(() => {
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <div ref={containerRef}>
      <ResizableBox
        className={`resize-horizontal`}
        width={resizableWidth}
        height={600}
        draggableOpts={{}}
        resizeHandles={["e"]}
        minConstraints={[innerWidth * 0.2, Infinity]}
        maxConstraints={[innerWidth * 0.75, Infinity]}
        onResizeStop={(e: any, data: any) => {
          setResizableWidth(data.size.width);
        }}
      >
        {children}
      </ResizableBox>
    </div>
  );
};

export default Resizable;
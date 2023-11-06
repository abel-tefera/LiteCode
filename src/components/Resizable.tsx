import React, { useEffect, useRef, useState } from "react";
import { ResizableBox, ResizableBoxProps } from "react-resizable";
import "../styles/resizable.css";
import throttle from "../utils/throttle";

interface ResizableProps {
  direction: "horizontal" | "vertical";
  children: React.ReactNode;
}

const Resizable: React.FC<ResizableProps> = ({ direction, children }) => {
  let resizableProps: ResizableBoxProps;

  const [innerWidth, setInnerWidth] = useState(window.innerWidth);
  const [innerHeight, setInnerHeight] = useState(window.innerHeight);

  const [resizableWidth, setResizableWidth] = useState(window.innerWidth * 0.5);

  const containerRef = useRef<HTMLDivElement>(null);

  const handleResize = throttle((e: UIEvent) => {
    const width = window.innerWidth;
    const height = window.innerHeight;

    setInnerWidth(width);
    setInnerHeight(height);

    if (window.innerWidth * 0.65 < resizableWidth) {
      setResizableWidth(window.innerWidth * 0.65);
    }
  }, 500);

  useEffect(() => {
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  if (direction === "horizontal") {
    resizableProps = {
      className: `resize-horizontal`,
      width: resizableWidth,
      height: innerHeight * 0.8,
      resizeHandles: ["e"],
      minConstraints: [innerWidth * 0.2, Infinity],
      maxConstraints: [innerWidth * 0.65, Infinity],
      onResizeStop: (e, data) => {
        setResizableWidth(data.size.width);
      },
    };
  } else {
    resizableProps = {
      minConstraints: [Infinity, 24],
      maxConstraints: [Infinity, innerHeight * 0.9],
      height: 300,
      width: Infinity,
      resizeHandles: ["s"],
    };
  }

  return (
    <div ref={containerRef}>
      <ResizableBox {...resizableProps}>{children}</ResizableBox>
    </div>
  );
};

export default Resizable;

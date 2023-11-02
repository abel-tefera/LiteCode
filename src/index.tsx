import React from 'react';
import ReactDOM from "react-dom/client";
import App from "./App";
import 'bulmaswatch/superhero/bulmaswatch.min.css';
import './styles/index.css';

const root = ReactDOM.createRoot(
  document.getElementById("root") as HTMLElement
);
root.render(<App />);

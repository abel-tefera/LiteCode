import React from "react";
import CodeCell from "./components/CodeCell";
import TextEditor from "./components/TextEditor";
import { Provider } from "react-redux";
import {store} from './state';
import Layout from "./components/layout/Layout";

const App = () => {
  return (
    <Provider store={store}>
      <div className="App">
        <Layout />
        {/* <h1>XYZ Code</h1>
        <CodeCell /> */}
        {/* <TextEditor /> */}
      </div>
    </Provider>
  );
};
export default App;

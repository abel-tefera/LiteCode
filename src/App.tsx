import React from "react";
import CodeCell from "./components/editors/CodeCell";
import TextEditor from "./components/editors/TextEditor";
import { Provider } from "react-redux";
import { store } from "./state";
import Layout from "./components/layout/Layout";
import Structure from "./components/file-structure/Structure";
import Tabs from "./components/menus/Tabs";
import Dialog from "./components/menus/Dialog";

const App = () => {
  return (
    <Provider store={store}>
      <div className="App bg-dark-bg text-white font-roboto">
        <Layout>
          <Tabs />
          <CodeCell />
        </Layout>
        {/* <Structure /> */}
        {/* <h1>XYZ Code</h1>
        <CodeCell /> */}
        {/* <TextEditor /> */}
      </div>
    </Provider>
  );
};
export default App;

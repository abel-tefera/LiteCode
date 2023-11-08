import React from "react";
import CodeCell from "./components/editors/CodeCell";
import TextEditor from "./components/editors/TextEditor";
import { Provider } from "react-redux";
import Layout from "./components/layout/Layout";
import Structure from "./components/file-structure/Structure";
import Tabs from "./components/menus/Tabs";
import Dialog from "./components/menus/Dialog";
import { store } from "./state/store";

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

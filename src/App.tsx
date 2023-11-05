import React from "react";
import CodeCell from "./components/CodeCell";
import TextEditor from "./components/TextEditor";
import { Provider } from "react-redux";
import { store } from "./state";
import Layout from "./components/layout/Layout";
import Structure from "./components/fileStructure/Structure";
import Tabs from "./components/Tabs";

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

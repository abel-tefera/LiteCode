import React from "react";
import { Provider } from "react-redux";
import { persistor, store } from "./state/store";
import Main from "./components/Main";
import { PersistGate } from "redux-persist/integration/react";

const App = () => {
  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}></PersistGate>
      <div className="App bg-dark-bg text-white font-roboto flex flex-row">
        <div className="flex flex-col w-full h-screen">
          <Main />
        </div>
      </div>
    </Provider>
  );
};
export default App;

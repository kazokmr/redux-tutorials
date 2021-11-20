import React from "react";
import ReactDom from "react-dom";
import './index.css'
import store from "./app/store";
import {Provider} from "react-redux";
import {worker} from "./api/server";
import App from "./App";
import {extendedApiSlice} from "./features/users/usersSlice";

worker.start({onUnhandledRequest: "bypass"})

// User情報を検索する
store.dispatch(extendedApiSlice.endpoints.getUsers.initiate());

ReactDom.render(
  <React.StrictMode>
    <Provider store={store}>
      <App/>
    </Provider>
  </React.StrictMode>,
  document.getElementById("root")
);
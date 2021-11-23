import {applyMiddleware, createStore} from "redux";
import {composeWithDevTools} from "redux-devtools-extension";
import rootReducer from "./reducer";

const composedEnhancer = composeWithDevTools(
  applyMiddleware()
);

const store = createStore(rootReducer, composedEnhancer);

export default store;

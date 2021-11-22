import {compose, createStore} from "redux";
import rootReducer from "./reducer";
import {includeMeaningOfLife, sayHiOnDispatch} from "./exampleAddons/enhancers";

const composedEnhancer = compose(sayHiOnDispatch, includeMeaningOfLife);
const store = createStore(rootReducer, undefined, composedEnhancer);

export default store;
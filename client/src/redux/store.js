import { configureStore } from "@reduxjs/toolkit";
import {thunk} from "redux-thunk";
import rootReducer from "./modules";

const initialState = {};

const middleware = [thunk];

const store = configureStore({
  reducer: rootReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(middleware),
  devTools: process.env.NODE_ENV === 'development',
  preloadedState: initialState,
});

export default store;
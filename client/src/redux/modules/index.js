import { combineReducers } from "redux";
import users from "./users";
import alerts from "./alerts";
import admin from "./admin";
import employee from "./employee";
import preferences from "./preferences";
import leaves from "./leaves";
import news from "./news";
import reportIssues from "./reportIssues";
import swap from "./swap";
const rootReducer = combineReducers({
  users,
  alerts,
  admin,
  employee,
  preferences,
  leaves,
  news,
  reportIssues,
  swap,
});

export default rootReducer;

import { api, setAuthToken } from "../../utils";
import { showAlertMessage } from "./alerts";

const REGISTER_SUCCESS = "users/REGISTER_SUCCESS";
const REGISTER_FAIL = "users/REGISTER_FAIL";
const USER_LOADED = "users/USER_LOADED";
const USER_ERROR = "users/USER_ERROR";
const LOGIN_SUCCESS = "users/LOGIN_SUCCESS";
const UPDATE_OPEN_FOR_SWAP_SUCCESS = "users/UPDATE_OPEN_FOR_SWAP_SUCCESS";
const UPDATE_OPEN_FOR_SWAP_FAIL = "users/UPDATE_OPEN_FOR_SWAP_FAIL";
const LOGIN_FAIL = "users/LOGIN_FAIL";
const LOGOUT = "users/LOGOUT";

const FETCH_USERS_REQUEST = "users/FETCH_USERS_REQUEST";
const FETCH_USERS_SUCCESS = "users/FETCH_USERS_SUCCESS";
const FETCH_USERS_FAILURE = "users/FETCH_USERS_FAILURE";

// Action Creators
export const fetchUsersRequest = () => ({ type: FETCH_USERS_REQUEST });
export const fetchUsersSuccess = (users) => ({ type: FETCH_USERS_SUCCESS, payload: users });
export const fetchUsersFailure = (error) => ({ type: FETCH_USERS_FAILURE, payload: error });

// Thunk Action to fetch users
export const fetchUsers = () => async (dispatch) => {
  dispatch(fetchUsersRequest());
  try {
    const response = await api.get("/users/all", { headers: { 'Cache-Control': 'no-cache' } });
    dispatch(fetchUsersSuccess(response.data));
  } catch (error) {
    dispatch(fetchUsersFailure(error.message));
  }
};

export const loadUser = () => async (dispatch) => {
  const token = localStorage.getItem("token");
  if (token) {
    setAuthToken(token);
  }

  try {
    const res = await api.get("/users/me");
    dispatch({ type: USER_LOADED, payload: res.data });
  } catch (error) {
    dispatch({ type: USER_ERROR });
  }
};

export function register(formData) {
  return async function registerThunk(dispatch) {
    try {
      const res = await api.post("/users/register", formData);
      localStorage.setItem("token", res.data.token);
      dispatch({ type: REGISTER_SUCCESS, payload: res.data });
      dispatch(loadUser());
    } catch (error) {
      if (error.response && error.response.data.errors) {
        const errors = error.response.data.errors;
        errors.forEach((error) => {
          dispatch(showAlertMessage(error.msg, "error"));
        });
      } else if (error.response && error.response.data.message) {
        dispatch(showAlertMessage(error.response.data.message, "error"));
      } else {
        dispatch(showAlertMessage("An unknown error occurred", "error"));
      }
      dispatch({
        type: REGISTER_FAIL,
      });
    }
  };
}

export const login = (formData) => async (dispatch) => {
  try {
    const res = await api.post("/users/login", formData);
    localStorage.setItem("token", res.data.token);
    dispatch({ type: LOGIN_SUCCESS, payload: res.data });
    dispatch(loadUser());
  } catch (error) {
    if (error.response && error.response.data.errors) {
      const errors = error.response.data.errors;
      errors.forEach((error) => {
        dispatch(showAlertMessage(error.msg, "error"));
      });
    } else if (error.response && error.response.data.message) {
      dispatch(showAlertMessage(error.response.data.message, "error"));
    } else {
      dispatch(showAlertMessage("An unknown error occurred", "error"));
    }
    dispatch({
      type: LOGIN_FAIL,
    });
  }
};

export const updateOpenForSwap = (formData) => async (dispatch) => {
  try {
    const res = await api.post("/users/updateOpenForSwap", formData);
    dispatch({ type: UPDATE_OPEN_FOR_SWAP_SUCCESS, payload: res.data });
    if (res.data.isOpenForSwap) {
      dispatch(showAlertMessage("You are now open for swaps"));
    } else {
      dispatch(showAlertMessage("You will no longer receive swap requests"));
    }
  } catch (error) {
    if (error.response && error.response.data.errors) {
      const errors = error.response.data.errors;
      errors.forEach((error) => {
        dispatch(showAlertMessage(error.msg, "error"));
      });
    } else if (error.response && error.response.data.message) {
      dispatch(showAlertMessage(error.response.data.message, "error"));
    } else {
      dispatch(showAlertMessage("An unknown error occurred", "error"));
    }
    dispatch({
      type: UPDATE_OPEN_FOR_SWAP_FAIL,
    });
  }
};

export const fetchIsOpenForSwap = () => async (dispatch) => {
  try {
    const res = await api.get("/users/isOpenForSwap");
    dispatch({ type: UPDATE_OPEN_FOR_SWAP_SUCCESS, payload: res.data });
  } catch (error) {
    dispatch({ type: UPDATE_OPEN_FOR_SWAP_FAIL });
  }
};

export const logout = () => (dispatch) => {
  localStorage.removeItem("token");
  setAuthToken();
  dispatch({ type: LOGOUT });
};

const initialState = {
  token: localStorage.getItem("token"),
  isAuthenticated: false,
  isOpenForSwap: false,
  loading: true,
  user: null,
  users: [],
  usersLoading: false,
  usersError: null,
};

export default function reducer(state = initialState, action) {
  const { type, payload } = action;
  switch (type) {
    case USER_LOADED:
      return {
        ...state,
        isAuthenticated: true,
        loading: false,
        user: payload,
      };
    case REGISTER_SUCCESS:
    case LOGIN_SUCCESS:
      setAuthToken(payload.token);
      return {
        ...state,
        token: payload.token,
        isAuthenticated: true,
        loading: false,
      };
    case REGISTER_FAIL:
    case LOGIN_FAIL:
    case LOGOUT:
      setAuthToken();
      return {
        ...state,
        token: null,
        isAuthenticated: false,
        loading: false,
      };
    case USER_ERROR:
      setAuthToken();
      return {
        ...state,
        isAuthenticated: false,
        loading: false,
        user: null,
      };
    case UPDATE_OPEN_FOR_SWAP_SUCCESS:
      return {
        ...state,
        isOpenForSwap: payload.isOpenForSwap,
        loading: false,
      };
    case UPDATE_OPEN_FOR_SWAP_FAIL:
      return {
        ...state,
        loading: false,
      };
    case FETCH_USERS_REQUEST:
      return {
        ...state,
        usersLoading: true,
        usersError: null,
      };
    case FETCH_USERS_SUCCESS:
      return {
        ...state,
        users: payload,
        usersLoading: false,
      };
    case FETCH_USERS_FAILURE:
      return {
        ...state,
        usersLoading: false,
        usersError: payload,
      };
    default:
      return state;
  }
}
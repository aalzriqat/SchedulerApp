import { api } from "../../utils";

export const FETCH_ALL_NEWS_REQUEST = "FETCH_ALL_NEWS_REQUEST";
export const FETCH_ALL_NEWS_SUCCESS = "FETCH_ALL_NEWS_SUCCESS";
export const FETCH_ALL_NEWS_FAIL = "FETCH_ALL_NEWS_FAIL";

export const FETCH_NEWS_REQUEST = "FETCH_NEWS_REQUEST";
export const FETCH_NEWS_SUCCESS = "FETCH_NEWS_SUCCESS";
export const FETCH_NEWS_FAIL = "FETCH_NEWS_FAIL";

export const CREATE_NEWS_REQUEST = "CREATE_NEWS_REQUEST";
export const CREATE_NEWS_SUCCESS = "CREATE_NEWS_SUCCESS";
export const CREATE_NEWS_FAIL = "CREATE_NEWS_FAIL";

export const UPDATE_NEWS_REQUEST = "UPDATE_NEWS_REQUEST";
export const UPDATE_NEWS_SUCCESS = "UPDATE_NEWS_SUCCESS";
export const UPDATE_NEWS_FAIL = "UPDATE_NEWS_FAIL";

export const DELETE_NEWS_REQUEST = "DELETE_NEWS_REQUEST";
export const DELETE_NEWS_SUCCESS = "DELETE_NEWS_SUCCESS";
export const DELETE_NEWS_FAIL = "DELETE_NEWS_FAIL";

// Fetch All News
export const fetchAllNews = () => async (dispatch) => {
  try {
    dispatch({ type: FETCH_ALL_NEWS_REQUEST });
    const { data } = await api.get("/news");
    dispatch({ type: FETCH_ALL_NEWS_SUCCESS, payload: data });
  } catch (error) {
    dispatch({
      type: FETCH_ALL_NEWS_FAIL,
      payload: error.response?.data?.message || error.message,
    });
  }
};

// Fetch News by ID
export const fetchNewsById = (id) => async (dispatch) => {
  try {
    dispatch({ type: FETCH_NEWS_REQUEST });
    const { data } = await api.get(`/news/${id}`);
    dispatch({ type: FETCH_NEWS_SUCCESS, payload: data });
  } catch (error) {
    dispatch({
      type: FETCH_NEWS_FAIL,
      payload: error.response?.data?.message || error.message,
    });
  }
};

// Create News
export const createNews = (newsData) => async (dispatch) => {
  try {
    dispatch({ type: CREATE_NEWS_REQUEST });
    const { data } = await api.post("/news", newsData);
    dispatch({ type: CREATE_NEWS_SUCCESS, payload: data });
  } catch (error) {
    dispatch({
      type: CREATE_NEWS_FAIL,
      payload: error.response?.data?.message || error.message,
    });
  }
};

// Update News
export const updateNews = (id, newsData) => async (dispatch) => {
  try {
    dispatch({ type: UPDATE_NEWS_REQUEST });
    const { data } = await api.put(`/news/${id}`, newsData);
    dispatch({ type: UPDATE_NEWS_SUCCESS, payload: data });
  } catch (error) {
    dispatch({
      type: UPDATE_NEWS_FAIL,
      payload: error.response?.data?.message || error.message,
    });
  }
};

// Delete News
export const deleteNews = (id) => async (dispatch) => {
  try {
    dispatch({ type: DELETE_NEWS_REQUEST });
    await api.delete(`/news/${id}`);
    dispatch({ type: DELETE_NEWS_SUCCESS, payload: id });
  } catch (error) {
    dispatch({
      type: DELETE_NEWS_FAIL,
      payload: error.response?.data?.message || error.message,
    });
  }
};

const initialState = {
  news: [],
  singleNews: null,
  loading: false,
  error: null,
};

export default function newsReducer(state = initialState, action) {
  switch (action.type) {
    case FETCH_ALL_NEWS_REQUEST:
    case FETCH_NEWS_REQUEST:
    case CREATE_NEWS_REQUEST:
    case UPDATE_NEWS_REQUEST:
    case DELETE_NEWS_REQUEST:
      return { ...state, loading: true, error: null }; // Reset error state on new request

    case FETCH_ALL_NEWS_SUCCESS:
      return { ...state, loading: false, news: action.payload, error: null };
    case FETCH_NEWS_SUCCESS:
      return { ...state, loading: false, singleNews: action.payload, error: null };
    case CREATE_NEWS_SUCCESS:
      return {
        ...state,
        loading: false,
        news: [...state.news, action.payload],
        error: null,
      };
    case UPDATE_NEWS_SUCCESS:
      return {
        ...state,
        loading: false,
        news: state.news.map((news) =>
          news._id === action.payload._id ? action.payload : news
        ),
        error: null,
      };
    case DELETE_NEWS_SUCCESS:
      return {
        ...state,
        loading: false,
        news: state.news.filter((news) => news._id !== action.payload),
        error: null,
      };

    case FETCH_ALL_NEWS_FAIL:
    case FETCH_NEWS_FAIL:
    case CREATE_NEWS_FAIL:
    case UPDATE_NEWS_FAIL:
    case DELETE_NEWS_FAIL:
      return { ...state, loading: false, error: action.payload };

    default:
      return state;
  }
}

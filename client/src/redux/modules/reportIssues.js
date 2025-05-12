import { api } from "../../utils";


export const REPORT_ISSUES_REQUEST = "REPORT_ISSUES_REQUEST";
export const REPORT_ISSUES_SUCCESS = "REPORT_ISSUES_SUCCESS";
export const REPORT_ISSUES_FAIL = "REPORT_ISSUES_FAIL";

export const GET_REPORT_ISSUES_REQUEST = "GET_REPORT_ISSUES_REQUEST";
export const GET_REPORT_ISSUES_SUCCESS = "GET_REPORT_ISSUES_SUCCESS";
export const GET_REPORT_ISSUES_FAIL = "GET_REPORT_ISSUES_FAIL";

export const DELETE_REPORT_ISSUES_REQUEST = "DELETE_REPORT_ISSUES_REQUEST";
export const DELETE_REPORT_ISSUES_SUCCESS = "DELETE_REPORT_ISSUES_SUCCESS";
export const DELETE_REPORT_ISSUES_FAIL = "DELETE_REPORT_ISSUES_FAIL";

export const UPDATE_REPORT_ISSUES_REQUEST = "UPDATE_REPORT_ISSUES_REQUEST";
export const UPDATE_REPORT_ISSUES_SUCCESS = "UPDATE_REPORT_ISSUES_SUCCESS";
export const UPDATE_REPORT_ISSUES_FAIL = "UPDATE_REPORT_ISSUES_FAIL";

// Report an Issue
export const reportIssues = (issueData) => async (dispatch) => {
  try {
    dispatch({ type: REPORT_ISSUES_REQUEST });

    const { data } = await api.post("/report-issues", issueData);

    dispatch({ type: REPORT_ISSUES_SUCCESS, payload: data });
  } catch (error) {
    dispatch({
      type: REPORT_ISSUES_FAIL,
      payload: error.response?.data?.message || error.message,
    });
  }
};

// Get All Reported Issues
export const getReportIssues = () => async (dispatch) => {
  try {
    dispatch({ type: GET_REPORT_ISSUES_REQUEST });

    const { data } = await api.get("/report-issues");

    dispatch({ type: GET_REPORT_ISSUES_SUCCESS, payload: data });
  } catch (error) {
    dispatch({
      type: GET_REPORT_ISSUES_FAIL,
      payload: error.response?.data?.message || error.message,
    });
  }
};

// Delete a Reported Issue
export const deleteReportIssues = (id) => async (dispatch) => {
  try {
    dispatch({ type: DELETE_REPORT_ISSUES_REQUEST });

    await api.delete(`/report-issues/${id}`);

    dispatch({ type: DELETE_REPORT_ISSUES_SUCCESS, payload: id });
  } catch (error) {
    dispatch({
      type: DELETE_REPORT_ISSUES_FAIL,
      payload: error.response?.data?.message || error.message,
    });
  }
};

// Update a Reported Issue
export const updateReportIssues = (id, issueData) => async (dispatch) => {
  try {
    dispatch({ type: UPDATE_REPORT_ISSUES_REQUEST });

    const { data } = await api.patch(`/report-issues/${id}`, issueData);

    dispatch({ type: UPDATE_REPORT_ISSUES_SUCCESS, payload: data });
  } catch (error) {
    dispatch({
      type: UPDATE_REPORT_ISSUES_FAIL,
      payload: error.response?.data?.message || error.message,
    });
  }
};

const initialState = {
    issues: [],
    loading: false,
    error: null,
  };
  
  export default function Reducer(state = initialState, action) {
    switch (action.type) {
      case REPORT_ISSUES_REQUEST:
      case GET_REPORT_ISSUES_REQUEST:
      case DELETE_REPORT_ISSUES_REQUEST:
      case UPDATE_REPORT_ISSUES_REQUEST:
        return { ...state, loading: true };
  
      case REPORT_ISSUES_SUCCESS:
        return {
          ...state,
          loading: false,
          issues: [...state.issues, action.payload],
        };
  
      case GET_REPORT_ISSUES_SUCCESS:
        return {
          ...state,
          loading: false,
          issues: action.payload,
        };
  
      case DELETE_REPORT_ISSUES_SUCCESS:
        return {
          ...state,
          loading: false,
          issues: state.issues.filter((issue) => issue._id !== action.payload),
        };
  
      case UPDATE_REPORT_ISSUES_SUCCESS:
        return {
          ...state,
          loading: false,
          issues: state.issues.map((issue) =>
            issue._id === action.payload._id ? action.payload : issue
          ),
        };
  
      case REPORT_ISSUES_FAIL:
      case GET_REPORT_ISSUES_FAIL:
      case DELETE_REPORT_ISSUES_FAIL:
      case UPDATE_REPORT_ISSUES_FAIL:
        return { ...state, loading: false, error: action.payload };
  
      default:
        return state;
    }
  }
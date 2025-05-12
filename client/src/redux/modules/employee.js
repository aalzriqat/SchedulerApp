import { api } from "../../utils";
import { showAlertMessage } from "./alerts";
// Action Types
export const SCHEDULES_REQUEST = "SCHEDULES_REQUEST";
export const SCHEDULES_SUCCESS = "SCHEDULES_SUCCESS";
export const SCHEDULES_FAIL = "SCHEDULES_FAIL";

export const CREATE_SWAP_REQUEST = "CREATE_SWAP_REQUEST";
export const CREATE_SWAP_SUCCESS = "CREATE_SWAP_SUCCESS";
export const CREATE_SWAP_FAIL = "CREATE_SWAP_FAIL";


export const RESET_SWAP_REQUEST = "RESET_SWAP_REQUEST"; 

// Action Creators

// Fetch all available schedules
export const fetchSchedulesAction = () => async (dispatch) => {
  try {
    dispatch({ type: SCHEDULES_REQUEST });

    const response = await api.get("/schedules/all");
    const data = await response.json();

    dispatch({ type: SCHEDULES_SUCCESS, payload: data });
  } catch (error) {
    const errorMessage = error.response?.data?.message || error.message;
    dispatch({ type: SCHEDULES_FAIL, payload: errorMessage });
  }
};

export const createSwapRequestAction =
  (recipientScheduleId, requesterScheduleId, recipientId, requesterId) =>
  async (dispatch) => {
    try {
      dispatch({ type: CREATE_SWAP_REQUEST });

      const response = await api.post("/swap/request", {
        recipientSchedule: recipientScheduleId,
        recipient: recipientId,
        requester: requesterId,
        requesterSchedule: requesterScheduleId,
      });

      const data = await response.data;
      dispatch({ type: CREATE_SWAP_SUCCESS, payload: response.data });
      dispatch(showAlertMessage("Swap Request Sent To The User Successfully"));
    } catch (error) {
      if (error.response && error.response.data) {
        dispatch({
          type: CREATE_SWAP_FAIL,
          payload: error.response.data.error,
        });
        dispatch(showAlertMessage(error.response.data.error, "error"));
      } else {
        dispatch({ type: CREATE_SWAP_FAIL, payload: error.message });
      }
    }
  };

// reset swap request
export const resetSwapRequest = () => ({
  type: RESET_SWAP_REQUEST,
});

const initialState = {
  schedules: [],
  loadingSchedules: false,
  loadingSwap: false,
  error: null,
  swapRequest: null,
};

export default function Reducer(state = initialState, action) {
  switch (action.type) {
    // Handling schedule fetching
    case SCHEDULES_REQUEST:
      return {
        ...state,
        loadingSchedules: true,
        error: null,
      };
    case SCHEDULES_SUCCESS:
      return {
        ...state,
        loadingSchedules: false,
        schedules: action.payload,
      };
    case SCHEDULES_FAIL:
      return {
        ...state,
        loadingSchedules: false,
        error: action.payload,
      };

    // Handling swap requests
    case CREATE_SWAP_REQUEST:
      return {
        ...state,
        loadingSwap: true,
        error: null,
      };
    case CREATE_SWAP_SUCCESS:
      return {
        ...state,
        loadingSwap: false,
        swapRequest: action.payload,
      };
    case CREATE_SWAP_FAIL:
      return {
        ...state,
        loadingSwap: false,
        error: action.payload,
      };

    // Handling reset swap request
    case RESET_SWAP_REQUEST:
      return {
        ...state,
        swapRequest: null,
      };

    default:
      return state;
  }
}

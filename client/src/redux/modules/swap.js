import { api } from "../../utils";

// Action Types
const FETCH_ALL_SWAPS_REQUEST = "FETCH_ALL_SWAPS_REQUEST";
const FETCH_ALL_SWAPS_SUCCESS = "FETCH_ALL_SWAPS_SUCCESS";
const FETCH_ALL_SWAPS_FAIL = "FETCH_ALL_SWAPS_FAIL";

const FETCH_RECEIVED_SWAPS_REQUEST = "FETCH_RECEIVED_SWAPS_REQUEST";
const FETCH_RECEIVED_SWAPS_SUCCESS = "FETCH_RECEIVED_SWAPS_SUCCESS";
const FETCH_RECEIVED_SWAPS_FAIL = "FETCH_RECEIVED_SWAPS_FAIL";

const FETCH_SENT_SWAPS_REQUEST = "FETCH_SENT_SWAPS_REQUEST";
const FETCH_SENT_SWAPS_SUCCESS = "FETCH_SENT_SWAPS_SUCCESS";
const FETCH_SENT_SWAPS_FAIL = "FETCH_SENT_SWAPS_FAIL";

const FETCH_APPROVED_SWAPS_REQUEST = "FETCH_APPROVED_SWAPS_REQUEST";
const FETCH_APPROVED_SWAPS_SUCCESS = "FETCH_APPROVED_SWAPS_SUCCESS";
const FETCH_APPROVED_SWAPS_FAIL = "FETCH_APPROVED_SWAPS_FAIL";

const CREATE_SWAP_REQUEST = "CREATE_SWAP_REQUEST";
const CREATE_SWAP_SUCCESS = "CREATE_SWAP_SUCCESS";
const CREATE_SWAP_FAIL = "CREATE_SWAP_FAIL";

const UPDATE_SWAP_STATUS_REQUEST = "UPDATE_SWAP_STATUS_REQUEST";
const UPDATE_SWAP_STATUS_SUCCESS = "UPDATE_SWAP_STATUS_SUCCESS";
const UPDATE_SWAP_STATUS_FAIL = "UPDATE_SWAP_STATUS_FAIL";

const CANCEL_SWAP_REQUEST = "CANCEL_SWAP_REQUEST";
const CANCEL_SWAP_SUCCESS = "CANCEL_SWAP_SUCCESS";
const CANCEL_SWAP_FAIL = "CANCEL_SWAP_FAIL";

const CANCEL_ALL_SWAPS_REQUEST = "CANCEL_ALL_SWAPS_REQUEST";
const CANCEL_ALL_SWAPS_SUCCESS = "CANCEL_ALL_SWAPS_SUCCESS";
const CANCEL_ALL_SWAPS_FAIL = "CANCEL_ALL_SWAPS_FAIL";

// Fetch All Swaps Action
export const fetchAllSwaps = () => async (dispatch) => {
  try {
    dispatch({ type: FETCH_ALL_SWAPS_REQUEST });
    const { data } = await api.get("/swap/swaps");
    dispatch({ type: FETCH_ALL_SWAPS_SUCCESS, payload: data });
  } catch (error) {
    dispatch({ type: FETCH_ALL_SWAPS_FAIL, payload: error.message });
  }
};

// Fetch Received Swaps Action
export const fetchReceivedSwaps = (userId) => async (dispatch) => {
  try {
    dispatch({ type: FETCH_RECEIVED_SWAPS_REQUEST });
    const { data } = await api.get(`/swap/received/${userId}`);
    dispatch({ type: FETCH_RECEIVED_SWAPS_SUCCESS, payload: data });
  } catch (error) {
    dispatch({ type: FETCH_RECEIVED_SWAPS_FAIL, payload: error.message });
  }
};

// Fetch Sent Swaps Action
export const fetchSentSwaps = (userId) => async (dispatch) => {
  try {
    dispatch({ type: FETCH_SENT_SWAPS_REQUEST });
    const { data } = await api.get(`/swap/sent/${userId}`);
    dispatch({ type: FETCH_SENT_SWAPS_SUCCESS, payload: data });
  } catch (error) {
    dispatch({ type: FETCH_SENT_SWAPS_FAIL, payload: error.message });
  }
};

// Fetch Approved Swaps Action
export const fetchApprovedSwaps = () => async (dispatch) => {
  try {
    dispatch({ type: FETCH_APPROVED_SWAPS_REQUEST });
    const { data } = await api.get("/swap/approved-requests");
    dispatch({ type: FETCH_APPROVED_SWAPS_SUCCESS, payload: data });
  } catch (error) {
    dispatch({ type: FETCH_APPROVED_SWAPS_FAIL, payload: error.message });
  }
};

// Create Swap Request Action
export const createSwapRequest = (swapData) => async (dispatch) => {
  try {
    dispatch({ type: CREATE_SWAP_REQUEST });
    const { data } = await api.post("/swap/request", swapData);
    dispatch({ type: CREATE_SWAP_SUCCESS, payload: data });
  } catch (error) {
    dispatch({ type: CREATE_SWAP_FAIL, payload: error.message });
  }
};

// Update Swap Status Action
export const updateSwapStatus = (swapId, statusData) => async (dispatch) => {
  try {
    dispatch({ type: UPDATE_SWAP_STATUS_REQUEST });
    const { data } = await api.put(`/swap/update/${swapId}`, statusData);
    dispatch({ type: UPDATE_SWAP_STATUS_SUCCESS, payload: data });
  } catch (error) {
    dispatch({ type: UPDATE_SWAP_STATUS_FAIL, payload: error.message });
  }
};

// Cancel Swap Request Action
export const cancelSwapRequest = (swapId) => async (dispatch) => {
  try {
    dispatch({ type: CANCEL_SWAP_REQUEST });
    const { data } = await api.put(`/swap/cancel/${swapId}`);
    dispatch({ type: CANCEL_SWAP_SUCCESS, payload: data });
  } catch (error) {
    dispatch({ type: CANCEL_SWAP_FAIL, payload: error.message });
  }
};

// Cancel All Swap Requests Action
export const cancelAllSwaps = (requesterId, recipientId, week) => async (dispatch) => {
  try {
    dispatch({ type: CANCEL_ALL_SWAPS_REQUEST });
    const { data } = await api.put(`/swap/cancel-all`, { requesterId, recipientId, week });
    dispatch({ type: CANCEL_ALL_SWAPS_SUCCESS, payload: data });
  } catch (error) {
    dispatch({ type: CANCEL_ALL_SWAPS_FAIL, payload: error.message });
  }
};

// Initial State
const initialState = {
  swaps: {
    all: [],
    received: [],
    sent: [],
    approved: [],
  },
  loading: {
    allSwaps: false,
    receivedSwaps: false,
    sentSwaps: false,
    approvedSwaps: false,
    createSwap: false,
    updateSwap: false,
    cancelSwap: false,
    cancelAllSwaps: false,
  },
  error: null,
};

// Reducer
export default function reducer(state = initialState, action) {
  switch (action.type) {
    case FETCH_ALL_SWAPS_REQUEST:
      return { ...state, loading: { ...state.loading, allSwaps: true } };
    case FETCH_ALL_SWAPS_SUCCESS:
      return {
        ...state,
        loading: { ...state.loading, allSwaps: false },
        swaps: { ...state.swaps, all: action.payload },
      };
    case FETCH_ALL_SWAPS_FAIL:
      return {
        ...state,
        loading: { ...state.loading, allSwaps: false },
        error: action.payload,
      };

    case FETCH_RECEIVED_SWAPS_REQUEST:
      return { ...state, loading: { ...state.loading, receivedSwaps: true } };
    case FETCH_RECEIVED_SWAPS_SUCCESS:
      return {
        ...state,
        loading: { ...state.loading, receivedSwaps: false },
        swaps: { ...state.swaps, received: action.payload },
      };
    case FETCH_RECEIVED_SWAPS_FAIL:
      return {
        ...state,
        loading: { ...state.loading, receivedSwaps: false },
        error: action.payload,
      };

    case FETCH_SENT_SWAPS_REQUEST:
      return { ...state, loading: { ...state.loading, sentSwaps: true } };
    case FETCH_SENT_SWAPS_SUCCESS:
      return {
        ...state,
        loading: { ...state.loading, sentSwaps: false },
        swaps: { ...state.swaps, sent: action.payload },
      };
    case FETCH_SENT_SWAPS_FAIL:
      return {
        ...state,
        loading: { ...state.loading, sentSwaps: false },
        error: action.payload,
      };

    case FETCH_APPROVED_SWAPS_REQUEST:
      return { ...state, loading: { ...state.loading, approvedSwaps: true } };
    case FETCH_APPROVED_SWAPS_SUCCESS:
      return {
        ...state,
        loading: { ...state.loading, approvedSwaps: false },
        swaps: { ...state.swaps, approved: action.payload },
      };
    case FETCH_APPROVED_SWAPS_FAIL:
      return {
        ...state,
        loading: { ...state.loading, approvedSwaps: false },
        error: action.payload,
      };

    case CREATE_SWAP_REQUEST:
      return { ...state, loading: { ...state.loading, createSwap: true } };
    case CREATE_SWAP_SUCCESS:
      return {
        ...state,
        loading: { ...state.loading, createSwap: false },
        swaps: { ...state.swaps, sent: [...state.swaps.sent, action.payload] },
      };
    case CREATE_SWAP_FAIL:
      return {
        ...state,
        loading: { ...state.loading, createSwap: false },
        error: action.payload,
      };

    case UPDATE_SWAP_STATUS_REQUEST:
      return { ...state, loading: { ...state.loading, updateSwap: true } };
    case UPDATE_SWAP_STATUS_SUCCESS:
      return {
        ...state,
        loading: { ...state.loading, updateSwap: false },
        swaps: {
          ...state.swaps,
          all: state.swaps.all.map((swap) =>
            swap._id === action.payload._id ? action.payload : swap
          ),
          received: state.swaps.received.map((swap) =>
            swap._id === action.payload._id ? action.payload : swap
          ),
          sent: state.swaps.sent.map((swap) =>
            swap._id === action.payload._id ? action.payload : swap
          ),
        },
      };
    case UPDATE_SWAP_STATUS_FAIL:
      return {
        ...state,
        loading: { ...state.loading, updateSwap: false },
        error: action.payload,
      };

    case CANCEL_SWAP_REQUEST:
      return { ...state, loading: { ...state.loading, cancelSwap: true } };
    case CANCEL_SWAP_SUCCESS:
      return {
        ...state,
        loading: { ...state.loading, cancelSwap: false },
        swaps: {
          ...state.swaps,
          all: state.swaps.all.map((swap) =>
            swap._id === action.payload._id ? action.payload : swap
          ),
          received: state.swaps.received.map((swap) =>
            swap._id === action.payload._id ? action.payload : swap
          ),
          sent: state.swaps.sent.map((swap) =>
            swap._id === action.payload._id ? action.payload : swap
          ),
        },
      };
    case CANCEL_SWAP_FAIL:
      return {
        ...state,
        loading: { ...state.loading, cancelSwap: false },
        error: action.payload,
      };

    case CANCEL_ALL_SWAPS_REQUEST:
      return { ...state, loading: { ...state.loading, cancelAllSwaps: true } };
    case CANCEL_ALL_SWAPS_SUCCESS:
      return {
        ...state,
        loading: { ...state.loading, cancelAllSwaps: false },
        swaps: {
          ...state.swaps,
          all: state.swaps.all.map((swap) =>
            swap.requester === action.payload.requesterId ||
            swap.recipient === action.payload.recipientId
              ? { ...swap, status: "cancelled" }
              : swap
          ),
          received: state.swaps.received.map((swap) =>
            swap.requester === action.payload.requesterId ||
            swap.recipient === action.payload.recipientId
              ? { ...swap, status: "cancelled" }
              : swap
          ),
          sent: state.swaps.sent.map((swap) =>
            swap.requester === action.payload.requesterId ||
            swap.recipient === action.payload.recipientId
              ? { ...swap, status: "cancelled" }
              : swap
          ),
        },
      };
    case CANCEL_ALL_SWAPS_FAIL:
      return {
        ...state,
        loading: { ...state.loading, cancelAllSwaps: false },
        error: action.payload,
      };

    default:
      return state;
  }
}
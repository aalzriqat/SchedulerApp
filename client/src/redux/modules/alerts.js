const SHOW_ALERT_MESSAGE = "alerts/SHOW_ALERT_MESSAGE";

export function showAlertMessage(message,type='info') {
  return async function showAlertMessageThunk(dispatch){
    dispatch({
      type: SHOW_ALERT_MESSAGE,
      payload: {
        show: true,
        message,
        type,
      },
    });
  };
}

const initialState = {
  show: false,
  message: "",
  type: "info",
};

export default function reducer(state = initialState, action) {
  switch (action.type) {
    case SHOW_ALERT_MESSAGE:
      return {
        ...state,
        show: true,
        message: action.payload.message,
        type: action.payload.type,
      };
    default:
      return state;
  }
}

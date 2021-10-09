import { SET_ALERT, REMOVE_ALERT } from "./types";
import { v4 as uuidv4 } from "uuid";

export const setAlert =
  (msg, alertType, timeout = 5000) =>
  (dispatch) => {
    const id = uuidv4();
    dispatch({
      type: SET_ALERT,
      payload: { msg, alertType, id },
    });

    // after the alert is posted, wait 5 seconds and dispatch an action to remove the alert
    setTimeout(() => dispatch({ type: REMOVE_ALERT, payload: id }), timeout);
  };

import {
  REGISTER_SUCCESS,
  REGISTER_FAIL,
  LOGIN_SUCCESS,
  LOGIN_FAIL,
  USER_LOADED,
  AUTH_ERROR,
  LOGOUT,
  ACCOUNT_DELETED,
} from "../actions/types";

// +++++ AUTH STATE +++++
const initialState = {
  token: localStorage.getItem("token"),
  isAuthenticated: null,
  loading: true, // true by default, once the request is done, make it false because it is done loading
  user: null,
};

export default function (state = initialState, action) {
  const { type, payload } = action;

  switch (type) {
    case USER_LOADED:
      return { ...state, isAuthenticated: true, loading: false, user: payload };
    case REGISTER_SUCCESS:
    case LOGIN_SUCCESS:
      localStorage.setItem("token", payload.token);
      return { ...state, ...payload, isAuthenticated: true, loading: false };
    case REGISTER_FAIL:
    case LOGIN_FAIL:
    case AUTH_ERROR:
    case ACCOUNT_DELETED:
    case LOGOUT:
      localStorage.removeItem("token");
      return { ...state, token: null, isAuthenticated: false, loading: false };
    default:
      return state;
  }
}

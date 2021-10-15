import axios from "axios";
import { setAlert } from "./alert";
import {
  CLEAR_PROFILE,
  ACCOUNT_DELETED,
  GET_PROFILE,
  GET_PROFILES,
  PROFILE_ERROR,
  UPDATE_PROFILE,
  GET_REPOS,
} from "./types";

// Get current user's profile
export const getCurrentProfile = () => async (dispatch) => {
  try {
    const res = await axios.get("/api/profile/me");

    dispatch({ type: GET_PROFILE, payload: res.data });
  } catch (err) {
    dispatch({
      type: PROFILE_ERROR,
      payload: { msg: err.response.statusText, status: err.response.status },
    });
  }
};

// Get all profiles
export const getProfiles = () => async (dispatch) => {
  dispatch({ type: CLEAR_PROFILE });

  try {
    const res = await axios.get("/api/profile");

    dispatch({ type: GET_PROFILES, payload: res.data });
  } catch (err) {
    dispatch({
      type: PROFILE_ERROR,
      payload: { msg: err.response.statusText, status: err.response.status },
    });
  }
};

// Get profile by id
export const getProfileById = (userId) => async (dispatch) => {
  try {
    const res = await axios.get(`/api/profile/profile/${userId}`);

    dispatch({ type: GET_PROFILE, payload: res.data });
  } catch (err) {
    dispatch({
      type: PROFILE_ERROR,
      payload: { msg: err.response.statusText, status: err.response.status },
    });
  }
};

// Get Github repos
export const getGithubRepos = (username) => async (dispatch) => {
  try {
    const res = await axios.get(`api/profile/github/${username}`);

    dispatch({ type: GET_REPOS, payload: res.data });
  } catch (err) {
    dispatch({
      type: PROFILE_ERROR,
      payload: { msg: err.response.statusText, status: err.response.status },
    });
  }
};

// Create or Update a profile
export const createProfile =
  (formData, history, edit = false) =>
  async (dispatch) => {
    try {
      const config = { headers: { "Content-Type": "application/json" } };
      const res = await axios.post("/api/profile", formData, config);

      // this is going to do the same as GET_PROFILE action
      dispatch({ type: GET_PROFILE, payload: res.data });

      // dispatch an alert notifying the user of what has been done
      dispatch(
        setAlert(
          edit
            ? "Profile updated"
            : "You have successfuly created your profile",
          "success"
        )
      );

      // redirect after creating a profile
      // we have to use the history method in the actions, and not <Redirect />
      if (!edit) {
        return history.push("/dashboard");
      }
    } catch (err) {
      // in the api if we failed then we return some errors, which we need to turn into alerts, done below
      const errors = err.response.data.errors;
      if (errors) {
        errors.forEach((error) => dispatch(setAlert(error.msg, "danger")));
      }

      dispatch({
        type: PROFILE_ERROR,
        payload: { msg: err.response.statusText, status: err.response.status },
      });
    }
  };

// Add experience
export const addExperience = (formData, history) => async (dispatch) => {
  try {
    const config = { headers: { "Content-Type": "application/json" } };
    const res = await axios.put("/api/profile/experience", formData, config);

    // this is going to do the same as GET_PROFILE action
    dispatch({ type: UPDATE_PROFILE, payload: res.data });

    // dispatch an alert notifying the user of what has been done
    dispatch(setAlert("Experience added!", "success"));

    // we have to use the history method in the actions, and not <Redirect />
    return history.push("/dashboard");
  } catch (err) {
    // in the api if we failed then we return some errors, which we need to turn into alerts, done below
    const errors = err.response.data.errors;
    if (errors) {
      errors.forEach((error) => dispatch(setAlert(error.msg, "danger")));
    }

    dispatch({
      type: PROFILE_ERROR,
      payload: { msg: err.response.statusText, status: err.response.status },
    });
  }
};

// Add education
export const addEducation = (formData, history) => async (dispatch) => {
  try {
    const config = { headers: { "Content-Type": "application/json" } };
    const res = await axios.put("/api/profile/education", formData, config);

    // this is going to do the same as GET_PROFILE action
    dispatch({ type: UPDATE_PROFILE, payload: res.data });

    // dispatch an alert notifying the user of what has been done
    dispatch(setAlert("Education added!", "success"));

    // we have to use the history method in the actions, and not <Redirect />
    return history.push("/dashboard");
  } catch (err) {
    // in the api if we failed then we return some errors, which we need to turn into alerts, done below
    const errors = err.response.data.errors;
    if (errors) {
      errors.forEach((error) => dispatch(setAlert(error.msg, "danger")));
    }

    dispatch({
      type: PROFILE_ERROR,
      payload: { msg: err.response.statusText, status: err.response.status },
    });
  }
};

// Delete experience
export const deleteExperience = (id) => async (dispatch) => {
  try {
    const res = await axios.delete(`api/profile/experience/${id}`);
    dispatch({
      type: UPDATE_PROFILE,
      payload: res.data,
    });

    dispatch(setAlert("Experience removed!", "success"));
  } catch (err) {
    dispatch({
      type: PROFILE_ERROR,
      payload: { msg: err.response.statusText, status: err.response.status },
    });
  }
};

// Delete education
export const deleteEducation = (id) => async (dispatch) => {
  try {
    const res = await axios.delete(`api/profile/education/${id}`);
    dispatch({
      type: UPDATE_PROFILE,
      payload: res.data,
    });

    dispatch(setAlert("Education removed!", "success"));
  } catch (err) {
    dispatch({
      type: PROFILE_ERROR,
      payload: { msg: err.response.statusText, status: err.response.status },
    });
  }
};

// Delete account and profile
export const deleteAccount = () => async (dispatch) => {
  if (window.confirm("Are you sure? This action cannot be reverted.")) {
    try {
      await axios.delete(`api/profile/`);

      dispatch({
        type: CLEAR_PROFILE,
      });
      dispatch({
        type: ACCOUNT_DELETED,
      });

      dispatch(setAlert("Your account has been permanately deleted"));
    } catch (err) {
      dispatch({
        type: PROFILE_ERROR,
        payload: { msg: err.response.statusText, status: err.response.status },
      });
    }
  }
};

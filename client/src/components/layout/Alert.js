import React from "react";
import PropTypes from "prop-types";

import { connect } from "react-redux";

const Alert = ({ alerts }) =>
  alerts !== null &&
  alerts.length > 0 &&
  alerts.map((alert) => (
    <div key={alert.id} className={`alert alert-${alert.alertType}`}>
      {alert.msg}
    </div>
  ));

Alert.propTypes = {
  alerts: PropTypes.array.isRequired,
};

const mapStateToProps = (state) => ({
  // we fetch the state/store from the root reducer to the props of this component
  alerts: state.alert,
});

export default connect(mapStateToProps)(Alert);

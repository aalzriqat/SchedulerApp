import { useEffect } from "react";
import { connect } from "react-redux";
import { useAlert } from "react-alert";

const Alert = ({ alert }) => {
  const showAlert = useAlert();

  useEffect(() => {
    if (alert.message) {
      showAlert.show(alert.message, {
        type: alert.type,
      });
    }
  }, [alert, showAlert]);
  
};

const mapStateToProps = (state) => {
  return {
    alert: state.alerts,
  };
};

export default connect(mapStateToProps)(Alert);

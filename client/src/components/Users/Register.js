import React, { useState } from "react";
import { connect } from "react-redux";
import { Link, Navigate } from "react-router-dom";
import PropTypes from "prop-types";
import { register } from "../../redux/modules/users";
import { showAlertMessage } from "../../redux/modules/alerts";

const Register = ({ register, showAlertMessage, isAuthenticated }) => {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const { username, email, password, confirmPassword} = formData;

  const onChange = (e) => {
    return setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      showAlertMessage("Passwords do not match", "error");
    } else {
      await register({ username, email, password });
    }
  };

  if (isAuthenticated) {
    return <Navigate to="/home" />;
  }

  return (
    <div className=" main register">
      <p align="center" className="form-title">
        Sign Up
      </p>
      <form className="form2" onSubmit={onSubmit}>
        <input
          className="input-text"
          type="text"
          placeholder="User Name"
          align="center"
          name="username"
          value={username}
          onChange={onChange}
          required
        />
        <input
          className="input-text"
          type="text"
          placeholder="Email"
          align="center"
          name="email"
          value={email}
          onChange={onChange}
          required
        />
        <input
          className="input-text"
          type="password"
          placeholder="Password"
          name="password"
          value={password}
          onChange={(e) => onChange(e)}
          minLength="6"
        />
        <input
          className="input-text"
          type="password"
          placeholder="Confirm Password"
          name="confirmPassword"
          value={confirmPassword}
          onChange={(e) => onChange(e)}
          minLength="6"
        />
        <input
          type="submit"
          className="btn btn-primary"
          style={{ marginLeft: "36%" }}
          value="Register"
        />
        <p className="forgot" align="center">
          Already have an account? <Link to="/login">Sign In</Link>
        </p>
      </form>
    </div>
  );
};

Register.propTypes = {
  register: PropTypes.func.isRequired,
  showAlertMessage: PropTypes.func.isRequired,
  isAuthenticated: PropTypes.bool,
};


const mapStateToProps = (state) => ({
  isAuthenticated: state.users.isAuthenticated,
});

export default connect(mapStateToProps, { register, showAlertMessage })(
  Register
);

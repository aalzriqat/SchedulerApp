import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { login } from "../../redux/modules/users";
import usePersistedState from "../hooks/usePersistedState"; // Import the custom hook

const Login = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const { email, password } = formData;

  const dispatch = useDispatch();
  const navigate = useNavigate();

  // Use the custom hook to persist the token
  const [token, setToken] = usePersistedState("token", null);

  // Get authentication state and user role from Redux store
  const isAuthenticated = useSelector((state) => state?.users?.isAuthenticated);
  const userRole = useSelector((state) => state.users?.user?.role);

  const onChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const onSubmit = async (e) => {
    e.preventDefault();
    dispatch(login({ email, password }));
  };

  // Redirect logic based on role
  useEffect(() => {
    if (isAuthenticated) {
      if (userRole === "admin") {
        navigate("/admin/upload-schedule");
      } else if (userRole === "employee") {
        navigate("/employee/swap-request-form");
      } else {
        navigate("/"); // Default path for any other role
      }
    }
  }, [isAuthenticated, userRole, navigate]);

  return (
    <div className="main register">
      <p align="center" className="form-title">
        Sign In
      </p>
      <form className="form2" onSubmit={onSubmit}>
        <input
          className="input-text"
          type="text"
          placeholder="Email Address"
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
          onChange={onChange}
          minLength="6"
          required
        />

        <input
          type="submit"
          className="btn btn-primary"
          style={{ marginLeft: "36%" }}
          value="Login"
        />

        <p className="forgot" align="center">
          New to Scheduler? <Link to="/register">Sign Up</Link>
        </p>
      </form>
    </div>
  );
};

export default Login;
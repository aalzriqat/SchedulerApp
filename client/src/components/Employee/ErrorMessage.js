import React from 'react';
import PropTypes from 'prop-types';

const ErrorMessage = ({ message }) => <p className="error-message">{message}</p>;

ErrorMessage.propTypes = {
  message: PropTypes.string.isRequired,
};

export default ErrorMessage;
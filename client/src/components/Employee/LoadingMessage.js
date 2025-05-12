import React from 'react';
import PropTypes from 'prop-types';

const LoadingMessage = ({ message }) => <p className="loading-message">{message}</p>;

LoadingMessage.propTypes = {
  message: PropTypes.string.isRequired,
};

export default LoadingMessage;
import React from 'react';
import PropTypes from 'prop-types';

const Notification = ({ notifications }) => {
  return (
    <div
      id="popover-region-container-66f3dbb87de9d66f3dbb8725e04"
      className="popover-region-container"
      data-region="popover-region-container"
      aria-expanded="true"
      aria-hidden="false"
      aria-label="Notification window"
      role="region"
    >
      <div className="--popover-region-header-container so_heading">
        <p className="--popover-region-header-text" data-region="popover-region-header-text">
          Notifications
        </p>
        <div className="popover-region-header-actions" data-region="popover-region-header-actions">
          <a
            className="mark-all-read-button"
            href="#"
            title="Mark all as read"
            data-action="mark-all-read"
            role="button"
            aria-label="Mark all as read"
          >
            <span className="normal-icon">
              <i className="icon fa fa-check fa-fw" aria-hidden="true"></i>
            </span>
            <span className="loading-icon icon-no-margin">
              <i className="icon fa fa-circle-o-notch fa-spin fa-fw" title="Loading" role="img" aria-label="Loading"></i>
            </span>
          </a>
          <a
            href="https://lms.htux.org/message/notificationpreferences.php"
            title="Notification preferences"
            aria-label="Notification preferences"
          >
            <i className="icon fa flaticon-settings fa-fw" aria-hidden="true"></i>
          </a>
        </div>
      </div>
      <div
        className="popover-region-content-container"
        data-region="popover-region-content-container"
        aria-busy="false"
      >
        <div className="popover-region-content" data-region="popover-region-content">
          <div
            className="all-notifications"
            data-region="all-notifications"
            role="log"
            aria-busy="false"
            aria-atomic="false"
            aria-relevant="additions"
          >
            {notifications.length === 0 ? (
              <div className="empty-message" tabIndex="0" data-region="empty-message">
                You have no notifications
              </div>
            ) : (
              notifications.map((notification, index) => (
                <div key={index} className="notification-item">
                  {notification.message}
                </div>
              ))
            )}
          </div>
          <span className="loading-icon icon-no-margin">
            <i className="icon fa fa-circle-o-notch fa-spin fa-fw" title="Loading" role="img" aria-label="Loading"></i>
          </span>
        </div>
        <a
          className="see-all-link view_all_noti text-thm"
          href="https://lms.htux.org/message/output/popup/notifications.php"
        >
          <div className="ccn--popover-region-footer-container">
            <div className="popover-region-seeall-text">See all</div>
          </div>
        </a>
      </div>
    </div>
  );
};

Notification.propTypes = {
  notifications: PropTypes.array,
};

Notification.defaultProps = {
  notifications: [],
};

export default Notification;
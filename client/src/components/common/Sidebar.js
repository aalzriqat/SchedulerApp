import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';

const Sidebar = () => {
  const [isExpanded, setIsExpanded] = useState(true);
  const userRole = useSelector((state) => state.users?.user?.role);
  const isAuthenticated = useSelector((state) => state.users?.isAuthenticated);

  const toggleSidebar = () => {
    setIsExpanded(!isExpanded);
  };

  if (!isAuthenticated) {
    return null;
  }

  return (
    <section id="sidebar" className={isExpanded ? '' : 'hide'}>
      <button className="toggle-btn" onClick={toggleSidebar}>
        <span className="bx">&#9776;</span> {/* Hamburger icon */}
      </button>
      <ul className="side-menu top">
        {userRole === 'admin' && (
          <>
            <li><Link to="upload-schedule"><span className="bx">&#128197;</span>{isExpanded && 'Upload Schedule'}</Link></li>
            <li><Link to="swap-request"><span className="bx">&#128257;</span>{isExpanded && 'Swap Requests'}</Link></li>
            <li><Link to="all-schedules"><span className="bx">&#128198;</span>{isExpanded && 'View Schedules'}</Link></li>
            <li><Link to="all-preferences"><span className="bx">&#128221;</span>{isExpanded && 'View Preferences'}</Link></li>
            <li><Link to="leave-requests"><span className="bx">&#128100;</span>{isExpanded && 'Leave Requests'}</Link></li>
            <li><Link to="BreakingNews-manager"><span className="bx">&#128214;</span>{isExpanded && 'Manage News'}</Link></li> {/* New link for AdminBreakingNewsManager */}
          </>
        )}
        {userRole === 'employee' && (
          <>
            <li><Link to="swap-request-form"><span className="bx">&#128257;</span>{isExpanded && 'Swap Requester'}</Link></li>
            <li><Link to="employee-swap-requests"><span className="bx">&#128198;</span>{isExpanded && 'Swap Manager'}</Link></li>
            <li><Link to="preferences"><span className="bx">&#128221;</span>{isExpanded && 'Preferences'}</Link></li>
            <li><Link to="employee-leave-requests"><span className="bx">&#128100;</span>{isExpanded && 'Leave Requests'}</Link></li>
            <li><Link to="BreakingNews"><span className="bx">&#128214;</span>{isExpanded && 'View News'}</Link></li> {/* New link for ClientBreakingNewsViewer */}
          </>
        )}
      </ul>
    </section>
  );
};

export default Sidebar;
import React from 'react';
import PropTypes from 'prop-types';
import { formatTime } from './DateUtils';

const SwapRequestTable = ({ swaps, handleAccept, handleReject }) => (
  <table className="swap-table">
    <thead>
      <tr>
        <th>Requester</th>
        <th>Schedule</th>
        <th>Status</th>
        <th>Actions</th>
      </tr>
    </thead>
    <tbody>
      {swaps.length > 0 ? (
        swaps.map((swap) => (
          <tr key={swap._id}>
            <td>{swap.requester?.username || "N/A"}</td>
            <td>
              {swap.scheduleid
                ? `Working Hours: ${swap.scheduleid.workingHours || "N/A"}, Off Days: ${swap.scheduleid.offDays || "N/A"}`
                : "N/A"}
            </td>
            <td>{swap.status || "N/A"}</td>
            <td>
              <button className="btn btn-primary" onClick={() => handleAccept(swap._id)}>
                Accept
              </button>
              <button className="btn btn-danger" onClick={() => handleReject(swap._id)}>
                Reject
              </button>
            </td>
          </tr>
        ))
      ) : (
        <tr>
          <td colSpan="4" className="no-requests">No swap requests found.</td>
        </tr>
      )}
    </tbody>
  </table>
);

SwapRequestTable.propTypes = {
  swaps: PropTypes.array.isRequired,
  handleAccept: PropTypes.func.isRequired,
  handleReject: PropTypes.func.isRequired,
};

export default SwapRequestTable;
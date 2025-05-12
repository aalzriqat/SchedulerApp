import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchLeaveRequests,
  updateLeaveRequest,
} from "../../redux/modules/leaves"; // Adjust the import path as necessary
import * as XLSX from "xlsx";
import usePersistedState from "../hooks/usePersistedState"; // Import the custom hook

const exportToExcel = (data, fileName = "leave_requests.xlsx") => {
  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Leave Requests");
  XLSX.writeFile(workbook, fileName);
};

const LeaveRequests = () => {
  const dispatch = useDispatch();
  const { status, error } = useSelector((state) => state.leaves);
  const [leaveRequests, setLeaveRequests] = usePersistedState('leaveRequests', []);

  useEffect(() => {
    dispatch(fetchLeaveRequests());
  }, [dispatch]);

  const leaveRequestsFromStore = useSelector((state) => state.leaves.leaveRequests);

  useEffect(() => {
    if (leaveRequestsFromStore.length > 0) {
      setLeaveRequests(leaveRequestsFromStore);
    }
  }, [leaveRequestsFromStore, setLeaveRequests]);

  const handleApprove = (id) => {
    dispatch(updateLeaveRequest(id, { status: "approved" }));
  };

  const handleReject = (id) => {
    dispatch(updateLeaveRequest(id, { status: "rejected" }));
  };

  if (status === "loading") {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div className="main">
      <h2 className="form-title">Leave Requests</h2>
      <button
        className="btn-primary"
        onClick={() => exportToExcel(leaveRequests)}
      >
        Download as Excel
      </button>
      <table>
        <thead>
          <tr>
            <th>User</th>
            <th>Reason</th>
            <th>Creation Date</th>
            <th>Last Update</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {leaveRequests.map((request) => (
            <tr key={request._id}>
              <td>{request.user.username}</td>
              <td>{request.reason}</td>
              <td>{request.createdAt}</td>
              <td>{request.updatedAt}</td>
              <td>{request.status}</td>
              <td>
                {request.status === "pending" && (
                  <>
                    <button onClick={() => handleApprove(request._id)}>
                      Approve
                    </button>
                    <button onClick={() => handleReject(request._id)}>
                      Reject
                    </button>
                  </>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default LeaveRequests;
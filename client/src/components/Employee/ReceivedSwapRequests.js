import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchReceivedSwaps,
  updateSwapStatus,
  clearUploadError, // Import the action to reset the error state
} from "../../redux/modules/admin";

const ReceivedSwapRequests = () => {
  const dispatch = useDispatch();
  const { user, isAuthenticated } = useSelector((state) => state.users);
  const { receivedSwaps, loading, error } = useSelector((state) => ({
    receivedSwaps: state.admin.swaps.received,
    loading: state.admin.loading.receivedSwaps,
    error: state.admin.error,
  }));
  const [transformedSwaps, setTransformedSwaps] = useState([]);

  useEffect(() => {
    if (isAuthenticated && user?._id) {
      dispatch(fetchReceivedSwaps(user._id));
    }
  }, [dispatch, isAuthenticated, user?._id]);

  useEffect(() => {
    // Transform the swaps only after they are fetched
    if (receivedSwaps && receivedSwaps.length > 0) {
      const transformedData = receivedSwaps.map((swap) => {
        // You can perform any necessary data transformation here
        return swap;
      });
      setTransformedSwaps(transformedData);
    } else {
      setTransformedSwaps([]); // Reset if there are no swaps
    }
  }, [receivedSwaps]);

  useEffect(() => {
    // Reset state when an error occurs
    if (error) {
      setTransformedSwaps([]);
    }
  }, [error]);

  useEffect(() => {
    // Cleanup function to reset error state when component unmounts or auth state changes
    return () => {
      dispatch(clearUploadError());
    };
  }, [dispatch, isAuthenticated]);

  const handleAccept = (swapId) => {
    dispatch(
      updateSwapStatus(
        swapId,
        "accepted",
        "Swap accepted.",
        user.role,
        "pending"
      )
    ).then(() => {
      dispatch(fetchReceivedSwaps(user._id));
    });
  };

  const handleReject = (swapId) => {
    dispatch(
      updateSwapStatus(
        swapId,
        "rejected",
        "Swap rejected.",
        user.role,
        "cancelled"
      )
    ).then(() => {
      dispatch(fetchReceivedSwaps(user._id));
    });
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    const options = {
      timeZone: "Asia/Amman",
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    };
    const formatter = new Intl.DateTimeFormat("en-GB", options);
    const [
      { value: day },
      ,
      { value: month },
      ,
      { value: year },
      ,
      { value: hours },
      ,
      { value: minutes },
      ,
      { value: seconds },
    ] = formatter.formatToParts(date);

    return `${day}-${month}-${year} ,${hours}:${minutes}:${seconds}`;
  };

  const getStatusStyle = (adminApproval) => {
    switch (adminApproval) {
      case "pending":
        return { backgroundColor: "yellow" };
      case "accepted":
      case "approved":
        return { backgroundColor: "green", color: "white" };
      case "rejected":
      case "declined":
        return { backgroundColor: "red", color: "white" };
      default:
        return {};
    }
  };

  if (!isAuthenticated) {
    return <p>You need to log in to view swap requests.</p>;
  }

  // Show loading while fetching received swaps
  if (loading.receivedSwaps) {
    return <p className="loading-message">Loading...</p>;
  }

  // Handle any errors
  if (error) {
    return <p>{error}</p>;
  }

  return (
    <div className="manage-leave-main">
      <h2 className="form-title">Received Swap Requests</h2>
      {transformedSwaps.length > 0 ? (
        <table className="swap-table">
          <thead>
            <tr>
              <th>Hidden</th>
              <th>Schedule</th>
              <th>Creation Date</th>
              <th>Last Update</th>
              <th>Status</th>
              <th>Actions</th>
              <th>Approval</th>
              <th>Week</th>
            </tr>
          </thead>
          <tbody>
            {transformedSwaps.map((swap) => (
              <tr key={swap._id}>
                <td>{swap.requester?.username || "N/A"}</td>
                <td>
                  {swap.requesterSchedule
                    ? `Working Hours: ${
                        swap.requesterSchedule.workingHours || "N/A"
                      }, Off Days: ${swap.requesterSchedule.offDays || "N/A"}`
                    : "N/A"}
                </td>
                <td>{formatTime(swap.createdAt)}</td>
                <td>{formatTime(swap.updatedAt)}</td>
                <td>{swap.status || "N/A"}</td>
                <td>
                  {swap.status === "pending" ? (
                    <>
                      <button
                        className="custom-btn custom-btn-primary"
                        onClick={() => handleAccept(swap._id)}
                      >
                        Accept
                      </button>
                      <button
                        className="custom-btn custom-btn-danger"
                        onClick={() => handleReject(swap._id)}
                      >
                        Reject
                      </button>
                    </>
                  ) : (
                    <span>{swap.status}</span>
                  )}
                </td>
                <td style={getStatusStyle(swap.status)}>
                  {swap.adminApproval}
                </td>
                <td>{swap.requesterSchedule?.week || "N/A"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p>No swap requests found.</p>
      )}
    </div>
  );
};

export default ReceivedSwapRequests;
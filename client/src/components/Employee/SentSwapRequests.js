import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchSentSwaps } from "../../redux/modules/admin";

const SentSwapRequests = () => {
  const dispatch = useDispatch();
  const { user, isAuthenticated } = useSelector((state) => state.users);
  const { sentSwaps, loading, error } = useSelector((state) => ({
    sentSwaps: state.admin.swaps.sent,
    loading: state.admin.loading.sentSwaps,
    error: state.admin.error,
  }));

  useEffect(() => {
    if (isAuthenticated && user?._id) {
      dispatch(fetchSentSwaps(user._id));
    }
  }, [dispatch, isAuthenticated, user?._id]);

  if (!isAuthenticated) {
    return <p>You need to log in to view swap requests.</p>;
  }

  if (loading.swaps) {
    return <p className="loading-message">Loading...</p>;
  }

  if (error) {
    return <p>{error}</p>;
  }

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

    return `${day}-${month}-${year} , ${hours}:${minutes}:${seconds}`;
  };

  // Sort sentSwaps by week in descending order
  const sortedSwaps = [...sentSwaps].sort((a, b) => {
    const weekA = a.recipientSchedule?.week || 0;
    const weekB = b.recipientSchedule?.week || 0;
    return weekB - weekA;
  });

  return (
    <div className="manage-leave-main">
      <h2 className="form-title">Sent Swap Requests</h2>
      {sortedSwaps.length > 0 ? (
        <table className="swap-table">
          <thead>
            <tr>
              <th>Hidden</th> <th>Requested Schedule</th>
              <th>Creation Date</th>
              <th>Last Update</th>
              <th>Status</th>
              <th>Admin Approval</th>
              <th>Week</th>
            </tr>
          </thead>
          <tbody>
            {sortedSwaps.map((swap) => (
              <tr key={swap._id}>
                <td>{swap.recipient?.username || "N/A"}</td>
                <td>
                  {swap.recipientSchedule
                    ? `Working Hours: ${
                        swap.recipientSchedule.workingHours || "N/A"
                      }, Off Days: ${swap.recipientSchedule.offDays || "N/A"}`
                    : "N/A"}
                </td>
                <td>{formatTime(swap.createdAt)}</td>
                <td>{formatTime(swap.updatedAt)}</td>
                <td>{swap.status}</td>
                <td>{swap.adminApproval}</td>
                <td>{swap.recipientSchedule?.week || "N/A"}</td>
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

export default SentSwapRequests;
import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchSwaps, updateSwapStatus } from "../../redux/modules/admin";
import SwapRequestTable from "../common/SwapRequestTable";
import LoadingMessage from "../common/LoadingMessage";
import ErrorMessage from "../common/ErrorMessage";
import { cancelAllSwaps } from "../../redux/modules/swap";
const ManageSwaps = () => {
  const dispatch = useDispatch();
  const { swaps, loading, error } = useSelector((state) => state.admin);

  useEffect(() => {
    dispatch(fetchSwaps());
  }, [dispatch]);

  const handleAccept = (swapId) => {
    dispatch(updateSwapStatus(swapId, "accepted", "Swap accepted.")).then(() => {
      dispatch(fetchSwaps());
    });
    
  };

  const handleReject = (swapId) => {
    dispatch(updateSwapStatus(swapId, "rejected", "Swap rejected.")).then(() => {
      dispatch(fetchSwaps());
    });
  };

  return (
    <div className="main">
      <p className="form-title">Received Shift Swap Requests</p>
      {loading ? (
        <LoadingMessage message="Loading..." />
      ) : error ? (
        <ErrorMessage message={error} />
      ) : (
        <SwapRequestTable swaps={swaps} handleAccept={handleAccept} handleReject={handleReject} />
      )}
    </div>
  );
};

export default ManageSwaps;
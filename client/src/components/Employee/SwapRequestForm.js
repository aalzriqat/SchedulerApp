import React, { useEffect, useCallback, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { createSwapRequestAction, resetSwapRequest } from "../../redux/modules/employee";
import { fetchSchedules } from "../../redux/modules/admin";
import { fetchUsers } from "../../redux/modules/users";
import SwapRequestFormContent from "./SwapRequestFormContent";
import useAvailableSchedules from "../hooks/useAvailableSchedules";
import useForm from "../hooks/useForm";
import LoadingMessage from "../common/LoadingMessage";
import ErrorMessage from "../common/ErrorMessage";

const SwapRequestForm = () => {
  const dispatch = useDispatch();
  const [selectedWeek, setSelectedWeek] = useState("");

  useEffect(() => {
    dispatch(fetchSchedules());
    dispatch(fetchUsers());
  }, [dispatch]);

  const { schedules = [], loadingSchedules } = useSelector((state) => state.admin || {});
  const { users = [], usersLoading, user } = useSelector((state) => state.users || {});
  const { error, loadingSwap, swapRequest } = useSelector((state) => state.employee || {});

  const availableSchedules = useAvailableSchedules(schedules, users, user, selectedWeek);

  const onSubmit = useCallback((formData, setFormError) => {
    const { selectedScheduleId } = formData;

    if (!selectedScheduleId) {
      setFormError("Please select a schedule.");
      return;
    }

    const recipientSchedule = schedules.find((schedule) => schedule._id === selectedScheduleId);

    if (!recipientSchedule) {
      setFormError("Recipient schedule not found.");
      return;
    }

    const requesterSchedule = schedules.find((schedule) => schedule.user && schedule.user._id === user._id && schedule.week === selectedWeek);

    if (!requesterSchedule) {
      setFormError("You have no active schedules to swap for the selected week.");
      return;
    }

    dispatch(
      createSwapRequestAction(
        selectedScheduleId,
        requesterSchedule._id,
        recipientSchedule.user._id,
        user._id,
        recipientSchedule.skill,
        recipientSchedule.marketPlace
      )
    );
    
  }, [schedules, user, selectedWeek, dispatch]);

  const { formData, formError, handleChange, handleSubmit, setFormError } = useForm({ selectedScheduleId: "" }, onSubmit);

  useEffect(() => {
    setFormError(error || "");
  }, [error, setFormError]);

  useEffect(() => {
    setFormError("");
    dispatch(resetSwapRequest());
  }, [formData.selectedScheduleId, dispatch, setFormError]);

  return (
    <div className="main manage-leave-main">
      <h2 className="form-title">Swap Requester</h2>
      {loadingSchedules && <LoadingMessage message="Loading schedules..." />}
      {usersLoading && <LoadingMessage message="Loading users..." />}

      <label>Select a week:</label>
      <select value={selectedWeek} onChange={(e) => setSelectedWeek(e.target.value)} required>
        <option value="">--Select Week--</option>
        {[...new Set(schedules.map(schedule => schedule.week))].map(week => (
          <option key={week} value={week}>{week}</option>
        ))}
      </select>

      {!loadingSchedules && !usersLoading && schedules && user && (
        <SwapRequestFormContent
          availableSchedules={availableSchedules}
          selectedScheduleId={formData.selectedScheduleId}
          setSelectedScheduleId={(id) => handleChange({ target: { name: "selectedScheduleId", value: id } })}
          handleSubmit={handleSubmit}
          loadingSwap={loadingSwap}
          user={user}
        />
      )}

      {formError && <ErrorMessage message={formError} />}
      {swapRequest && <p className="success-message">Swap Request Sent To The User Successfully!</p>}
    </div>
  );
};

export default SwapRequestForm;
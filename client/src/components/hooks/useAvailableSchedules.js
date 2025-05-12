import { useMemo, useCallback } from "react";

const useAvailableSchedules = (schedules, users, user, selectedWeek) => {
  const parseStartTime = useCallback((timeRange) => {
    if (!timeRange) {
      console.error("Time range is undefined or null:", timeRange);
      return 0;
    }
    const [start] = timeRange.split("-").map(time => time.trim());
    if (!start) {
      console.error("Invalid time range format:", timeRange);
      return 0;
    }
    const [startHours, startMinutes] = start.split(":").map(Number);
    if (isNaN(startHours) || isNaN(startMinutes)) {
      console.error("Invalid time values in time range:", timeRange);
      return 0;
    }
    return startHours * 60 + startMinutes;
  }, []);

  const isStartTimeGreaterOrEqual = useCallback((range1, range2) => {
    const start1 = parseStartTime(range1);
    const start2 = parseStartTime(range2);
    const result = start1 >= start2;
    console.log(`Comparing start times: ${range1} (${start1} minutes) >= ${range2} (${start2} minutes) => ${result}`);
    return result;
  }, [parseStartTime]);

  return useMemo(() => {
    console.log("useAvailableSchedules inputs:", { schedules, users, user, selectedWeek });

    if (!schedules.length || !users.length || !user || !selectedWeek) {
      console.log("Missing schedules, users, user data, or selected week.");
      return [];
    }

    const requesterSchedule = schedules.find(schedule => schedule.user._id === user._id && schedule.week === selectedWeek);

    if (!requesterSchedule) {
      console.log("Requester schedule not found for the selected week.");
      return [];
    }

    const eligibleSchedules = [];

    schedules.forEach(schedule => {
      if (schedule.week !== selectedWeek) {
        console.log(`Skipping schedule ID: ${schedule._id} for week: ${schedule.week}`);
        return;
      }

      const scheduleUser = users.find(u => u._id === schedule.user._id);

      if (!scheduleUser) {
        console.log(`User not found for schedule ID: ${schedule._id}`);
        return;
      }

      if (scheduleUser._id === user._id) {
        console.log(`Skipping own schedule for user ID: ${user._id}`);
        return;
      }

      if (!scheduleUser.isOpenForSwap) {
        console.log(`User ID: ${scheduleUser._id} is not open for swap`);
        return;
      }

      if (scheduleUser.role !== "employee") {
        console.log(`User ID: ${scheduleUser._id} is not an employee`);
        return;
      }

      if (!schedule.skill || schedule.skill !== requesterSchedule.skill) {
        console.log(`Skill mismatch for schedule ID: ${schedule._id}. Schedule skill: ${schedule.skill}, Requester skill: ${requesterSchedule.skill}`);
        return;
      }

      if (schedule.marketPlace !== requesterSchedule.marketPlace) {
        console.log(`MarketPlace mismatch for schedule ID: ${schedule._id}. Schedule marketPlace: ${schedule.marketPlace}, Requester marketPlace: ${requesterSchedule.marketPlace}`);
        return;
      }

      const scheduleWorkingHours = schedule.workingHours;
      const requesterScheduleWorkingHours = requesterSchedule.workingHours;

      if (!scheduleWorkingHours || !requesterScheduleWorkingHours) {
        console.error("Working hours are undefined for schedule or requester:", scheduleWorkingHours, requesterScheduleWorkingHours);
        return;
      }

      console.log(`Comparing scheduleWorkingHours: ${scheduleWorkingHours} with requesterScheduleWorkingHours: ${requesterScheduleWorkingHours}`);
      const result = isStartTimeGreaterOrEqual(scheduleWorkingHours, requesterScheduleWorkingHours);

      console.log(`Schedule ID: ${schedule._id}, Result: ${result}`);
      if (result) {
        eligibleSchedules.push(schedule);
      }
    });

    console.log("Available schedules before return:", eligibleSchedules);
    return eligibleSchedules;
  }, [schedules, users, user, selectedWeek, isStartTimeGreaterOrEqual]);
};

export default useAvailableSchedules;
import express from "express";
import {
  getAllSchedules,
  uploadSchedule,
  getAvailableSchedules,
  getSchedulesByEmployeeId // Import the new controller function
} from "../controllers/scheduleController.js";

const router = express.Router();

router.get("/all", getAllSchedules);
router.post("/upload", uploadSchedule);
router.post('/available-schedules', getAvailableSchedules);
router.get("/employee/:employeeId", getSchedulesByEmployeeId); // Add the new route

export default router;
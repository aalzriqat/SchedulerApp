import React, { useEffect, useMemo, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchSchedules } from '../../redux/modules/admin';
import * as XLSX from 'xlsx';
import usePersistedState from '../hooks/usePersistedState'; // Import the custom hook

const AllSchedules = () => {
  const dispatch = useDispatch();
  const { schedules = [], loading, error } = useSelector((state) => state.admin); // Default to an empty array
  const [searchQuery, setSearchQuery] = usePersistedState('searchQuery', ''); // Use usePersistedState for searchQuery

  useEffect(() => {
    dispatch(fetchSchedules()); // Fetch all schedules when the component mounts
  }, [dispatch]);

  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
  };

  const filteredSchedules = useMemo(() => {
    if (!Array.isArray(schedules)) return [];
    return schedules.filter((schedule) => {
      const { user, workingHours, offDays, week } = schedule;
      const username = user?.username || 'N/A';
      const offDaysStr = Array.isArray(offDays) ? offDays.join(', ') : offDays || 'N/A';
      const weekStr = week || 'N/A';

      return (
        username.toLowerCase().includes(searchQuery.toLowerCase()) ||
        workingHours.toLowerCase().includes(searchQuery.toLowerCase()) ||
        offDaysStr.toLowerCase().includes(searchQuery.toLowerCase()) ||
        weekStr.toLowerCase().includes(searchQuery.toLowerCase())
      );
    });
  }, [schedules, searchQuery]);

  const exportToExcel = () => {
    try {
      const worksheet = XLSX.utils.json_to_sheet(filteredSchedules.map(schedule => ({
        Username: schedule.user?.username || 'N/A',
        'Working Hours': schedule.workingHours || 'N/A',
        'Off Days': Array.isArray(schedule.offDays) ? schedule.offDays.join(', ') : schedule.offDays || 'N/A',
        Week: schedule.week || 'N/A'
      })));
      const workbook = XLSX.utils.book_new();
      const weeks = [...new Set(filteredSchedules.map(schedule => schedule.week || 'N/A'))].join('-');
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Schedules');
      XLSX.writeFile(workbook, `schedules-Weeks${weeks}.xlsx`);
    } catch (error) {
      console.error('Error exporting to Excel:', error);
      alert('An error occurred while exporting to Excel. Please try again.');
    }
  };

  if (loading.schedules) {
    return <p className="loading-message">Loading...</p>;
  }

  if (error) {
    return <p className="error-message">An error occurred: {JSON.stringify(error)}</p>; 
  }

  return (
    <div className="main">
      <h2 className="form-title">Schedules History</h2>
      <input
        type="text"
        placeholder="Search by username, working hours, off days, or week..."
        value={searchQuery}
        onChange={handleSearch}
        className="search-input"
        aria-label="Search schedules"
      />
      <button className="btn-primary" onClick={exportToExcel}>Download as Excel</button>
      <table className="schedule-table">
        <thead>
          <tr>
            <th>Username</th>
            <th>Working Hours</th>
            <th>Off Days</th>
            <th>Week</th>
            <th>Skill</th>
            <th>Market Place</th>
          </tr>
        </thead>
        <tbody>
          {filteredSchedules.length > 0 ? (
            filteredSchedules.map((schedule) => (
              <tr key={schedule._id}>
                <td>{schedule.user?.username || 'N/A'}</td>
                <td>{schedule.workingHours || 'N/A'}</td>
                <td>{Array.isArray(schedule.offDays) ? schedule.offDays.join(', ') : schedule.offDays || 'N/A'}</td>
                <td>{schedule.week || 'N/A'}</td>
                <td>{schedule.skill || 'N/A'}</td>
                <td>{schedule.marketPlace || 'N/A'}</td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="6">No schedules found</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default AllSchedules;
import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, Button, RefreshControl as RNRefreshControl, TouchableOpacity } from 'react-native'; // Added TouchableOpacity
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../../store/store';
import { User } from '../../store/slices/authSlice';
import { fetchMyPersonalAnalytics, clearEmployeeAnalyticsError } from '../../store/slices/analyticsSlice'; // Removed EmployeePersonalAnalytics as it's mock
import { fetchUserSchedule, Shift } from '../../store/slices/employeeScheduleSlice'; // For schedule
import { fetchMySwapRequests, APISwapRequest } from '../../store/slices/swapSlice'; // For swaps
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { useThemeColor } from '@/hooks/useThemeColor';
import { useRouter } from 'expo-router'; // Added for navigation

const EmployeeDashboardScreen = () => {
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter(); // Added for navigation
  const { user }: { user: User | null } = useSelector((state: RootState) => state.auth);
  
  // Analytics Data (current mock)
  const { employeePersonalData, isLoadingEmployeeData, employeeDataError } = useSelector(
    (state: RootState) => state.analytics
  );
  // Schedule Data
  const { shifts: userSchedule, isLoading: isLoadingSchedule, error: scheduleError } = useSelector(
    (state: RootState) => state.employeeSchedule
  );
  // Swap Requests Data
  const { mySentRequests = [], myReceivedRequests = [], isLoadingMySwaps, mySwapsError } = useSelector( // Added isLoadingMySwaps, mySwapsError
    (state: RootState) => state.swaps
  );

  const themedPrimaryButtonBg = useThemeColor({}, 'buttonPrimaryBackground');
  const themedPrimaryButtonText = useThemeColor({}, 'buttonPrimaryText');
  const themedCardBackgroundColor = useThemeColor({}, 'cardBackground');
  const themedBorderColor = useThemeColor({}, 'border');


  useEffect(() => {
    if (user?.id) {
      dispatch(fetchMyPersonalAnalytics()); // Still fetch analytics
      dispatch(fetchUserSchedule(user.id));
      dispatch(fetchMySwapRequests(user.id));
    }
    return () => {
      // Consider if errors should be cleared here or in respective screens
      dispatch(clearEmployeeAnalyticsError());
      // dispatch(clearEmployeeScheduleErrors()); // If exists
      // dispatch(clearAllSwapErrors()); // If exists and appropriate
    };
  }, [dispatch, user?.id]);

  const onRefresh = () => {
    if (user?.id) {
      dispatch(fetchMyPersonalAnalytics());
      dispatch(fetchUserSchedule(user.id));
      dispatch(fetchMySwapRequests(user.id));
    }
  };

  // --- Date and Schedule Logic Helpers ---
  const dayOfWeekAsString = (dayIndex: number): string => {
    return ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"][dayIndex];
  };

  const getCurrentWeekNumber = (startDate: Date, currentDate: Date): number => {
    // This is a simplified week calculation. A more robust solution would consider the actual start date of "Week 1".
    // For now, let's assume Week 1 starts at a fixed point or use a placeholder.
    // This needs a proper definition of how 'week' in the schedule data maps to calendar weeks.
    // Placeholder:
    const oneDay = 24 * 60 * 60 * 1000;
    const firstDate = new Date(startDate.getFullYear(), 0, 1); // Assuming week 1 starts Jan 1st for simplicity
    const days = Math.floor((currentDate.getTime() - firstDate.getTime()) / oneDay);
    return Math.ceil(days / 7);
  };
  
  // --- Data Processing for Cards ---
  let todayShiftInfo: string | Shift = "Details unavailable";
  let upcomingShiftsInfo: Shift[] = [];

  if (userSchedule && userSchedule.length > 0) {
    const today = new Date();
    const currentDayName = dayOfWeekAsString(today.getDay());
    // Simplified: Assuming userSchedule is sorted by week or we find the 'current' week.
    // This logic is highly dependent on how 'week' in schedule maps to actual dates.
    // For this example, let's find a schedule for a 'current week' (e.g., week 1 as placeholder)
    // A proper implementation needs a way to map calendar date to schedule week.
    const currentCalendarWeek = getCurrentWeekNumber(new Date(userSchedule[0]?.createdAt || today), today); // Example: use createdAt of first schedule as a rough start

    const currentWeekSchedule = userSchedule.find((s: Shift) => s.week === currentCalendarWeek); // Typed 's'

    if (currentWeekSchedule) {
      if (currentWeekSchedule.offDays.includes(currentDayName)) {
        todayShiftInfo = "Day Off";
      } else {
        todayShiftInfo = currentWeekSchedule; // Pass the whole shift object
      }
    } else {
      todayShiftInfo = "No schedule found for current week";
    }

    // Upcoming shifts: simple take next 2 from a future week or later in current week (simplified)
    upcomingShiftsInfo = userSchedule.filter((s: Shift) => s.week >= currentCalendarWeek).slice(0, 3); // Typed 's'
    if (currentWeekSchedule && typeof todayShiftInfo === 'object' && todayShiftInfo._id) { // Check if todayShiftInfo is a Shift object
        // If today has a shift, make sure upcoming doesn't include today's
        upcomingShiftsInfo = userSchedule.filter((s: Shift) => s.week > currentCalendarWeek || (s.week === currentCalendarWeek && s._id !== (todayShiftInfo as Shift)._id )).slice(0,3); // Typed 's'
    } else {
         upcomingShiftsInfo = userSchedule.filter((s: Shift) => s.week >= currentCalendarWeek).slice(0,3); // Typed 's'
    }


  }

  const swapSummaryData = {
    pendingSent: mySentRequests.filter((s: APISwapRequest) => s.status === 'pending').length,
    pendingReceived: myReceivedRequests.filter((r: APISwapRequest) => r.status === 'pending').length,
  };

  // --- Card Rendering Logic ---
  const renderInfoCard = (
    title: string,
    content: React.ReactNode,
    cardStyle?: object,
    titleStyle?: object,
    contentStyle?: object
  ) => (
    <ThemedView style={[styles.infoCard, {backgroundColor: themedCardBackgroundColor, borderColor: themedBorderColor}, cardStyle]}>
      <ThemedText style={[styles.infoCardTitle, titleStyle]}>{title}</ThemedText>
      <View style={contentStyle}>{content}</View>
    </ThemedView>
  );
  
  const renderMetricCard = (title: string, value: string | number | undefined, unit: string = '') => (
    <ThemedView style={styles.metricCard}>
      <ThemedText style={styles.metricTitle}>{title}</ThemedText>
      <ThemedText style={styles.metricValue}>{value ?? 'N/A'} {unit}</ThemedText>
    </ThemedView>
  );

  // Combined loading state for initial dashboard content
  const isInitialLoading = isLoadingSchedule || isLoadingMySwaps; // Not including analytics as it's mock

  if (isInitialLoading && !userSchedule.length && (!mySentRequests.length && !myReceivedRequests.length)) {
    return (
      <ThemedView style={[styles.container, styles.centerContent]}>
        <ActivityIndicator size="large" color={themedPrimaryButtonBg} />
        <ThemedText>Loading your dashboard...</ThemedText>
      </ThemedView>
    );
  }
  
  // Note: todayScheduleData and upcomingShiftsData are processed above and used directly in JSX.
  // The swapSummaryData is also calculated above.
  // The placeholder declarations for these are removed as they are now populated or used directly.

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.scrollContentContainer}
      refreshControl={<RNRefreshControl refreshing={isLoadingSchedule || isLoadingMySwaps || isLoadingEmployeeData} onRefresh={onRefresh} colors={[themedPrimaryButtonBg]}/>}
    >
      <ThemedText style={styles.welcomeMessage}>Welcome, {user?.name || 'Employee'}!</ThemedText>

      {/* Error display for multiple sources - can be refined */}
      {(scheduleError || mySwapsError || employeeDataError) && (
        <ThemedView style={styles.errorContainer}>
          <ThemedText style={styles.errorText}>
            {scheduleError && `Schedule Error: ${scheduleError}\n`}
            {mySwapsError && `Swap Error: ${mySwapsError}\n`}
            {employeeDataError && `Analytics Error: ${employeeDataError}`}
          </ThemedText>
          <Button title="Retry All" onPress={onRefresh} color={themedPrimaryButtonBg} />
        </ThemedView>
      )}

      {/* New Card-based layout - Content is now directly rendered here */}
      {renderInfoCard(
        "Today's Shift",
        typeof todayShiftInfo === 'string'
          ? <ThemedText>{todayShiftInfo}</ThemedText>
          : (
            <>
              <ThemedText>Hours: {todayShiftInfo.workingHours}</ThemedText>
              <ThemedText>Status: {todayShiftInfo.isOpenForSwap ? "Open for Swap" : "Not open for swap"}</ThemedText>
            </>
          )
      )}

      {renderInfoCard(
        "Upcoming Shifts",
        upcomingShiftsInfo.length > 0
          ? upcomingShiftsInfo.map((shift: Shift) => (
            <View key={shift._id} style={[styles.upcomingShiftItem, {borderBottomColor: themedBorderColor}]}>
              <ThemedText style={styles.bold}>Week {shift.week}:</ThemedText>
              <ThemedText>  Hours: {shift.workingHours}</ThemedText>
              <ThemedText>  Off Days: {shift.offDays.join(', ')}</ThemedText>
            </View>
          ))
          : <ThemedText>No upcoming shifts scheduled.</ThemedText>
      )}

      {renderInfoCard(
        "Swap Requests",
        <>
          <ThemedText>Pending Sent: {swapSummaryData.pendingSent}</ThemedText>
          <ThemedText>Pending Received: {swapSummaryData.pendingReceived}</ThemedText>
          <TouchableOpacity
            style={styles.cardButton}
            onPress={() => router.push('/hub/swaps/swapStatus')} // Corrected path
          >
            <ThemedText style={styles.cardButtonText}>View All Swaps</ThemedText>
          </TouchableOpacity>
        </>
      )}
      
      {/* Existing Performance Section (can be a card too) */}
      {/* {employeePersonalData && (
        <ThemedView style={styles.section}>
          <ThemedText type="subtitle" style={styles.sectionTitle}>My Performance (Mock Data)</ThemedText>
          {renderMetricCard('Shifts Completed', employeePersonalData.shiftsCompleted)}
          {renderMetricCard('Punctuality', employeePersonalData.punctualityPercentage, '%')}
          {renderMetricCard('Hours This Period', employeePersonalData.hoursWorkedThisPeriod, 'hrs')}
        </ThemedView>
      )} */}
      
      {/* {renderInfoCard("Quick Actions",
        <View>
          <TouchableOpacity
            style={[styles.cardButton, {backgroundColor: themedPrimaryButtonBg}]}
            onPress={() => router.push('/(app)/(tabs)/(employee)/employeeSchedule')}
          >
            <ThemedText style={[styles.cardButtonText, {color: themedPrimaryButtonText}]}>My Schedule</ThemedText>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.cardButton, {backgroundColor: themedPrimaryButtonBg, marginTop: 10}]}
            onPress={() => router.push('/(app)/(tabs)/(employee)/submitLeave')}
          >
            <ThemedText style={[styles.cardButtonText, {color: themedPrimaryButtonText}]}>Submit Leave</ThemedText>
          </TouchableOpacity>
        </View>
      )} */}

    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContentContainer: {
    padding: 16,
  },
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 50,
  },
  mainTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  welcomeMessage: {
    fontSize: 18,
    marginBottom: 20,
    textAlign: 'center',
  },
  errorContainer: {
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#ffebee',
    borderRadius: 8,
    marginBottom: 20,
  },
  errorText: {
    color: '#c62828',
    fontSize: 16,
    marginBottom: 10,
    textAlign: 'center',
  },
  section: {
    marginBottom: 20,
    padding: 15,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 10,
  },
  metricCard: {
    padding: 12,
    borderRadius: 6,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#d0d0d0',
  },
  metricTitle: {
    fontSize: 15,
    fontWeight: '500',
    marginBottom: 4,
  },
  metricValue: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  placeholderText: {
    fontStyle: 'italic',
    textAlign: 'center',
    paddingVertical: 10,
  },
  // Styles for new cards
  infoCard: {
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
    borderWidth: 1,
    // backgroundColor and borderColor are themed, applied inline via ThemedView
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1, // Softer shadow
    },
    shadowOpacity: 0.08, // Softer shadow
    shadowRadius: 2.22, // Softer shadow
    elevation: 2, // Softer shadow
  },
  infoCardTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 10,
  },
  upcomingShiftItem: {
    marginBottom: 8,
    paddingBottom: 8,
    borderBottomWidth: 1,
    // borderBottomColor is now applied inline using themedBorderColor
  },
  cardButton: {
    marginTop: 10,
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 8,
    alignItems: 'center',
    // backgroundColor is applied inline using themedPrimaryButtonBg
  },
  cardButtonText: {
    fontWeight: 'bold',
    fontSize: 16,
    // color is applied inline using themedPrimaryButtonText
  },
  bold: { fontWeight: 'bold' },
});

export default EmployeeDashboardScreen;
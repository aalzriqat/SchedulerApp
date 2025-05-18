import React, { useEffect, useCallback } from 'react'; // Import useCallback
import { View, StyleSheet, ScrollView, ActivityIndicator, RefreshControl, TouchableOpacity } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../../store/store';
import { fetchAdminDashboardAnalytics, clearAdminAnalyticsError } from '../../store/slices/analyticsSlice';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { useThemeColor } from '@/hooks/useThemeColor';
import { Colors } from '@/constants/Colors'; // Import Colors

// TODO: Replace TouchableOpacity with a ThemedButton component once available
const ThemedButtonPlaceholder = ({ title, onPress, style, textStyle }: { title: string, onPress: () => void, style?: any, textStyle?: any }) => {
  const buttonBackgroundColor = useThemeColor({}, 'buttonPrimaryBackground');
  const buttonTextColor = useThemeColor({}, 'buttonPrimaryText');
  return (
    <TouchableOpacity onPress={onPress} style={[styles.themedButton, { backgroundColor: buttonBackgroundColor }, style]}>
      <ThemedText style={[{ color: buttonTextColor }, textStyle]}>{title}</ThemedText>
    </TouchableOpacity>
  );
};


const AdminDashboardScreen = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { adminDashboardData, isLoadingAdminData, adminDataError } = useSelector(
    (state: RootState) => state.analytics
  );

  const tintColor = useThemeColor({}, 'tint');
  const cardBackgroundColor = useThemeColor({}, 'cardBackground');
  const borderColor = useThemeColor({}, 'border');
  const errorTextColor = useThemeColor({}, 'errorText');
  const subtleTextColor = useThemeColor({}, 'subtleText');
  const defaultTextColor = useThemeColor({}, 'text');


  useEffect(() => {
    dispatch(fetchAdminDashboardAnalytics());
    return () => {
      dispatch(clearAdminAnalyticsError());
    }
  }, [dispatch]);

  const onRefresh = useCallback(() => {
    dispatch(fetchAdminDashboardAnalytics());
  }, [dispatch]);

  const renderMetricCard = (title: string, value: string | number | undefined, unit: string = '') => (
    <ThemedView style={[styles.metricCard, { backgroundColor: cardBackgroundColor, borderColor: borderColor }]}>
      <ThemedText type="defaultSemiBold" style={[styles.metricTitle, { color: subtleTextColor }]}>{title}</ThemedText>
      <ThemedText type="subtitle" style={[styles.metricValue, { color: tintColor }]}>{value ?? 'N/A'} {unit}</ThemedText>
    </ThemedView>
  );

  const renderChartPlaceholder = (title: string) => (
    <ThemedView style={[styles.chartPlaceholder, { borderColor: tintColor }]}>
      <ThemedText type="defaultSemiBold" style={styles.chartTitle}>{title}</ThemedText>
      <ThemedText style={[styles.chartText, { color: subtleTextColor }]}>(Chart Placeholder - e.g., using react-native-svg-charts or a WebView library)</ThemedText>
    </ThemedView>
  );

  if (isLoadingAdminData && !adminDashboardData) {
    return (
      <ThemedView style={[styles.container, styles.centerContent]}>
        <ActivityIndicator size="large" color={tintColor} />
        <ThemedText>Loading dashboard data...</ThemedText>
      </ThemedView>
    );
  }

  if (adminDataError) {
    return (
      <ThemedView style={[styles.container, styles.centerContent]}>
        <ThemedText style={[styles.errorText, { color: errorTextColor }]}>Error: {adminDataError}</ThemedText>
        {/* Use ThemedButtonPlaceholder or a real ThemedButton */}
        <ThemedButtonPlaceholder title="Retry" onPress={onRefresh} />
      </ThemedView>
    );
  }
  
  if (!adminDashboardData) {
    return (
      <ThemedView style={[styles.container, styles.centerContent]}>
        <ThemedText>No analytics data available.</ThemedText>
        {/* Use ThemedButtonPlaceholder or a real ThemedButton */}
        <ThemedButtonPlaceholder title="Refresh" onPress={onRefresh} />
      </ThemedView>
    );
  }

  const { scheduleAdherence, swapRequestTrends, leaveTrends, scheduleHeatmap } = adminDashboardData;

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.scrollContentContainer}
      refreshControl={<RefreshControl refreshing={isLoadingAdminData} onRefresh={onRefresh} colors={[tintColor]} tintColor={tintColor} />}
    >
      <ThemedText type="title" style={styles.mainTitle}>Admin Analytics Dashboard</ThemedText>
      
      <ThemedView style={[styles.section, { backgroundColor: cardBackgroundColor, borderColor: borderColor }]}>
        <ThemedText type="subtitle" style={styles.sectionTitle}>Schedule Adherence</ThemedText>
        {renderMetricCard('Total Shifts Tracked', scheduleAdherence?.totalShifts)}
        {renderMetricCard('On-Time Arrival', scheduleAdherence?.onTimePercentage, '%')}
      </ThemedView>

      <ThemedView style={[styles.section, { backgroundColor: cardBackgroundColor, borderColor: borderColor }]}>
        <ThemedText type="subtitle" style={styles.sectionTitle}>Swap Request Trends</ThemedText>
        {renderMetricCard('Total Swap Requests', swapRequestTrends?.totalRequests)}
        {renderMetricCard('Approval Rate', swapRequestTrends?.approvedPercentage, '%')}
        {renderMetricCard('Avg. Time to Approve', swapRequestTrends?.averageTimeToApprove)}
      </ThemedView>

      <ThemedView style={[styles.section, { backgroundColor: cardBackgroundColor, borderColor: borderColor }]}>
        <ThemedText type="subtitle" style={styles.sectionTitle}>Leave Trends</ThemedText>
        {renderMetricCard('Total Leave Requests', leaveTrends?.totalRequests)}
        {leaveTrends?.commonLeaveTypes?.map((lt: { type: string; count: number }) => (
          <React.Fragment key={lt.type}>
            {renderMetricCard(lt.type, lt.count, 'requests')}
          </React.Fragment>
        ))}
      </ThemedView>
      
      <ThemedView style={[styles.section, { backgroundColor: cardBackgroundColor, borderColor: borderColor }]}>
        <ThemedText type="subtitle" style={styles.sectionTitle}>Schedule Heatmap (Peak Times)</ThemedText>
        {renderChartPlaceholder('Shift Demand Heatmap')}
        <View style={styles.dataPointContainer}>
          {scheduleHeatmap?.slice(0,5).map((point: { date: string; intensity: number }) => (
            <ThemedText key={point.date} style={[styles.dataPoint, { color: defaultTextColor }]}>{point.date}: Intensity {point.intensity}</ThemedText>
          ))}
        </View>
      </ThemedView>

      {renderChartPlaceholder('Performance Metrics Over Time')}
      
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
  },
  mainTitle: { // Consider adjusting ThemedText 'title' style or creating a new variant
    fontSize: 24, // Current ThemedText 'title' is 32.
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  section: {
    marginBottom: 20,
    padding: 15,
    borderRadius: 8,
    borderWidth: 1,
    // borderColor is now applied dynamically
  },
  sectionTitle: { // Consider adjusting ThemedText 'subtitle' style or creating a new variant
    fontSize: 18, // Current ThemedText 'subtitle' is 20.
    fontWeight: '600', // Current ThemedText 'subtitle' is 'bold'
    marginBottom: 10,
  },
  metricCard: {
    padding: 12,
    borderRadius: 6,
    marginBottom: 10,
    borderWidth: 1,
    // backgroundColor and borderColor are now applied dynamically
    // Consider adding shadow from a design system if desired
  },
  metricTitle: {
    fontSize: 15, // Consider a ThemedText type e.g. 'caption' or 'smallSemiBold'
    fontWeight: '500',
    marginBottom: 4,
    // color is now applied dynamically
  },
  metricValue: {
    fontSize: 20, // Matches ThemedText 'subtitle' fontSize
    fontWeight: 'bold', // Matches ThemedText 'subtitle' fontWeight
    // color is now applied dynamically (tintColor)
  },
  chartPlaceholder: {
    borderWidth: 2,
    // borderColor is now applied dynamically
    borderStyle: 'dashed',
    borderRadius: 8,
    padding: 20,
    marginVertical: 15,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 150,
  },
  chartTitle: { // Matches ThemedText 'defaultSemiBold'
    fontSize: 16,
    fontWeight: 'bold', // defaultSemiBold is '600'
    marginBottom: 10,
  },
  chartText: {
    textAlign: 'center',
    // color is now applied dynamically
  },
  dataPointContainer: {
    marginTop: 10,
  },
  dataPoint: {
    fontSize: 13, // Consider a ThemedText type e.g. 'caption'
    marginBottom: 3,
    // color is now applied dynamically
  },
  errorText: {
    // color is now applied dynamically
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 10, // Added margin for button spacing
  },
  themedButton: { // Placeholder style for ThemedButton
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
  }
});

export default AdminDashboardScreen;
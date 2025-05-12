import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, Button, RefreshControl } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../../store/store';
import { fetchAdminDashboardAnalytics, clearAdminAnalyticsError, AdminAnalyticsData } from '../../store/slices/analyticsSlice';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';

const AdminDashboardScreen = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { adminDashboardData, isLoadingAdminData, adminDataError } = useSelector(
    (state: RootState) => state.analytics
  );

  useEffect(() => {
    dispatch(fetchAdminDashboardAnalytics());
    return () => {
      dispatch(clearAdminAnalyticsError());
    }
  }, [dispatch]);

  const onRefresh = () => {
    dispatch(fetchAdminDashboardAnalytics());
  };

  const renderMetricCard = (title: string, value: string | number | undefined, unit: string = '') => (
    <ThemedView style={styles.metricCard}>
      <ThemedText style={styles.metricTitle}>{title}</ThemedText>
      <ThemedText style={styles.metricValue}>{value ?? 'N/A'} {unit}</ThemedText>
    </ThemedView>
  );

  const renderChartPlaceholder = (title: string) => (
    <ThemedView style={styles.chartPlaceholder}>
      <ThemedText style={styles.chartTitle}>{title}</ThemedText>
      <ThemedText style={styles.chartText}>(Chart Placeholder - e.g., using react-native-svg-charts or a WebView library)</ThemedText>
    </ThemedView>
  );

  if (isLoadingAdminData && !adminDashboardData) {
    return (
      <ThemedView style={[styles.container, styles.centerContent]}>
        <ActivityIndicator size="large" color="#007bff" />
        <ThemedText>Loading dashboard data...</ThemedText>
      </ThemedView>
    );
  }

  if (adminDataError) {
    return (
      <ThemedView style={[styles.container, styles.centerContent]}>
        <ThemedText style={styles.errorText}>Error: {adminDataError}</ThemedText>
        <Button title="Retry" onPress={onRefresh} color="#007bff" />
      </ThemedView>
    );
  }
  
  if (!adminDashboardData) {
    return (
      <ThemedView style={[styles.container, styles.centerContent]}>
        <ThemedText>No analytics data available.</ThemedText>
         <Button title="Refresh" onPress={onRefresh} color="#007bff" />
      </ThemedView>
    );
  }

  const { scheduleAdherence, swapRequestTrends, leaveTrends, scheduleHeatmap } = adminDashboardData;

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.scrollContentContainer}
      refreshControl={<RefreshControl refreshing={isLoadingAdminData} onRefresh={onRefresh} colors={["#007bff"]}/>}
    >
      <ThemedText type="title" style={styles.mainTitle}>Admin Analytics Dashboard</ThemedText>
      
      <ThemedView style={styles.section}>
        <ThemedText type="subtitle" style={styles.sectionTitle}>Schedule Adherence</ThemedText>
        {renderMetricCard('Total Shifts Tracked', scheduleAdherence?.totalShifts)}
        {renderMetricCard('On-Time Arrival', scheduleAdherence?.onTimePercentage, '%')}
      </ThemedView>

      <ThemedView style={styles.section}>
        <ThemedText type="subtitle" style={styles.sectionTitle}>Swap Request Trends</ThemedText>
        {renderMetricCard('Total Swap Requests', swapRequestTrends?.totalRequests)}
        {renderMetricCard('Approval Rate', swapRequestTrends?.approvedPercentage, '%')}
        {renderMetricCard('Avg. Time to Approve', swapRequestTrends?.averageTimeToApprove)}
      </ThemedView>

      <ThemedView style={styles.section}>
        <ThemedText type="subtitle" style={styles.sectionTitle}>Leave Trends</ThemedText>
        {renderMetricCard('Total Leave Requests', leaveTrends?.totalRequests)}
        {leaveTrends?.commonLeaveTypes?.map((lt: { type: string; count: number }) => renderMetricCard(lt.type, lt.count, 'requests'))}
      </ThemedView>
      
      <ThemedView style={styles.section}>
        <ThemedText type="subtitle" style={styles.sectionTitle}>Schedule Heatmap (Peak Times)</ThemedText>
        {renderChartPlaceholder('Shift Demand Heatmap')}
        <View style={styles.dataPointContainer}>
          {scheduleHeatmap?.slice(0,5).map((point: { date: string; intensity: number }) => ( // Display a few points as example
            <ThemedText key={point.date} style={styles.dataPoint}>{point.date}: Intensity {point.intensity}</ThemedText>
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
  mainTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  section: {
    marginBottom: 20,
    padding: 15,
    borderRadius: 8,
    // backgroundColor: '#f9f9f9', // Consider theme
    borderWidth: 1,
    borderColor: '#e0e0e0', // Consider theme
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 10,
  },
  metricCard: {
    padding: 12,
    borderRadius: 6,
    // backgroundColor: '#ffffff', // Consider theme
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#d0d0d0', // Consider theme
    // shadowColor: "#000",
    // shadowOffset: { width: 0, height: 1 },
    // shadowOpacity: 0.1,
    // shadowRadius: 2,
    // elevation: 2,
  },
  metricTitle: {
    fontSize: 15,
    fontWeight: '500',
    // color: '#555', // Consider theme
    marginBottom: 4,
  },
  metricValue: {
    fontSize: 20,
    fontWeight: 'bold',
    // color: '#007bff', // Consider theme
  },
  chartPlaceholder: {
    borderWidth: 2,
    borderColor: '#007bff', // Consider theme (dashed or themed)
    borderStyle: 'dashed',
    borderRadius: 8,
    padding: 20,
    marginVertical: 15,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 150,
  },
  chartTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  chartText: {
    // color: '#777', // Consider theme
    textAlign: 'center',
  },
  dataPointContainer: {
    marginTop: 10,
  },
  dataPoint: {
    fontSize: 13,
    // color: '#444', // Consider theme
    marginBottom: 3,
  },
  errorText: {
    color: 'red',
    fontSize: 16,
    textAlign: 'center',
  },
});

export default AdminDashboardScreen;
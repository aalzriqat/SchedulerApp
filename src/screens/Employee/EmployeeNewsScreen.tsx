import React, { useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator, RefreshControl as RNRefreshControl, Button } from 'react-native'; // Added Button, RNRefreshControl
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../../store/store';
import { fetchNews, NewsItem, clearFetchError } from '../../store/slices/newsSlice'; // Corrected import
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { useThemeColor } from '@/hooks/useThemeColor'; // Import useThemeColor

// Moved styles to top to use themed colors in definition if needed, or apply inline
const EmployeeNewsScreen = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { items: newsItemsData, loading, error } = useSelector((state: RootState) => state.news);
  const newsItems = newsItemsData || []; // Safeguard against undefined

  // Theme colors
  const themedBackgroundColor = useThemeColor({}, 'background');
  const themedTextColor = useThemeColor({}, 'text');
  const themedBorderColor = useThemeColor({}, 'border');
  const themedCardBackgroundColor = useThemeColor({}, 'cardBackground');
  const themedSubtleTextColor = useThemeColor({}, 'subtleText');
  const themedErrorTextColor = useThemeColor({}, 'errorText');
  const themedPrimaryButtonBg = useThemeColor({}, 'buttonPrimaryBackground');


  useEffect(() => {
    dispatch(fetchNews());
    return () => {
        dispatch(clearFetchError()); // Use the correct clear action
    }
  }, [dispatch]);

  const onRefresh = () => {
    dispatch(fetchNews());
  };
  
  // Styles defined here, potentially using theme hook values if needed for dynamic parts not covered by Themed components
  // For now, ThemedView/Text handle most direct colorings, others applied inline.
  const styles = StyleSheet.create({
    container: { // bg applied inline
      flex: 1,
    },
    centerContent: { // bg applied inline
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: 20,
    },
    header: { // color from ThemedText
      fontSize: 22,
      fontWeight: 'bold',
      paddingVertical: 15,
      paddingHorizontal: 20,
      textAlign: 'center',
    },
    listContentContainer: {
      paddingHorizontal: 10,
      paddingBottom: 20,
    },
    newsItemContainer: { // bg and borderColor applied inline
      padding: 15,
      marginVertical: 8,
      marginHorizontal: 10,
      borderRadius: 8,
      borderWidth: 1,
    },
    newsTitle: { // color from ThemedText
      fontSize: 18,
      fontWeight: 'bold',
      marginBottom: 5,
    },
    newsDate: { // color applied inline
      fontSize: 12,
      marginBottom: 8,
    },
    newsContent: { // color from ThemedText
      fontSize: 15,
      lineHeight: 22,
    },
    errorText: { // color applied inline
      fontSize: 16,
      marginBottom: 10,
    },
  });


  if (loading && (!Array.isArray(newsItems) || newsItems.length === 0)) { // Added Array.isArray check
    return (
      <ThemedView style={[styles.container, styles.centerContent, {backgroundColor: themedBackgroundColor}]}>
        <ActivityIndicator size="large" color={themedPrimaryButtonBg} />
        <ThemedText>Loading news...</ThemedText>
      </ThemedView>
    );
  }

  if (error) {
    return (
      <ThemedView style={[styles.container, styles.centerContent, {backgroundColor: themedBackgroundColor}]}>
        <ThemedText style={[styles.errorText, {color: themedErrorTextColor}]}>Error: {error}</ThemedText>
        <ThemedText style={{color: themedTextColor}}>Please try refreshing.</ThemedText>
        <Button title="Refresh" onPress={onRefresh} color={themedPrimaryButtonBg} />
      </ThemedView>
    );
  }

  if (!loading && (!Array.isArray(newsItems) || newsItems.length === 0)) {
    return (
      <ThemedView style={[styles.container, styles.centerContent, {backgroundColor: themedBackgroundColor}]}>
        <ThemedText>No news announcements at the moment.</ThemedText>
        <Button title="Refresh" onPress={onRefresh} color={themedPrimaryButtonBg} />
      </ThemedView>
    );
  }

  const renderNewsItem = ({ item }: { item: NewsItem }) => (
    <ThemedView style={[styles.newsItemContainer, {backgroundColor: themedCardBackgroundColor, borderColor: themedBorderColor}]}>
      <ThemedText type="subtitle" style={styles.newsTitle}>{item.title}</ThemedText>
      <ThemedText style={[styles.newsDate, {color: themedSubtleTextColor}]}>{new Date(item.date).toLocaleDateString()}</ThemedText>
      <ThemedText style={styles.newsContent}>{item.content}</ThemedText>
    </ThemedView>
  );

  return (
    <ThemedView style={[styles.container, {backgroundColor: themedBackgroundColor}]}>
      <ThemedText type="title" style={styles.header}>Company News & Announcements</ThemedText>
      <FlatList
        data={newsItems} // Already safeguarded: newsItemsData || []
        renderItem={renderNewsItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContentContainer}
        refreshControl={
          <RNRefreshControl refreshing={loading} onRefresh={onRefresh} colors={[themedPrimaryButtonBg]} tintColor={themedPrimaryButtonBg}/>
        }
      />
    </ThemedView>
  );
};

export default EmployeeNewsScreen;
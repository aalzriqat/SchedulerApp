import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert, ScrollView, ActivityIndicator } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../../store/store'; // Assuming store.ts exports these types
import { postNews, resetPostStatus } from '../../store/slices/newsSlice';
import { useNavigation } from '@react-navigation/native';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { useThemeColor } from '@/hooks/useThemeColor'; // Import useThemeColor

const AdminPostNewsScreen = () => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const dispatch = useDispatch<AppDispatch>();
  const navigation = useNavigation();

  const { postLoading, postError, postSuccess } = useSelector((state: RootState) => state.news);

  // Theme colors
  const themedBackgroundColor = useThemeColor({}, 'background');
  const themedInputBg = useThemeColor({}, 'inputBackground');
  const themedInputBorder = useThemeColor({}, 'inputBorder');
  const themedInputText = useThemeColor({}, 'inputText');
  const themedInputPlaceholder = useThemeColor({}, 'inputPlaceholder');
  const themedPrimaryButtonBg = useThemeColor({}, 'buttonPrimaryBackground');
  // Button title color will be default for React Native Button, or use custom TouchableOpacity for full control

  useEffect(() => {
    if (postSuccess) {
      Alert.alert('Success', 'News posted successfully!');
      setTitle('');
      setContent('');
      dispatch(resetPostStatus());
      // Optionally navigate away or refresh a news list
      // navigation.goBack(); 
    }
    if (postError) {
      Alert.alert('Error', `Failed to post news: ${postError}`);
      dispatch(resetPostStatus());
    }
  }, [postSuccess, postError, dispatch, navigation]);

  const handleSubmit = () => {
    if (!title.trim() || !content.trim()) {
      Alert.alert('Validation Error', 'Title and content cannot be empty.');
      return;
    }
    dispatch(postNews({ title, content }));
  };

  return (
    <ThemedView style={[styles.container, {backgroundColor: themedBackgroundColor}]}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <ThemedText type="title" style={styles.header}>Post New Announcement</ThemedText>
        
        <ThemedText style={styles.label}>Title:</ThemedText>
        <TextInput
          style={[styles.input, {
            backgroundColor: themedInputBg,
            borderColor: themedInputBorder,
            color: themedInputText
          }]}
          value={title}
          onChangeText={setTitle}
          placeholder="Enter news title"
          placeholderTextColor={themedInputPlaceholder}
        />
        
        <ThemedText style={styles.label}>Content:</ThemedText>
        <TextInput
          style={[styles.input, styles.textArea, {
            backgroundColor: themedInputBg,
            borderColor: themedInputBorder,
            color: themedInputText
          }]}
          value={content}
          onChangeText={setContent}
          placeholder="Enter news content"
          placeholderTextColor={themedInputPlaceholder}
          multiline
          numberOfLines={6}
        />
        
        {postLoading ? (
          <ActivityIndicator size="large" color={themedPrimaryButtonBg} style={styles.loader} />
        ) : (
          <Button title="Post News" onPress={handleSubmit} color={themedPrimaryButtonBg} />
        )}
      </ScrollView>
    </ThemedView>
  );
};

const styles = StyleSheet.create({
  container: { // bg applied inline
    flex: 1,
  },
  scrollContainer: {
    padding: 20,
  },
  header: { // color from ThemedText
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  label: { // color from ThemedText
    fontSize: 16,
    marginBottom: 8,
  },
  input: { // bg, borderColor, color applied inline
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 15,
    paddingVertical: 10,
    marginBottom: 20,
    fontSize: 16,
  },
  textArea: { // bg, borderColor, color applied inline
    height: 120,
    textAlignVertical: 'top',
  },
  loader: {
    marginTop: 20,
  }
});

export default AdminPostNewsScreen;
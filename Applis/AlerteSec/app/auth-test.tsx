import React from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import AuthTest from '../components/AuthTest';

export default function AuthTestScreen() {
  return (
    <ScrollView style={styles.container}>
      <AuthTest />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
});





import { Stack, router } from 'expo-router';
import { useEffect } from 'react';
import { StyleSheet, View, ActivityIndicator } from 'react-native';

export default function NotFoundScreen() {
  useEffect(() => {
    // Redirect to login when this screen is shown
    router.replace('/auth/login'); 
  }, []);

  return (
    <>
      <Stack.Screen options={{ title: 'Redirecting...' }} />
      <View style={styles.container}>
        <ActivityIndicator size="large" />
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
});

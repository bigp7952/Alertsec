import { Stack } from 'expo-router';

export default function SignalementLayout() {
  return (
    <Stack>
      <Stack.Screen name="nouveau" options={{ headerShown: false }} />
    </Stack>
  );
}

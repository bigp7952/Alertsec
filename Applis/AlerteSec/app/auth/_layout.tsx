import { Stack } from 'expo-router';

export default function AuthLayout() {
  return (
    <Stack>
      <Stack.Screen name="login-citoyen" options={{ headerShown: false }} />
      <Stack.Screen name="login-force" options={{ headerShown: false }} />
      <Stack.Screen name="register-citoyen" options={{ headerShown: false }} />
    </Stack>
  );
}

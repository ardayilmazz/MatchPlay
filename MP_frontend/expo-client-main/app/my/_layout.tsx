import { Stack } from 'expo-router';

export default function MyLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="requests" />
      <Stack.Screen name="waitlist" />
    </Stack>
  );
}

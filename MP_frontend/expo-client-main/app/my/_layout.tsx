import { Stack } from 'expo-router';

export default function MyLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="games" />
      <Stack.Screen name="games/[id]" />
      <Stack.Screen name="games/[id]/requests" />
      <Stack.Screen name="joined-games" />
      <Stack.Screen name="joined-games/[id]" />
      <Stack.Screen name="completed-games" />
      <Stack.Screen name="completed-games/[id]" />
      <Stack.Screen name="requests" />
      <Stack.Screen name="waitlist" />
      <Stack.Screen name="ratings" />
      <Stack.Screen name="complaints" />
    </Stack>
  );
}

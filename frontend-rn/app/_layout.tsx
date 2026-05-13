import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

export default function RootLayout() {
  return (
    <>
      <StatusBar style="dark" />
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: '#ffdd00' },
          headerTintColor: '#1a1a1a',
          headerTitleStyle: { fontWeight: 'bold' },
          headerBackTitle: 'Volver',
        }}
      />
    </>
  );
}

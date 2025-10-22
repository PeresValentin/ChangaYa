import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';

import { useColorScheme } from '@/hooks/use-color-scheme';

export const unstable_settings = {
  anchor: '(tabs)',
};

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="auth/welcome" options={{ headerShown: false }} />
        <Stack.Screen name="auth/login" options={{ headerShown: false }} />
        <Stack.Screen name="auth/register" options={{ headerShown: false }} />
        <Stack.Screen name="home/trabajador" options={{ headerShown: false }} />
        <Stack.Screen name="home/contratante" options={{ headerShown: false }} />
        <Stack.Screen name="chats/index" options={{ headerShown: false }} />
        <Stack.Screen name="chats/[id]" options={{ headerShown: false }} />
        <Stack.Screen name="changas/favoritas" options={{ headerShown: false }} />
        <Stack.Screen name="changas/mis" options={{ headerShown: false }} />
        <Stack.Screen name="changas/nueva" options={{ headerShown: false }} />
        <Stack.Screen name="changas/[id]" options={{ headerShown: false }} />
        <Stack.Screen name="modal" options={{ headerShown: false }} />
        <Stack.Screen name="profile/[id]" options={{ headerShown: false }} />
        <Stack.Screen name="profile/index" options={{ headerShown: false }} />
      </Stack>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}


//Hola chicos, este es el layout principal de la aplicacion donde se definen las pantallas y el tema de la app. Basicamente la navegacion muchachos, en base vayas creando pantallas agreguenlas.


// App.js
// import { AuthProvider, useAuth } from '@/context/authContext';
import { RegisterContextProvider } from '@/context/registerContext';
import { SpinnerProvider } from '@/context/spinnerContext';
import {CartProvider} from "@/context/cartContent"
import { Stack, Tabs } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import { useFonts } from 'expo-font';
import  ToastManager  from 'toastify-react-native';
import {ProfileProvider} from "@/context/userProfileContent"
export default function App() {
  const [loaded, error] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  useEffect(() => {
    if (error) throw error;
    if (loaded) SplashScreen.hideAsync();
  }, [error, loaded]);

  if (!loaded) return null;

  return (
    // <AuthProvider>
      <RegisterContextProvider> 
        <SpinnerProvider>
          <CartProvider>
            <ProfileProvider>

              <ToastManager showCloseIcon={false} showProgressBar={false} />
              <RootLayoutNav />
            </ProfileProvider>
          </CartProvider>
        </SpinnerProvider>
      </RegisterContextProvider>
    // </AuthProvider>
  );
}

function RootLayoutNav() {
  // const { isAuthenticated } = useAuth();

  return (
    <Stack screenOptions={{headerShown:false}}>
      {false ? (
        <Tabs>
          <Tabs.Screen
            name="(tabs)"
            options={{ headerShown: false }}
          />
        </Tabs>
      ) : (
        <>
          <Stack.Screen name="auth/login" options={{ headerShown: false }} />
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          {/* <Stack.Screen name="auth/emailPage" options={{ headerShown: true, 
            headerTitle:"Continue with Email",presentation:"modal" }} /> */}
        </>
      )}
    </Stack>
  );
}

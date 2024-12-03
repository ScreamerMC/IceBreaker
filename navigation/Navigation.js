import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';

// Screens
import LoginScreen from '../screens/Auth/LoginScreen';
import SignUpScreen from '../screens/Auth/SignUpScreen';
import SplashScreen from '../screens/Main/SplashScreen';
import ProfileSetupScreen from '../screens/Main/ProfileSetupScreen';
import SwipeScreen from '../screens/Main/SwipeScreen';
import ChatScreen from '../screens/Main/ChatScreen';
import VoiceChat from '../screens/Main/VoiceChat';
import MyProfileScreen from '../screens/Main/MyProfileScreen';
import SettingsScreen from '../screens/Settings/SettingsScreen';
import EditProfile from '../screens/Settings/EditProfile';

// Firebase Auth
import { auth } from '../firebaseConfig';

const Stack = createStackNavigator();

export default function AppNavigator() {
  const [initialRoute, setInitialRoute] = useState('Splash'); // Default initial route
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        setIsAuthenticated(true);
        setInitialRoute('Swipe'); // Main app screen for authenticated users
      } else {
        setIsAuthenticated(false);
        setInitialRoute('Login'); // Login screen for unauthenticated users
      }
    });

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, []);

  const AuthenticatedStack = () => (
    <>
      <Stack.Screen name="Splash" component={SplashScreen} options={{ headerShown: false }} />
      <Stack.Screen name="Swipe" component={SwipeScreen} options={{ headerShown: false }} />
      <Stack.Screen name="ChatScreen" component={ChatScreen} options={{ headerShown: false }} />
      <Stack.Screen
        name="VoiceChat"
        component={VoiceChat}
        options={({ route }) => ({
          title: `Chat with ${route.params.matchName}`,
        })}
      />
      <Stack.Screen name="MyProfile" component={MyProfileScreen} options={{ headerShown: false }} />
      <Stack.Screen name="Settings" component={SettingsScreen} options={{ headerShown: false }} />
      <Stack.Screen name="EditProfile" component={EditProfile} options={{ headerShown: false }} />
      <Stack.Screen name="ProfileSetup" component={ProfileSetupScreen} options={{ headerShown: false }} />
    </>
  );

  const UnauthenticatedStack = () => (
    <>
      <Stack.Screen name="Splash" component={SplashScreen} options={{ headerShown: false }} />
      <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
      <Stack.Screen name="SignUp" component={SignUpScreen} options={{ headerShown: false }} />
      <Stack.Screen name="ProfileSetup" component={ProfileSetupScreen} options={{ headerShown: false }} />
    </>
  );

  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName={initialRoute}>
        {isAuthenticated ? AuthenticatedStack() : UnauthenticatedStack()}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

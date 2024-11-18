import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import LoginScreen from '../screens/Auth/LoginScreen';
import ProfileSetupScreen from '../screens/Main/ProfileSetupScreen';
import SignUpScreen from '../screens/Auth/SignUpScreen';
import SplashScreen from '../screens/Main/SplashScreen';
import SwipeScreen from '../screens/Main/SwipeScreen';
import ChatScreen from '../screens/Main/ChatScreen';
import VoiceChat from '../screens/Main/VoiceChat';
import MyProfileScreen from '../screens/Main/MyProfileScreen';
import { auth } from '../firebaseConfig';
import { ActivityIndicator, View } from 'react-native';
import SettingsScreen from '../screens/Settings/SettingsScreen';
import EditProfile from '../screens/Settings/EditProfile'

const Stack = createStackNavigator(); 

export default function AppNavigator() {
  const [initialRoute, setInitialRoute] = useState('Splash'); // Default to Splash screen
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        // User is signed in
        setIsAuthenticated(true);
        setInitialRoute('Swipe'); // Set main app screen as the initial route for authenticated users
      } else {
        // User is not signed in
        setIsAuthenticated(false);
        setInitialRoute('Login'); // Set Login as the initial route for unauthenticated users
      }
    });

    // Cleanup subscription on unmount
    return unsubscribe;
  }, []);

  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName={initialRoute}>
        {isAuthenticated ? (
          // Stack Navigator for logged-in users
          <>
            <Stack.Screen name="Splash" component={SplashScreen} options={{ headerShown: false }} />
            <Stack.Screen name="Swipe" component={SwipeScreen} options={{ headerShown: false }} />
            <Stack.Screen name="ChatScreen" component={ChatScreen} options={{ headerShown: false }} />
            <Stack.Screen name="VoiceChat" component={VoiceChat} options={({ route }) => ({ title: `Chat with ${route.params.matchName}` })} />
            <Stack.Screen name="MyProfile" component={MyProfileScreen} options={{ headerShown: false }} />
            <Stack.Screen name="Settings" component={SettingsScreen} options={{ headerShown: false }} />
            <Stack.Screen name="EditProfile" component={EditProfile} options={{ headerShown: false }} />
            <Stack.Screen name="ProfileSetup" component={ProfileSetupScreen} options={{ headerShown: false }} />
          </>
        ) : (
          // Stack Navigator for unauthenticated users
          <>
            <Stack.Screen name="Splash" component={SplashScreen} options={{ headerShown: false }} />
            <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
            <Stack.Screen name="SignUp" component={SignUpScreen} options={{ headerShown: false }} />
            <Stack.Screen name="ProfileSetup" component={ProfileSetupScreen} options={{ headerShown: false }} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Image, Animated, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient'; // Gradient background
import { auth } from '../../firebaseConfig';

const { width } = Dimensions.get('window'); // Get screen width

export default function SplashScreen({ navigation }) {
  const fadeAnim = new Animated.Value(0); // Fade-in animation

  useEffect(() => {
    // Start fade-in animation
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 1000,
      useNativeDriver: true,
    }).start();

    // Check user authentication and navigate after 3.5 seconds
    const timer = setTimeout(() => {
      if (auth.currentUser) {
        navigation.replace('Swipe'); // Redirect if logged in
      } else {
        navigation.replace('Login');
      }
    }, 3500); // Extended display time to 3.5 seconds

    return () => clearTimeout(timer);
  }, []);

  return (
    <LinearGradient
      colors={['#1E90FF', '#87CEFA']} // Blue gradient background
      style={styles.container}
    >
      {/* Logo with increased size */}
      <Animated.View style={{ opacity: fadeAnim }}>
        <Image
          source={require('../../assets/ice_cube_logo.png')} // Ice cube logo from uploaded image
          style={styles.logo}
        />
      </Animated.View>

      {/* Main message with updated font style */}
      <Text style={styles.message}>Welcome to ICEBREAKER</Text>
      <Text style={styles.subMessage}>
        A voice-only dating app to connect through voice notes
      </Text>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 100, // Move content higher up on the screen
  },
  logo: {
    width: 150, // Increased logo size
    height: 150, // Increased logo size
    marginBottom: 20,
  },
  message: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFFFFF',
    fontFamily: 'Cochin', // Replace with a custom font if desired
    textAlign: 'center',
    paddingHorizontal: width * 0.1, // Add padding to both sides, 10% of screen width
    marginBottom: 10,
  },
  subMessage: {
    fontSize: 18,
    color: '#FFFFFF',
    textAlign: 'center',
    paddingHorizontal: width * 0.1, // Add padding to both sides, 10% of screen width
  },
});

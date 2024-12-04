import React, { useState } from 'react';
import { View, Text, StyleSheet, Alert, Dimensions, TouchableOpacity, Image } from 'react-native';
import { Input, Button } from 'react-native-elements';
import { LinearGradient } from 'expo-linear-gradient';
import { signUp } from '../../firebaseConfig';

const { width } = Dimensions.get('window');

export default function SignUpScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isCooldown, setIsCooldown] = useState(false); // Cooldown flag

  const handleSignUp = async () => {
    if (isCooldown) {
      Alert.alert("Cooldown Active", "Please wait a moment before trying again.");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email)) {
      Alert.alert("Invalid Email", "Please enter a valid email address.");
      return;
    }

    if (!password || password.length < 8) {
      Alert.alert("Weak Password", "Password must be at least 8 characters long.");
      return;
    }

    if (
      !/[A-Z]/.test(password) || 
      !/[a-z]/.test(password) || 
      !/[0-9]/.test(password) || 
      !/[!@#$%^&*]/.test(password)
    ) {
      Alert.alert(
        "Weak Password",
        "Password must include at least one uppercase letter, one lowercase letter, one number, and one special character."
      );
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert("Passwords Do Not Match", "Please ensure the passwords match.");
      return;
    }

    setIsCooldown(true); // Activate cooldown
    setTimeout(() => setIsCooldown(false), 5000); // Cooldown duration (5 seconds)

    try {
      await signUp(email, password);
      navigation.replace('ProfileSetup');
    } catch (error) {
      Alert.alert('Sign Up Failed', error.message);
    }
  };

  return (
    <LinearGradient colors={['#1E90FF', '#87CEFA']} style={styles.container}>
      <View style={styles.header}>
        <Image
          source={require('../../assets/ice_cube_logo.png')}
          style={styles.logo}
        />
        <Text style={styles.title}>Create Account ❄️</Text>
      </View>

      <Text style={styles.subtitle}>
        Join IceBreaker and meet your match!
      </Text>

      <Input
        placeholder="Email"
        placeholderTextColor="#aaa"
        inputStyle={styles.inputText}
        inputContainerStyle={styles.inputContainer}
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
      />
      <Input
        placeholder="Password"
        placeholderTextColor="#aaa"
        inputStyle={styles.inputText}
        inputContainerStyle={styles.inputContainer}
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        autoCapitalize="none"
      />
      <Input
        placeholder="Confirm Password"
        placeholderTextColor="#aaa"
        inputStyle={styles.inputText}
        inputContainerStyle={styles.inputContainer}
        value={confirmPassword}
        onChangeText={setConfirmPassword}
        secureTextEntry
        autoCapitalize="none"
      />

      <Button
        title="Sign Up"
        buttonStyle={styles.button}
        titleStyle={styles.buttonTitle}
        onPress={handleSignUp}
        disabled={isCooldown}
      />

      <TouchableOpacity onPress={() => navigation.navigate('Login')}>
        <Text style={styles.switchText}>Already have an account? <Text style={styles.switchTextBold}>Login</Text></Text>
      </TouchableOpacity>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 30,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  logo: {
    width: 50,
    height: 50,
    marginRight: 10,
  },
  title: {
    fontSize: 30,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  subtitle: {
    fontSize: 18,
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 30,
    paddingHorizontal: width * 0.1,
  },
  inputContainer: {
    borderBottomWidth: 0,
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    paddingHorizontal: 15,
    marginBottom: 15,
  },
  inputText: {
    color: '#333',
    fontSize: 16,
  },
  button: {
    backgroundColor: isCooldown ? '#888' : '#005bb5',
    borderRadius: 10,
    paddingVertical: 12,
    marginVertical: 15,
  },
  buttonTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  switchText: {
    color: '#FFFFFF',
    textAlign: 'center',
    marginTop: 20,
    fontSize: 16,
  },
  switchTextBold: {
    fontWeight: 'bold',
  },
});

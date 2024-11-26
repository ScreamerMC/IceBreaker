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

  const handleSignUp = async () => {
    if (!email || !/\S+@\S+\.\S+/.test(email)) {
      Alert.alert("Invalid Email", "Please enter a valid email address.");
      return;
    }
    if (!password || password.length < 6) {
      Alert.alert("Weak Password", "Password must be at least 6 characters.");
      return;
    }
    if (password !== confirmPassword) {
      Alert.alert("Passwords Do Not Match", "Please ensure the passwords match.");
      return;
    }
    
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
      />
      <Input
        placeholder="Password"
        placeholderTextColor="#aaa"
        inputStyle={styles.inputText}
        inputContainerStyle={styles.inputContainer}
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />
          <Input
      placeholder="Confirm Password"
      placeholderTextColor="#aaa"
      inputStyle={styles.inputText}
      inputContainerStyle={styles.inputContainer}
      value={confirmPassword}
      onChangeText={setConfirmPassword}
      secureTextEntry
    />

      <Button
        title="Sign Up"
        buttonStyle={styles.button}
        titleStyle={styles.buttonTitle}
        onPress={handleSignUp}
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
    backgroundColor: '#005bb5',
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

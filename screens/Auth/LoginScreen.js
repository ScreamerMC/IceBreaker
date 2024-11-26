import React, { useState } from 'react';
import { View, Text, StyleSheet, Alert, Dimensions, TouchableOpacity, Image } from 'react-native';
import { Input, Button } from 'react-native-elements';
import { LinearGradient } from 'expo-linear-gradient';
import { login } from '../../firebaseConfig';

const { width } = Dimensions.get('window');

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async () => {
    if (!email || !/\S+@\S+\.\S+/.test(email)) {
      Alert.alert("Invalid Email", "Please enter a valid email address.");
      return;
    }
    if (!password) {
      Alert.alert("Password Required", "Please enter your password.");
      return;
    }
  
    try {
      await login(email, password);
      navigation.replace('Swipe');
    } catch (error) {
      Alert.alert('Login Failed', error.message);
    }
  };
  
  return (
    <LinearGradient colors={['#1E90FF', '#87CEFA']} style={styles.container}>
      <View style={styles.header}>
        <Image
          source={require('../../assets/ice_cube_logo.png')}
          style={styles.logo}
        />
        <Text style={styles.title}>Welcome Back 👋</Text>
      </View>

      <Text style={styles.subtitle}>
        Your fans missed you!
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

      <Button
        title="Login"
        buttonStyle={styles.button}
        titleStyle={styles.buttonTitle}
        onPress={handleLogin}
      />

      <TouchableOpacity onPress={() => navigation.navigate('SignUp')}>
        <Text style={styles.switchText}>Don’t have an account? <Text style={styles.switchTextBold}>Sign Up</Text></Text>
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

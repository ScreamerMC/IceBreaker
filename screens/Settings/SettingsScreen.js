import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, TextInput } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { auth, db } from '../../firebaseConfig';
import { doc, deleteDoc } from 'firebase/firestore';
import { reauthenticateWithCredential, EmailAuthProvider } from 'firebase/auth';
import { getStorage, ref, listAll, deleteObject } from "firebase/storage";


export default function SettingsScreen({ navigation }) {
  const [password, setPassword] = useState(''); // Store password for re-authentication
  const [showPasswordInput, setShowPasswordInput] = useState(false); // Control visibility of password field
  const user = auth.currentUser;

  const handleDeleteAccountConfirmation = () => {
    Alert.alert(
      "Delete Account",
      "Are you sure you want to delete your account? This action cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => setShowPasswordInput(true), // Show the password field if confirmed
        },
      ]
    );
  };

  const handlePause = () => {
    try {
      Alert.alert(
        "Pause Account",
        "Pausing your account will make you invisible to others until you sign back in. Do you want to proceed?",
        [
          { text: "Cancel", style: "cancel" },
          {
            text: "Pause",
            style: "destructive",
            onPress: async () => {
              // Update the user status in Firestore to "paused"
              const userRef = doc(db, "users", user.uid);
              await updateDoc(userRef, { status: "paused" });
              Alert.alert("Success", "Your account has been paused.");
              await auth.signOut(); // Log the user out
              navigation.replace("Login"); // Redirect to the login screen
            },
          },
        ]
      );
    } catch (error) {
      console.error("Error pausing account:", error);
      Alert.alert("Error", "Could not pause your account. Please try again.");
    }
  };
  
  const handleLogout = async () => {
    try {
      await auth.signOut();
      navigation.replace("Splash");
      console.log("User signed out and navigated to login screen.");
    } catch (error) {
      console.error("Error signing out:", error);
      Alert.alert("Error", "Could not sign out. Please try again.");
  }
  }  

  const handleDeleteAccount = async () => {
    console.log("handleDeleteAccount called");
    if (!password) {
      Alert.alert("Error", "Please enter your password to delete your account.");
      return;
    }

    try {
      // Re-authenticate the user
      console.log("Re-authenticating user...");
      const credential = EmailAuthProvider.credential(user.email, password);
      await reauthenticateWithCredential(user, credential);
      console.log("Re-authentication successful.");

      // Delete Storage 
      const storage = getStorage();
      const userImagesFolderRef = ref(storage, `users/${user.uid}/images`)

      try {
        const folderContents = await listAll(userImagesFolderRef);
        if (folderContents.items.length === 0){
          console.log('no images to delete')
        }

        const deletePromises = folderContents.items.map(async (itemRef) => {
          try {
            await deleteObject(itemRef);
          } catch (error) {
            console.error('error deleting')
          }
        });
      await Promise.all(deletePromises)
      } catch (storageError) {
        console.error('COULD NOT DELETE USER IMAGES BRO')
        Alert.alert('Error', 'Could not delete images')
        return;
      }
      // Delete Firestore document
      console.log("Deleting user data from Firestore...");
      await deleteDoc(doc(db, 'users', user.uid));
      console.log("User data deleted from Firestore.");

      // Delete Firebase Authentication user
      console.log("Deleting user from Firebase Authentication...");
      await user.delete();
      console.log("User deleted from Firebase Authentication.");

      // Log out and navigate to Login screen
      console.log("Signing out...");
      await auth.signOut();
      navigation.navigate('Login');
      console.log("User signed out and navigated to login screen.");
    } catch (error) {
      console.error("Error deleting account:", error);

      // Check if the error is due to re-authentication
      if (error.code === 'auth/requires-recent-login') {
        Alert.alert(
          "Re-authentication required",
          "For security reasons, please log in again before deleting your account."
        );
      } else {
        Alert.alert("Error", "Could not delete account. Please check your password and try again.");
      }
    }
  };

  return (
    <LinearGradient colors={['#1E90FF', '#87CEFA']} style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back-outline" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.title}>Settings</Text>
      </View>

      <View style={styles.contentContainer}>
        {/* Show "Delete Account" button initially */}
        {!showPasswordInput && (
          <TouchableOpacity style={styles.deleteButton} onPress={handleDeleteAccountConfirmation}>
            <Ionicons name="trash-outline" size={24} color="#4682B4" />
            <Text style={styles.deleteButtonText}>Delete Account</Text>
          </TouchableOpacity>
        )}

        {/* Show password input and confirmation button if user confirmed delete action */}
        {showPasswordInput && (
          <>
            <TextInput
              placeholder="Enter your password"
              placeholderTextColor="#888"
              secureTextEntry
              style={styles.passwordInput}
              value={password}
              onChangeText={setPassword}
            />
            <TouchableOpacity style={styles.confirmDeleteButton} onPress={handleDeleteAccount}>
              <Ionicons name="checkmark-circle-outline" size={24} color="#FFFFFF" />
              <Text style={styles.confirmDeleteButtonText}>Confirm Delete</Text>
            </TouchableOpacity>
          </>
        )}
        <TouchableOpacity style={styles.logoutButton} onPress={handlePause}>
        <Ionicons name="alarm-outline" size={24} color="#4682B4" />
        <Text style={styles.logoutButtonText}>Pause Account</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={24} color="#4682B4" />
          <Text style={styles.logoutButtonText}>Logout</Text>
        </TouchableOpacity>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 50,
    paddingHorizontal: 20,
    marginBottom: 30,
  },
  backButton: {
    marginRight: 15,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  contentContainer: {
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  deleteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 10,
    width: '60%',
  },
  deleteButtonText: {
    color: '#4682B4',
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  passwordInput: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    padding: 12,
    marginVertical: 20,
    fontSize: 16,
    color: '#333',
  },
  confirmDeleteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FF4500',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 10,
  },
  confirmDeleteButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 10,
    marginTop: 20,
    width: '60%',
  },
  logoutButtonText: {
    color: '#4682B4',
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  
});

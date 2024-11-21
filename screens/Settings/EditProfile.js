import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, ScrollView, Alert, Image, KeyboardAvoidingView, Platform } from 'react-native';
import { Button } from 'react-native-elements';
import { LinearGradient } from 'expo-linear-gradient';
import * as ImagePicker from 'expo-image-picker';
import { Dimensions } from 'react-native';
import { db } from '../../firebaseConfig'; // Ensure firebaseConfig is correctly set up and exports `db`
import { getAuth } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore'; // Import Firestore methods
import { Ionicons } from '@expo/vector-icons';
const { width } = Dimensions.get('window');

export default function EditProfile({ navigation }) {
  const [profile, setProfile] = useState({
    mainImage: '',
    extraImages: ['', '', '', ''], // Array for extra images
    captions: ['', '', '', ''], // Array for captions
    gender: '',
    preference: '',
    bio: '',
    nickName: '',
  });

  const [loading, setLoading] = useState(true);
  const auth = getAuth(); // Get Firebase Auth instance
  const user = auth.currentUser; // Get the current user

  useEffect(() => {
    // Fetch user profile data from Firestore
    const fetchUserProfile = async () => {
      try {
        if (user) {
          const userRef = doc(db, 'users', user.uid); // Firestore document reference
          const userSnap = await getDoc(userRef);

          if (userSnap.exists()) {
            setProfile(userSnap.data()); // Populate the state with user data
          } else {
            console.log('No such user profile found!');
          }
        } else {
          console.log('No user is signed in.');
        }
      } catch (error) {
        console.error('Error fetching user profile:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, [user]);

  const handleImagePick = async (index = -1) => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permissionResult.granted) {
      Alert.alert('Permission required', 'Permission to access the media library is required to upload images.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.5,
    });

    if (!result.canceled) {
      const selectedImageUri = result.assets[0].uri;
      if (index === -1) {
        setProfile((prev) => ({ ...prev, mainImage: selectedImageUri }));
      } else {
        const updatedImages = [...profile.extraImages];
        updatedImages[index] = selectedImageUri;
        setProfile((prev) => ({ ...prev, extraImages: updatedImages }));
      }
    }
  };

  const handleSaveChanges = async () => {
    const { mainImage, gender, preference, bio, extraImages, captions, nickName } = profile;

    if (!mainImage || !gender || !preference) {
      Alert.alert('Profile Incomplete', 'Please complete all required fields.');
      return;
    }

    try {
      const updatedProfile = {
        mainImage,
        extraImages,
        captions,
        gender,
        preference,
        bio,
        nickName,
      };

      await db.collection('users').doc(user.uid).update(updatedProfile);

      Alert.alert('Profile Updated', 'Your profile has been successfully updated.');
      navigation.goBack();
    } catch (error) {
      console.error('Error updating profile:', error);
      Alert.alert('Error', 'Failed to update profile. Please try again.');
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  return (
    <LinearGradient colors={['#1E90FF', '#87CEFA']} style={styles.container}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.keyboardAvoidingView}>
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          <View style={styles.contentContainer}>
            <View style={styles.header}>
              <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                <Ionicons name="arrow-back-outline" size={24} color="#FFFFFF" />
              </TouchableOpacity>
              <Text style={styles.title}>Edit Profile</Text>
            </View>
            <Text style={styles.label}>Main Profile Picture</Text>
            <TouchableOpacity onPress={() => handleImagePick(-1)} style={styles.imageUpload}>
              {profile.mainImage ? (
                <Image source={{ uri: profile.mainImage }} style={styles.image} />
              ) : (
                <Text style={styles.imagePlaceholder}>Choose Image</Text>
              )}
            </TouchableOpacity>

            {/* Remaining fields */}

            <Text style={styles.label}>Nickname</Text>
            <TextInput
              style={styles.captionInput}
              value={profile.nickName}
              placeholder="Enter your nickname"
              onChangeText={(text) => setProfile((prev) => ({ ...prev, nickName: text }))}
            />

            <Button
              title="Save Changes"
              buttonStyle={styles.saveButton}
              titleStyle={styles.saveButtonTitle}
              onPress={handleSaveChanges}
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1E90FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 18,
    color: '#ffffff',
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  scrollContainer: {
    padding: 20,
    paddingBottom: 50,
  },
  contentContainer: {
    alignItems: 'center',
  },
  label: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ffffff',
    marginTop: 20,
    marginBottom: 10,
  },
  imageUpload: {
    width: width * 0.5,
    height: width * 0.5,
    borderRadius: width * 0.25,
    backgroundColor: '#87CEFA',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    marginBottom: 20,
  },
  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  imagePlaceholder: {
    color: '#f0f8ff',
    fontSize: 16,
  },
  captionInput: {
    width: '100%',
    padding: 10,
    marginVertical: 5,
    backgroundColor: '#F8F8FF',
    borderRadius: 5,
    borderWidth: 1,
    borderColor: '#87CEFA',
    color: '#333',
  },
  saveButton: {
    width: '100%',
    backgroundColor: '#4682B4',
    padding: 15,
    borderRadius: 5,
    marginTop: 20,
  },
  saveButtonTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  header: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 30, 
    paddingHorizontal: 30,
    marginBottom: 30,
    padding: 20,
    gap: 20,
    borderColor:'#FFFFFF',
    borderWidth: 2,
    borderRadius: 10
  },
  title: {
    fontSize: 30,
    color: '#FFFFFF'

  }
});

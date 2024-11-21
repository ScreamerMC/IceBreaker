import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, ScrollView, Alert, Image, KeyboardAvoidingView, Platform } from 'react-native';
import { Button } from 'react-native-elements';
import { LinearGradient } from 'expo-linear-gradient';
import * as ImagePicker from 'expo-image-picker';
import { Dimensions } from 'react-native';
import { db } from '../../firebaseConfig';
import { getAuth } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';

const { width } = Dimensions.get('window');

export default function EditProfile({ navigation }) {
  const [profile, setProfile] = useState({
    mainImage: '',
    extraImages: ['', '', '', ''],
    captions: ['', '', '', ''],
    gender: '',
    preference: '',
    bio: '',
    nickName: '',
  });

  const [loading, setLoading] = useState(true);
  const auth = getAuth();
  const user = auth.currentUser;

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        if (user) {
          const userRef = doc(db, 'users', user.uid);
          const userSnap = await getDoc(userRef);

          if (userSnap.exists()) {
            setProfile(userSnap.data());
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
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Edit Profile</Text>
      </View>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.keyboardAvoidingView}>
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          <View style={styles.contentContainer}>
            <Text style={styles.label}>Main Profile Picture</Text>
            <TouchableOpacity onPress={() => handleImagePick(-1)} style={styles.imageUpload}>
              {profile.mainImage ? (
                <Image source={{ uri: profile.mainImage }} style={styles.image} />
              ) : (
                <Text style={styles.imagePlaceholder}>Choose Image</Text>
              )}
            </TouchableOpacity>

            <Text style={styles.label}>Nickname</Text>
            <TextInput
              style={styles.captionInput}
              value={profile.nickName}
              placeholder="Enter your nickname"
              onChangeText={(text) => setProfile((prev) => ({ ...prev, nickName: text }))}
            />

            <Text style={styles.label}>Bio</Text>
            <TextInput
              style={styles.captionInput}
              value={profile.bio}
              placeholder="Enter your bio"
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
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: '#4682B4',
  },
  backButton: {
    padding: 10,
    borderRadius: 5,
    backgroundColor: '#FFFFFF',
    marginRight: 15,
  },
  backButtonText: {
    color: '#4682B4',
    fontWeight: 'bold',
    fontSize: 16,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
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
});

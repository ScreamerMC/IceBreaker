import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, ScrollView, Alert, Image, KeyboardAvoidingView, Platform } from 'react-native';
import { Button } from 'react-native-elements';
import { LinearGradient } from 'expo-linear-gradient';
import * as ImagePicker from 'expo-image-picker';
import { Dimensions } from 'react-native';
import { db } from '../../firebaseConfig';
import { getAuth } from 'firebase/auth';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { SafeAreaView } from 'react-native-safe-area-context';

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

      const userDocRef = doc(db, 'users', user.uid);
      await updateDoc(userDocRef, updatedProfile);

      Alert.alert('Profile Updated', 'Your profile has been successfully updated.');
      navigation.goBack();
    } catch (error) {
      console.error('Error updating profile:', error);
      Alert.alert('Error', 'Failed to update profile. Please try again.');
    }
  };
  //THIS DOES NOTHING YET FIX IT  
  if (loading) {
    return (
      <View style={styles.container}>
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  return (
    <LinearGradient colors={['#1E90FF', '#87CEFA']} style={styles.container}>
      <SafeAreaView style={styles.SafeAreaView}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Edit Profile</Text>
      </View>
      </SafeAreaView>
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

            <Text style={styles.label}> Additional Pictures </Text>
            <View style={styles.extraImagesContainer}>
              {profile.extraImages.map((image,index) => (
                <View key={index} style={styles.imageWithCaption}>
                  <TouchableOpacity onPress={() => handleImagePick(index)} style={styles.extraImageUpload}>
                    {image ? (
                      <Image source={{ uri:image }} style={styles.extraImage} />
                    ) : ( 
                      <Text style={styles.imagePlaceholder} >+ </Text>
                    )}
                  </TouchableOpacity>
                  <TextInput 
                    placeholder={`Caption for Picture ${index + 1}`}
                    placeholderTextColor={"#aaa"}
                    style={styles.captionInput}
                    value={profile.captions[index]}
                    onChangeText={(text) => {
                      const updatedCaptions = [...profile.captions];
                      updatedCaptions[index] = text;
                      setProfile((prev) => ({ ...prev, captions: updatedCaptions}));
                    }}
                    />
                </View>
                  ))}
            </View>
            <Text style={styles.label}>Nickname</Text>
            <TextInput
              style={styles.captionInput}
              value={profile.nickName}
              placeholder="Enter your nickname"
              onChangeText={(text) => setProfile((prev) => ({ ...prev, nickName: text }))}
            />
            {/* Gender Selection */}
            <Text style={styles.label}>I am a</Text>
            <View style={styles.selectionContainer}>
              <TouchableOpacity
                onPress={() => setProfile((prev) => ({ ...prev, gender: 'Male' }))}
                style={[
                  styles.optionButton,
                  profile.gender === 'Male' && styles.selectedButton,
                ]}
              >
                <Text style={styles.optionText}>Male</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => setProfile((prev) => ({ ...prev, gender: 'Female' }))}
                style={[
                  styles.optionButton,
                  profile.gender === 'Female' && styles.selectedButton,
                ]}
              >
                <Text style={styles.optionText}>Female</Text>
              </TouchableOpacity>
            </View>

            {/* Preference Selection */}
            <Text style={styles.label}>Looking for</Text>
            <View style={styles.selectionContainer}>
              <TouchableOpacity
                onPress={() => setProfile((prev) => ({ ...prev, preference: 'Male' }))}
                style={[
                  styles.optionButton,
                  profile.preference === 'Male' && styles.selectedButton,
                ]}
              >
                <Text style={styles.optionText}>Male</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => setProfile((prev) => ({ ...prev, preference: 'Female' }))}
                style={[
                  styles.optionButton,
                  profile.preference === 'Female' && styles.selectedButton,
                ]}
              >
                <Text style={styles.optionText}>Female</Text>
              </TouchableOpacity>
            </View>

            
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
              containerStyle={styles.saveButtonContainer}
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  safeArea:{
    backgroundColor: '#4682B4',
  },
  container: {
    flex: 1,
    backgroundColor: '#1E90FF',
  },
  selectionContainer:{
    flexDirection: 'row',
    justifyContent:'space-between',
    marginVertical: 10,
  },
  optionButton: {
    flex: 1,
    paddingVertical: 10,
    marginHorizontal: 5, 
    borderWidth: 1,
    borderRadius: 5,
    alignItems: 'center',
    backgroundColor: '#F8F8FF',
    borderColor: '#4682B4',
  },
  selectedButton: {
    backgroundColor: '#4682B4',
    borderColor: '#1E90FF',
  },
  optionText: {
    color: '#333',
    fontWeight: 'bold',
  },
  extraImagesContainer: {
    flexDirection:'row',
    flexWrap:'wrap',
    justifyContent:'space-between',
    marginTop: 10,
  },
  imageWithCaption: {
    width: '50%',
    marginBotton: 10,
    alignItems:'center',
  },
  extraImageUpload: {
    width: width * 0.4,
    height: width * 0.4,
    borderRadius: 10,
    backgroundColor: '#87CEFA',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  extraImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover'
  },
  loadingText: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
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
  saveButtonContainer: { width: '100%', alignItems: 'center', justifyContent: 'center' },
});

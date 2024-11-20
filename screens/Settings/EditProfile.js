import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, ScrollView, Alert, Image, KeyboardAvoidingView, Platform } from 'react-native';
import { Button } from 'react-native-elements';
import { LinearGradient } from 'expo-linear-gradient';
import * as ImagePicker from 'expo-image-picker';
import { Dimensions } from 'react-native';
import { db } from '../../firebaseConfig'; 

const { width, height } = Dimensions.get('window');

export default function EditProfile({ navigation }) {
  useEffect(() => {
    
  })
  // State variables to hold user profile details
  const initialState = {
    mainImage: user.mainImage,
    extraImages:user.extraImages || [null, null, null, null, null],
    captions: user.captions || ['','','','',''],
    gender: user.gender,
    preference: user.preference,
    bio: user.bio || '',
    nickName: user.nickName, 
  }

  function profileReducer(state, action){
    switch (action.type) {
      case 'UPDATE_FIELD':
        return { ...state, [action.field]: action.value};
      default:
        return state; 
    }
  }
  
  const [state, dispatch] = useReducer(profileReducer,initialState);

  const handleImagePick = async (index = -1) => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permissionResult.granted) {
      Alert.alert("Permission required", "Permission to access the media library is required to upload images.");
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
        dispatch({type: 'UPDATE_FIELD', field: 'mainImage', value: selectedImageUri
        })
      } else {
        const updatedImages = [...profile.extraImages];
        updatedImages[index] = selectedImageUri;
        dispatch({type: 'UPDATE_FIELD', field: 'extraImages', value: selectedImageUri})
      }
    }
  };

  const handleSaveChanges = async () => {
    const { mainImage, gender, preference, bio, extraImages, captions, nickName } = profile; 
    
    if (!mainImage || !gender || !preference) {
      Alert.alert("Profile Incomplete", "Please complete all required fields.");
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

      await db.collection('users').doc(user.id).update(updatedProfile);

      Alert.alert("Profile Updated", "Your profile has been successfully updated.");
      navigation.goBack(); // Go back to the MyProfileScreen
    } catch (error) {
      console.error("Error updating profile:", error);
      Alert.alert("Error", "Failed to update profile. Please try again.");
    }
  };

  return (
    <LinearGradient colors={['#1E90FF', '#87CEFA']} style={styles.container}>
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.keyboardAvoidingView}>
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          <View style={styles.contentContainer}>
            {/* Main Profile Image */}
            <Text style={styles.label}>Main Profile Picture</Text>
            <TouchableOpacity onPress={() => handleImagePick(-1)} style={styles.imageUpload}>
              {mainImage ? (
                <Image source={{ uri: mainImage }} style={styles.image} />
              ) : (
                <Text style={styles.imagePlaceholder}>Choose Image</Text>
              )}
            </TouchableOpacity>

            {/* Extra Images */}
            <Text style={styles.label}>Additional Pictures (Optional)</Text>
            <View style={styles.extraImagesContainer}>
              {extraImages.map((image, index) => (
                <TouchableOpacity key={index} onPress={() => handleImagePick(index)} style={styles.extraImageUpload}>
                  {image ? (
                    <Image source={{ uri: image }} style={styles.extraImage} />
                  ) : (
                    <Text style={styles.imagePlaceholder}>+</Text>
                  )}
                </TouchableOpacity>
              ))}
            </View>

            {/* Captions for Extra Images */}
            {extraImages.map((image, index) =>
              image ? (
                <TextInput
                  key={`caption-${index}`}
                  placeholder={`Caption for Picture ${index + 1} (Optional)`}
                  placeholderTextColor="#aaa"
                  style={styles.captionInput}
                  value={captions[index]}
                  onChangeText={(text) => {
                    const updatedCaptions = [...captions];
                    updatedCaptions[index] = text;
                    setCaptions(updatedCaptions);
                  }}
                />
              ) : null
            )}

            {/* Gender Selection */}
            <Text style={styles.label}>I am a</Text>
            <View style={styles.selectionContainer}>
              <TouchableOpacity onPress={() => setGender('Male')} style={[styles.optionButton, gender === 'Male' && styles.selectedButton]}>
                <Text style={styles.optionText}>Male</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => setGender('Female')} style={[styles.optionButton, gender === 'Female' && styles.selectedButton]}>
                <Text style={styles.optionText}>Female</Text>
              </TouchableOpacity>
            </View>

            {/* Preference Selection */}
            <Text style={styles.label}>Looking for</Text>
            <View style={styles.selectionContainer}>
              <TouchableOpacity onPress={() => setPreference('Male')} style={[styles.optionButton, preference === 'Male' && styles.selectedButton]}>
                <Text style={styles.optionText}>Male</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => setPreference('Female')} style={[styles.optionButton, preference === 'Female' && styles.selectedButton]}>
                <Text style={styles.optionText}>Female</Text>
              </TouchableOpacity>
            </View>

            {/* Bio Input */}
            <Text style={styles.label}>Bio</Text>
            <TextInput
              placeholder="Tell us a bit about yourself..."
              placeholderTextColor="#aaa"
              multiline
              style={styles.bioInput}
              value={bio}
              onChangeText={setBio}
              returnKeyType="done"
              onSubmitEditing={() => Keyboard.dismiss()}
            />

            {/* Save Button */}
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
    backgroundColor: '#1E90FF', // Deep blue as a base
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
    color: '#ffffff', // White for contrast
    marginTop: 20,
    marginBottom: 10,
  },
  imageUpload: {
    width: width * 0.5,
    height: width * 0.5,
    borderRadius: width * 0.25,
    backgroundColor: '#87CEFA', // Light sky blue for placeholder
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
    color: '#f0f8ff', // Alice blue for text
    fontSize: 16,
  },
  extraImagesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  extraImageUpload: {
    width: width * 0.25,
    height: width * 0.25,
    backgroundColor: '#B0E0E6', // Powder blue for extra image placeholders
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    margin: 5,
    overflow: 'hidden',
  },
  extraImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  captionInput: {
    width: '100%',
    padding: 10,
    marginVertical: 5,
    backgroundColor: '#F8F8FF', // Ghost white for input fields
    borderRadius: 5,
    borderWidth: 1,
    borderColor: '#87CEFA', // Light sky blue border
    color: '#333',
  },
  selectionContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 10,
  },
  optionButton: {
    padding: 10,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: '#ffffff', // White for border
    backgroundColor: 'rgba(255, 255, 255, 0.2)', // Transparent white
  },
  selectedButton: {
    backgroundColor: '#ffffff', // White for selected button
  },
  optionText: {
    color: '#ffffff', // White text
    fontSize: 16,
  },
  bioInput: {
    width: '100%',
    height: 100,
    padding: 10,
    marginTop: 10,
    backgroundColor: '#F8F8FF', // Ghost white for bio input
    borderRadius: 5,
    borderWidth: 1,
    borderColor: '#87CEFA', // Light blue border
    color: '#333',
    textAlignVertical: 'top',
  },
  saveButton: {
    width: '100%',
    backgroundColor: '#4682B4', // Steel blue for button
    padding: 15,
    borderRadius: 5,
    marginTop: 20,
  },
  saveButtonTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF', // White for button text
  },
});

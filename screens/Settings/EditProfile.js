import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, ScrollView, Alert, Image, KeyboardAvoidingView, Platform } from 'react-native';
import { Button } from 'react-native-elements';
import { LinearGradient } from 'expo-linear-gradient';
import * as ImagePicker from 'expo-image-picker';
import { Dimensions } from 'react-native';
import { db } from '../../firebaseConfig'; 

const { width, height } = Dimensions.get('window');

export default function EditProfile({ navigation, route }) {

  // State variables to hold user profile details
  const [mainImage, setMainImage] = useState(user.mainImage || null);
  const [extraImages, setExtraImages] = useState(user.extraImages || [null, null, null, null, null]);
  const [captions, setCaptions] = useState(user.captions || ['', '', '', '', '']);
  const [gender, setGender] = useState(user.gender || '');
  const [preference, setPreference] = useState(user.preference || '');
  const [bio, setBio] = useState(user.bio || '');

  const handleImagePick = async (index = -1) => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permissionResult.granted) {
      Alert.alert("Permission required", "Permission to access the media library is required to upload images.");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.5,
    });

    if (!result.canceled) {
      const selectedImageUri = result.assets[0].uri;
      if (index === -1) {
        setMainImage(selectedImageUri);
      } else {
        const updatedImages = [...extraImages];
        updatedImages[index] = selectedImageUri;
        setExtraImages(updatedImages);
      }
    }
  };

  const handleSaveChanges = async () => {
    if (!mainImage || !gender || !preference) {
      Alert.alert("Profile Incomplete", "Please complete all required fields.");
      return;
    }

    // Here, you would upload the images to Firebase Storage and update the user profile in Firestore
    try {
      const updatedProfile = {
        mainImage,
        extraImages,
        captions,
        gender,
        preference,
        bio,
      };

      // Example Firebase Firestore update (replace 'users' and user.id with your collection and user identifier)
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
  // (Use your existing styles here or add new ones as needed)
});

import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, ScrollView, Alert, Image, KeyboardAvoidingView, Platform } from 'react-native';
import { Button } from 'react-native-elements';
import { LinearGradient } from 'expo-linear-gradient';
import * as ImagePicker from 'expo-image-picker';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage'; 
import { db, storage, auth } from '../../firebaseConfig';
import { doc, setDoc, collection } from 'firebase/firestore';

export default function ProfileSetupScreen({ navigation }) {
  const [mainImage, setMainImage] = useState(null);
  const [extraImages, setExtraImages] = useState([null, null, null, null, null]);
  const [captions, setCaptions] = useState(['', '', '', '', '']);
  const [gender, setGender] = useState('');
  const [preference, setPreference] = useState('');
  const [bio, setBio] = useState('');
  const [nickName, setNickname] = useState('')

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
        setMainImage(selectedImageUri);
      } else {
        const updatedImages = [...extraImages];
        updatedImages[index] = selectedImageUri;
        setExtraImages(updatedImages);
      }
    }
  };


  const uploadImageToFirebase = async (uri, filename) => {
    const response = await fetch(uri);
    const blob = await response.blob();

    // Use `ref` and `uploadBytes` with the modular SDK
    const imageRef = ref(storage, `profileImages/${auth.currentUser.uid}/${filename}`);
    console.log('Uploading to:', imageRef.fullPath);
    await uploadBytes(imageRef, blob);


    return await getDownloadURL(imageRef); 
  };

  
  const handleSaveProfile = async () => {
    if (!mainImage) {
      Alert.alert("Profile Incomplete", "Please upload a main profile picture.");
      return;
    }
    if (!gender || !preference) {
      Alert.alert("Profile Incomplete", "Please select your gender and who you're interested in.");
      return;
    }
    if (!nickName){
      Alert.alert('Please enter a nickname');
      return;
    }

    try {
      // Upload images to Firebase Storage and get URLs
      const mainImageUrl = await uploadImageToFirebase(mainImage, 'mainImage.jpg');
      const extraImagesUrls = await Promise.all(
        extraImages.map((image, index) => {
          return image ? uploadImageToFirebase(image, `extraImage_${index}.jpg`) : null;
        })
      );

      // Save profile data to Firestore
      const profileData = {
        mainImage: mainImageUrl,
        extraImages: extraImagesUrls,
        captions,
        gender,
        preference,
        bio,
        nickName,
      };

      await setDoc(doc(db, 'users', auth.currentUser.uid), profileData);
      Alert.alert("Profile Created", "Welcome to ICEBREAKER!");
      navigation.replace('Swipe');
    } catch (error) {
      console.error("Error saving profile:", error);
      Alert.alert("Error", "Failed to save profile. Please try again.");
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
            {/* NICKNAME */}
            <Text style ={styles.label}> Set a Nickname!</Text>
            <TextInput
            placeholder="Enter your nickName"
            placeholderTextColor="#aaa"
            style={styles.nicknameInput}
            value={nickName}
            onChangeText={setNickname}
            />
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
              title="Save Profile"
              buttonStyle={styles.saveButton}
              titleStyle={styles.saveButtonTitle}
              onPress={handleSaveProfile}
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
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  scrollContainer: {
    paddingVertical: 40,
    alignItems: 'center',
  },
  contentContainer: {
    width: '90%',
    alignItems: 'center',
  },
  label: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginVertical: 10,
  },
  imageUpload: {
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  imagePlaceholder: {
    color: '#aaa',
    fontSize: 16,
  },
  image: {
    width: '100%',
    height: '100%',
    borderRadius: 75,
  },
  extraImagesContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  extraImageUpload: {
    width: 60,
    height: 60,
    borderRadius: 10,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    margin: 5,
  },
  extraImage: {
    width: '100%',
    height: '100%',
    borderRadius: 10,
  },
  captionInput: {
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    padding: 10,
    color: '#333',
    width: '100%',
    marginBottom: 10,
  },
  selectionContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginBottom: 20,
  },
  optionButton: {
    padding: 10,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#FFFFFF',
    backgroundColor: '#87CEFA',
  },
  selectedButton: {
    backgroundColor: '#005bb5',
  },
  optionText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  bioInput: {
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    padding: 10,
    color: '#333',
    width: '100%',
    height: 100,
    textAlignVertical: 'top',
    marginBottom: 20,
  },
  saveButton: {
    backgroundColor: '#005bb5',
    borderRadius: 10,
    paddingVertical: 12,
    width: '100%',
  },
  saveButtonTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  nicknameInput: {
    borderBottomWidth: 1, 
    borderBottomColor: '#white',
    paddingVertical: 5,
    fontSize: 16, 
    color: '#white',
    marginBottom: 20, 
    width: '80%',
  }
});

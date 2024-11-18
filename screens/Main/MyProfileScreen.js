import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { auth, db } from '../../firebaseConfig';
import { doc, getDoc } from 'firebase/firestore';

export default function MyProfileScreen({ navigation }) {
  const [mainImage, setMainImage] = useState(null);

  useEffect(() => {
    const fetchUserProfile = async () => {
      const userId = auth.currentUser.uid;
      const userDoc = await getDoc(doc(db, 'users', userId));

      if (userDoc.exists()) {
        const data = userDoc.data();
        setMainImage(data.mainImage); // Load the main profile image from Firebase
      }
    };

    fetchUserProfile();
  }, []);

  return (
    <LinearGradient colors={['#1E90FF', '#87CEFA']} style={styles.container}>
      <View style={styles.profileContainer}>
        {/* Display Main Profile Picture */}
        <View style={styles.imageContainer}>
          {mainImage ? (
            <Image source={{ uri: mainImage }} style={styles.image} />
          ) : (
            <Text style={styles.imagePlaceholder}>No Image Available</Text>
          )}
        </View>

        {/* Profile Actions */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.profileButton} onPress={() => navigation.navigate('EditProfile')}>
            <Ionicons name="pencil-outline" size={24} color="#FFFFFF" />
            <Text style={styles.buttonText}>Edit Profile</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.profileButton} onPress={() => navigation.navigate('Settings')}>
            <Ionicons name="settings-outline" size={24} color="#FFFFFF" />
            <Text style={styles.buttonText}>Settings</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Bottom Navigation */}
      <View style={styles.bottomNav}>
        <TouchableOpacity onPress={() => navigation.navigate('MyProfile')}>
          <Ionicons name="person-circle-outline" size={32} color="#FFFFFF" />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigation.navigate('Swipe')}>
          <Ionicons name="heart-outline" size={32} color="#FFFFFF" />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigation.navigate('ChatScreen')}>
          <Ionicons name="chatbubbles-outline" size={32} color="#FFFFFF" />
        </TouchableOpacity>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  profileContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  imageContainer: {
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  image: {
    width: '100%',
    height: '100%',
    borderRadius: 75,
  },
  imagePlaceholder: {
    color: '#aaa',
    fontSize: 16,
  },
  buttonContainer: {
    flexDirection: 'row',
    marginTop: 20,
  },
  profileButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FF4500',
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 20,
    marginHorizontal: 10,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 5,
  },
  bottomNav: {
    position: 'absolute',
    bottom: 20,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: '#005bb5',
    paddingVertical: 10,
  },
});

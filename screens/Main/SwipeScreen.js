import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, Dimensions, Image, Animated, TouchableOpacity } from 'react-native';
import { db, auth } from '../../firebaseConfig';
import { collection, query, where, getDocs, getDoc, doc } from 'firebase/firestore';
import { LinearGradient } from 'expo-linear-gradient';
import Ionicons from '@expo/vector-icons/Ionicons';
const { width, height } = Dimensions.get('window');

export default function SwipeScreen({ navigation }) {
  const [profiles, setProfiles] = useState([]); // Stores the profiles fetched from the database.
  const [currentIndex, setCurrentIndex] = useState(0); // Tracks the currently visible profile index.
  const position = useRef(new Animated.ValueXY()).current; // Animates the card's position during swipe gestures.
  const touchStartRef = useRef({ x: 0, y: 0 }); // Tracks the initial touch position to calculate swipe movement.
  const [swipeFeedback, setSwipeFeedback] = useState({text: '', color: 'transparent'});
  // Fetches profiles based on the user's preferences.
  useEffect(() => {
    const fetchProfiles = async () => {
      const userId = auth.currentUser.uid;
      const userRef = doc(db, 'users', userId);
      const userDoc = await getDoc(userRef);
      const { gender: userGender, preference: userPreference } = userDoc.data();

      // Query to fetch profiles matching user's preference and gender.
      const profilesQuery = query(
        collection(db, 'users'),
        where('gender', '==', userPreference),
        where('preference', '==', userGender)
      );

      // Filters out the current user's profile and formats the data.
      const profileDocs = await getDocs(profilesQuery);
      const profileData = profileDocs.docs
        .filter((doc) => doc.id !== userId)
        .map((doc) => ({ id: doc.id, ...doc.data() }));

      setProfiles(profileData); // Sets the profiles state.
    };

    fetchProfiles();
  }, []);

  // Records the starting point of the user's touch.
  const handleTouchStart = (e) => {
    const { pageX, pageY } = e.nativeEvent; // Captures the initial touch coordinates.
    touchStartRef.current = { x: pageX, y: pageY }; // Saves the coordinates for later calculations.
  };

  // Calculates the movement of the user's touch and updates the card position.
  const handleTouchMove = (e) => {
    const { pageX, pageY } = e.nativeEvent; // Captures the current touch coordinates.
    const dx = pageX - touchStartRef.current.x; // Horizontal distance moved.
    const dy = pageY - touchStartRef.current.y; // Vertical distance moved.

    // Updates the position of the card based on touch movement.
    position.setValue({ x: dx, y: dy });

    if (dx > 50) {
      setSwipeFeedback({text: 'LIKE', color: '#00FF00'});
    } else if (dx < -50) {
      setSwipeFeedback({text: 'NOPE', color: 'red'});
    } else {
      setSwipeFeedback({text: '', color: 'transparent'});
    }
  };

  // Determines the swipe result (like/dislike) or resets the position if the swipe is insufficient.
  const handleTouchEnd = (e) => {
    const { pageX } = e.nativeEvent; // Captures the ending horizontal position of the touch.
    const dx = pageX - touchStartRef.current.x; // Calculates the total horizontal movement.

    if (dx > 50) {
      // Right swipe detected: Like.
      Animated.timing(position, {
        toValue: { x: width + 100, y: 0 }, // Moves the card off-screen to the right.
        duration: 300,
        useNativeDriver: false,
      }).start(() => {
        console.log('Liked:', profiles[currentIndex]?.name);
        setSwipeFeedback({ text: 'LIKE', color: '#00FF00' });
        handleNextCard(); // Moves to the next card.
      });
    } else if (dx < -50) {
      // Left swipe detected: Dislike.
      Animated.timing(position, {
        toValue: { x: -width - 100, y: 0 }, // Moves the card off-screen to the left.
        duration: 300,
        useNativeDriver: false,
      }).start(() => {
        console.log('Disliked:', profiles[currentIndex]?.name); 
        setSwipeFeedback({ text: 'NOPE', color: '#FF0000'}); 
        handleNextCard(); // Moves to the next card.
      });
    } else {
      // Swipe was insufficient: Reset the card to its original position.
      Animated.spring(position, {
        toValue: { x: 0, y: 0 },
        useNativeDriver: false,
      }).start(() => setSwipeFeedback({ text: '', color: 'transparent'}));
    }
  };

  // Advances to the next card and resets the position animation.
  const handleNextCard = () => {
    position.setValue({ x: 0, y: 0 }); // Resets the card's position for the next profile.
    setCurrentIndex((prevIndex) => Math.min(prevIndex + 1, profiles.length - 1)); // Updates the current profile index.
  };

  return (
    <LinearGradient colors={['#1E90FF', '#87CEFA']} style={styles.container}>
      
      <Animated.Text 
        style={[styles.feedbackText,
          {
            color: swipeFeedback.text === 'LIKE' || swipeFeedback.text === 'Like' 
            ? '#00FF00' 
            : swipeFeedback.text === 'NOPE' || swipeFeedback.text === 'Dislike'
            ? 'red'
            : 'transparent',
            opacity: position.x.interpolate({
              inputRange: [-width/2, -50, 0, 50, width/2],
              outputRange: [1, 1, 0, 1, 1],
              extrapolate: 'clamp',
            })
          }
        ]}
      >
        {swipeFeedback.text}
      </Animated.Text>
      {profiles.length > 0 && profiles.map((profile, index) => {
        if (index < currentIndex) return null; // Skips already swiped profiles.

        //const isCurrent = index === currentIndex; // Checks if the profile is the currently active card.

        return (
          <Animated.View
            key={profile.id}
            style={[
              styles.card,
              {
                transform: [
                  { translateX: position.x }, // Applies horizontal movement.
                  { translateY: position.y }, // Applies vertical movement.
                  {
                    rotate: position.x.interpolate({
                      inputRange: [-width / 2, 0, width / 2],
                      outputRange: ['-10deg', '0deg', '10deg'], // Rotates the card based on swipe direction.
                      extrapolate: 'clamp',
                    }),
                  },
                ],
              },
            ]}
            onTouchStart={handleTouchStart} // Begins tracking the touch.
            onTouchMove={handleTouchMove} // Updates the card's position.
            onTouchEnd={handleTouchEnd} // Determines swipe outcome or resets the position.
          >
            <Image source={{ uri: profile.mainImage }} style={styles.image} />
            <Text style={styles.name}>{profile.nickName}</Text>
            <Text style={styles.bio}>{profile.bio}</Text>
          </Animated.View>
          
        );
      })}
      {currentIndex >= profiles.length && (
        <Text style={styles.noProfilesText}>No more profiles to show!</Text> // Message when no profiles are left.
      )}
      <View style={styles.bottomNav}>
        <TouchableOpacity onPress={() => navigation.navigate('MyProfile')} style={styles.navButton}>
          <Ionicons name="person-circle-outline" size={24} color="#FFFFFF" />
          <Text style={styles.navButtonText}>My Profile</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigation.navigate('ChatScreen')} style={styles.navButton}>
          <Ionicons name="chatbubbles-outline" size={24} color="#FFFFFF" />
          <Text style={styles.navButtonText}>Chats</Text>
        </TouchableOpacity>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  feedbackText: {
    position: 'absolute',
    top: '40%',
    fontSize: 42,
    fontWeight: 'bold',
    textAlign: 'center',
    zIndex: 100,
    width: '100%',
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: -1, height: 1 },
    textShadowRadius: 10,
    transform: [{ rotate: '-30deg' }],
  },
  card: {
    zIndex: 999,
    width: width * 0.9,
    height: height * 0.7,
    position: 'absolute',
    borderRadius: 10,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  image: {
    width: '100%',
    height: '70%',
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
  },
  name: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 10,
  },
  bio: {
    fontSize: 16,
    color: '#777',
    textAlign: 'center',
    marginVertical: 10,
  },
  noProfilesText: {
    fontSize: 18,
    color: '#555',
  },
  bottomNav: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: '#005bb5',
    paddingVertical: 25,
    height: 90,
  },
  navButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  navButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 5,
  },
});

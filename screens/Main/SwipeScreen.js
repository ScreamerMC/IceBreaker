import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Dimensions, Image, TouchableOpacity, Animated, PanResponder } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { db, auth } from '../../firebaseConfig';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { Ionicons } from '@expo/vector-icons'; // Import icons for button styling

const { width, height } = Dimensions.get('window');

export default function SwipeScreen({ navigation }) {
  const [profiles, setProfiles] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const position = useRef(new Animated.ValueXY()).current;

  useEffect(() => {
    const fetchProfiles = async () => {
      const userId = auth.currentUser.uid;
      const userDoc = await getDocs(collection(db, 'users'), userId);
      const userData = userDoc.data();

      const userGender = userData.gender;
      const userPreference = userData.preference;

      const profilesQuery = query(
        collection(db, 'users'),
        where('gender', '==', userPreference),
        where('preference', '==', userGender)
      );

      const profileDocs = await getDocs(profilesQuery);
      const profileData = profileDocs.docs
        .filter((doc) => doc.id !== userId)
        .map((doc) => ({ id: doc.id, ...doc.data() }));

      setProfiles(profileData);
    };

    fetchProfiles();
  }, []);

  const rotate = position.x.interpolate({
    inputRange: [-width / 2, 0, width / 2],
    outputRange: ['-10deg', '0deg', '10deg'],
    extrapolate: 'clamp',
  });

  const likeOpacity = position.x.interpolate({
    inputRange: [0, width / 4],
    outputRange: [0, 1],
    extrapolate: 'clamp',
  });

  const dislikeOpacity = position.x.interpolate({
    inputRange: [-width / 4, 0],
    outputRange: [1, 0],
    extrapolate: 'clamp',
  });

  const nextCard = () => {
    position.setValue({ x: 0, y: 0 });
    setCurrentIndex((prevIndex) => prevIndex + 1);
  };

  const panResponder = PanResponder.create({
    onMoveShouldSetPanResponder: () => true,
    onPanResponderMove: (event, gesture) => {
      position.setValue({ x: gesture.dx, y: gesture.dy });
    },
    onPanResponderRelease: (event, gesture) => {
      if (gesture.dx > 120) {
        Animated.spring(position, {
          toValue: { x: width + 100, y: gesture.dy },
          useNativeDriver: false,
        }).start(() => {
          console.log('Liked', profiles[currentIndex].name);
          nextCard();
        });
      } else if (gesture.dx < -120) {
        Animated.spring(position, {
          toValue: { x: -width - 100, y: gesture.dy },
          useNativeDriver: false,
        }).start(() => {
          console.log('Disliked', profiles[currentIndex].name);
          nextCard();
        });
      } else {
        Animated.spring(position, {
          toValue: { x: 0, y: 0 },
          friction: 4,
          useNativeDriver: false,
        }).start();
      }
    },
  });

  return (
    <LinearGradient colors={['#1E90FF', '#87CEFA']} style={styles.container}>
      {profiles.length > 0 && profiles.map((profile, index) => {
        if (index < currentIndex) return null;

        const isCurrent = index === currentIndex;
        const cardStyle = isCurrent
          ? [
              styles.card,
              {
                transform: [
                  { translateX: position.x },
                  { translateY: position.y },
                  { rotate: rotate },
                ],
              },
            ]
          : [styles.card, { opacity: 0 }];

        return (
          <Animated.View
            key={profile.id}
            style={cardStyle}
            {...(isCurrent ? panResponder.panHandlers : {})}
          >
            <Image source={{ uri: profile.mainImage }} style={styles.image} />
            <View style={styles.profileInfo}>
              <Text style={styles.name}>{profile.name}, {profile.age}</Text>
              <Text style={styles.bio}>{profile.bio}</Text>
            </View>

            {isCurrent && (
              <>
                <Animated.View style={[styles.likeBadge, { opacity: likeOpacity }]}>
                  <Text style={styles.likeText}>LIKE</Text>
                </Animated.View>
                <Animated.View style={[styles.dislikeBadge, { opacity: dislikeOpacity }]}>
                  <Text style={styles.dislikeText}>NOPE</Text>
                </Animated.View>
              </>
            )}
          </Animated.View>
        );
      })}

      {profiles.length === 0 && (
        <View style={styles.noProfilesContainer}>
          <Image source={require('../../assets/ice_cube_logo.png')} style={styles.noProfilesLogo} />
          <Text style={styles.noProfilesText}>No more profiles to show right now. Please check back later!</Text>
        </View>
      )}

      {/* Updated bottom navigation buttons */}
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
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: 80,
  },
  card: {
    width: width * 0.9,
    height: height * 0.7,
    borderRadius: 20,
    backgroundColor: '#fff',
    position: 'absolute',
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 10,
    alignItems: 'center',
  },
  image: {
    width: '100%',
    height: '75%',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  profileInfo: {
    padding: 15,
    alignItems: 'center',
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  bio: {
    fontSize: 16,
    color: '#777',
    textAlign: 'center',
    marginTop: 5,
  },
  likeBadge: {
    position: 'absolute',
    top: 50,
    left: 40,
    zIndex: 1,
    borderWidth: 2,
    borderColor: '#4CAF50',
    padding: 10,
    borderRadius: 5,
  },
  dislikeBadge: {
    position: 'absolute',
    top: 50,
    right: 40,
    zIndex: 1,
    borderWidth: 2,
    borderColor: '#F44336',
    padding: 10,
    borderRadius: 5,
  },
  likeText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  dislikeText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#F44336',
  },
  noProfilesContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: -height * 0.15,
  },
  noProfilesLogo: {
    width: 100,
    height: 100,
    marginBottom: 20,
  },
  noProfilesText: {
    fontSize: 18,
    color: '#FFFFFF',
    textAlign: 'center',
    paddingHorizontal: width * 0.1,
  },
  bottomNav: {
    position: 'absolute',
    bottom: 100, // Moved up for better placement
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '80%',
    paddingVertical: 10,
  },
  navButton: {
    backgroundColor: '#005bb5', // Button background color
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 15,
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

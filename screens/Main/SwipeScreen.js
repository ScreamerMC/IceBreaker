import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, Dimensions, Image, Animated, TouchableOpacity, ScrollView, Platform } from 'react-native';
import { db, auth } from '../../firebaseConfig';
import { collection, query, where, getDocs, getDoc, doc, setDoc, updateDoc, arrayUnion } from 'firebase/firestore';
import { LinearGradient } from 'expo-linear-gradient';
import Ionicons from '@expo/vector-icons/Ionicons';
const { width, height } = Dimensions.get('window');
import MatchAlert from '../components/MatchAlert';

export default function SwipeScreen({ navigation }) {
  const [profiles, setProfiles] = useState([]); // Stores the profiles fetched from the database.
  const [currentIndex, setCurrentIndex] = useState(0); // Tracks the currently visible profile index.
  const position = useRef(new Animated.ValueXY()).current; // Animates the card's position during swipe gestures.
  const touchStartRef = useRef({ x: 0, y: 0 }); // Tracks the initial touch position to calculate swipe movement.
  const [swipeFeedback, setSwipeFeedback] = useState({text: '', color: 'transparent'});
  const feedbackColor = useRef(new Animated.Value(0)).current;
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);

  const [matchAlert, setMatchAlert] = useState({visible: false, profile: null});
  // useEffect to handle screen focus
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      checkAvailableProfiles(false);
    });
    return unsubscribe;
  }, [navigation]);
  
  // Separate the profile checking logic
  const checkAvailableProfiles = async (includeDisliked = false) => {
    try {
      const userId = auth.currentUser.uid;
      const userRef = doc(db, 'users', userId);
      const userDoc = await getDoc(userRef);
      const userData = userDoc.data();
      
      // Get user's interactions
      const likes = userData.likes || [];
      const dislikes = userData.dislikes || [];
      const matches = userData.matches || [];
      
      // If includeDisliked is false, filter out all interactions
      // If true, only filter out likes and matches
      const filteredProfiles = includeDisliked ? 
        [...likes, ...matches] : 
        [...likes, ...dislikes, ...matches];

      // Query profiles matching user's preference
      const profilesQuery = query(
        collection(db, 'users'),
        where('gender', '==', userData.preference),
        where('preference', '==', userData.gender)
      );

      const profileDocs = await getDocs(profilesQuery);
      const availableProfiles = profileDocs.docs
        .filter(doc => 
          doc.id !== userId && 
          !filteredProfiles.includes(doc.id)
        )
        .map(doc => ({ id: doc.id, ...doc.data() }));

      if (availableProfiles.length === 0) {
        setProfiles([]);
        setCurrentIndex(0);
      } else {
        setProfiles(availableProfiles);
        setCurrentIndex(0);
      }
    } catch (error) {
      console.error('Error checking available profiles:', error);
    }
  };

  // Update the refresh button to explicitly fetch new profiles
  const handleRefresh = async () => {
    await checkAvailableProfiles(true);
  };

  // Records the starting point of the user's touch.
  const handleTouchStart = (event) => {
    const { pageX } = event.nativeEvent;
    setStartX(pageX);
    setIsDragging(false);
    touchStartRef.current = { x: pageX };
  };

  // Calculates the movement of the user's touch and updates the card position.
  const handleTouchMove = (event) => {
    const { pageX } = event.nativeEvent;
    const dx = pageX - startX;

    // Only trigger dragging if horizontal movement is significant
    if (Math.abs(dx) > 10 && !isDragging) {
      setIsDragging(true);
    }

    if (isDragging) {
      requestAnimationFrame(() => {
        position.setValue({ x: dx, y: 0 });
      });

      if (dx > 50) {
        setSwipeFeedback({text: 'LIKE', color: '#00FF00'});
        Animated.timing(feedbackColor, {
          toValue: 1,
          duration: 0,
          useNativeDriver: false,
        }).start();
      } else if (dx < -50) {
        setSwipeFeedback({text: 'NOPE', color: '#FF0000'});
        Animated.timing(feedbackColor, {
          toValue: 2,
          duration: 0,
          useNativeDriver: false,
        }).start();
      } else {
        setSwipeFeedback({text: '', color: 'transparent'});
        Animated.timing(feedbackColor, {
          toValue: 0,
          duration: 300,
          useNativeDriver: false,
        }).start();
      }
    }
  };

  // Determines the swipe result (like/dislike) or resets the position if the swipe is insufficient.
  const handleTouchEnd = (event) => {
    const { pageX } = event.nativeEvent; // Captures the ending horizontal position of the touch.
    const dx = pageX - touchStartRef.current.x; // Calculates the total horizontal movement.
    const currentProfile = profiles[currentIndex];
    const currentUserId = auth.currentUser.uid;

    if (dx > 50) {
      // Right swipe detected: Like.
      Animated.timing(position, {
        toValue: { x: width + 100, y: 0 }, // Moves the card off-screen to the right.
        duration: 300,
        useNativeDriver: false,
      }).start( async () => {
        try {
          const userRef = doc(db, 'users', currentUserId);
          await updateDoc(userRef, {
            likes: arrayUnion(currentProfile.id)
          });
       
          console.log('Liked:', currentProfile?.nickName || 'Name not available');   
        // check if the other user has liked the current user
          const otherUserRef = doc(db, 'users', currentProfile.id);
          const otherUserDoc = await getDoc(otherUserRef);
          const otherUserLiked = otherUserDoc.data().likes || [];
          
          if (otherUserLiked.includes(currentUserId)) {
            //match 
            const matchRef = doc(collection(db, 'matches'));
            await setDoc(matchRef, {
              users: [currentUserId, currentProfile.id],
              timestamp: new Date(),
              lastMessage: null
            });
            // update both user's matches array 
            await updateDoc(userRef, {
              matches: arrayUnion(currentProfile.id)
            });
            await updateDoc(otherUserRef, {
              matches: arrayUnion(currentUserId)
            });
            setMatchAlert({visible: true, profile: currentProfile});
          }
        setSwipeFeedback({ text: 'LIKE', color: '#00FF00' });
        handleNextCard(); // Moves to the next card.
      } catch (error) {
        console.error('Error liking profile:', error);
      }
      });
    } else if (dx < -50) {
      // Left swipe detected: Dislike.
      Animated.timing(position, {
        toValue: { x: -width - 100, y: 0 }, // Moves the card off-screen to the left.
        duration: 300,
        useNativeDriver: false,
      }).start(async() => {
        try {
          const userRef = doc(db, 'users', currentUserId);
          await updateDoc(userRef, {
            dislikes: arrayUnion(currentProfile.id)
          });
          console.log('Disliked:', profiles[currentIndex]?.nickName); 
        setSwipeFeedback({ text: 'NOPE', color: '#FF0000'}); 
        handleNextCard(); // Moves to the next card.
        } catch (error) {
          console.error('Error disliking profile:', error);
        }
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
    setCurrentIndex(prevIndex => {
      if (prevIndex >= profiles.length - 1) {
        return profiles.length;
      }
      return prevIndex + 1;
    }); // Updates the current profile index.
  };

  

  return (
    <LinearGradient colors={['#1E90FF', '#87CEFA']} style={styles.container}>
      
      <Animated.Text 
        style={[styles.feedbackText,
          {
            color: feedbackColor.interpolate({
              inputRange: [0, 1, 2],
              outputRange: ['transparent', '#00FF00', '#FF0000']       
            }),
            opacity: position.x.interpolate({
              inputRange: [-width/2, -50, 0, 50, width/2],
              outputRange: [1, 1, 0, 1, 1],
              extrapolate: 'clamp',
            }),
          }
        ]}
      >
        {swipeFeedback.text}
      </Animated.Text>
      {profiles.length > 0 && currentIndex < profiles.length ? (
          <Animated.View
            key={profiles[currentIndex].id}
            style={[
              styles.card,
              {
                transform: [
                  { translateX: position.x },
                  { translateY: position.y },
                  {
                    rotate: position.x.interpolate({
                      inputRange: [-width / 2, 0, width / 2],
                      outputRange: ['-10deg', '0deg', '10deg'],
                      extrapolate: 'clamp',
                    }),
                  },
                ],
              },
            ]}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          >
            <ScrollView 
              style={styles.scrollView}
              showsVerticalScrollIndicator={false}
              bounces={false}
              scrollEnabled={!isDragging}
              onScrollBeginDrag={() => setIsDragging(false)}
              onScrollEndDrag={() => setIsDragging(false)}
            >
              {/* Main Image Section */}
              <View style={styles.mainImageContainer}>
                <Image 
                  source={{ uri: profiles[currentIndex].mainImage }} 
                  style={styles.mainImage} 
                />
                <LinearGradient
                  colors={['transparent', 'rgba(0,0,0,0.8)']}
                  style={styles.gradientOverlay}
                >
                  <Text style={styles.name}>{profiles[currentIndex].nickName}</Text>
                  <Text style={styles.bio}>{profiles[currentIndex].bio}</Text>
                </LinearGradient>
              </View>

              {/* Extra Images Section */}
              {profiles[currentIndex].extraImages?.map((imageUrl, index) => (
                imageUrl && (
                  <View key={index} style={styles.extraImageContainer}>
                    <Image 
                      source={{ uri: imageUrl }} 
                      style={styles.extraImage} 
                    />
                    {profiles[currentIndex].captions?.[index] && (
                      <View style={styles.captionContainer}>
                        <Text style={styles.caption}>
                          {profiles[currentIndex].captions[index]}
                        </Text>
                      </View>
                    )}
                  </View>
                )
              ))}
            </ScrollView>
          </Animated.View>
          
           ) : (
            <View style={styles.noProfilesContainer}>
              <Image source={require('../../assets/icon.png')} style={styles.noProfilesIcon} />
          <Text style={styles.noProfilesText}>No more profiles to show!</Text> 
          <TouchableOpacity
           style={styles.refreshButton} 
           onPress={handleRefresh}
          >
          <Ionicons name="refresh" size={24} color="white" />
          <Text style={styles.refreshButtonText}>Refresh</Text>
          </TouchableOpacity>
        </View> 
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
        {/*<TouchableOpacity style={styles.test} onPress={() => setMatchAlert({visible: true, profile: {nickName: 'test'}})}>

      </TouchableOpacity> */}
      </View>
      <MatchAlert 
        visible={matchAlert.visible} 
        onClose={() => setMatchAlert({visible: false, profile: null})}
        matchedProfile={matchAlert.profile}
        navigation={navigation}
      />
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  /*test: {
    position: 'absolute',
    top: 20,
    right: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    padding: 10,
    borderRadius: 8,
  },*/
  card: {
    width: width * 0.8,
    height: height * 0.7,
    position: 'absolute',
    paddingBottom: 10, 
    marginBottom: 10,
    borderRadius: 25,
    backgroundColor: '#f8f9fa',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: {
          width: 0,
          height: 2,
        },
        shadowOpacity: 0.2,
        shadowRadius: 10,
      },
      android: {
        elevation: 0,
      },
    }),
    overflow: 'hidden',
  },
  scrollView: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  mainImageContainer: {
    position: 'relative',
    height: height * 0.6,
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
    overflow: 'hidden',
  },
  mainImage: {
    width: '100%',
    height: '100%',
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
  },
  gradientOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 25,
    paddingVertical: 35,
    background: 'linear-gradient(to bottom, rgba(0,0,0,0), rgba(0,0,0,0.8))',
  },
  name: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 10,
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 5,
  },
  bio: {
    fontSize: 16,
    color: '#FFFFFF',
    lineHeight: 22,
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 5,
  },
  extraImageContainer: {
    marginVertical: 12,
    marginHorizontal: 15,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: {
          width: 0,
          height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 0,
      },
    }),
  },
  extraImage: {
    width: '100%',
    height: 350,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  captionContainer: {
    padding: 20,
    backgroundColor: '#FFFFFF',
  },
  caption: {
    fontSize: 15,
    color: '#2c3e50',
    textAlign: 'center',
    lineHeight: 22,
  },
  feedbackText: {
    position: 'absolute',
    top: '40%',
    fontSize: 90,
    fontWeight: 'bold',
    textAlign: 'center',
    zIndex: 100,
    width: '100%',
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: -1, height: 1 },
    textShadowRadius: 10,
    transform: [{ rotate: '-30deg' }],
    elevation: 5,
  },
  noProfilesContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 30,
  },
  noProfilesIcon: {
    width: 120,
    height: 120,
    marginBottom: 25,
    opacity: 0.9,
  },
  noProfilesText: {
    fontSize: 26,
    color: '#FFFFFF',
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
    textShadowColor: 'rgba(0, 0, 0, 0.2)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  refreshButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 25,
    paddingVertical: 15,
    borderRadius: 30,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  refreshButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
    marginLeft: 10,
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

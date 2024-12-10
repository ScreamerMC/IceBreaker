import React, { useState, useEffect } from 'react';
import { Image, View, Text, TouchableOpacity, StyleSheet, FlatList, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { auth, db } from '../../firebaseConfig';
import { useMatches } from '../custom hooks/useMatches';
import { doc, getDoc } from 'firebase/firestore';
import Ionicons from '@expo/vector-icons/Ionicons';

export default function ChatScreen({navigation}) {
  const matches = useMatches();
  const [matchDetails, setMatchDetails] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMatchDetails = async () => {
      setLoading(true);
      const details = {};
      
      for (const match of matches) {
        const otherUserId = match.users.find(id => id !== auth.currentUser.uid);
        if (otherUserId) {
          const userDoc = await getDoc(doc(db, 'users', otherUserId));
          if (userDoc.exists()) {
            const userData = userDoc.data();
            details[match.id] = {
              nickName: userData.nickName || 'Unknown User',
              mainImage: userData.mainImage || 'https://via.placeholder.com/150',
            };

          }
        }
      }
      
      setMatchDetails(details);
      setLoading(false);
    };

    if (matches.length > 0) {
      fetchMatchDetails();
    } else {
      setLoading(false);
    }
  }, [matches]);

  const renderMatchItem = ({item}) => (
    <TouchableOpacity 
      style={styles.matchItem}
      onPress={() => navigation.replace('VoiceChat', {matchId: item.id, nickName: matchDetails[item.id]?.nickName || 'User' })}
    >
      <View style={styles.matchItemContent}>
        <Image 
          source={{uri: matchDetails[item.id]?.mainImage}}
          style={styles.profileImage}
          />
  
      <Text style={styles.matchText}>
        {matchDetails[item.id]?.nickName || 'Loading...'}
      </Text>   
      </View>
    </TouchableOpacity>
  );

  const EmptyListComponent = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyText}>No matches yet!</Text>
      <Text style={styles.emptySubText}>Start swiping to find matches</Text>
    </View>
  );

  if (loading) {
    return (
      <LinearGradient colors={['#1E90FF', '#87CEFA']} style={styles.container}>
        <ActivityIndicator size="large" color="#FFFFFF" />
      </LinearGradient>
    );
  }

  return (
    <LinearGradient colors={['#1E90FF', '#87CEFA']} style={styles.container}>
      <FlatList
        data={matches}
        renderItem={renderMatchItem}
        keyExtractor={(item) => item.id}
        ListEmptyComponent={EmptyListComponent}
        contentContainerStyle={matches.length === 0 ? styles.centerContent : null}
      />
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
    padding: 20,
    paddingTop: 50,
  },
  matchItem: {
    padding: 15,
    backgroundColor: '#87CEFA',
    borderRadius: 10,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  matchText: {
    fontSize: 16,
    fontWeight: 'bold',
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
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  emptyText: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  emptySubText: {
    color: '#FFFFFF',
    fontSize: 16,
  },
  centerContent: {
    flex: 1,
    justifyContent: 'center',
  },
  matchItem: {
    padding: 15,
    backgroundColor: '#fff',
    borderRadius: 10,
    marginBottom: 10,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  matchItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  profileImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 10,
  },
  matchText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
});

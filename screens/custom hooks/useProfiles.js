  
  import { useState, useEffect } from 'react';
  import { db, auth } from '../../firebaseConfig';
  import { collection, query, where, getDocs, getDoc, doc } from 'firebase/firestore';
  
  export const useProfiles = () => {
    const [profiles, setProfiles] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isLoading, setIsLoading] = useState(false);
  // Separate the profile checking logic
  const checkAvailableProfiles = async (includeDisliked = false) => {
    try {
      setIsLoading(true);
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
    } finally {
      setIsLoading(false);
    }
  };

  return { profiles, currentIndex, checkAvailableProfiles, setCurrentIndex, isLoading };
};
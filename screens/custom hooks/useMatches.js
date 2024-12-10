import { useState, useEffect } from 'react';
import { db, auth } from '../../firebaseConfig';
import { collection, query, where, onSnapshot } from 'firebase/firestore';

export const useMatches = () => {
    const [matches, setMatches] = useState([]);
    
    useEffect(() => {
        const userId = auth.currentUser.uid;
        const matchesQuery = query(
            collection(db,'matches'),
            where('users', 'array-contains', userId)
        )

        const unsubscribe = onSnapshot(matchesQuery, (Snapshot) => {
            const matchesData = Snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
            }));
            setMatches(matchesData);
        });

        return () => unsubscribe();
    }, []);
    return matches;
}

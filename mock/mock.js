const { db } = require('../firebaseConfig'); // Adjust path as per your structure
const mockAccounts = require('./mockAccounts.json'); // Import mockAccounts.json
require('firebase/firestore');
const { collection, addDoc } = require('firebase/firestore');

// Function to upload JSON data to Firestore
const uploadMockData = async () => {
  try {
    const usersCollection = collection(db, 'users'); // Replace 'users' with your Firestore collection name

    for (const user of mockAccounts.users) {
      const docRef = await addDoc(usersCollection, user);
      console.log(`Uploaded user with ID: ${docRef.id}`);
    }

    console.log('All mock accounts uploaded successfully!');
  } catch (error) {
    console.error('Error uploading mock accounts:', error);
  }
};

// Call the function
uploadMockData();

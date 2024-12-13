import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { Modal, View, Text, TouchableOpacity, Image, StyleSheet } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
export default function MatchAlert({ visible, onClose, navigation }) {
    return (
        <Modal
        animationType="fade" 
        transparent={true}
        visible={visible} 
        onRequestClose={onClose}
        >
            <View style={styles.modalOverlay}>
                <LinearGradient
                colors={['#1E90FF', '#87CEFA']}
                style={styles.modalContent}
                >
                    <Image
                    source={require('../../assets/ice_cube_logo.png')}
                    style={styles.logo}
                    />
                    <Text style={styles.matchTitle}>You have a new match!</Text>
                    <Text style={styles.matchText}>You liked each other!</Text>

                    <View style={styles.buttonContainer}>
                        <TouchableOpacity 
                        style={styles.button} 
                        onPress={() => {
                            onClose();
                            navigation.replace('ChatScreen');
                        }}
                        >
                            <Ionicons name="chatbubbles-outline" size={24} color="#FFFFFF" />
                            <Text style={styles.buttonText}>Send a Voice Note!</Text>
                        </TouchableOpacity>
                        <TouchableOpacity 
                        style={[styles.button, styles.keepSwiping]}
                        onPress={(onClose)}
                        >
                            <Ionicons name="heart-outline" size={24} color="#FFFFFF" />
                            <Text style={styles.buttonText}>Keep Swiping</Text>
                        </TouchableOpacity>
                    </View>
                </LinearGradient>
            </View>
        </Modal>
    );
}
const styles = StyleSheet.create({
    modalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.7)',
      justifyContent: 'center',
      alignItems: 'center',
    },
    modalContent: {
      width: '80%',
      padding: 20,
      borderRadius: 20,
      alignItems: 'center',
      elevation: 5,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.25,
      shadowRadius: 3.84,
    },
    logo: {
      width: 80,
      height: 80,
      marginBottom: 15,
    },
    matchTitle: {
      fontSize: 28,
      fontWeight: 'bold',
      color: '#FFFFFF',
      marginBottom: 10,
      textAlign: 'center',
    },
    matchText: {
      fontSize: 18,
      color: '#FFFFFF',
      textAlign: 'center',
      marginBottom: 20,
    },
    buttonContainer: {
      width: '100%',
      gap: 10,
    },
    button: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 15,
      borderRadius: 25,
      backgroundColor: 'rgba(255, 255, 255, 0.2)',
      gap: 10,
    },
    keepSwiping: {
      backgroundColor: 'rgba(255, 255, 255, 0.1)',
    },
    buttonText: {
      color: '#FFFFFF',
      fontSize: 16,
      fontWeight: '600',
    },
  });
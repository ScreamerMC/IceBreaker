import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, Alert } from 'react-native';
import { Audio } from 'expo-av';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

export default function VoiceChat({ route, navigation }) {
  const { matchId, nickName } = route.params;
  const [recording, setRecording] = useState(null);
  const [messages, setMessages] = useState([]);
  const [otherUserNickName, setOtherUserNickName] = useState('User');

  // Start audio recording
  const startRecording = async () => {
    try {
      const { granted } = await Audio.requestPermissionsAsync();
      if (!granted) {
        Alert.alert('Permission Denied', 'Audio recording permissions are required.');
        return;
      }

      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      const { recording } = await Audio.Recording.createAsync(Audio.RecordingOptionsPresets.HIGH_QUALITY);
      setRecording(recording);
    } catch (error) {
      console.error('Failed to start recording:', error);
      Alert.alert('Recording Error', 'An error occurred while starting the recording.');
    }
  };

  // Stop recording and save the audio message
  const stopRecording = async () => {
    try {
      if (!recording) return;

      await recording.stopAndUnloadAsync();
      const uri = recording.getURI();

      if (uri) {
        setMessages((prevMessages) => [...prevMessages, { uri, sender: 'me' }]);
      }
    } catch (error) {
      console.error('Failed to stop recording:', error);
      Alert.alert('Recording Error', 'An error occurred while stopping the recording.');
    } finally {
      setRecording(null);
    }
  };

  // Play the selected audio message
  const playMessage = async (uri) => {
    try {
      const sound = new Audio.Sound();
      await sound.loadAsync({ uri });
      await sound.playAsync();
    } catch (error) {
      console.error('Failed to play the message:', error);
      Alert.alert('Playback Error', 'An error occurred while playing the audio.');
    }
  };

  // Render each audio message
  const renderMessage = ({ item }) => (
    <View style = {styles.messageContainer}>
      <TouchableOpacity onPress={() => playMessage(item.uri)}>
        <Ionicons name="play-circle-outline" size={32} color="#FFFFFF" />
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      

      {/* List of audio messages */}
      <FlatList
        data={messages}
        keyExtractor={(item, index) => index.toString()}
        renderItem={renderMessage}
        contentContainerStyle={styles.messageList}
      />

      {/* Record button */}
      <View style={styles.recordButtonContainer}>
        <TouchableOpacity
          onPress={recording ? stopRecording : startRecording}
          style={styles.recordButton}
        >
          <Ionicons
            name={recording ? 'stop-circle-outline' : 'mic-outline'}
            size={48}
            color="#FFFFFF"
          />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 50,
    backgroundColor: '#1E90FF',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 20,
  },
  messageList: {
    paddingHorizontal: 20,
    width: '100%',
  },
  messageContainer: {
    alignItems: 'center',
    padding: 10,
    borderRadius: 10,
    marginVertical: 5,
  },
  myMessage: {
    alignSelf: 'flex-end',
    backgroundColor: '#87CEFA',
  },
  theirMessage: {
    alignSelf: 'flex-start',
    backgroundColor: '#005bb5',
  },
  recordButtonContainer: {
    position: 'absolute',
    bottom: 50,
    alignItems: 'center',
  },
  recordButton: {
    backgroundColor: '#FF4500',
    borderRadius: 50,
    padding: 15,
    alignItems: 'center',
  },
});

import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, Alert } from 'react-native';
import { Audio } from 'expo-av';
import { Ionicons } from '@expo/vector-icons';

export default function VoiceChat({ route }) {
  const { matchId, matchName } = route.params;
  const [recording, setRecording] = useState(null);
  const [messages, setMessages] = useState([]);

  const startRecording = async () => {
    try {
      await Audio.requestPermissionsAsync();
      await Audio.setAudioModeAsync({ allowsRecordingIOS: true, playsInSilentModeIOS: true });

      const { recording } = await Audio.Recording.createAsync(Audio.RecordingOptionsPresets.HIGH_QUALITY);
      setRecording(recording);
    } catch (error) {
      console.error('Failed to start recording', error);
    }
  };

  //possible logic error with this function 
  // stopRecording function sets recording to undefined before calling
  // stopAndUnloadAsync
  const stopRecording = async () => {
    setRecording(undefined);
    await recording.stopAndUnloadAsync();

    const uri = recording.getURI();
    setMessages((prevMessages) => [...prevMessages, { uri, sender: 'me' }]);
  };

  const playMessage = async (uri) => {
    try {
      const sound = new Audio.Sound();
      await sound.loadAsync({ uri });
      await sound.playAsync();
    } catch (error) {
      console.error('Failed to play the message', error);
    }
  };

  const renderMessage = ({ item }) => (
    <View style={[styles.messageContainer, item.sender === 'me' ? styles.myMessage : styles.theirMessage]}>
      <TouchableOpacity onPress={() => playMessage(item.uri)}>
        <Ionicons name="play-circle-outline" size={32} color="#FFFFFF" />
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Chat with {matchName}</Text>
      <FlatList
        data={messages}
        keyExtractor={(item, index) => index.toString()}
        renderItem={renderMessage}
        contentContainerStyle={styles.messageList}
      />

      <View style={styles.recordButtonContainer}>
        <TouchableOpacity
          onPress={recording ? stopRecording : startRecording}
          style={styles.recordButton}
        >
          <Ionicons name={recording ? "stop-circle-outline" : "mic-outline"} size={48} color="#FFFFFF" />
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

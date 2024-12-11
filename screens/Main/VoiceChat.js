import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, FlatList, ActivityIndicator, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useVoiceChat } from '../custom hooks/useVoiceChat';
import { auth } from '../../firebaseConfig';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');

export default function VoiceChat({ route }) {
  const { matchId } = route.params;
  const {
    recording,
    messages,
    loading,
    startRecording,
    stopRecording,
    playMessage
  } = useVoiceChat(matchId);
  const [playingId, setPlayingId] = useState(null);

  const handlePlayMessage = async (messageId, audioUrl) => {
    setPlayingId(messageId);
    await playMessage(audioUrl);
    setPlayingId(null);
  };

  const renderMessage = ({ item }) => {
    const isMyMessage = item.senderId === auth.currentUser.uid;
    const isPlaying = playingId === item.id;

    return (
      <View style={[
        styles.messageWrapper,
        isMyMessage ? styles.myMessageWrapper : styles.theirMessageWrapper
      ]}>
        <LinearGradient
          colors={isMyMessage ? ['#1E90FF', '#87CEFA'] : ['#9FA2A7', '#7A7D82']}
          style={[
            styles.messageContainer,
            isMyMessage ? styles.myMessage : styles.theirMessage
          ]}
        >
          <TouchableOpacity
            style={styles.playButton}
            onPress={() => handlePlayMessage(item.id, item.audioUrl)}
          >
            <Ionicons
              name={isPlaying ? "pause-circle" : "play-circle"}
              size={32}
              color="#FFFFFF"
            />
          </TouchableOpacity>

          {/* Animated waveform bars */}
          <View style={styles.waveformContainer}>
            {[...Array(8)].map((_, index) => (
              <View
                key={index}
                style={[
                  styles.waveformBar,
                  { height: Math.random() * 15 + 5 },
                  isPlaying && styles.waveformBarActive
                ]}
              />
            ))}
          </View>
        </LinearGradient>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#1E90FF" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={messages}
        renderItem={renderMessage}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.messageList}
      />

      <TouchableOpacity
        style={[
          styles.recordButton,
          recording && styles.recordingActive
        ]}
        onPress={recording ? stopRecording : startRecording}
      >
        <LinearGradient
          colors={recording ? ['#FF4500', '#FF6347'] : ['#1E90FF', '#87CEFA']}
          style={styles.recordButtonGradient}
        >
          <Ionicons
            name={recording ? "radio-button-on" : "mic"}
            size={32}
            color="#FFFFFF"
          />
        </LinearGradient>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  messageList: {
    padding: 20,
    paddingBottom: 100,
  },
  messageWrapper: {
    marginVertical: 5,
    maxWidth: width * 0.75,
  },
  myMessageWrapper: {
    alignSelf: 'flex-end',
  },
  theirMessageWrapper: {
    alignSelf: 'flex-start',
  },
  messageContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  myMessage: {
    borderTopRightRadius: 4,
  },
  theirMessage: {
    borderTopLeftRadius: 4,
  },
  playButton: {
    marginRight: 10,
  },
  waveformContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 30,
    marginLeft: 5,
  },
  waveformBar: {
    width: 3,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    marginHorizontal: 1,
    borderRadius: 3,
  },
  waveformBarActive: {
    backgroundColor: '#FFFFFF',
    animation: 'pulse 1s infinite',
  },
  recordButton: {
    position: 'absolute',
    bottom: 30,
    alignSelf: 'center',
    width: 64,
    height: 64,
    borderRadius: 32,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  recordButtonGradient: {
    width: '100%',
    height: '100%',
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  recordingActive: {
    transform: [{ scale: 1.1 }],
  },
});

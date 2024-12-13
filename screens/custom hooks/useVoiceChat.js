import { useState, useEffect } from 'react';
import { Audio, InterruptionModeAndroid, InterruptionModeIOS } from 'expo-av';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { collection, addDoc, query, where, orderBy, onSnapshot } from 'firebase/firestore';
import { storage, db, auth } from '../../firebaseConfig';
import { Platform } from 'react-native';

export function useVoiceChat(matchId) {
  const [recording, setRecording] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sound, setSound] = useState(null);

  //set up audio 
  useEffect(() => {
    const setupAudio = async () => {
      try {
        await Audio.setAudioModeAsync({
          allowsRecordingIOS: true,
          playsInSilentModeIOS: true,
          staysActiveInBackground: true,
          interruptionModeIOS: InterruptionModeIOS.DuckOthers,
          interruptionModeAndroid: InterruptionModeAndroid.DuckOthers,
          shouldDuckAndroid: true,
          playThroughEarpieceAndroid: false,
      });
    } catch (error) {
      console.error('Failed to set up audio:', error);
    }
  };
  setupAudio();
}, []);

  //clean up when component unmounts
  useEffect(() => {
    return sound 
    ? () => {
        sound.unloadAsync();
      }
    : undefined;
  }, [sound]);

  // Fetch messages
  useEffect(() => {
    const messagesRef = collection(db, 'voiceMessages');
    const q = query(
      messagesRef,
      where('matchId', '==', matchId),
      orderBy('timestamp', 'asc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const messageList = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setMessages(messageList);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [matchId]);

  const startRecording = async () => {
    try {
      const { granted } = await Audio.requestPermissionsAsync();
      if (!granted) return;

      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
        staysActiveInBackground: true,
        interruptionModeIOS: InterruptionModeIOS.DuckOthers,
        interruptionModeAndroid: InterruptionModeAndroid.DuckOthers,
        shouldDuckAndroid: true,
        playThroughEarpieceAndroid: false,
      });

      const { recording } = await Audio.Recording.createAsync(
        Platform.OS == 'ios' ? {
          isMeteringEnabled: true,
          android: {
            extension: '.m4a',
            outputFormat: Audio.RECORDING_OPTION_ANDROID_OUTPUT_FORMAT_MPEG_4,
            audioEncoder: Audio.RECORDING_OPTION_ANDROID_AUDIO_ENCODER_AAC,
            sampleRate: 44100,
            numberOfChannels: 2,
            bitRate: 128000,
          },
          ios: {
            extension: '.m4a',
            outputFormat: Audio.RECORDING_OPTION_IOS_OUTPUT_FORMAT_MPEG4AAC,
            audioQuality: Audio.RECORDING_OPTION_IOS_AUDIO_QUALITY_MAX,
            sampleRate: 44100,
            numberOfChannels: 2,
            bitRate: 128000,
            linearPCMBitDepth: 16,
            linearPCMIsBigEndian: false,
            linearPCMIsFloat: false,
          },
        }
        : Audio.RecordingOptionsPresets.HIGH_QUALITY
      );
      setRecording(recording);
    } catch (error) {
      console.error('Failed to start recording:', error);
    }
  };

  const stopRecording = async () => {
    try {
      if (!recording) return;

      await recording.stopAndUnloadAsync();
      const uri = recording.getURI();

      const response = await fetch(uri);
      const blob = await response.blob();
      
      const filename = `voice_${Date.now()}.m4a`;
      const storageRef = ref(storage, `voiceMessages/${matchId}/${filename}`);
      
      await uploadBytes(storageRef, blob);
      const downloadURL = await getDownloadURL(storageRef);

      await addDoc(collection(db, 'voiceMessages'), {
        matchId,
        senderId: auth.currentUser.uid,
        audioUrl: downloadURL,
        timestamp: new Date().toISOString(),
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
      });

    } catch (error) {
      console.error('Failed to stop recording:', error);
    } finally {
      setRecording(null);
    }
  };

  const playMessage = async (audioUrl) => {
    try {
      if (sound) {
        await sound.stopAsync();
        await sound.unloadAsync();
        setSound(null);
      }
      console.log('starting message:', audioUrl);
      const { sound: newSound } = await Audio.Sound.createAsync(
        { uri: audioUrl },
        { shouldPlay: true, volume: 1.0}
      );
      setSound(newSound);

      newSound.setOnPlaybackStatusUpdate(async (status) => {
        if (status.didJustFinish) {
          await newSound.unloadAsync();
          setSound(null);
        }
      });
      await newSound.playAsync();
    } catch (error) {
      console.error(error);
    }
    useEffect(() => {
      return () => {
        if (sound) {
          sound.unloadAsync();
        }
      };
    }, [sound]);

  };

  return {
    recording,
    messages,
    loading,
    startRecording,
    stopRecording,
    playMessage,
    sound
  };
}



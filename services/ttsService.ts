import { Platform } from 'react-native';
import * as Speech from 'expo-speech';

/**
 * Cross-platform text-to-speech. Uses expo-speech on native and SpeechSynthesis on web.
 */
export const speak = (text: string): void => {
  if (Platform.OS === 'web') {
    // Web path: use browser TTS if available
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'en-US';
      utterance.rate = 1.0;
      window.speechSynthesis.cancel();
      window.speechSynthesis.speak(utterance);
      return;
    }
    console.warn('Web SpeechSynthesis not available.');
    return;
  }

  // Native path: expo-speech
  try {
    Speech.stop();
    Speech.speak(text, { language: 'en-US', rate: 1.0 });
  } catch (e) {
    console.warn('expo-speech failed to speak:', e);
  }
};

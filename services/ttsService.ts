/**
 * Uses the browser's SpeechSynthesis API to speak a given text.
 * @param text The text to be spoken.
 */
export const speak = (text: string): void => {
  if ('speechSynthesis' in window) {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'en-US';
    utterance.rate = 1.0;
    
    // Cancel any ongoing speech to prevent overlap
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utterance);
  } else {
    console.warn('Text-to-speech is not supported in this browser.');
    // You could provide a fallback here, like an alert.
    alert(`Voice guidance not supported. Your directions:\n${text}`);
  }
};

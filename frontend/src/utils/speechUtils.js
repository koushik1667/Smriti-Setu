/**
 * Multilingual Speech Synthesis (Text-to-Speech) Utility
 * Reads dosage routines and clinical flashcards aloud in English, Hindi (hi-IN), or Telugu (te-IN).
 */

export function speakText(text, lang = 'en', onEndCallback = null) {
  if (!('speechSynthesis' in window)) {
    console.warn('Speech synthesis not supported in this browser.');
    return;
  }

  // Cancel any ongoing speech
  window.speechSynthesis.cancel();

  if (!text || typeof text !== 'string') return;

  const utterance = new SpeechSynthesisUtterance(text);
  
  // Set language code
  const langCodeMap = {
    en: 'en-US',
    hi: 'hi-IN',
    te: 'te-IN'
  };

  utterance.lang = langCodeMap[lang] || 'en-US';
  utterance.rate = 0.95; // Slightly slower for clear medical instructions
  utterance.pitch = 1.0;

  // Try to find a matching native voice
  const voices = window.speechSynthesis.getVoices();
  const targetPrefix = langCodeMap[lang]?.substring(0, 2);
  const matchingVoice = voices.find(v => v.lang.startsWith(targetPrefix));
  if (matchingVoice) {
    utterance.voice = matchingVoice;
  }

  if (onEndCallback) {
    utterance.onend = onEndCallback;
    utterance.onerror = onEndCallback;
  }

  window.speechSynthesis.speak(utterance);
}

export function stopSpeaking() {
  if ('speechSynthesis' in window) {
    window.speechSynthesis.cancel();
  }
}

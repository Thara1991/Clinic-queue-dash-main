/**
 * Text-to-Speech utility for queue announcements
 * Uses Web Speech API (works offline, no internet required)
 */

export interface SpeechOptions {
  language?: string;
  volume?: number;
  rate?: number;
  pitch?: number;
}

/**
 * Speak text using Web Speech API
 */
export function speakText(
  text: string,
  options: SpeechOptions = {}
): Promise<void> {
  return new Promise((resolve, reject) => {
    // Check if browser supports Speech Synthesis
    if (!('speechSynthesis' in window)) {
      console.warn('Speech synthesis not supported in this browser');
      reject(new Error('Speech synthesis not supported'));
      return;
    }

    // Cancel any ongoing speech
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    
    // Set options
    utterance.lang = options.language || 'th-TH'; // Thai language
    utterance.volume = options.volume ?? 1.0; // 0.0 to 1.0
    utterance.rate = options.rate ?? 1.0; // 0.1 to 10
    utterance.pitch = options.pitch ?? 1.0; // 0 to 2

    // Handle events
    utterance.onend = () => {
      resolve();
    };

    utterance.onerror = (error) => {
      console.error('Speech synthesis error:', error);
      reject(error);
    };

    // Speak
    window.speechSynthesis.speak(utterance);
  });
}

/**
 * Announce queue number in Thai
 * Format: "คิว [queueNumber] กรุณาไปที่ห้อง [roomNumber]"
 */
export async function announceQueue(
  queueNumber: string,
  roomNumber: string,
  repeatCount: number = 2,
  voiceLanguage: 'th' | 'en' = 'th'
): Promise<void> {
  const isThai = voiceLanguage === 'th';
  const text = isThai
    ? `คิว ${queueNumber} กรุณาไปที่ห้อง ${roomNumber}`
    : `Queue ${queueNumber}, please proceed to room ${roomNumber}`;
  const languageCode = isThai ? 'th-TH' : 'en-US';
  const rate = isThai ? 0.9 : 1.0;
  
  // Stop any ongoing speech before starting a new announcement sequence
  stopSpeech();

  const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

  for (let i = 0; i < repeatCount; i++) {
    await speakText(text, {
      language: languageCode,
      volume: 1.0,
      rate,
      pitch: 1.0
    }).catch((error) => {
      console.error('Error during speech:', error);
    });

    if (i < repeatCount - 1) {
      await delay(3000);
    }
  }
}

/**
 * Stop any ongoing speech
 */
export function stopSpeech(): void {
  if ('speechSynthesis' in window) {
    window.speechSynthesis.cancel();
  }
}


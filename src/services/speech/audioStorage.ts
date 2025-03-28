
// Audio storage functionality

// Store multiple audio recordings by message ID
const audioStore: Map<string, { blob: Blob, url: string }> = new Map();

/**
 * Stores audio data for a specific message
 */
export const storeAudioForMessage = (messageId: string, blob: Blob): string => {
  const url = URL.createObjectURL(blob);
  audioStore.set(messageId, { blob, url });
  
  // Log the storage for debugging
  console.log(`Audio stored for message ID ${messageId}`);
  console.log("Audio store size:", audioStore.size);
  
  return url;
};

/**
 * Gets the URL for a specific message's audio recording
 */
export const getMessageAudioUrl = (messageId: string): string | null => {
  console.log(`Getting audio URL for message ID: ${messageId}`);
  console.log("Available message IDs:", Array.from(audioStore.keys()));
  
  const audioData = audioStore.get(messageId);
  if (audioData) {
    console.log(`Found audio for message ID: ${messageId}`);
    return audioData.url;
  } else {
    console.log(`No audio found for message ID: ${messageId}`);
    return null;
  }
};

/**
 * Checks if a specific message has audio data
 */
export const hasMessageAudio = (messageId: string): boolean => {
  const hasAudio = audioStore.has(messageId);
  console.log(`Checking if message ${messageId} has audio: ${hasAudio}`);
  return hasAudio;
};

/**
 * Removes audio data for a specific message
 */
export const removeAudioForMessage = (messageId: string): boolean => {
  const audioData = audioStore.get(messageId);
  if (audioData) {
    URL.revokeObjectURL(audioData.url);
    return audioStore.delete(messageId);
  }
  return false;
};

/**
 * Clears all stored audio data
 */
export const clearAllAudioData = (): void => {
  audioStore.forEach(audio => {
    URL.revokeObjectURL(audio.url);
  });
  audioStore.clear();
};

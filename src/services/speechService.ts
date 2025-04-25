
/**
 * @deprecated This service is maintained only for backward compatibility.
 * Please use the useVoiceRecorder hook for new voice recording functionality.
 */

/**
 * Checks if a message has associated audio
 * @param messageId The message ID to check
 * @returns True if the message has audio, false otherwise
 */
export const hasMessageAudio = (messageId: string): boolean => {
  console.warn('Using deprecated hasMessageAudio - use useVoiceRecorder hook instead');
  return false; // Always return false since we're migrating away from this system
};

/**
 * Gets the URL for a message's audio
 * @param messageId The message ID to get audio for
 * @returns The audio URL, or null if not found
 */
export const getMessageAudioUrl = (messageId: string): string | null => {
  console.warn('Using deprecated getMessageAudioUrl - use useVoiceRecorder hook instead');
  return null; // Always return null since we're migrating away from this system
};


// Browser support detection for speech functionality

/**
 * Checks if the browser supports voice recording
 */
export const isVoiceRecordingSupported = (): boolean => {
  // Check if the browser supports the necessary APIs
  return !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia);
};

/**
 * Requests microphone permission
 */
export const requestMicrophonePermission = async (): Promise<boolean> => {
  try {
    // Request microphone access
    await navigator.mediaDevices.getUserMedia({ audio: true });
    return true;
  } catch (error) {
    console.error("Microphone permission denied:", error);
    return false;
  }
};

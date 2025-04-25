
/**
 * Audio recording functionality - Simplified for react-media-recorder integration
 * These are stub functions since we now use the react-media-recorder hook
 * This file maintains API compatibility with any code that might be using these functions
 */

// Simplified implementation to maintain backwards compatibility
export const isVoiceRecordingActive = (): boolean => {
  console.warn('Using deprecated isVoiceRecordingActive - use useVoiceRecorder hook instead');
  return false;
};

export const getAudioUrl = (): string | null => {
  console.warn('Using deprecated getAudioUrl - use useVoiceRecorder hook instead');
  return null;
};

export const hasAudioData = (): boolean => {
  console.warn('Using deprecated hasAudioData - use useVoiceRecorder hook instead');
  return false;
};

export const setupMediaRecorder = async (): Promise<boolean> => {
  console.warn('Using deprecated setupMediaRecorder - use useVoiceRecorder hook instead');
  return false;
};

export const startVoiceRecording = (): void => {
  console.warn('Using deprecated startVoiceRecording - use useVoiceRecorder hook instead');
};

export const stopRecording = async (): Promise<void> => {
  console.warn('Using deprecated stopRecording - use useVoiceRecorder hook instead');
};

export const processAudioData = async (): Promise<Blob | null> => {
  console.warn('Using deprecated processAudioData - use useVoiceRecorder hook instead');
  return null;
};

export const cleanupAudioResources = (): void => {
  console.warn('Using deprecated cleanupAudioResources - use useVoiceRecorder hook instead');
};

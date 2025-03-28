
/**
 * Core recorder state management
 */

// Shared state for the audio recorder
let isRecording = false;
let mediaRecorder: MediaRecorder | null = null;
let audioChunks: Blob[] = [];
let audioBlob: Blob | null = null;
let audioUrl: string | null = null;

/**
 * Checks if recording is currently active
 */
export const isVoiceRecordingActive = (): boolean => {
  return isRecording;
};

/**
 * Sets the recording state
 */
export const setRecordingState = (state: boolean): void => {
  isRecording = state;
};

/**
 * Gets the MediaRecorder instance
 */
export const getMediaRecorder = (): MediaRecorder | null => {
  return mediaRecorder;
};

/**
 * Sets the MediaRecorder instance
 */
export const setMediaRecorder = (recorder: MediaRecorder | null): void => {
  mediaRecorder = recorder;
};

/**
 * Adds an audio chunk to the collection
 */
export const addAudioChunk = (chunk: Blob): void => {
  audioChunks.push(chunk);
};

/**
 * Clears all audio chunks
 */
export const clearAudioChunks = (): void => {
  audioChunks = [];
};

/**
 * Gets all audio chunks
 */
export const getAudioChunks = (): Blob[] => {
  return audioChunks;
};

/**
 * Sets the audio blob
 */
export const setAudioBlob = (blob: Blob | null): void => {
  audioBlob = blob;
};

/**
 * Gets the audio blob
 */
export const getAudioBlob = (): Blob | null => {
  return audioBlob;
};

/**
 * Sets the audio URL
 */
export const setAudioUrl = (url: string | null): void => {
  audioUrl = url;
};

/**
 * Gets the URL for the audio recording for playback
 */
export const getAudioUrl = (): string | null => {
  return audioUrl;
};

/**
 * Checks if audio data is available for playback
 */
export const hasAudioData = (): boolean => {
  return audioBlob !== null && !!audioUrl;
};

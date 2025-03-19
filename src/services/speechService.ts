
// Mock speech-to-text service with direct LLM processing
// In a production app, this would use the Web Speech API or another service

import { generateLLMResponse } from './apiService';

// Track recording state
let isRecording = false;
let mediaRecorder: MediaRecorder | null = null;
let audioChunks: Blob[] = [];
let audioBlob: Blob | null = null;
let audioUrl: string | null = null;

/**
 * Starts voice recording session
 */
export const startVoiceRecording = (): void => {
  // Reset chunks array
  audioChunks = [];
  isRecording = true;
  
  // Clean up previous audio URL if it exists
  if (audioUrl) {
    URL.revokeObjectURL(audioUrl);
    audioUrl = null;
  }
};

/**
 * Stops voice recording and sends it directly to LLM for processing
 * In a real implementation, this would send the audio data to a speech-to-text service
 * and then pass the transcribed text to the LLM API
 */
export const stopVoiceRecording = async (): Promise<string> => {
  isRecording = false;
  
  if (audioChunks.length > 0) {
    audioBlob = new Blob(audioChunks, { type: 'audio/webm' });
    audioUrl = URL.createObjectURL(audioBlob);
  }
  
  return new Promise((resolve) => {
    // Mock processing delay (1.5 seconds)
    setTimeout(async () => {
      // Instead of returning a transcription, we'll simulate the voice 
      // being directly processed by the LLM
      
      // In a real implementation, we would:
      // 1. Send the audio to a speech-to-text service
      // 2. Take the transcribed text and send it to the LLM
      
      // For now, we'll just simulate an LLM response directly
      const mockModelId = "palm"; // Using one of our mock models
      const directResponse = await generateLLMResponse(
        mockModelId, 
        "Voice input processed directly"
      );
      
      resolve(directResponse);
    }, 1500);
  });
};

/**
 * Gets the URL for the audio recording for playback
 */
export const getAudioUrl = (): string | null => {
  return audioUrl;
};

/**
 * Checks if recording is currently active
 */
export const isVoiceRecordingActive = (): boolean => {
  return isRecording;
};

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

/**
 * Sets up the media recorder
 * In a real app, this would capture and store audio data
 */
export const setupMediaRecorder = async (): Promise<boolean> => {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    
    mediaRecorder = new MediaRecorder(stream);
    
    mediaRecorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        audioChunks.push(event.data);
      }
    };
    
    mediaRecorder.start();
    
    return true;
  } catch (error) {
    console.error("Error setting up media recorder:", error);
    return false;
  }
};

/**
 * Cleans up the audio recording resources
 */
export const cleanupAudioResources = (): void => {
  if (audioUrl) {
    URL.revokeObjectURL(audioUrl);
    audioUrl = null;
  }
  audioBlob = null;
  audioChunks = [];
};

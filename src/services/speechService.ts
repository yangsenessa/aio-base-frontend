
// Mock speech-to-text service with direct LLM processing
// In a production app, this would use the Web Speech API or another service

import { generateLLMResponse } from './apiService';

// Track recording state
let isRecording = false;
let mediaRecorder: MediaRecorder | null = null;
let audioChunks: Blob[] = [];
let audioBlob: Blob | null = null;
let audioUrl: string | null = null;

// Store multiple audio recordings by message ID
const audioStore: Map<string, { blob: Blob, url: string }> = new Map();

/**
 * Starts voice recording session
 */
export const startVoiceRecording = async (): Promise<boolean> => {
  try {
    // Reset chunks array
    audioChunks = [];
    isRecording = true;
    
    // Clean up previous audio URL if it exists
    if (audioUrl) {
      URL.revokeObjectURL(audioUrl);
      audioUrl = null;
    }
    
    return true;
  } catch (error) {
    console.error("Error starting voice recording:", error);
    return false;
  }
};

/**
 * Stops voice recording and sends it directly to LLM for processing
 * In a real implementation, this would send the audio data to a speech-to-text service
 * and then pass the transcribed text to the LLM API
 */
export const stopVoiceRecording = async (): Promise<{ response: string, messageId: string }> => {
  isRecording = false;
  
  if (mediaRecorder && mediaRecorder.state !== 'inactive') {
    return new Promise((resolve) => {
      mediaRecorder!.onstop = async () => {
        const result = await processAudioData();
        resolve(result);
      };
      mediaRecorder!.stop();
    });
  } else if (audioChunks.length > 0) {
    return processAudioData();
  }
  
  return Promise.reject("No audio recording found");
};

/**
 * Process the audio data and create URL for playback
 */
const processAudioData = async (): Promise<{ response: string, messageId: string }> => {
  if (audioChunks.length > 0) {
    audioBlob = new Blob(audioChunks, { type: 'audio/webm' });
    audioUrl = URL.createObjectURL(audioBlob);
    
    // Log for debugging
    console.log("Audio blob created:", audioBlob);
    console.log("Audio URL created:", audioUrl);
  }
  
  // Mock processing delay (1.5 seconds)
  return new Promise((resolveInner) => {
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
      
      // Generate a message ID for this recording
      const messageId = Date.now().toString();
      
      // Store the audio blob and URL in our store
      if (audioBlob && audioUrl) {
        audioStore.set(messageId, {
          blob: audioBlob,
          url: audioUrl
        });
        
        // Log the storage for debugging
        console.log(`Audio stored for message ID ${messageId}`);
        console.log("Audio store size:", audioStore.size);
      }
      
      resolveInner({
        response: directResponse,
        messageId: messageId
      });
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
        console.log("Audio chunk received:", event.data.size);
      }
    };
    
    mediaRecorder.start();
    console.log("Media recorder started");
    
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
  
  if (mediaRecorder && mediaRecorder.state !== 'inactive') {
    mediaRecorder.stop();
  }
  
  // Stop all audio tracks
  if (mediaRecorder && mediaRecorder.stream) {
    mediaRecorder.stream.getTracks().forEach(track => track.stop());
  }
};

/**
 * Checks if audio data is available for playback
 */
export const hasAudioData = (): boolean => {
  return audioBlob !== null && !!audioUrl;
};

/**
 * Checks if a specific message has audio data
 */
export const hasMessageAudio = (messageId: string): boolean => {
  const hasAudio = audioStore.has(messageId);
  console.log(`Checking if message ${messageId} has audio: ${hasAudio}`);
  return hasAudio;
};


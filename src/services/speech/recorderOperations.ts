
/**
 * Audio recorder operations (starting/stopping)
 */

import { 
  setRecordingState, 
  clearAudioChunks, 
  setAudioBlob, 
  setAudioUrl, 
  getMediaRecorder, 
  getAudioUrl 
} from './recorderState';
import { setupMediaRecorder } from './recorderSetup';

/**
 * Starts voice recording session
 */
export const startVoiceRecording = async (): Promise<boolean> => {
  try {
    // Reset chunks array
    clearAudioChunks();
    setRecordingState(true);
    
    // Clean up previous audio URL if it exists
    const currentAudioUrl = getAudioUrl();
    if (currentAudioUrl) {
      URL.revokeObjectURL(currentAudioUrl);
      setAudioUrl(null);
    }
    
    // Reset the audio blob
    setAudioBlob(null);
    
    // Setup media recorder immediately when starting
    const setupSuccess = await setupMediaRecorder();
    if (!setupSuccess) {
      console.error("[AUDIO-RECORDING] ❌ Failed to setup media recorder");
      return false;
    }
    
    console.log("[AUDIO-RECORDING] ✅ Voice recording started successfully");
    return true;
  } catch (error) {
    console.error("[AUDIO-RECORDING] ❌ Error starting voice recording:", error);
    return false;
  }
};

/**
 * Stops the ongoing recording
 */
export const stopRecording = async (): Promise<void> => {
  const isRecording = isVoiceRecordingActive();
  if (!isRecording) {
    console.log("[AUDIO-RECORDING] ℹ️ No active recording to stop");
    return;
  }
  
  setRecordingState(false);
  
  const mediaRecorder = getMediaRecorder();
  if (mediaRecorder && mediaRecorder.state !== 'inactive') {
    console.log("[AUDIO-RECORDING] 🛑 Stopping media recorder...");
    
    return new Promise<void>((resolve) => {
      if (!mediaRecorder) {
        console.warn("[AUDIO-RECORDING] ⚠️ No media recorder available");
        resolve();
        return;
      }
      
      // Add event handler for when recording stops
      mediaRecorder.onstop = () => {
        console.log("[AUDIO-RECORDING] ✅ Media recorder stopped successfully");
        console.log("[AUDIO-RECORDING] 📊 Total audio chunks collected:", getAudioChunks().length);
        resolve();
      };
      
      // Request one final chunk before stopping
      mediaRecorder.requestData();
      
      // Stop the recorder after a small delay to ensure we get the last chunk
      setTimeout(() => {
        if (mediaRecorder && mediaRecorder.state !== 'inactive') {
          mediaRecorder.stop();
          
          // Stop all tracks
          if (mediaRecorder.stream) {
            mediaRecorder.stream.getTracks().forEach(track => track.stop());
          }
        }
      }, 200);
    });
  } else {
    console.warn("[AUDIO-RECORDING] ⚠️ MediaRecorder not active or not available");
  }
};

// Import isVoiceRecordingActive function and getAudioChunks at the top of the file to avoid reference errors
import { isVoiceRecordingActive, getAudioChunks } from './recorderState';

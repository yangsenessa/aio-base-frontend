
/**
 * Audio recorder setup and initialization
 */

import { 
  setMediaRecorder, 
  addAudioChunk, 
  setRecordingState 
} from './recorderState';

/**
 * Sets up the media recorder
 * In a real app, this would capture and store audio data
 */
export const setupMediaRecorder = async (): Promise<boolean> => {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ 
      audio: {
        echoCancellation: true,
        noiseSuppression: true,
        autoGainControl: true
      } 
    });
    
    // Clean up existing media recorder if it exists
    const currentMediaRecorder = getMediaRecorder();
    if (currentMediaRecorder && currentMediaRecorder.state !== 'inactive') {
      currentMediaRecorder.stop();
      currentMediaRecorder.stream.getTracks().forEach(track => track.stop());
    }
    
    // Create media recorder with audio MIME type specification
    const recorder = new MediaRecorder(stream, {
      mimeType: MediaRecorder.isTypeSupported('audio/webm') 
        ? 'audio/webm' 
        : 'audio/mp4'
    });
    
    console.log(`[AUDIO-RECORDING] 🎙️ Created MediaRecorder with MIME type: ${recorder.mimeType}`);
    
    // Set up data available event handler
    recorder.ondataavailable = (event) => {
      if (event.data && event.data.size > 0) {
        addAudioChunk(event.data);
        console.log("[AUDIO-RECORDING] 📊 Audio chunk received:", event.data.size, "bytes, type:", event.data.type);
      } else {
        console.warn("[AUDIO-RECORDING] ⚠️ Empty audio data received");
      }
    };
    
    // Add error handler
    recorder.onerror = (event) => {
      console.error("[AUDIO-RECORDING] ❌ MediaRecorder error:", event);
    };
    
    // Store the recorder
    setMediaRecorder(recorder);
    
    // Start recording with 100ms time slices to ensure we get frequent data events
    recorder.start(100);
    console.log("[AUDIO-RECORDING] 🎙️ Media recorder started with 100ms time slices");
    
    return true;
  } catch (error) {
    console.error("[AUDIO-RECORDING] ❌ Error setting up media recorder:", error);
    return false;
  }
};

// Import getMediaRecorder function at the top of the file to avoid reference errors
import { getMediaRecorder } from './recorderState';

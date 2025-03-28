
/**
 * Cleanup functionality for audio recording resources
 */

import { 
  getMediaRecorder, 
  getAudioUrl,
  setAudioBlob, 
  clearAudioChunks, 
  setMediaRecorder,
  setAudioUrl,
  setRecordingState
} from './recorderState';

/**
 * Cleans up the audio recording resources
 */
export const cleanupAudioResources = (): void => {
  const audioUrl = getAudioUrl();
  if (audioUrl) {
    URL.revokeObjectURL(audioUrl);
    setAudioUrl(null);
  }
  
  setAudioBlob(null);
  clearAudioChunks();
  
  const mediaRecorder = getMediaRecorder();
  if (mediaRecorder && mediaRecorder.state !== 'inactive') {
    try {
      mediaRecorder.stop();
      
      // Stop all audio tracks
      if (mediaRecorder.stream) {
        mediaRecorder.stream.getTracks().forEach(track => track.stop());
      }
    } catch (error) {
      console.error("[AUDIO-RECORDING] ❌ Error cleaning up media recorder:", error);
    }
  }
  
  setMediaRecorder(null);
  setRecordingState(false);
};

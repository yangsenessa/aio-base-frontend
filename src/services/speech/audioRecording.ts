
// Audio recording functionality

let isRecording = false;
let mediaRecorder: MediaRecorder | null = null;
let audioChunks: Blob[] = [];
let audioBlob: Blob | null = null;
let audioUrl: string | null = null;

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
 * Stops the ongoing recording
 */
export const stopRecording = async (): Promise<void> => {
  isRecording = false;
  
  if (mediaRecorder && mediaRecorder.state !== 'inactive') {
    mediaRecorder.stop();
  }
};

/**
 * Checks if recording is currently active
 */
export const isVoiceRecordingActive = (): boolean => {
  return isRecording;
};

/**
 * Process the audio data and create URL for playback
 */
export const processAudioData = async (): Promise<Blob | null> => {
  if (audioChunks.length > 0) {
    audioBlob = new Blob(audioChunks, { type: 'audio/webm' });
    audioUrl = URL.createObjectURL(audioBlob);
    
    // Log for debugging
    console.log("Audio blob created:", audioBlob);
    console.log("Audio URL created:", audioUrl);
    
    return audioBlob;
  }
  
  return null;
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

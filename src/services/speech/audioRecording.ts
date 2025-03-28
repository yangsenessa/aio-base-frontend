
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
 * Sets up the media recorder
 * In a real app, this would capture and store audio data
 */
export const setupMediaRecorder = async (): Promise<boolean> => {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    
    // Clean up existing media recorder if it exists
    if (mediaRecorder && mediaRecorder.state !== 'inactive') {
      mediaRecorder.stop();
      mediaRecorder.stream.getTracks().forEach(track => track.stop());
    }
    
    mediaRecorder = new MediaRecorder(stream);
    
    // Set up data available event handler
    mediaRecorder.ondataavailable = (event) => {
      if (event.data && event.data.size > 0) {
        audioChunks.push(event.data);
        console.log("[AUDIO-RECORDING] 📊 Audio chunk received:", event.data.size, "bytes");
      } else {
        console.warn("[AUDIO-RECORDING] ⚠️ Empty audio data received");
      }
    };
    
    // Add error handler
    mediaRecorder.onerror = (event) => {
      console.error("[AUDIO-RECORDING] ❌ MediaRecorder error:", event);
    };
    
    // Start recording with 100ms time slices to ensure we get frequent data events
    mediaRecorder.start(100);
    console.log("[AUDIO-RECORDING] 🎙️ Media recorder started with 100ms time slices");
    
    return true;
  } catch (error) {
    console.error("[AUDIO-RECORDING] ❌ Error setting up media recorder:", error);
    return false;
  }
};

/**
 * Stops the ongoing recording
 */
export const stopRecording = async (): Promise<void> => {
  if (!isRecording) {
    console.log("[AUDIO-RECORDING] ℹ️ No active recording to stop");
    return;
  }
  
  isRecording = false;
  
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
        console.log("[AUDIO-RECORDING] 📊 Total audio chunks collected:", audioChunks.length);
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

/**
 * Checks if recording is currently active
 */
export const isVoiceRecordingActive = (): boolean => {
  return isRecording;
};

/**
 * Process the audio data and create URL for playback with enhanced logging
 */
export const processAudioData = async (): Promise<Blob | null> => {
  try {
    console.log(`[AUDIO-RECORDING] 📊 Processing audio data with ${audioChunks.length} chunks`);
    
    if (audioChunks.length > 0) {
      // Generate a unique identifier for this audio recording
      const recordingId = Date.now().toString();
      console.log(`[AUDIO-RECORDING] 🆔 Recording ID: ${recordingId}`);
      
      // Log details about audio chunks
      console.log(`[AUDIO-RECORDING] 📊 Total audio chunks: ${audioChunks.length}`);
      const totalChunkSize = audioChunks.reduce((total, chunk) => total + chunk.size, 0);
      console.log(`[AUDIO-RECORDING] 💾 Total chunk size: ${(totalChunkSize / 1024).toFixed(2)} KB`);
      
      // List all chunk sizes for debugging
      audioChunks.forEach((chunk, index) => {
        console.log(`[AUDIO-RECORDING] 📦 Chunk ${index + 1}: ${chunk.size} bytes, type: ${chunk.type}`);
      });
      
      // Create blob with logging
      audioBlob = new Blob(audioChunks, { type: 'audio/webm' });
      console.log(`[AUDIO-RECORDING] 🎧 Created audio blob`);
      console.log(`[AUDIO-RECORDING] 📏 Blob size: ${(audioBlob.size / 1024).toFixed(2)} KB`);
      console.log(`[AUDIO-RECORDING] 🔍 Blob type: ${audioBlob.type}`);
      
      // Create object URL with logging
      audioUrl = URL.createObjectURL(audioBlob);
      console.log(`[AUDIO-RECORDING] 🔗 Created audio URL: ${audioUrl}`);
      
      // Optional: Log blob contents (be cautious with large files)
      try {
        const arrayBuffer = await audioBlob.arrayBuffer();
        console.log(`[AUDIO-RECORDING] 📝 Blob array buffer length: ${arrayBuffer.byteLength} bytes`);
      } catch (bufferError) {
        console.warn(`[AUDIO-RECORDING] ⚠️ Could not log blob buffer:`, bufferError);
      }
      
      return audioBlob;
    }
    
    console.warn('[AUDIO-RECORDING] ⚠️ No audio chunks available');
    return null;
  } catch (error) {
    console.error('[AUDIO-RECORDING] ❌ Error processing audio data:', error);
    throw error;
  }
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
  
  mediaRecorder = null;
  isRecording = false;
};

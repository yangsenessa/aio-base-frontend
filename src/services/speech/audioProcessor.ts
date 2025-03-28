
/**
 * Audio data processing functionality
 */

import { 
  getAudioChunks, 
  setAudioBlob, 
  setAudioUrl, 
  getAudioBlob 
} from './recorderState';

/**
 * Process the audio data and create URL for playback with enhanced logging
 */
export const processAudioData = async (): Promise<Blob | null> => {
  try {
    const audioChunks = getAudioChunks();
    console.log(`[AUDIO-RECORDING] 📊 Processing audio data with ${audioChunks.length} chunks`);
    
    if (audioChunks.length === 0) {
      console.warn('[AUDIO-RECORDING] ⚠️ No audio chunks available');
      return null;
    }
    
    // Generate a unique identifier for this audio recording
    const recordingId = Date.now().toString();
    console.log(`[AUDIO-RECORDING] 🆔 Recording ID: ${recordingId}`);
    
    // Log details about audio chunks
    console.log(`[AUDIO-RECORDING] 📊 Total audio chunks: ${audioChunks.length}`);
    const totalChunkSize = audioChunks.reduce((total, chunk) => total + chunk.size, 0);
    console.log(`[AUDIO-RECORDING] 💾 Total chunk size: ${(totalChunkSize / 1024).toFixed(2)} KB`);
    
    // List chunk details for debugging
    audioChunks.forEach((chunk, index) => {
      console.log(`[AUDIO-RECORDING] 📦 Chunk ${index + 1}: ${chunk.size} bytes, type: ${chunk.type}`);
    });
    
    // Determine the correct MIME type for the blob
    const firstChunkType = audioChunks[0].type;
    const blobType = firstChunkType || 'audio/webm';
    console.log(`[AUDIO-RECORDING] 🔍 Using blob type: ${blobType}`);
    
    // Create blob with logging
    const audioBlob = new Blob(audioChunks, { type: blobType });
    setAudioBlob(audioBlob);
    
    console.log(`[AUDIO-RECORDING] 🎧 Created audio blob`);
    console.log(`[AUDIO-RECORDING] 📏 Blob size: ${(audioBlob.size / 1024).toFixed(2)} KB`);
    console.log(`[AUDIO-RECORDING] 🔍 Blob type: ${audioBlob.type}`);
    
    if (audioBlob.size === 0) {
      console.error('[AUDIO-RECORDING] ❌ Created audio blob is empty (0 bytes)');
      return null;
    }
    
    // Create object URL with logging
    const audioUrl = URL.createObjectURL(audioBlob);
    setAudioUrl(audioUrl);
    console.log(`[AUDIO-RECORDING] 🔗 Created audio URL: ${audioUrl}`);
    
    // Optional: Log blob contents (be cautious with large files)
    try {
      const arrayBuffer = await audioBlob.arrayBuffer();
      console.log(`[AUDIO-RECORDING] 📝 Blob array buffer length: ${arrayBuffer.byteLength} bytes`);
    } catch (bufferError) {
      console.warn(`[AUDIO-RECORDING] ⚠️ Could not log blob buffer:`, bufferError);
    }
    
    return audioBlob;
  } catch (error) {
    console.error('[AUDIO-RECORDING] ❌ Error processing audio data:', error);
    throw error;
  }
};

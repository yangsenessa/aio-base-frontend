
/**
 * Audio format conversion utilities for EMC Network compatibility
 */

/**
 * Convert audio blob to the required format (MP3 or WAV) for EMC Network
 * @param audioBlob Original audio blob
 * @returns Promise resolving to converted audio blob
 */
export async function convertToCompatibleFormat(audioBlob: Blob): Promise<Blob> {
  console.log(`[AUDIO-CONVERTER] 🔍 Checking original audio format: ${audioBlob.type}`);
  
  // If already in WAV or MP3 format, return as is
  if (audioBlob.type === 'audio/wav' || audioBlob.type === 'audio/mpeg') {
    console.log(`[AUDIO-CONVERTER] ✅ Audio already in compatible format: ${audioBlob.type}`);
    return audioBlob;
  }
  
  console.log(`[AUDIO-CONVERTER] 🔄 Converting from ${audioBlob.type} to WAV format`);
  
  try {
    // Create audio context
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    
    // Convert blob to array buffer
    const arrayBuffer = await audioBlob.arrayBuffer();
    console.log(`[AUDIO-CONVERTER] 📊 Array buffer size: ${(arrayBuffer.byteLength / 1024).toFixed(2)} KB`);
    
    if (arrayBuffer.byteLength === 0) {
      console.error(`[AUDIO-CONVERTER] ❌ Empty array buffer`);
      throw new Error("Audio buffer is empty");
    }
    
    // Decode audio data
    const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
    console.log(`[AUDIO-CONVERTER] 📊 Decoded audio buffer: ${audioBuffer.length} samples, ${audioBuffer.numberOfChannels} channels, ${audioBuffer.sampleRate}Hz`);
    
    // Convert to WAV format
    const wavBlob = await audioBufferToWav(audioBuffer);
    
    console.log(`[AUDIO-CONVERTER] ✅ Conversion successful`);
    console.log(`[AUDIO-CONVERTER] 📊 Original size: ${(audioBlob.size / 1024).toFixed(2)} KB, Converted size: ${(wavBlob.size / 1024).toFixed(2)} KB`);
    
    return wavBlob;
  } catch (error) {
    console.error(`[AUDIO-CONVERTER] ❌ Conversion failed:`, error);
    
    // Fallback: If conversion fails but the original format is WebM with audio
    if (audioBlob.type.includes('audio') || audioBlob.type.includes('webm')) {
      console.log(`[AUDIO-CONVERTER] ⚠️ Using original format as fallback`);
      // Ensure it has an audio MIME type
      return new Blob([await audioBlob.arrayBuffer()], { type: 'audio/webm' });
    }
    
    throw new Error(`Failed to convert audio format: ${error instanceof Error ? error.message : String(error)}`);
  }
}

/**
 * Convert AudioBuffer to WAV format blob
 * @param audioBuffer AudioBuffer to convert
 * @returns WAV format blob
 */
function audioBufferToWav(audioBuffer: AudioBuffer): Promise<Blob> {
  return new Promise((resolve) => {
    const numberOfChannels = audioBuffer.numberOfChannels;
    const sampleRate = audioBuffer.sampleRate;
    const format = 1; // PCM format
    const bitDepth = 16; // 16-bit
    
    // Get channel data
    const channelData = [];
    for (let channel = 0; channel < numberOfChannels; channel++) {
      channelData.push(audioBuffer.getChannelData(channel));
    }
    
    // Calculate sizes for WAV header
    const dataLength = channelData[0].length * numberOfChannels * (bitDepth / 8);
    const buffer = new ArrayBuffer(44 + dataLength);
    const view = new DataView(buffer);
    
    // Write WAV header
    // "RIFF" chunk descriptor
    writeString(view, 0, 'RIFF');
    view.setUint32(4, 36 + dataLength, true);
    writeString(view, 8, 'WAVE');
    
    // "fmt " sub-chunk
    writeString(view, 12, 'fmt ');
    view.setUint32(16, 16, true); // fmt chunk size
    view.setUint16(20, format, true); // format code
    view.setUint16(22, numberOfChannels, true); // channels
    view.setUint32(24, sampleRate, true); // sample rate
    view.setUint32(28, sampleRate * numberOfChannels * (bitDepth / 8), true); // byte rate
    view.setUint16(32, numberOfChannels * (bitDepth / 8), true); // block align
    view.setUint16(34, bitDepth, true); // bits per sample
    
    // "data" sub-chunk
    writeString(view, 36, 'data');
    view.setUint32(40, dataLength, true); // data size
    
    // Write audio data
    const offset = 44;
    const volume = 1;
    let position = offset;
    
    for (let i = 0; i < channelData[0].length; i++) {
      for (let channel = 0; channel < numberOfChannels; channel++) {
        const sample = channelData[channel][i] * volume;
        
        // Clamp value between -1 and 1
        const clampedSample = sample < -1 ? -1 : sample > 1 ? 1 : sample;
        
        // Convert to int16
        const int16 = clampedSample < 0 
          ? clampedSample * 0x8000 
          : clampedSample * 0x7FFF;
        
        view.setInt16(position, int16, true);
        position += 2;
      }
    }
    
    // Create WAV blob
    const wavBlob = new Blob([buffer], { type: 'audio/wav' });
    resolve(wavBlob);
  });
}

/**
 * Helper function to write string to DataView
 */
function writeString(view: DataView, offset: number, string: string): void {
  for (let i = 0; i < string.length; i++) {
    view.setUint8(offset + i, string.charCodeAt(i));
  }
}

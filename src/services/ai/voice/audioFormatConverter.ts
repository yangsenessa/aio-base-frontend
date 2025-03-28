
/**
 * Audio format conversion utilities
 * This file handles the main conversion logic for making audio compatible
 * with various services.
 */

import { wavToMp3 } from './converters/mp3Converter';
import { audioBufferToWav } from './converters/wavConverter';
import { isAlreadyMp3, findSupportedMp3MimeType } from './converters/mimeTypeUtils';

/**
 * Converts any audio blob to a format compatible with AI services
 * @param audioBlob Audio blob in any format
 * @returns Blob in a compatible format (MP3)
 */
export async function convertToCompatibleFormat(audioBlob: Blob): Promise<Blob> {
  try {
    console.log(`[AUDIO-CONVERTER] 🔄 Starting format conversion`);
    console.log(`[AUDIO-CONVERTER] 📊 Input blob type: ${audioBlob.type}, size: ${(audioBlob.size / 1024).toFixed(2)} KB`);
    
    // If already in MP3 format, return as is
    if (isAlreadyMp3(audioBlob)) {
      console.log(`[AUDIO-CONVERTER] ✅ Audio already in MP3 format, no conversion needed`);
      return audioBlob;
    }
    
    // For web audio API, we first convert to WAV, then to MP3
    if (audioBlob.type.includes('audio/wav') || audioBlob.type.includes('audio/wave')) {
      console.log(`[AUDIO-CONVERTER] 🔄 Converting WAV directly to MP3`);
      const mp3Blob = await wavToMp3(audioBlob);
      console.log(`[AUDIO-CONVERTER] ✅ WAV to MP3 conversion complete`);
      return mp3Blob;
    }
    
    // For other formats, we need to go through the Audio API
    console.log(`[AUDIO-CONVERTER] 🔄 Converting ${audioBlob.type} to MP3 via WAV`);
    
    // Create an audio element to decode the audio
    const audioElement = new Audio();
    audioElement.src = URL.createObjectURL(audioBlob);
    
    await new Promise((resolve) => {
      audioElement.onloadedmetadata = () => {
        console.log(`[AUDIO-CONVERTER] ℹ️ Audio metadata loaded, duration: ${audioElement.duration.toFixed(2)}s`);
        resolve(true);
      };
      
      // Handle loading errors
      audioElement.onerror = (e) => {
        console.warn(`[AUDIO-CONVERTER] ⚠️ Error loading audio:`, e);
        // Resolve anyway to continue the process
        resolve(false);
      };
      
      // Set a timeout in case metadata doesn't load
      setTimeout(() => {
        console.warn(`[AUDIO-CONVERTER] ⚠️ Metadata loading timeout`);
        resolve(false);
      }, 3000);
    });
    
    // Create an audio context
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    
    // Decode the audio data
    console.log(`[AUDIO-CONVERTER] 🔄 Decoding audio data`);
    
    const arrayBuffer = await audioBlob.arrayBuffer();
    let audioBuffer;
    
    try {
      audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
      console.log(`[AUDIO-CONVERTER] ✅ Audio data decoded successfully`);
      console.log(`[AUDIO-CONVERTER] ℹ️ Audio properties: duration=${audioBuffer.duration.toFixed(2)}s, channels=${audioBuffer.numberOfChannels}, sample rate=${audioBuffer.sampleRate}Hz`);
    } catch (decodeError) {
      console.error(`[AUDIO-CONVERTER] ❌ Failed to decode audio:`, decodeError);
      // If we can't decode, return the original blob
      URL.revokeObjectURL(audioElement.src);
      throw new Error(`Failed to decode audio: ${decodeError}`);
    }
    
    // Convert to WAV
    console.log(`[AUDIO-CONVERTER] 🔄 Converting decoded audio to WAV`);
    const wavBlob = await audioBufferToWav(audioBuffer);
    console.log(`[AUDIO-CONVERTER] ✅ Conversion to WAV complete, size: ${(wavBlob.size / 1024).toFixed(2)} KB`);
    
    // Convert WAV to MP3
    console.log(`[AUDIO-CONVERTER] 🔄 Converting WAV to MP3`);
    const mp3Blob = await wavToMp3(wavBlob);
    console.log(`[AUDIO-CONVERTER] ✅ Conversion to MP3 complete, size: ${(mp3Blob.size / 1024).toFixed(2)} KB`);
    
    // Clean up
    URL.revokeObjectURL(audioElement.src);
    
    return mp3Blob;
  } catch (error) {
    console.error(`[AUDIO-CONVERTER] ❌ Error in format conversion:`, error);
    throw error;
  }
}

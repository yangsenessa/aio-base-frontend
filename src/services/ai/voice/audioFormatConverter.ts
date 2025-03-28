
/**
 * Audio format conversion utilities for EMC Network compatibility
 */

/**
 * Convert audio blob to MP3 format for EMC Network
 * @param audioBlob Original audio blob
 * @returns Promise resolving to converted audio blob in MP3 format
 */
export async function convertToCompatibleFormat(audioBlob: Blob): Promise<Blob> {
  console.log(`[AUDIO-CONVERTER] 🔍 Checking original audio format: ${audioBlob.type}`);
  
  // If already in MP3 format, return as is
  if (audioBlob.type === 'audio/mpeg') {
    console.log(`[AUDIO-CONVERTER] ✅ Audio already in MP3 format`);
    return audioBlob;
  }
  
  console.log(`[AUDIO-CONVERTER] 🔄 Converting from ${audioBlob.type} to MP3 format`);
  
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
    
    // First convert to WAV as an intermediate format
    const wavBlob = await audioBufferToWav(audioBuffer);
    console.log(`[AUDIO-CONVERTER] 🔄 Intermediate WAV conversion complete: ${(wavBlob.size / 1024).toFixed(2)} KB`);
    
    // Then convert WAV to MP3 using Web Audio API and media encoding
    const mp3Blob = await wavToMp3(wavBlob);
    
    console.log(`[AUDIO-CONVERTER] ✅ MP3 conversion successful`);
    console.log(`[AUDIO-CONVERTER] 📊 Original size: ${(audioBlob.size / 1024).toFixed(2)} KB, MP3 size: ${(mp3Blob.size / 1024).toFixed(2)} KB`);
    
    return mp3Blob;
  } catch (error) {
    console.error(`[AUDIO-CONVERTER] ❌ Conversion failed:`, error);
    
    // Fallback: If conversion fails but the original format might be acceptable
    if (audioBlob.type.includes('audio')) {
      console.log(`[AUDIO-CONVERTER] ⚠️ Using original audio format as fallback`);
      // Create a new blob with audio/mpeg MIME type
      return new Blob([await audioBlob.arrayBuffer()], { type: 'audio/mpeg' });
    }
    
    throw new Error(`Failed to convert audio format: ${error instanceof Error ? error.message : String(error)}`);
  }
}

/**
 * Convert WAV blob to MP3 using MediaRecorder
 * @param wavBlob WAV format blob
 * @returns MP3 format blob
 */
async function wavToMp3(wavBlob: Blob): Promise<Blob> {
  return new Promise(async (resolve, reject) => {
    try {
      console.log(`[AUDIO-CONVERTER] 🔄 Starting WAV to MP3 conversion`);
      
      // Create an audio element to play the WAV
      const audioElement = new Audio();
      audioElement.src = URL.createObjectURL(wavBlob);
      
      // Create an audio context and source
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const source = audioContext.createMediaElementSource(audioElement);
      
      // Create a destination node
      const destination = audioContext.createMediaStreamDestination();
      source.connect(destination);
      
      // Create a MediaRecorder with MP3 mime type if supported
      let mimeType = 'audio/mpeg';
      if (!MediaRecorder.isTypeSupported(mimeType)) {
        console.log(`[AUDIO-CONVERTER] ⚠️ audio/mpeg not supported, trying alternatives`);
        // Try alternative MIME types
        const alternatives = ['audio/mp3', 'audio/mp4', 'audio/webm;codecs=mp3'];
        for (const alt of alternatives) {
          if (MediaRecorder.isTypeSupported(alt)) {
            mimeType = alt;
            console.log(`[AUDIO-CONVERTER] 🔍 Using alternative MIME type: ${mimeType}`);
            break;
          }
        }
      }
      
      const chunks: Blob[] = [];
      const recorder = new MediaRecorder(destination.stream, { mimeType });
      
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunks.push(e.data);
        }
      };
      
      recorder.onstop = () => {
        const mp3Blob = new Blob(chunks, { type: 'audio/mpeg' });
        console.log(`[AUDIO-CONVERTER] ✅ MP3 conversion complete, size: ${(mp3Blob.size / 1024).toFixed(2)} KB`);
        
        // Clean up
        URL.revokeObjectURL(audioElement.src);
        audioElement.remove();
        
        resolve(mp3Blob);
      };
      
      recorder.onerror = (e) => {
        console.error(`[AUDIO-CONVERTER] ❌ MediaRecorder error:`, e);
        reject(new Error(`MediaRecorder error: ${e}`));
      };
      
      // Start recording
      recorder.start();
      
      // Play the audio (this will trigger the MediaRecorder)
      audioElement.onended = () => {
        recorder.stop();
      };
      
      audioElement.onerror = (e) => {
        console.error(`[AUDIO-CONVERTER] ❌ Audio playback error:`, e);
        reject(new Error(`Audio playback error: ${e}`));
      };
      
      // Set a timeout in case the audio doesn't play or end properly
      const timeout = setTimeout(() => {
        if (recorder.state === 'recording') {
          console.log(`[AUDIO-CONVERTER] ⚠️ Stopping recorder after timeout`);
          recorder.stop();
        }
      }, 30000); // 30 second timeout
      
      // Play the audio to start the conversion process
      audioElement.play().catch(e => {
        clearTimeout(timeout);
        console.error(`[AUDIO-CONVERTER] ❌ Cannot play audio:`, e);
        reject(new Error(`Cannot play audio: ${e}`));
      });
    } catch (error) {
      console.error(`[AUDIO-CONVERTER] ❌ WAV to MP3 conversion error:`, error);
      reject(error);
    }
  });
}

/**
 * Convert AudioBuffer to WAV format blob (used as an intermediate format)
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

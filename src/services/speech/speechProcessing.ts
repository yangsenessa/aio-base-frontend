
// Speech processing functionality
import { generateLLMResponse } from '../apiService';
import { processAudioData } from './audioRecording';
import { storeAudioForMessage } from './audioStorage';
import { stopRecording } from './audioRecording';

/**
 * Stops voice recording and processes the audio data
 */
export const stopVoiceRecording = async (): Promise<{ response: string, messageId: string }> => {
  try {
    console.log("[SPEECH-PROCESSING] 🛑 Stopping recording...");
    await stopRecording();
    console.log("[SPEECH-PROCESSING] ✅ Recording stopped");
    
    console.log("[SPEECH-PROCESSING] 🔄 Processing audio data...");
    const audioBlob = await processAudioData();
    
    if (!audioBlob) {
      console.error("[SPEECH-PROCESSING] ❌ No audio recording found");
      throw new Error("No audio recording found");
    }
    
    if (audioBlob.size === 0) {
      console.error("[SPEECH-PROCESSING] ❌ Audio recording is empty (0 bytes)");
      throw new Error("Audio recording is empty");
    }
    
    console.log("[SPEECH-PROCESSING] ✅ Audio data processed, size:", audioBlob.size, "type:", audioBlob.type);
    
    // Generate a message ID for this recording
    const messageId = Date.now().toString();
    console.log("[SPEECH-PROCESSING] 🆔 Generated message ID:", messageId);
    
    // Store the audio blob for later use
    storeAudioForMessage(messageId, audioBlob);
    console.log("[SPEECH-PROCESSING] 💾 Audio stored for message ID:", messageId);
    
    // Mock processing delay (1.5 seconds)
    console.log("[SPEECH-PROCESSING] ⏱️ Processing voice with delay...");
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
        
        console.log("[SPEECH-PROCESSING] ✅ Generated response for voice message");
        
        resolveInner({
          response: directResponse,
          messageId: messageId
        });
      }, 1500);
    });
  } catch (error) {
    console.error("[SPEECH-PROCESSING] ❌ Error in stopVoiceRecording:", error);
    throw error;
  }
};

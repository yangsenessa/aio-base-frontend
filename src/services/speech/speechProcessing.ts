
// Speech processing functionality
import { generateLLMResponse } from '../apiService';
import { processAudioData } from './audioRecording';
import { storeAudioForMessage } from './audioStorage';
import { stopRecording } from './audioRecording';

/**
 * Stops voice recording and processes the audio data
 */
export const stopVoiceRecording = async (): Promise<{ response: string, messageId: string }> => {
  await stopRecording();
  
  const audioBlob = await processAudioData();
  
  if (!audioBlob) {
    return Promise.reject("No audio recording found");
  }
  
  // Mock processing delay (1.5 seconds)
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
      
      // Generate a message ID for this recording
      const messageId = Date.now().toString();
      
      // Store the audio blob and URL in our store
      if (audioBlob) {
        storeAudioForMessage(messageId, audioBlob);
      }
      
      resolveInner({
        response: directResponse,
        messageId: messageId
      });
    }, 1500);
  });
};

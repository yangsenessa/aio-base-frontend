
/**
 * Mock implementation for voice processing when real API is not available
 */

/**
 * Process voice data with mock implementation
 */
export async function processMockVoiceData(): Promise<{ response: string, messageId: string, transcript: string }> {
  console.log("[VOICE-AI] 🔍 Using mock implementation for voice processing");
  
  // Simulate processing time
  console.log("[VOICE-AI] ⏱️ Simulating processing delay (1500ms)");
  await new Promise(resolve => setTimeout(resolve, 1500));
  
  // Generate a random message ID
  const messageId = Date.now().toString();
  console.log(`[VOICE-AI] 🆔 Generated mock message ID: ${messageId}`);
  
  // Generate mock transcript and response
  const mockTranscript = "This is a simulated transcription of voice input.";
  const response = "I've processed your voice message. This is a simulated response since we're using the mock API. In a production environment, your voice would be transcribed by EMC Network.";
  
  console.log(`[VOICE-AI] 📝 Mock transcript: "${mockTranscript}"`);
  console.log(`[VOICE-AI] 🤖 Mock response generated`);
  
  return { 
    response, 
    messageId,
    transcript: mockTranscript 
  };
}

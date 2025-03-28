
/**
 * EMC Network implementation for voice processing
 */

import { toast } from "@/components/ui/use-toast";
import { EMC_ENDPOINTS, EMC_API_KEY, REQUEST_TIMEOUT } from "./emcEndpoints";
import { fetchWithTimeout } from "./networkUtils";
import { detectLanguage } from "./languageDetection";
import { convertToCompatibleFormat } from "./audioFormatConverter";

/**
 * Process voice data through EMC Network
 */
export async function processEMCVoiceData(audioData: Blob): Promise<{ response: string, messageId: string, transcript: string }> {
  try {
    console.log(`[VOICE-AI] 🔄 Starting voice data transformation`);
    
    // Log original blob details
    console.log(`[VOICE-AI] 📊 Original audio blob details:`);
    console.log(`  - Size: ${(audioData.size / 1024).toFixed(2)} KB`);
    console.log(`  - Type: ${audioData.type}`);
    
    // Validate the audio data
    if (audioData.size === 0) {
      console.error(`[VOICE-AI] ❌ Audio data is empty (0 bytes)`);
      throw new Error("Audio data is empty");
    }
    
    // Make a copy of the blob to avoid potential issues
    const audioBlobCopy = new Blob([await audioData.arrayBuffer()], { type: audioData.type });
    console.log(`[VOICE-AI] 🔄 Created audio blob copy: ${(audioBlobCopy.size / 1024).toFixed(2)} KB`);
    
    // Convert audio to compatible format (MP3 or WAV) for EMC Network
    const compatibleAudio = await convertToCompatibleFormat(audioBlobCopy);
    console.log(`[VOICE-AI] 🔄 Audio format prepared: ${compatibleAudio.type}, size: ${(compatibleAudio.size / 1024).toFixed(2)} KB`);
    
    // Validate converted audio
    if (compatibleAudio.size === 0) {
      console.error(`[VOICE-AI] ❌ Converted audio is empty`);
      throw new Error("Converted audio is empty");
    }
    
    // Create FormData with detailed logging
    const formData = new FormData();
    const fileExtension = compatibleAudio.type === 'audio/mpeg' ? 'mp3' : 'wav';
    const filename = `recording_${Date.now()}.${fileExtension}`;
    
    // Add the file to FormData with explicit filename
    formData.append('file', compatibleAudio, filename);
    formData.append('filename', filename); // Some APIs require this as a separate field
    
    console.log(`[VOICE-AI] 📦 FormData created:`);
    console.log(`  - Filename: ${filename}`);
    console.log(`  - Total form data size: ${(compatibleAudio.size / 1024).toFixed(2)} KB`);
    
    // Try each EMC endpoint for voice transcription
    let transcript = null;
    let lastError = null;
    
    console.log(`[VOICE-AI] 🔄 Will try ${EMC_ENDPOINTS.length} endpoints for transcription`);
    
    for (let i = 0; i < EMC_ENDPOINTS.length; i++) {
      const endpoint = EMC_ENDPOINTS[i];
      try {
        console.log(`[VOICE-AI] 🔍 Trying EMC endpoint ${i + 1}/${EMC_ENDPOINTS.length}: ${endpoint}`);
        console.log(`[VOICE-AI] ⏱️ Setting timeout to ${REQUEST_TIMEOUT}ms`);
        
        // Log start time for performance measurement
        const startTime = performance.now();
        
        // Call EMC Network API with timeout
        const response = await fetchWithTimeout(
          endpoint,
          {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${EMC_API_KEY}`,
              // Explicitly don't set Content-Type, let the browser set it with the boundary
            },
            body: formData
          },
          REQUEST_TIMEOUT
        );
        
        // Calculate response time
        const responseTime = (performance.now() - startTime).toFixed(2);
        console.log(`[VOICE-AI] ⏱️ EMC endpoint ${i + 1} responded in ${responseTime}ms`);
        
        if (!response.ok) {
          const errorText = await response.text();
          console.error(`[VOICE-AI] ❌ EMC endpoint ${i + 1} failed with status ${response.status}:`, errorText);
          throw new Error(`EMC Network error: ${response.statusText} - ${errorText}`);
        }
        
        console.log(`[VOICE-AI] 📥 Received response from EMC endpoint ${i + 1}`);
        
        // Parse the response
        const data = await response.json();
        console.log(`[VOICE-AI] 🧩 Response structure:`, data);
        
        // Extract transcript from response - try different possible response formats
        transcript = data.text || data.transcript || data.result;
        
        // If no direct text field, check if it's nested in a 'response' object
        if (!transcript && data.response) {
          transcript = data.response.text || data.response.transcript || 
                      data.response.message || data.response.results ||
                      (Array.isArray(data.response.label_result) ? 
                        data.response.label_result.join(' ') : data.response.label_result);
        }
        
        if (!transcript) {
          console.error(`[VOICE-AI] ⚠️ Invalid response format from EMC Network:`, data);
          throw new Error("Invalid response format from EMC Network");
        }
        
        console.log(`[VOICE-AI] ✅ Voice transcription successful. Length: ${transcript.length} chars`);
        console.log(`[VOICE-AI] 📝 Transcript: "${transcript.substring(0, 100)}${transcript.length > 100 ? '...' : ''}"`);
        break; // Exit the loop if successful
      } catch (error) {
        console.warn(`[VOICE-AI] ⚠️ EMC endpoint ${i + 1} failed:`, error);
        lastError = error;
        // Continue to the next endpoint
      }
    }
    
    if (!transcript) {
      console.error(`[VOICE-AI] ❌ All EMC Network endpoints failed`);
      throw lastError || new Error("All EMC Network endpoints failed");
    }
    
    // Now get AI response based on the transcription
    console.log(`[VOICE-AI] 🤖 Generating AI response based on transcript`);
    // We'll use our existing AI services for the response generation
    const { generateRealAIResponse } = await import("../openAIService");
    const startResponseTime = performance.now();
    const response = await generateRealAIResponse(transcript);
    const aiResponseTime = (performance.now() - startResponseTime).toFixed(2);
    
    console.log(`[VOICE-AI] ⏱️ AI response generated in ${aiResponseTime}ms`);
    console.log(`[VOICE-AI] 📏 AI response length: ${response.length} chars`);
    
    const messageId = Date.now().toString();
    console.log(`[VOICE-AI] 🆔 Generated message ID: ${messageId}`);
    
    // When processing transcript, add more detailed logging
    if (transcript) {
      console.log(`[VOICE-AI] 📝 Transcript analysis:`);
      console.log(`  - Length: ${transcript.length} characters`);
      console.log(`  - Word count: ${transcript.trim().split(/\s+/).length}`);
      console.log(`  - Language detection: ${detectLanguage(transcript)}`);
    }
    
    return {
      response,
      messageId,
      transcript
    };
  } catch (error) {
    console.error("[VOICE-AI] ❌ Error in EMC voice processing:", error);
    throw error;
  }
}

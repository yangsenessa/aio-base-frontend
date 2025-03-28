import { toast } from "@/components/ui/use-toast";

// EMC Network endpoints for audio transcription
const EMC_ENDPOINTS = [
  "http://18.167.51.1:40005/edge/16Uiu2HAmQnkL58V215wZUDCLBTxeUQZeCXUwzPZKLAQKyvBQ7c3a/8003/extract_text",
  "http://18.167.51.1:40005/edge/16Uiu2HAmQnkL58V215wZUDCLBTxeUQZeCXUwzPZKLAQKyvBQ7c3a/8004/extract_text"
];

// API key for EMC Network
const EMC_API_KEY = "833_txLiSbJibu160317539183112192";

// Request timeout (ms)
const REQUEST_TIMEOUT = 15000;

/**
 * Process voice data and get a response
 */
export async function processVoiceData(audioData: Blob, useMockApi: boolean): Promise<{ response: string, messageId: string, transcript?: string }> {
  try {
    if (!useMockApi) {
      console.log(`[VOICE-AI] 🔄 Starting voice data transformation`);
      
      // Log original blob details
      console.log(`[VOICE-AI] 📊 Original audio blob details:`);
      console.log(`  - Size: ${(audioData.size / 1024).toFixed(2)} KB`);
      console.log(`  - Type: ${audioData.type}`);
      
      // Optional: Convert audio if needed (example conversion logging)
      let audioToSend = audioData;
      if (audioData.type !== 'audio/webm') {
        console.log(`[VOICE-AI] 🔀 Converting audio from ${audioData.type} to audio/webm`);
        // Hypothetical conversion logic would go here
        // In a real scenario, you might use Web Audio API or a library like lamejs
      }
      
      // Create FormData with detailed logging
      const formData = new FormData();
      formData.append('file', audioToSend, `recording_${Date.now()}.webm`);
      
      console.log(`[VOICE-AI] 📦 FormData created:`);
      console.log(`  - Filename: recording_${Date.now()}.webm`);
      console.log(`  - Total form data size: ${(formData.get('file') as Blob).size / 1024} KB`);
      
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
                'Authorization': `Bearer ${EMC_API_KEY}`
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
            throw new Error(`EMC Network error: ${response.statusText}`);
          }
          
          console.log(`[VOICE-AI] 📥 Received response from EMC endpoint ${i + 1}`);
          
          // Parse the response
          const data = await response.json();
          console.log(`[VOICE-AI] 🧩 Response structure:`, Object.keys(data));
          
          // Extract transcript from response
          transcript = data.text || data.transcript || data.result;
          
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
      const { generateRealAIResponse } = await import("./openAIService");
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
    }
    
    // Mock implementation
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
  } catch (error) {
    console.error("[VOICE-AI] ❌ Error processing voice data:", error);
    toast({
      title: "Voice processing failed",
      description: "Could not process voice message",
      variant: "destructive"
    });
    throw error;
  }
}

/**
 * Helper function to fetch with timeout
 */
async function fetchWithTimeout(url: string, options: RequestInit, timeout: number): Promise<Response> {
  const controller = new AbortController();
  const { signal } = controller;
  
  console.log(`[VOICE-AI] 🔄 Setting up fetch with URL: ${url}`);
  console.log(`[VOICE-AI] ⏱️ Timeout set to: ${timeout}ms`);
  
  const timeoutId = setTimeout(() => {
    console.log(`[VOICE-AI] ⏱️ Request timed out after ${timeout}ms`);
    controller.abort();
  }, timeout);
  
  try {
    console.log(`[VOICE-AI] 📡 Starting fetch request`);
    const startFetch = performance.now();
    
    const response = await fetch(url, { 
      ...options, 
      signal 
    });
    
    const fetchTime = (performance.now() - startFetch).toFixed(2);
    console.log(`[VOICE-AI] ⏱️ Fetch completed in ${fetchTime}ms with status: ${response.status}`);
    
    clearTimeout(timeoutId);
    return response;
  } catch (error) {
    clearTimeout(timeoutId);
    if (error instanceof Error) {
      console.error(`[VOICE-AI] ❌ Fetch error: ${error.name} - ${error.message}`);
      if (error.name === 'AbortError') {
        console.error(`[VOICE-AI] ❌ Request was aborted due to timeout (${timeout}ms)`);
      }
    } else {
      console.error(`[VOICE-AI] ❌ Unknown fetch error:`, error);
    }
    throw error;
  }
}

/**
 * Advanced language detection with support for multiple languages
 * Uses character frequency analysis and script detection
 */
function detectLanguage(text: string): string {
  if (!text || typeof text !== 'string' || text.trim() === '') {
    return 'Unknown (empty text)';
  }
  
  // Character ranges for different scripts
  const scriptRanges = {
    Arabic: /[\u0600-\u06FF]/,
    Bengali: /[\u0980-\u09FF]/,
    Chinese: /[\u4E00-\u9FFF\u3400-\u4DBF]/,
    Cyrillic: /[\u0400-\u04FF]/,
    Devanagari: /[\u0900-\u097F]/,  // Hindi, Sanskrit, etc.
    Greek: /[\u0370-\u03FF]/,
    Hangul: /[\uAC00-\uD7AF\u1100-\u11FF]/,  // Korean
    Hebrew: /[\u0590-\u05FF]/,
    Hiragana: /[\u3040-\u309F]/,
    Katakana: /[\u30A0-\u30FF]/,
    Latin: /[A-Za-z]/,
    Tamil: /[\u0B80-\u0BFF]/,
    Telugu: /[\u0C00-\u0C7F]/,
    Thai: /[\u0E00-\u0E7F]/
  };
  
  // Count characters in each script
  const scriptCounts: Record<string, number> = {};
  const sampleText = text.slice(0, 1000); // Analyze up to 1000 characters for efficiency
  
  for (const char of sampleText) {
    for (const [script, range] of Object.entries(scriptRanges)) {
      if (range.test(char)) {
        scriptCounts[script] = (scriptCounts[script] || 0) + 1;
      }
    }
  }
  
  // Find dominant script
  let dominantScript = 'Unknown';
  let maxCount = 0;
  
  for (const [script, count] of Object.entries(scriptCounts)) {
    if (count > maxCount) {
      maxCount = count;
      dominantScript = script;
    }
  }
  
  // Calculate script ratio (dominant script characters / total analyzed)
  const scriptRatio = maxCount / sampleText.length;
  console.log(`[VOICE-AI] 🔍 Language detection - Dominant script: ${dominantScript} (${(scriptRatio * 100).toFixed(2)}%)`);
  
  // Additional language-specific patterns for languages that share scripts
  if (dominantScript === 'Latin') {
    // Spanish characters
    if (/[áéíóúüñ¿¡]/i.test(text)) {
      const spanishMarkers = (text.match(/[áéíóúüñ¿¡]/gi) || []).length;
      // Common Spanish words
      const spanishWords = /\b(el|la|los|las|de|en|con|por|para|como|que|es|son|está|están)\b/gi;
      const spanishWordMatches = (text.match(spanishWords) || []).length;
      
      if (spanishMarkers > 5 || spanishWordMatches > 3) {
        console.log(`[VOICE-AI] 🔍 Detected Spanish markers: ${spanishMarkers}, Spanish words: ${spanishWordMatches}`);
        return 'Spanish';
      }
    }
    
    // French characters
    if (/[àâæçéèêëîïôœùûüÿ]/i.test(text)) {
      const frenchMarkers = (text.match(/[àâæçéèêëîïôœùûüÿ]/gi) || []).length;
      // Common French words
      const frenchWords = /\b(le|la|les|un|une|des|du|de|en|avec|pour|dans|sur|ce|cette|ces)\b/gi;
      const frenchWordMatches = (text.match(frenchWords) || []).length;
      
      if (frenchMarkers > 5 || frenchWordMatches > 3) {
        console.log(`[VOICE-AI] 🔍 Detected French markers: ${frenchMarkers}, French words: ${frenchWordMatches}`);
        return 'French';
      }
    }
    
    // German characters
    if (/[äöüß]/i.test(text)) {
      const germanMarkers = (text.match(/[äöüß]/gi) || []).length;
      // Common German words
      const germanWords = /\b(der|die|das|ein|eine|den|dem|zu|mit|für|auf|ist|sind)\b/gi;
      const germanWordMatches = (text.match(germanWords) || []).length;
      
      if (germanMarkers > 3 || germanWordMatches > 3) {
        console.log(`[VOICE-AI] 🔍 Detected German markers: ${germanMarkers}, German words: ${germanWordMatches}`);
        return 'German';
      }
    }
    
    // Italian
    if (/[àèéìíîòóùú]/i.test(text)) {
      // Common Italian words
      const italianWords = /\b(il|lo|la|i|gli|le|un|uno|una|di|del|della|in|con|per|è|sono)\b/gi;
      const italianWordMatches = (text.match(italianWords) || []).length;
      
      if (italianWordMatches > 3) {
        console.log(`[VOICE-AI] 🔍 Detected Italian words: ${italianWordMatches}`);
        return 'Italian';
      }
    }
    
    // Portuguese
    if (/[áâãàçéêíóôõú]/i.test(text)) {
      // Common Portuguese words
      const portugueseWords = /\b(o|a|os|as|um|uma|de|da|do|em|no|na|por|para|com|é|são)\b/gi;
      const portugueseWordMatches = (text.match(portugueseWords) || []).length;
      
      if (portugueseWordMatches > 3) {
        console.log(`[VOICE-AI] 🔍 Detected Portuguese words: ${portugueseWordMatches}`);
        return 'Portuguese';
      }
    }
    
    // Default to English for Latin script if no other language was detected
    return 'English';
  }
  
  // Map script to language
  const scriptToLanguage: Record<string, string> = {
    Arabic: 'Arabic',
    Bengali: 'Bengali',
    Chinese: 'Chinese',
    Cyrillic: 'Russian', // Could be other Slavic languages
    Devanagari: 'Hindi',
    Greek: 'Greek',
    Hangul: 'Korean',
    Hebrew: 'Hebrew',
    Hiragana: 'Japanese',
    Katakana: 'Japanese',
    Tamil: 'Tamil',
    Telugu: 'Telugu',
    Thai: 'Thai'
  };
  
  // Japanese often uses a mix of scripts
  if ((scriptCounts['Hiragana'] || 0) > 0 && (scriptCounts['Katakana'] || 0) > 0) {
    return 'Japanese';
  }
  
  // If we have a reliable script detection and a corresponding language
  if (scriptRatio > 0.1 && scriptToLanguage[dominantScript]) {
    return scriptToLanguage[dominantScript];
  }
  
  // Log detailed script analysis for debugging
  console.log(`[VOICE-AI] 🔍 Script counts:`, scriptCounts);
  console.log(`[VOICE-AI] 🔍 Script ratio: ${(scriptRatio * 100).toFixed(2)}%`);
  
  return dominantScript !== 'Unknown' 
    ? `${scriptToLanguage[dominantScript] || dominantScript} (detected)`
    : 'Unknown language';
}

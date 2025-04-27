
import { 
  cleanJsonString, 
  fixMalformedJson,
  safeJsonParse,
  hasModalStructure,
  getResponseFromModalJson,
  extractJsonFromMarkdownSections,
  fixBackslashEscapeIssues,
  aggressiveBackslashFix
} from './formatters';

export const getResponseContent = (content: string): string => {
  if (!content) return "No response content available.";
  
  console.log("[ResponseUtils] Processing response content");

  // Enhanced detection for create_video intent in any format to prevent infinite loops
  if (content.includes('"primary_goal"') && content.includes('"create_video"')) {
    console.log("[ResponseUtils] Detected create_video intent, preventing infinite loop");
    return "I understand you want to create a video. Please click the Execute button when you're ready to proceed with video creation.";
  }

  // Check if content is already what appears to be the final response (not a JSON object)
  if (!content.trim().startsWith('{') && !content.includes('```json') && !content.includes('**Response:**')) {
    // If it's just plain text and doesn't contain JSON markers, return as is
    return content;
  }

  // Always try direct parsing first without modifications
  try {
    if (content.trim().startsWith('{')) {
      const parsed = JSON.parse(content);
      if (parsed && parsed.response) {
        console.log("[ResponseUtils] Found response in direct JSON parse");
        return parsed.response;
      }
    }
  } catch (initialError) {
    // Continue with other methods if direct parsing fails
  }

  // Try direct markdown sections (most reliable format)
  if (content.includes("**Response:**")) {
    console.log("[ResponseUtils] Found **Response:** section");
    const parts = content.split("**Response:**");
    if (parts.length > 1) {
      return parts[1].trim();
    }
  }

  // Extract from structured data with markdown sections
  const structuredData = extractJsonFromMarkdownSections(content);
  if (structuredData?.response) {
    console.log("[ResponseUtils] Found response in structured markdown");
    return structuredData.response;
  }

  try {
    // Try JSON parsing with our enhanced parser (only apply fixes if needed)
    if (content.trim().startsWith('{')) {
      console.log("[ResponseUtils] Attempting JSON parsing");
      
      const parsed = safeJsonParse(content);
      
      if (parsed) {
        // Check for create_video intent before anything else to prevent infinite loop
        if (parsed.intent_analysis?.request_understanding?.primary_goal === "create_video") {
          console.log("[ResponseUtils] Found create_video intent in JSON structure");
          return "I understand you want to create a video. Please click the Execute button when you're ready to proceed with video creation.";
        }
        
        if (parsed.response) {
          console.log("[ResponseUtils] Found response field in parsed JSON");
          return parsed.response;
        }
        
        // Fallback for modal structure
        const responseFromModal = getResponseFromModalJson(parsed);
        if (responseFromModal) {
          console.log("[ResponseUtils] Found response in modal structure");
          return responseFromModal;
        }
      }
    }
    
    // Handle code block JSON parsing
    if (content.includes('```json') || content.includes('```')) {
      console.log("[ResponseUtils] Attempting code block JSON parsing");
      
      // Extract JSON from code blocks
      let codeBlockContent = content;
      if (content.includes('```json')) {
        const parts = content.split('```json');
        if (parts.length > 1) {
          codeBlockContent = parts[1].split('```')[0].trim();
        }
      } else if (content.includes('```')) {
        const parts = content.split('```');
        if (parts.length > 1) {
          codeBlockContent = parts[1].trim();
        }
      }
      
      // Check for create_video intent in code block to prevent infinite loop
      if (codeBlockContent.includes('"primary_goal"') && codeBlockContent.includes('"create_video"')) {
        console.log("[ResponseUtils] Found create_video intent in code block JSON");
        return "I understand you want to create a video. Please click the Execute button when you're ready to proceed with video creation.";
      }
      
      // Get the clean JSON
      const cleanJson = cleanJsonString(codeBlockContent);
      
      // Try parsing with safe parser
      try {
        const parsed = JSON.parse(cleanJson);
        if (parsed && parsed.response) {
          console.log("[ResponseUtils] Found response in clean JSON parse");
          return parsed.response;
        }
      } catch (parseError) {
        // Try with our more robust parser if direct parsing fails
        const parsed = safeJsonParse(cleanJson);
        
        if (parsed) {
          if (parsed.response) {
            console.log("[ResponseUtils] Found response in code block JSON");
            return parsed.response;
          }
          
          const responseFromModal = getResponseFromModalJson(parsed);
          if (responseFromModal) {
            console.log("[ResponseUtils] Found response in modal code block structure");
            return responseFromModal;
          }
        }
      }
    }
    
    // Last resort - check for simple text after a colon
    const colonMatch = content.match(/response\s*:\s*["']?([^"'\n]+)["']?/i);
    if (colonMatch && colonMatch[1]) {
      console.log("[ResponseUtils] Found response in text pattern");
      return colonMatch[1].trim();
    }
  } catch (error) {
    console.warn("[ResponseUtils] Failed to parse response:", error);
  }
  
  // Final fallback - if nothing else worked and we're looking at raw JSON
  // extract the `response` field if it exists
  if (content.includes('"response":') || content.includes("'response':")) {
    try {
      // Use regex to extract the response value
      const responseRegex = /"response"\s*:\s*"([^"]+)"/;
      const matches = content.match(responseRegex);
      if (matches && matches[1]) {
        console.log("[ResponseUtils] Extracted response using regex");
        return matches[1];
      }
    } catch (regexError) {
      console.warn("[ResponseUtils] Regex extraction failed:", regexError);
    }
  }

  console.log("[ResponseUtils] Returning original content (no special format detected)");
  // Return original content if no special format is detected
  return content;
};

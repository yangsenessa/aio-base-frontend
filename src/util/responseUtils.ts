
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

const processingDepth = new Map<string, number>();
const MAX_PROCESSING_DEPTH = 3;

export const getResponseContent = (content: string): string => {
  if (!content) return "No response content available.";
  
  console.log("[ResponseUtils] Processing response content");
  
  // Generate a simple hash for the content to track processing depth
  const contentHash = String(content.length) + (content.substring(0, 20) || '');
  const currentDepth = processingDepth.get(contentHash) || 0;
  
  // Prevent infinite processing loops by limiting recursion depth
  if (currentDepth >= MAX_PROCESSING_DEPTH) {
    console.warn("[ResponseUtils] Maximum processing depth reached, preventing infinite loop");
    processingDepth.delete(contentHash); // Reset for future use
    
    // Return a safe message when recursion limit is reached
    return "Processing complete. Please click Execute if you'd like to proceed with this operation.";
  }
  
  // Increment processing depth counter
  processingDepth.set(contentHash, currentDepth + 1);

  // Check if content is already what appears to be the final response (not a JSON object)
  if (!content.trim().startsWith('{') && !content.includes('```json') && !content.includes('**Response:**')) {
    // If it's just plain text and doesn't contain JSON markers, return as is
    processingDepth.delete(contentHash); // Reset counter
    return content;
  }

  // Always try direct parsing first without modifications
  try {
    if (content.trim().startsWith('{')) {
      const parsed = JSON.parse(content);
      if (parsed && parsed.response) {
        console.log("[ResponseUtils] Found response in direct JSON parse");
        processingDepth.delete(contentHash); // Reset counter
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
      processingDepth.delete(contentHash); // Reset counter
      return parts[1].trim();
    }
  }

  // Extract from structured data with markdown sections
  const structuredData = extractJsonFromMarkdownSections(content);
  if (structuredData?.response) {
    console.log("[ResponseUtils] Found response in structured markdown");
    processingDepth.delete(contentHash); // Reset counter
    return structuredData.response;
  }

  try {
    // Try JSON parsing with our enhanced parser (only apply fixes if needed)
    if (content.trim().startsWith('{')) {
      console.log("[ResponseUtils] Attempting JSON parsing");
      
      const parsed = safeJsonParse(content);
      
      if (parsed) {
        if (parsed.response) {
          console.log("[ResponseUtils] Found response field in parsed JSON");
          processingDepth.delete(contentHash); // Reset counter
          return parsed.response;
        }
        
        // Fallback for modal structure
        const responseFromModal = getResponseFromModalJson(parsed);
        if (responseFromModal) {
          console.log("[ResponseUtils] Found response in modal structure");
          processingDepth.delete(contentHash); // Reset counter
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
      
      // Get the clean JSON
      const cleanJson = cleanJsonString(codeBlockContent);
      
      // Try parsing with safe parser
      try {
        const parsed = JSON.parse(cleanJson);
        if (parsed && parsed.response) {
          console.log("[ResponseUtils] Found response in clean JSON parse");
          processingDepth.delete(contentHash); // Reset counter
          return parsed.response;
        }
      } catch (parseError) {
        // Try with our more robust parser if direct parsing fails
        const parsed = safeJsonParse(cleanJson);
        
        if (parsed) {
          if (parsed.response) {
            console.log("[ResponseUtils] Found response in code block JSON");
            processingDepth.delete(contentHash); // Reset counter
            return parsed.response;
          }
          
          const responseFromModal = getResponseFromModalJson(parsed);
          if (responseFromModal) {
            console.log("[ResponseUtils] Found response in modal code block structure");
            processingDepth.delete(contentHash); // Reset counter
            return responseFromModal;
          }
        }
      }
    }
    
    // Last resort - check for simple text after a colon
    const colonMatch = content.match(/response\s*:\s*["']?([^"'\n]+)["']?/i);
    if (colonMatch && colonMatch[1]) {
      console.log("[ResponseUtils] Found response in text pattern");
      processingDepth.delete(contentHash); // Reset counter
      return colonMatch[1].trim();
    }
  } catch (error) {
    console.warn("[ResponseUtils] Failed to parse response:", error);
    processingDepth.delete(contentHash); // Always reset counter on error
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
        processingDepth.delete(contentHash); // Reset counter
        return matches[1];
      }
    } catch (regexError) {
      console.warn("[ResponseUtils] Regex extraction failed:", regexError);
    }
  }

  console.log("[ResponseUtils] Returning original content (no special format detected)");
  // Reset counter before returning
  processingDepth.delete(contentHash);
  
  // Return original content if no special format is detected
  return content;
};

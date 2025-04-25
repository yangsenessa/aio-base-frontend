
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
      
      // Get the clean JSON
      const cleanJson = cleanJsonString(content);
      
      // Try parsing with safe parser first
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
    
    // Last resort - check for simple text after a colon
    const colonMatch = content.match(/response\s*:\s*["']?([^"'\n]+)["']?/i);
    if (colonMatch && colonMatch[1]) {
      console.log("[ResponseUtils] Found response in text pattern");
      return colonMatch[1].trim();
    }
  } catch (error) {
    console.warn("[ResponseUtils] Failed to parse response:", error);
  }

  console.log("[ResponseUtils] Returning original content (no special format detected)");
  // Return original content if no special format is detected
  return content;
};


import { 
  cleanJsonString, 
  fixMalformedJson,
  safeJsonParse,
  hasModalStructure,
  getResponseFromModalJson,
  extractJsonFromMarkdownSections
} from './formatters';

export const getResponseContent = (content: string): string => {
  if (!content) return "No response content available.";
  
  console.log("[ResponseUtils] Processing response content");

  // Try direct markdown sections first (most reliable format)
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
    // Try direct JSON parsing with our enhanced parser
    if (content.trim().startsWith('{')) {
      console.log("[ResponseUtils] Attempting direct JSON parsing");
      const fixedJson = fixMalformedJson(content);
      const parsed = safeJsonParse(fixedJson);
      
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
      const cleanJson = cleanJsonString(content);
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

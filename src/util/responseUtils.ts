
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

  // Try markdown sections first (most reliable format)
  if (content.includes("**Response:**")) {
    const parts = content.split("**Response:**");
    if (parts.length > 1) {
      return parts[1].trim();
    }
  }

  // Extract from structured data with markdown sections
  const structuredData = extractJsonFromMarkdownSections(content);
  if (structuredData?.response) {
    return structuredData.response;
  }

  try {
    // Try direct JSON parsing
    if (content.trim().startsWith('{')) {
      const fixedJson = fixMalformedJson(content);
      const parsed = safeJsonParse(fixedJson);
      
      if (parsed) {
        if (parsed.response) return parsed.response;
        
        // Fallback for modal structure
        const responseFromModal = getResponseFromModalJson(parsed);
        if (responseFromModal) return responseFromModal;
      }
    }
    
    // Code block JSON parsing
    if (content.includes('```json') || content.includes('```')) {
      const cleanJson = cleanJsonString(content);
      const parsed = safeJsonParse(cleanJson);
      
      if (parsed) {
        if (parsed.response) return parsed.response;
        
        const responseFromModal = getResponseFromModalJson(parsed);
        if (responseFromModal) return responseFromModal;
      }
    }
  } catch (error) {
    console.warn("Failed to parse response:", error);
  }

  // Return original content if no special format is detected
  return content;
};


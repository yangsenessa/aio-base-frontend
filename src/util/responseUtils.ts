
import { 
  cleanJsonString, 
  fixMalformedJson,
  safeJsonParse,
  hasModalStructure,
  getResponseFromModalJson,
  extractJsonFromMarkdownSections
} from './formatters';

export const getResponseContent = (content: string): string => {
  // Try markdown sections first
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

  return content || "No response content available.";
};

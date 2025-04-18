
/**
 * Formats a JSON object to a string suitable for ICP canister storage
 * - Removes newlines
 * - Properly escapes special characters
 * - Handles null/undefined cases
 * 
 * @param jsonData JSON object or string to format
 * @returns Formatted string safe for canister storage
 */
export const formatJsonForCanister = (jsonData: any): string => {
  if (!jsonData) return '';
  
  try {
    // If it's already a string, parse it to validate and then reformat
    const parsedJson = typeof jsonData === 'string' 
      ? JSON.parse(jsonData) 
      : jsonData;
    
    // Convert to string and remove newlines
    return JSON.stringify(parsedJson)
      .replace(/\n/g, ' ')
      .replace(/\r/g, ' ');
  } catch (error) {
    console.error('Error formatting JSON for canister:', error);
    // Return empty string on error
    return '';
  }
};

/**
 * Validates if a string is valid JSON format
 * 
 * @param str String to validate
 * @returns Boolean indicating if valid JSON
 */
export const isValidJson = (str: string): boolean => {
  if (!str || typeof str !== 'string') return false;
  
  // Trim to handle whitespace
  const trimmed = str.trim();
  
  // Quick checks before trying to parse
  if (!trimmed.startsWith('{') && !trimmed.startsWith('[')) return false;
  
  try {
    JSON.parse(trimmed);
    return true;
  } catch (error) {
    console.log("JSON validation failed:", error);
    return false;
  }
};

/**
 * Extracts JSON from a text that might include markdown or code blocks
 *
 * @param text Text that may contain JSON
 * @returns Extracted JSON string or null if none found
 */
export const extractJsonFromText = (text: string): string | null => {
  if (!text) return null;
  
  // Case 1: Text is just pure JSON
  if (isValidJson(text)) return text.trim();
  
  // Case 2: Clean up text with "```json" markers or triple backticks
  const jsonMarkdownPattern = /```(?:json)?\s*([\s\S]*?)\s*```/;
  const markdownMatches = text.match(jsonMarkdownPattern);
  if (markdownMatches && markdownMatches[1]) {
    const extracted = markdownMatches[1].trim();
    if (isValidJson(extracted)) {
      return extracted;
    }
  }
  
  // Case 3: Handle the specific format from the example
  const jsonBracePattern = /(\{[\s\S]*?\})/g;
  const braceMatches = text.match(jsonBracePattern);
  if (braceMatches) {
    for (const match of braceMatches) {
      if (isValidJson(match)) {
        return match;
      }
    }
  }
  
  console.log("Failed to extract JSON from:", text.substring(0, 100) + "...");
  return null;
};

/**
 * Extracts the response field from a structured JSON response
 * 
 * @param jsonString JSON string that may contain a response field
 * @returns The response text or null if not found
 */
export const extractResponseFromJson = (jsonString: string): string | null => {
  if (!jsonString) return null;
  
  try {
    const parsed = typeof jsonString === 'string' ? JSON.parse(jsonString) : jsonString;
    
    // Direct access to top-level response field
    if (parsed.response && typeof parsed.response === 'string') {
      return parsed.response;
    }
    
    // Check for nested response field in common structures
    if (parsed.execution_plan?.steps?.[0]?.output?.response) {
      return parsed.execution_plan.steps[0].output.response;
    }
    
    return null;
  } catch (error) {
    console.error('Error parsing JSON for response extraction:', error);
    return null;
  }
};

/**
 * Processes AI response content to extract the appropriate display text
 * 
 * @param content The raw AI response content
 * @returns The processed content suitable for display
 */
export const processAIResponseContent = (content: string): string => {
  if (!content) return '';
  
  try {
    // First, try to extract JSON from the content
    const extractedJson = extractJsonFromText(content);
    
    if (extractedJson) {
      // Check if there's a response field in the JSON
      const responseText = extractResponseFromJson(extractedJson);
      
      // If we found a response field, return it
      if (responseText) {
        return responseText;
      }
    }
    
    // If no JSON or no response field, return the original content
    return content;
  } catch (error) {
    console.error('Error processing AI response:', error);
    return content;
  }
};

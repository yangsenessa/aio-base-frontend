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
  
  // Case 2: Clean up text with "```json" markers
  if (text.includes('```json')) {
    // Remove "```json" and closing "```"
    let cleaned = text.replace(/```json\s*/, '').replace(/\s*```$/, '');
    if (isValidJson(cleaned)) {
      return cleaned.trim();
    }
  }
  
  // Case 3: Handle the specific format from the example
  const jsonPattern = /```json\s*(\{[\s\S]*?\})\s*```/;
  const matches = text.match(jsonPattern);
  if (matches && matches[1]) {
    const extracted = matches[1].trim();
    if (isValidJson(extracted)) {
      return extracted;
    }
  }
  
  // Case 4: Try to find JSON object in the text
  const jsonRegex = /(\{[\s\S]*\})/g;
  const allMatches = text.match(jsonRegex);
  if (allMatches) {
    for (const match of allMatches) {
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
  try {
    const parsed = JSON.parse(jsonString);
    if (parsed.response) {
      return parsed.response;
    }
    return null;
  } catch (error) {
    console.error('Error parsing JSON for response extraction:', error);
    return null;
  }
};

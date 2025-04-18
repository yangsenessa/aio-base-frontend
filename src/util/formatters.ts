
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
 * Extracts JSON from a string that might include markdown or code blocks
 *
 * @param text Text that may contain JSON
 * @returns Extracted JSON string or null if none found
 */
export const extractJsonFromText = (text: string): string | null => {
  if (!text) return null;
  
  // Case 1: Text is just pure JSON
  if (isValidJson(text)) return text.trim();
  
  // Case 2: JSON inside ```json blocks
  if (text.includes('```json')) {
    // Handle the format: ```json { ... } ```
    const jsonPattern = /```json\s*(\{[\s\S]*?\})\s*```/;
    const matches = text.match(jsonPattern);
    if (matches && matches[1]) {
      const jsonPart = matches[1].trim();
      if (isValidJson(jsonPart)) return jsonPart;
    }
    
    // If the above didn't work, try a more liberal approach
    const parts = text.split('```json');
    if (parts.length > 1) {
      const jsonPart = parts[1].split('```')[0].trim();
      if (isValidJson(jsonPart)) return jsonPart;
    }
    
    // Handle format: ```json { ... without ending backticks
    const noEndingPattern = /```json\s*(\{[\s\S]*)/;
    const noEndingMatches = text.match(noEndingPattern);
    if (noEndingMatches && noEndingMatches[1]) {
      const jsonPart = noEndingMatches[1].trim();
      if (isValidJson(jsonPart)) return jsonPart;
    }
  }
  
  // Case 3: JSON inside general code blocks
  if (text.includes('```')) {
    const parts = text.split('```');
    if (parts.length > 1) {
      const jsonPart = parts[1].trim();
      if (isValidJson(jsonPart)) return jsonPart;
    }
  }
  
  // Case 4: Handle format like: ```json { "intent_analysis": ... } ```
  const fullJsonBlockRegex = /```json\s*(\{[\s\S]*?\})\s*```/;
  const fullBlockMatches = text.match(fullJsonBlockRegex);
  if (fullBlockMatches && fullBlockMatches[1]) {
    const potentialJson = fullBlockMatches[1].trim();
    if (isValidJson(potentialJson)) return potentialJson;
  }
  
  // Case 5: Handle the format from the user example: ```json { ... } (without closing backticks)
  const userFormatRegex = /```json\s*(\{[\s\S]*)/;
  const userFormatMatches = text.match(userFormatRegex);
  if (userFormatMatches && userFormatMatches[1]) {
    // Try to find where the JSON object ends
    const jsonText = userFormatMatches[1].trim();
    let depth = 0;
    let endIndex = -1;
    
    for (let i = 0; i < jsonText.length; i++) {
      if (jsonText[i] === '{') depth++;
      else if (jsonText[i] === '}') {
        depth--;
        if (depth === 0) {
          endIndex = i;
          break;
        }
      }
    }
    
    if (endIndex !== -1) {
      const extractedJson = jsonText.substring(0, endIndex + 1);
      if (isValidJson(extractedJson)) return extractedJson;
    }
  }
  
  // Case 6: Using regex to extract JSON-like structure (fallback)
  const jsonRegex = /(\{[\s\S]*\})/g;
  const matches = text.match(jsonRegex);
  if (matches && matches.length > 0) {
    for (const match of matches) {
      const potentialJson = match.trim();
      if (isValidJson(potentialJson)) return potentialJson;
    }
  }
  
  console.log("Failed to extract JSON from:", text.substring(0, 100) + "...");
  return null;
};


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
  if (!str) return false;
  try {
    JSON.parse(str);
    return true;
  } catch (error) {
    return false;
  }
};

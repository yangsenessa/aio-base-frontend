
/**
 * Utility functions for handling JSON data formatting, extraction, and validation
 */

// Check if a string is valid JSON
export const isValidJson = (text: string): boolean => {
  try {
    JSON.parse(text);
    return true;
  } catch (error) {
    return false;
  }
};

/**
 * Extract and validate JSON from text content
 * Handles cleaning and normalization of JSON-like content
 */
export const extractAndValidateJson = (text: string): string | null => {
  try {
    // First, sanitize and clean the input text
    const cleanedText = text.trim()
      .replace(/\n/g, ' ')  // Remove newlines
      .replace(/\s+/g, ' ')  // Normalize whitespaces
      .replace(/,\s*}/g, '}')  // Remove trailing commas in objects
      .replace(/,\s*\]/g, ']');  // Remove trailing commas in arrays

    console.log("[JSON Extraction] Cleaned text:", cleanedText.substring(0, 100) + "...");

    // Check if the text starts with ```json
    if (cleanedText.includes('```json')) {
      const parts = cleanedText.split('```json');
      if (parts.length > 1) {
        const jsonPart = parts[1].split('```')[0].trim();
        try {
          const parsed = JSON.parse(jsonPart);
          return JSON.stringify(parsed);
        } catch (e) {
          console.warn("[JSON Extraction] Failed to parse JSON from code block:", e);
        }
      }
    }

    // Try extracting JSON using more flexible regex
    const jsonRegex = /\{(?:[^{}]|(?:\{(?:[^{}]|(?:\{[^{}]*\})*)*\}))*\}/g;
    const matches = cleanedText.match(jsonRegex);

    if (matches && matches.length > 0) {
      for (const jsonCandidate of matches) {
        try {
          // Fix malformed JSON with missing quotes or commas
          let fixedJson = jsonCandidate
            .replace(/(['"])?([a-zA-Z0-9_]+)(['"])?:/g, '"$2":')  // Ensure keys are quoted
            .replace(/:\s*(['"])?([^'"\[\]{},\s][^'"\[\]{},]*?)(['"])?([,}\]])/g, ':"$2"$4'); // Quote unquoted string values
          
          // Fix unquoted array elements
          fixedJson = fixedJson.replace(/\[([^"'\[\]{}]*?)([,\]])/g, function(match, p1, p2) {
            if (!p1.trim()) return match;
            return '["' + p1.trim() + '"]';
          });
          
          // Fix malformed array syntax
          fixedJson = fixedJson.replace(/\[(.*)\]'/g, '[$1]');
          
          console.log("[JSON Extraction] Attempting to parse fixed JSON:", fixedJson.substring(0, 100) + "...");
          
          const parsedJson = JSON.parse(fixedJson);
          return JSON.stringify(parsedJson);  // Return a canonicalized version
        } catch (parseError) {
          console.warn("[JSON Extraction] Parse attempt failed:", parseError);
        }
      }
    }

    console.error("[JSON Extraction] No valid JSON found in text");
    return null;
  } catch (error) {
    console.error("[JSON Extraction] Unexpected error:", error);
    return null;
  }
};

/**
 * Extract JSON from text - wrapper around extractAndValidateJson
 */
export const extractJsonFromText = (text: string): string | null => {
  try {
    // Special handling for ```json format
    if (text.includes('```json')) {
      const parts = text.split('```json');
      if (parts.length > 1) {
        const jsonPart = parts[1].split('```')[0].trim();
        try {
          // Try to parse directly first
          JSON.parse(jsonPart);
          return jsonPart;
        } catch (e) {
          // If direct parsing fails, try with the validator
          return extractAndValidateJson(jsonPart);
        }
      }
    }
    
    return extractAndValidateJson(text);
  } catch (error) {
    console.error("[JSON Extraction] Error in extractJsonFromText:", error);
    return null;
  }
};

/**
 * Process AI response content to extract the response field if available
 */
export const processAIResponseContent = (content: string): string => {
  try {
    // First check if it's a structured format with markdown headers
    if (content.includes("**Response:**")) {
      const parts = content.split("**Response:**");
      if (parts.length > 1) {
        return parts[1].trim();
      }
    }
    
    // Then try to parse as JSON to extract the response field
    const jsonContent = extractJsonFromText(content);
    if (jsonContent) {
      try {
        const parsed = JSON.parse(jsonContent);
        if (parsed.response) {
          return parsed.response;
        }
      } catch (error) {
        console.warn("[Response Extraction] Failed to parse JSON:", error);
      }
    }
    
    // Return original if no processing succeeded
    return content;
  } catch (error) {
    console.error("[Response Processing] Error:", error);
    return content;
  }
};

/**
 * Extract response field from JSON content
 */
export const extractResponseFromJson = (jsonStr: string): string | null => {
  try {
    if (!jsonStr) return null;
    
    const parsed = JSON.parse(jsonStr);
    return parsed.response || null;
  } catch (error) {
    console.error("[Response Extraction] Error parsing JSON:", error);
    return null;
  }
};

/**
 * Format JSON for canister storage by normalizing and cleaning
 */
export const formatJsonForCanister = (data: any): string => {
  try {
    // If it's already a string, validate it's JSON
    if (typeof data === 'string') {
      try {
        JSON.parse(data); // Validate that it's parseable JSON
        return data;
      } catch (e) {
        // Not valid JSON, treat as an object and stringify it
        return JSON.stringify({ value: data });
      }
    }
    
    // Otherwise, stringify the object/array
    return JSON.stringify(data);
  } catch (error) {
    console.error("[Formatter] Error formatting JSON for canister:", error);
    // Return a fallback
    return JSON.stringify({ error: "Failed to format data" });
  }
};

/**
 * Clean JSON string for proper parsing by removing markdown code blocks
 */
export const cleanJsonString = (jsonString: string): string => {
  if (!jsonString) return '';
  
  // Remove markdown code blocks
  if (jsonString.includes('```json')) {
    const parts = jsonString.split('```json');
    if (parts.length > 1) {
      const content = parts[1].split('```')[0].trim();
      return content;
    }
  }
  
  // Remove other code block formats
  if (jsonString.includes('```')) {
    const parts = jsonString.split('```');
    if (parts.length > 1) {
      return parts[1].trim();
    }
  }
  
  return jsonString;
};

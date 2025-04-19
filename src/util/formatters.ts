
/**
 * Utility functions for handling JSON data formatting, extraction, and validation
 */

/**
 * Check if a string is valid JSON
 */
export const isValidJson = (text: string): boolean => {
  try {
    JSON.parse(text);
    return true;
  } catch (error) {
    return false;
  }
};

/**
 * Attempt to fix common JSON syntax errors
 */
export const fixMalformedJson = (jsonString: string): string => {
  try {
    if (!jsonString) return jsonString;
    
    // Fix missing commas in arrays (a common issue with LLM outputs)
    let fixedJson = jsonString.replace(/"\s*"(?=\s*[,\]])/g, '", "');
    
    // Fix missing commas between array items with closing quotes followed by opening quotes
    fixedJson = fixedJson.replace(/"\s+"/g, '", "');
    
    // Fix missing commas between objects in arrays
    fixedJson = fixedJson.replace(/}\s*{/g, '}, {');
    
    // Fix trailing commas in objects and arrays
    fixedJson = fixedJson.replace(/,\s*}/g, '}').replace(/,\s*\]/g, ']');

    // Fix quotes around capability listing - common AI generation error in the sample
    fixedJson = fixedJson.replace(/"([^"]*?)"\s+("[^"]*?")/g, '"$1", $2');
    
    return fixedJson;
  } catch (error) {
    console.error("[JSON Fixer] Error fixing malformed JSON:", error);
    return jsonString; // Return original if fixing fails
  }
};

/**
 * Extract and validate JSON from text content
 * Handles cleaning and normalization of JSON-like content
 */
export const extractAndValidateJson = (text: string): string | null => {
  try {
    if (!text) return null;
    
    // First, sanitize and clean the input text
    const cleanedText = text.trim()
      .replace(/\n/g, ' ')  // Remove newlines
      .replace(/\s+/g, ' ')  // Normalize whitespaces
      .replace(/,\s*}/g, '}')  // Remove trailing commas in objects
      .replace(/,\s*\]/g, ']');  // Remove trailing commas in arrays

    console.log("[JSON Extraction] Cleaned text:", cleanedText.substring(0, 500) + (cleanedText.length > 500 ? "..." : ""));

    // Check if the text starts with ```json
    if (cleanedText.includes('```json')) {
      const parts = cleanedText.split('```json');
      if (parts.length > 1) {
        const jsonPart = parts[1].split('```')[0].trim();
        try {
          // Try to fix any potential malformed JSON
          const fixedJson = fixMalformedJson(jsonPart);
          // Try to parse the fixed JSON content
          const parsed = JSON.parse(fixedJson);
          return JSON.stringify(parsed);
        } catch (e) {
          console.warn("[JSON Extraction] Failed to parse JSON from code block:", e);
          // If direct parsing fails, continue with regex extraction
        }
      }
    }

    // Try extracting JSON using more flexible regex
    const jsonRegex = /\{(?:[^{}]|(?:\{(?:[^{}]|(?:\{[^{}]*\})*)*\}))*\}/g;
    const matches = cleanedText.match(jsonRegex);

    if (matches && matches.length > 0) {
      for (const jsonCandidate of matches) {
        try {
          // Fix malformed JSON with missing quotes, commas, etc.
          let fixedJson = jsonCandidate
            .replace(/(['"])?([a-zA-Z0-9_]+)(['"])?:/g, '"$2":')  // Ensure keys are quoted
            .replace(/:\s*(['"])?([^'"\[\]{},\s][^'"\[\]{},]*?)(['"])?([,}\]])/g, ':"$2"$4'); // Quote unquoted string values
          
          // Apply our new malformed JSON fixer
          fixedJson = fixMalformedJson(fixedJson);
          
          // Fix unquoted array elements
          fixedJson = fixedJson.replace(/\[([^"'\[\]{}]*?)([,\]])/g, function(match, p1, p2) {
            if (!p1.trim()) return match;
            return '["' + p1.trim() + '"]';
          });
          
          // Fix malformed array syntax
          fixedJson = fixedJson.replace(/\[(.*)\]'/g, '[$1]')
            // Fix the specific issue with mixed quotes in the sample JSON
            .replace(/\[\"mp4'\]/g, '["mp4"]')
            .replace(/\['mp4\"\]/g, '["mp4"]');
          
          console.log("[JSON Extraction] Attempting to parse fixed JSON:", fixedJson.substring(0, 500) + (fixedJson.length > 500 ? "..." : ""));
          
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
    if (text && text.includes('```json')) {
      const parts = text.split('```json');
      if (parts.length > 1) {
        const jsonPart = parts[1].split('```')[0].trim();
        try {
          // Apply JSON fixes and parse
          const fixedJsonPart = fixMalformedJson(jsonPart);
          JSON.parse(fixedJsonPart);
          return fixedJsonPart;
        } catch (e) {
          // If direct parsing fails, try with the validator
          return extractAndValidateJson(text);
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
    if (!content) return '';
    
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
      // Apply our JSON fixing function here too
      return fixMalformedJson(content);
    }
  }
  
  // Remove other code block formats
  if (jsonString.includes('```')) {
    const parts = jsonString.split('```');
    if (parts.length > 1) {
      const content = parts[1].trim();
      // Apply our JSON fixing function here too
      return fixMalformedJson(content);
    }
  }
  
  // Apply fixes even if no code blocks are found
  return fixMalformedJson(jsonString);
};

/**
 * Determine if a JSON structure matches the modal display format
 */
export const hasModalStructure = (obj: any): boolean => {
  if (!obj) return false;
  
  // Check for intent_analysis with non-empty content
  const hasIntentAnalysis = obj.intent_analysis && 
    typeof obj.intent_analysis === 'object' && 
    Object.keys(obj.intent_analysis).length > 0;
  
  // Check for execution_plan with steps
  const hasExecutionPlan = obj.execution_plan && 
    obj.execution_plan.steps && 
    Array.isArray(obj.execution_plan.steps) && 
    obj.execution_plan.steps.length > 0;
  
  return hasIntentAnalysis || hasExecutionPlan;
};

/**
 * Safely parse JSON with error handling
 */
export const safeJsonParse = (jsonString: string): any => {
  try {
    if (!jsonString) return null;
    
    // First try to fix any potential issues with the JSON
    const fixedJson = fixMalformedJson(jsonString);
    return JSON.parse(fixedJson);
  } catch (error) {
    console.error("[JSON Parser] Error parsing JSON:", error);
    return null;
  }
};

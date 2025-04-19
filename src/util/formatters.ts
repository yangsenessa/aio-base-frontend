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
    
    // Clean up code block syntax first (handle ```json prefix/suffix)
    let fixedJson = jsonString;
    if (fixedJson.includes('```json')) {
      const parts = fixedJson.split('```json');
      if (parts.length > 1) {
        fixedJson = parts[1].split('```')[0].trim();
      }
    } else if (fixedJson.includes('```')) {
      const parts = fixedJson.split('```');
      if (parts.length > 1) {
        fixedJson = parts[1].trim();
      }
    }
    
    // Fix missing commas between array elements
    fixedJson = fixedJson.replace(/"\s*"(?=\s*[,\]])/g, '", "');
    
    // Fix missing commas between key-value pairs
    fixedJson = fixedJson.replace(/}\s*{/g, '}, {');
    
    // Fix missing commas in object properties
    fixedJson = fixedJson.replace(/"\s*"/g, '", "');
    
    // Fix array syntax issues - specifically for the TTS and Sox command arrays
    fixedJson = fixedJson.replace(/\[\s*"([^"]+)"\s*"([^"]+)"\s*\]/g, '["$1", "$2"]');
    
    // Fix MCP Sox command pattern with quotes and colons
    fixedJson = fixedJson.replace(/\[\s*"([^"]*)\s*command:\s*'([^']+)'"\s*\]/g, '["$1 command: \'$2\'"]');
    fixedJson = fixedJson.replace(/\[\s*"([^"]*)\s*command:\s*"([^"]+)""\s*\]/g, '["$1 command: \'$2\'"]');
    
    // Fix array items without commas (most common error in the provided samples)
    fixedJson = fixedJson.replace(/(".*?")\s+(".*?")/g, '$1, $2');
    
    // Fix missing commas after strings before objects
    fixedJson = fixedJson.replace(/"([^"]*?)"\s+\{/g, '"$1", {');
    
    // Fix trailing commas
    fixedJson = fixedJson.replace(/,\s*}/g, '}').replace(/,\s*\]/g, ']');
    
    // Fix JSON format specifically for type arrays in schemas
    fixedJson = fixedJson.replace(/"type":\s*\[\s*"([^"]+)"\s*\]/g, '"type": "$1"');
    
    // Fix quotes in arrays
    fixedJson = fixedJson.replace(/\[\s*"([^"]*?)"\s*"([^"]*?)"\s*\]/g, '["$1", "$2"]');
    
    // Fix missing commas in arrays with multiple items
    fixedJson = fixedJson.replace(/\["([^"]*?)"\s+"([^"]*?)"\]/g, '["$1", "$2"]');
    
    // Fix quotes in commands
    fixedJson = fixedJson.replace(/'([^']*?)'/g, '"$1"');
    
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
          // Apply our JSON fixing function here too
          const fixedJson = fixMalformedJson(jsonCandidate);
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
    
    // If the content is raw JSON (no code block), try to extract the response field
    if (content.trim().startsWith('{') && content.includes('"response"')) {
      try {
        // First apply JSON fixes
        const fixedJson = fixMalformedJson(content);
        const parsed = JSON.parse(fixedJson);
        if (parsed.response) {
          return parsed.response;
        }
      } catch (error) {
        console.warn("[Response Extraction] Failed to parse direct JSON:", error);
      }
    }
    
    // Then try to parse from code blocks
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
  
  // For raw JSON format with no code blocks (most common in user's case)
  if (jsonString.trim().startsWith('{')) {
    return fixMalformedJson(jsonString);
  }
  
  // Apply fixes even if no code blocks are found
  return fixMalformedJson(jsonString);
};

/**
 * Determine if a JSON structure matches the modal display format
 */
export const hasModalStructure = (obj: any): boolean => {
  if (!obj) return false;
  
  // First check for response field (simplest indicator)
  if (obj.response && typeof obj.response === 'string') {
    return true;
  }
  
  // Check for AIO protocol structure - improved check for more flexible matching
  const hasIntentAnalysis = obj.intent_analysis || 
    (typeof obj === 'object' && Object.keys(obj).some(key => 
      key.includes('intent') || key.includes('analysis')
    ));
  
  const hasExecutionPlan = obj.execution_plan || 
    (typeof obj === 'object' && Object.keys(obj).some(key => 
      key.includes('execution') || key.includes('plan') || key.includes('steps')
    ));
  
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

/**
 * Extract the response string from a modal-structured JSON object
 */
export const getResponseFromModalJson = (jsonObj: any): string | null => {
  if (!jsonObj) return null;
  
  // Direct response field
  if (jsonObj.response && typeof jsonObj.response === 'string') {
    return jsonObj.response;
  }
  
  // Check inside execution_plan
  if (jsonObj.execution_plan?.response) {
    return jsonObj.execution_plan.response;
  }
  
  // Check inside intent_analysis
  if (jsonObj.intent_analysis?.response) {
    return jsonObj.intent_analysis.response;
  }
  
  // Check nested inside intent_analysis objects
  if (jsonObj.intent_analysis) {
    const keys = Object.keys(jsonObj.intent_analysis);
    for (const key of keys) {
      if (typeof jsonObj.intent_analysis[key] === 'object' && 
          jsonObj.intent_analysis[key]?.response) {
        return jsonObj.intent_analysis[key].response;
      }
    }
  }
  
  return null;
};

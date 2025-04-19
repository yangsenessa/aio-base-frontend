
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
    
    // Don't try to parse non-JSON content
    if (!fixedJson.includes('{') && !fixedJson.includes('[')) {
      return fixedJson;
    }
    
    // Fix unescaped apostrophes in JSON (but avoid double-escaping)
    fixedJson = fixedJson.replace(/([^\\])'/g, "$1\\'");
    
    // Fix unescaped quotes within string values
    // This finds quotes within strings that aren't already escaped
    // But only applies to quotes that are within other string values
    fixedJson = fixedJson.replace(/(?<=([:,]\s*").*?)(?<!\\)"(?=.*?")/g, '\\"');
    
    // Fix missing quotes around property names
    fixedJson = fixedJson.replace(/([{,]\s*)([a-zA-Z0-9_]+)(\s*:)/g, '$1"$2"$3');
    
    // Fix missing commas between array items
    // Look for situations like "item1" "item2" and insert a comma
    fixedJson = fixedJson.replace(/("(?:\\"|[^"])*")\s+("(?:\\"|[^"])*")/g, '$1, $2');
    
    // Fix missing commas between object properties
    // Look for situations like "key1": "value1" "key2": "value2"
    fixedJson = fixedJson.replace(/("(?:\\"|[^"])*")\s*:\s*("(?:\\"|[^"])*"|\{[^}]*\}|\[[^\]]*\]|true|false|null|\d+(?:\.\d+)?)\s+("(?:\\"|[^"])*")/g, '$1: $2, $3');
    
    // Another pass for object properties with nested objects/arrays as values
    fixedJson = fixedJson.replace(/(\}|\])\s+("(?:\\"|[^"])*")/g, '$1, $2');
    
    // Remove trailing commas in objects and arrays
    fixedJson = fixedJson.replace(/,\s*}/g, '}')
                         .replace(/,\s*\]/g, ']');
    
    // Fix unquoted string values
    fixedJson = fixedJson.replace(/:\s*([a-zA-Z0-9_]+)(\s*[,}])/g, function(match, p1, p2) {
      // Don't modify true, false, or null
      if (p1 === 'true' || p1 === 'false' || p1 === 'null') {
        return ': ' + p1 + p2;
      }
      return ': "' + p1 + '"' + p2;
    });
    
    // Fix "constraint": [] (should be "constraints": [])
    fixedJson = fixedJson.replace(/"constraint"\s*:/g, '"constraints":');
    
    // Try parsing to validate the fix
    try {
      JSON.parse(fixedJson);
      return fixedJson;
    } catch (parseError) {
      console.warn("JSON parsing failed after initial fixes:", parseError);
      
      // More aggressive comma fixing for deeply nested structures
      // Look for pattern: "key": "value" "nextKey":
      fixedJson = fixedJson.replace(/("[^"]*")\s*:\s*("[^"]*"|\{[^{]*\}|\[[^\[]*\]|true|false|null|\d+(?:\.\d+)?)\s+("[^"]*")\s*:/g, '$1: $2, $3:');
      
      // Try again after more aggressive fixes
      try {
        JSON.parse(fixedJson);
        return fixedJson;
      } catch (error) {
        console.warn("JSON parsing failed after aggressive fixes:", error);
        
        // If everything fails, just return the original string
        // This ensures we don't lose the original content
        return jsonString;
      }
    }
  } catch (error) {
    console.error("Error in JSON fixing:", error);
    return jsonString;
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
    
    // Check if content is just plain text (no JSON markers)
    if (!content.includes('{') && !content.includes('"response"') && !content.includes('```')) {
      return content;
    }
    
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
        // If parsing fails, return the original content
        return content;
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
        // If parsing fails, return the original content
        return content;
      }
    }
    
    // Check for specific format of code block that might contain response field
    if (content.includes('```json') && content.includes('"response"')) {
      try {
        const startIndex = content.indexOf('"response"');
        const valueStartIndex = content.indexOf(':', startIndex) + 1;
        const valueEndIndex = content.indexOf(',', valueStartIndex);
        
        if (valueStartIndex > 0) {
          let responseValue;
          if (valueEndIndex > 0) {
            responseValue = content.substring(valueStartIndex, valueEndIndex).trim();
          } else {
            responseValue = content.substring(valueStartIndex).trim();
            // Find the end of the string value
            const endQuotePos = responseValue.indexOf('"', 1);
            if (endQuotePos > 0) {
              responseValue = responseValue.substring(0, endQuotePos + 1);
            }
          }
          
          // If it's a quoted string, remove the quotes
          if (responseValue.startsWith('"') && responseValue.endsWith('"')) {
            return responseValue.substring(1, responseValue.length - 1);
          }
        }
      } catch (error) {
        console.warn("[Response Extraction] Failed string extraction:", error);
      }
    }
    
    // Return original if no processing succeeded
    return content;
  } catch (error) {
    console.error("[Response Processing] Error:", error);
    // Always return the original content on error
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
      key.includes('intent') || 
      key.includes('analysis') || 
      key === 'requestUnderstanding' || 
      key === 'modalityAnalysis' || 
      key === 'capabilityMapping'
    ));
  
  const hasExecutionPlan = obj.execution_plan || 
    (typeof obj === 'object' && Object.keys(obj).some(key => 
      key.includes('execution') || 
      key.includes('plan') || 
      key.includes('steps')
    ));
  
  return hasIntentAnalysis || hasExecutionPlan;
};

/**
 * Safely parse JSON with error handling
 */
export const safeJsonParse = (jsonString: string): any => {
  try {
    if (!jsonString) return null;
    
    // Don't try to parse non-JSON content
    if (!jsonString.includes('{') && !jsonString.includes('[')) {
      return null;
    }
    
    // First try to fix any potential issues with the JSON
    const fixedJson = fixMalformedJson(jsonString);
    console.log("Attempting to parse fixed JSON:", fixedJson.substring(0, 150) + "...");
    const parsed = JSON.parse(fixedJson);
    console.log("JSON parsed successfully!");
    return parsed;
  } catch (error) {
    console.error("[JSON Parser] Error parsing JSON:", error);
    
    // Add more detailed logging for debugging
    if (jsonString) {
      const errorPosition = (error as SyntaxError).message.match(/position (\d+)/);
      if (errorPosition && errorPosition[1]) {
        const position = parseInt(errorPosition[1]);
        const problemArea = jsonString.substring(
          Math.max(0, position - 20),
          Math.min(jsonString.length, position + 20)
        );
        console.error(`JSON error near: "...${problemArea}..."`);
      }
    }
    
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
  
  // Check for the new AIO protocol structure fields
  if (jsonObj.intent_analysis?.requestUnderstanding?.primaryGoal) {
    return `I understand your goal: ${jsonObj.intent_analysis.requestUnderstanding.primaryGoal}. How can I help you further with this?`;
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

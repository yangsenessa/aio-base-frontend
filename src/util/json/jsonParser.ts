
/**
 * Core JSON parsing and validation utilities
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
 * More aggressive fix for complex backslash escaping issues
 */
export const aggressiveBackslashFix = (jsonString: string): string => {
  // This is more aggressive and may alter the data, but is a last resort
  let fixedJson = jsonString;
  
  // Remove all backslashes that precede quotes
  fixedJson = fixedJson.replace(/\\"/g, '"');
  
  // Remove backslashes before colons
  fixedJson = fixedJson.replace(/\\:/g, ':');
  
  // Fix the pattern "key\": \"value" -> "key": "value"
  fixedJson = fixedJson.replace(/"([^"]+)\\": \\"([^"]+)"/g, '"$1": "$2"');
  
  return fixedJson;
};

/**
 * Fix issues with backslash escaping in JSON strings
 */
export const fixBackslashEscapeIssues = (jsonString: string): string => {
  // Don't try to fix what's not broken - check if the string is already valid JSON first
  try {
    JSON.parse(jsonString);
    return jsonString; // Already valid, don't modify
  } catch (error) {
    // Continue with fixes only if the string isn't valid JSON
  }
  
  // Handle incorrect backslash escaping in property names and values
  let fixedJson = jsonString;
  
  // Fix property names with incorrect backslash escaping
  // For example: "intent\": "value" -> "intent": "value"
  fixedJson = fixedJson.replace(/("[\w\s-]+)\\(":\s*")/g, '$1$2');
  fixedJson = fixedJson.replace(/("[\w\s-]+)\\(":\s*\\?")/g, '$1$2'); // Also handle \"value\" case
  
  // Fix the specific pattern we're seeing in errors: "intent\": \"value" -> "intent": "value"
  fixedJson = fixedJson.replace(/"([^"]+)\\": \\"([^"]+)"/g, '"$1": "$2"');
  
  // Fix incorrect backslash escaping within string values
  fixedJson = fixedJson.replace(/([^\\])\\(?!["\\/bfnrt])/g, '$1');
  
  // Fix double backslashes that aren't escaping anything valid
  fixedJson = fixedJson.replace(/\\\\(?!["\\/bfnrt])/g, '');
  
  return fixedJson;
};

/**
 * Special emergency fix for missing colons after property names
 */
export const emergencyFixMissingColons = (jsonString: string): string => {
  // Common pattern for missing colons: "property" "value" or "property" {
  let fixedJson = jsonString.replace(/("[^"]+")(\s*)("[^"]+"|\{|\[|true|false|null|-?\d+(\.\d+)?)/g, '$1:$2$3');
  
  // Fix missing colons in property name followed by property name (likely missing colon + value + comma)
  // Pattern: "property" "property" -> "property": null, "property"
  fixedJson = fixedJson.replace(/("[^"]+")(\s+)("[^"]+"\s*:)/g, '$1: null,$2$3');
  
  return fixedJson;
};

/**
 * Fix specific line with escaped quotes issues
 */
export const fixQuotesAndBackslashesInLine = (jsonString: string, lineStart: number, lineEnd: number): string => {
  const before = jsonString.substring(0, lineStart);
  const problematicLine = jsonString.substring(lineStart, lineEnd);
  const after = jsonString.substring(lineEnd);
  
  // Fix the specific "intent\\": \\"value" pattern
  let fixedLine = problematicLine
    // First fix the property name escaping issue: "intent\": -> "intent":
    .replace(/("[\w\s-]+)\\(":\s*\\?")/g, '$1$2')
    // Then fix any incorrectly escaped quotes in values: \"value\" -> "value"
    .replace(/\\("[\w\s-]+")/g, '$1');
  
  console.log("Original line:", problematicLine);
  console.log("Fixed line:", fixedLine);
  
  return before + fixedLine + after;
};

/**
 * Attempt to fix common JSON syntax errors
 */
export const fixMalformedJson = (jsonString: string): string => {
  try {
    if (!jsonString) return jsonString;
    
    // First validate if the string is already valid JSON - if so, return it unmodified
    try {
      JSON.parse(jsonString);
      return jsonString; // Already valid JSON, don't modify it
    } catch (error) {
      // Not valid JSON, continue with fixes
    }
    
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
    
    // Remove comments (//...)
    fixedJson = fixedJson.replace(/\/\/.*$/gm, '');
    
    // Don't try to parse non-JSON content
    if (!fixedJson.includes('{') && !fixedJson.includes('[')) {
      return fixedJson;
    }
    
    // Log original content for debugging
    console.log('Original JSON before fixes:', fixedJson.substring(0, 100) + '...');
    
    // First step: Fix the problematic backslash patterns that are causing the errors
    // This is the most critical fix for the "intent\": \"value" pattern
    fixedJson = fixedJson.replace(/"([^"]+)\\": \\"([^"]+)"/g, '"$1": "$2"');
    
    // Fix incorrect backslash escaping in property names with spaces
    fixedJson = fixedJson.replace(/("[\w\s-]+)\\(":\s*")/g, '$1$2');
    fixedJson = fixedJson.replace(/("[\w\s-]+)\\(":\s*\\?")/g, '$1$2');
    
    // Fix unescaped quotes within string values
    fixedJson = fixedJson.replace(/(?<=([:,]\s*").*?)(?<!\\)"(?=.*?")/g, '\\"');
    
    // Fix missing quotes around property names
    fixedJson = fixedJson.replace(/([{,]\s*)([a-zA-Z0-9_]+)(\s*:)/g, '$1"$2"$3');
    
    // Fix missing commas between array items
    fixedJson = fixedJson.replace(/("(?:\\"|[^"])*")\s+("(?:\\"|[^"])*")/g, '$1, $2');
    
    // Fix missing commas between object properties
    fixedJson = fixedJson.replace(/("(?:\\"|[^"])*")\s*:\s*("(?:\\"|[^"])*"|\{[^}]*\}|\[[^\]]*\]|true|false|null|\d+(?:\.\d+)?)\s+("(?:\\"|[^"])*")/g, '$1: $2, $3');
    
    // Fix missing colons after property names - this is key for the error in question
    fixedJson = fixedJson.replace(/("(?:\\"|[^"])*")(\s+)("(?:\\"|[^"])*"|\{|\[|true|false|null|-?\d+(?:\.\d+)?)/g, '$1: $2$3');
    
    // More aggressive fix for missing commas in nested objects
    fixedJson = fixedJson.replace(/(\}|\])\s+("(?:\\"|[^"])*")/g, '$1, $2');
    
    // Fix missing commas after string literals
    fixedJson = fixedJson.replace(/("(?:\\"|[^"])*")\s+("(?:\\"|[^"])*")/g, '$1, $2');
    
    // Remove trailing commas
    fixedJson = fixedJson.replace(/,(\s*[\}\]])/g, '$1');
    
    // Fix unquoted string values
    fixedJson = fixedJson.replace(/:\s*([a-zA-Z0-9_]+)(\s*[,}])/g, function(match, p1, p2) {
      if (p1 === 'true' || p1 === 'false' || p1 === 'null' || !isNaN(Number(p1))) {
        return ': ' + p1 + p2;
      }
      return ': "' + p1 + '"' + p2;
    });
    
    // Add missing closing braces/brackets
    let openBraces = (fixedJson.match(/{/g) || []).length;
    let closeBraces = (fixedJson.match(/}/g) || []).length;
    let openBrackets = (fixedJson.match(/\[/g) || []).length;
    let closeBrackets = (fixedJson.match(/\]/g) || []).length;
    
    while (openBraces > closeBraces) {
      fixedJson += '}';
      closeBraces++;
    }
    
    while (openBrackets > closeBrackets) {
      fixedJson += ']';
      closeBrackets++;
    }
    
    // Log the fixed JSON for debugging
    console.log('Fixed JSON after processing:', fixedJson.substring(0, 100) + '...');
    
    return fixedJson;
  } catch (error) {
    console.error("Error in JSON fixing:", error);
    return jsonString;
  }
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
    
    // First try direct parsing without any modifications
    try {
      return JSON.parse(jsonString);
    } catch (initialError) {
      // Only proceed with fixes if direct parsing fails
      console.log("Initial JSON parsing failed, attempting fixes:", initialError.message);
    }
    
    // Log parsing attempt
    console.log("Attempting to parse JSON with fixes:", jsonString.substring(0, 150) + "...");
    
    // Apply fixes only when needed
    const fixedJson = fixMalformedJson(jsonString);
    
    try {
      const parsed = JSON.parse(fixedJson);
      console.log("JSON parsed successfully after fixes!");
      return parsed;
    } catch (parseError) {
      console.error("[JSON Parser] Error parsing JSON:", parseError);
      
      // Additional error investigation
      if (parseError instanceof SyntaxError) {
        const errorMsg = parseError.message;
        const positionMatch = errorMsg.match(/position (\d+)/);
        
        if (positionMatch && positionMatch[1]) {
          const position = parseInt(positionMatch[1]);
          const lineNumber = fixedJson.substring(0, position).split('\n').length;
          const lineStart = fixedJson.lastIndexOf('\n', position) + 1;
          const lineEnd = fixedJson.indexOf('\n', position);
          const lineContent = fixedJson.substring(
            lineStart,
            lineEnd > -1 ? lineEnd : fixedJson.length
          );
          const columnInLine = position - lineStart;
          
          console.error(`JSON error at position ${position} (line ${lineNumber} column ${columnInLine})`);
          console.error(`Line content: ${lineContent}`);
          console.error(`Problem character: ${fixedJson.charAt(position)}`);
          
          // For specific errors, attempt more targeted fixes based on the problematic line
          if (lineContent.includes('\\\"')) {
            console.log("Detected escaped quotes issue, attempting specialized fix");
            const specialFixedJson = fixQuotesAndBackslashesInLine(fixedJson, lineStart, lineEnd > -1 ? lineEnd : fixedJson.length);
            try {
              const parsed = JSON.parse(specialFixedJson);
              console.log("JSON parsed successfully after specialized line fix!");
              return parsed;
            } catch (lineFixError) {
              console.error("[JSON Parser] Line-specific fix failed:", lineFixError);
            }
          }
        }
      }
      
      // Try an even more aggressive fix attempt for specific errors like missing colons
      if (parseError.message && parseError.message.includes("Expected ':'")) {
        const emergencyFixedJson = emergencyFixMissingColons(fixedJson);
        try {
          const parsed = JSON.parse(emergencyFixedJson);
          console.log("JSON parsed successfully after emergency fix!");
          return parsed;
        } catch (finalError) {
          console.error("[JSON Parser] Failed after emergency fixes:", finalError);
          
          // Last resort: completely clean problematic characters
          try {
            const aggressiveFixed = aggressiveBackslashFix(emergencyFixedJson);
            return JSON.parse(aggressiveFixed);
          } catch (e) {
            return null;
          }
        }
      }
      
      // Handle specific backslash escape issues
      if (parseError.message && (parseError.message.includes("Unexpected token") || 
                                 parseError.message.includes("Invalid or unexpected token"))) {
        const backslashFixedJson = fixBackslashEscapeIssues(fixedJson);
        try {
          const parsed = JSON.parse(backslashFixedJson);
          console.log("JSON parsed successfully after backslash fix!");
          return parsed;
        } catch (backslashError) {
          console.error("[JSON Parser] Failed after backslash fixes:", backslashError);
          
          // Try a more aggressive backslash fix as a last resort
          const aggressiveFixed = aggressiveBackslashFix(backslashFixedJson);
          try {
            const parsedAggressive = JSON.parse(aggressiveFixed);
            console.log("JSON parsed successfully after aggressive backslash fix!");
            return parsedAggressive;
          } catch (finalError) {
            console.error("[JSON Parser] All fixes failed:", finalError);
            return null;
          }
        }
      }
      
      return null;
    }
  } catch (error) {
    console.error("[JSON Parser] Unexpected error:", error);
    return null;
  }
};

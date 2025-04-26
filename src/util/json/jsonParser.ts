/**
 * Core JSON parsing and validation utilities
 */

/**
 * Check if a string is valid JSON
 */
export const isValidJson = (text: string): boolean => {
  try {
    // Quick check to avoid unnecessary parsing attempts
    if (!text || typeof text !== 'string') return false;
    
    // Simple heuristic - JSON objects/arrays must start with { or [
    const trimmed = text.trim();
    if (!(trimmed.startsWith('{') || trimmed.startsWith('['))) {
      return false;
    }
    
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
  // First remove all backslashes
  let result = jsonString.replace(/\\/g, '');
  
  // Then properly re-escape property name quotes
  result = result.replace(/({|,)\s*"([^"]+)"\s*:/g, (match, prefix, propName) => {
    return `${prefix}"${propName}":`;
  });
  
  // Ensure string values have proper quotes
  result = result.replace(/:\s*"([^"]*)"/g, (match, value) => {
    return `: "${value.replace(/"/g, '\\"')}"`;
  });
  
  return result;
};

/**
 * Fix issues with backslash escaping in JSON strings
 */
export const fixBackslashEscapeIssues = (jsonString: string): string => {
  return jsonString
    // Fix common backslash escape issues
    .replace(/\\"/g, '"')  // First remove escaped quotes
    .replace(/(?<!")(")((?=.*:))/g, '\\"')  // Then properly escape property name quotes
    .replace(/(?<=:\s*").*?(?<!\\)"(?=.*")/g, (match) => match.replace(/"/g, '\\"'));  // Fix unescaped quotes in values
};

/**
 * Special emergency fix for missing colons after property names
 */
export const emergencyFixMissingColons = (jsonString: string): string => {
  // Find property name patterns without colons
  return jsonString.replace(/("[\w\s]+")\s+("[\w\s]+"|\{|\[)/g, '$1: $2');
};

/**
 * Fix quotes and backslashes in a specific line of JSON
 */
export const fixQuotesAndBackslashesInLine = (json: string, lineStart: number, lineEnd: number): string => {
  const beforeLine = json.substring(0, lineStart);
  const line = json.substring(lineStart, lineEnd);
  const afterLine = json.substring(lineEnd);
  
  // Fix common backslash and quote issues in the problematic line
  let fixedLine = line
    // Fix escaped quotes that shouldn't be escaped (common in malformed JSON)
    .replace(/\\"/g, '"')
    // Then properly escape any quotes that need it
    .replace(/(?<!")(")((?=.*:))/, '\\"')
    // Fix double backslashes
    .replace(/\\\\/g, '\\')
    // Fix any remaining unescaped quotes in string values
    .replace(/(?<=:\s*").*?(?<!\\)"(?=.*")/g, (match) => match.replace(/"/g, '\\"'));
  
  return beforeLine + fixedLine + afterLine;
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
    
    // Improved check for non-JSON content
    const trimmed = jsonString.trim();
    if (!trimmed.startsWith('{') && !trimmed.startsWith('[')) {
      console.log("[JSON Parser] Input doesn't appear to be JSON:", trimmed.substring(0, 50) + "...");
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
        console.log("Detected missing colons, attempting fix");
        const emergencyFixedJson = emergencyFixMissingColons(fixedJson);
        try {
          const parsed = JSON.parse(emergencyFixedJson);
          console.log("JSON parsed successfully after emergency fix!");
          return parsed;
        } catch (finalError) {
          console.error("[JSON Parser] Failed after emergency fixes:", finalError);
        }
      }
      
      // Handle specific backslash escape issues
      if (parseError.message && (parseError.message.includes("Unexpected token") || 
                                 parseError.message.includes("Invalid or unexpected token"))) {
        console.log("Detected backslash escape issues, attempting fix");
        const backslashFixedJson = fixBackslashEscapeIssues(fixedJson);
        try {
          const parsed = JSON.parse(backslashFixedJson);
          console.log("JSON parsed successfully after backslash fix!");
          return parsed;
        } catch (backslashError) {
          console.error("[JSON Parser] Failed after backslash fixes:", backslashError);
        }
      }
      
      // Try with aggressive backslash fix as a last resort
      console.log("Attempting aggressive backslash fix as last resort");
      const aggressiveFixed = aggressiveBackslashFix(fixedJson);
      try {
        const parsedAggressive = JSON.parse(aggressiveFixed);
        console.log("JSON parsed successfully after aggressive backslash fix!");
        return parsedAggressive;
      } catch (finalError) {
        console.error("[JSON Parser] All standard fixes failed:", finalError);
      }
      
      // LAST RESORT: Try to create a minimal valid structure from the JSON
      try {
        console.log("Attempting to extract a minimal valid JSON structure");
        // Look for any valid-looking object structures
        const objectRegex = /{[^{]*?}/g;
        const matches = fixedJson.match(objectRegex);
        
        if (matches && matches.length > 0) {
          // Try each match, starting with the largest (most likely complete)
          const sortedMatches = [...matches].sort((a, b) => b.length - a.length);
          
          for (const match of sortedMatches) {
            try {
              const parsed = JSON.parse(match);
              console.log("Successfully parsed a partial JSON object!");
              
              // If this is just a fragment, try to reconstruct the full structure
              if (!parsed.intent_analysis && !parsed.execution_plan) {
                // Create a structured object with the parsed fragment
                const reconstructed: any = {};
                
                // Try to determine what kind of fragment this is
                if (parsed.primary_goal || parsed.request_understanding) {
                  reconstructed.intent_analysis = parsed;
                } else if (parsed.steps) {
                  reconstructed.execution_plan = parsed;
                } else if (typeof parsed === 'string' || 
                          (parsed.text && typeof parsed.text === 'string')) {
                  reconstructed.response = typeof parsed === 'string' ? parsed : parsed.text;
                }
                
                if (Object.keys(reconstructed).length > 0) {
                  console.log("Reconstructed a partial JSON structure");
                  return reconstructed;
                }
              }
              
              return parsed;
            } catch (matchError) {
              // Continue to the next match
            }
          }
        }
        
        // If no valid JSON objects found, look for key patterns and create a synthetic structure
        console.log("No valid JSON objects found, creating synthetic structure");
        if (fixedJson.includes('"intent_analysis"') || 
            fixedJson.includes('"execution_plan"') || 
            fixedJson.includes('"primary_goal"') || 
            fixedJson.includes('"response"')) {
          
          const syntheticJson: any = {};
          
          // Try to extract intent_analysis
          if (fixedJson.includes('"intent_analysis"') || fixedJson.includes('"primary_goal"')) {
            syntheticJson.intent_analysis = {
              request_understanding: {
                primary_goal: "general_chat"
              }
            };
          }
          
          // Try to extract execution_plan
          if (fixedJson.includes('"execution_plan"') || fixedJson.includes('"steps"')) {
            syntheticJson.execution_plan = {
              steps: [{
                mcp: "TextUnderstandingMCP",
                action: "respond",
                synthetic: true
              }]
            };
          }
          
          // Extract any text that looks like a response
          const responseMatch = fixedJson.match(/"response"\s*:\s*"([^"]+)"/);
          if (responseMatch && responseMatch[1]) {
            syntheticJson.response = responseMatch[1];
          }
          
          console.log("Created synthetic JSON structure from fragments");
          return syntheticJson;
        }
      } catch (extractError) {
        console.error("[JSON Parser] Reconstruction attempt failed:", extractError);
      }
      
      return null;
    }
  } catch (error) {
    console.error("[JSON Parser] Unexpected error:", error);
    return null;
  }
};

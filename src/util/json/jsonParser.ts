
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
 * Safely parse JSON with error handling
 */
export const safeJsonParse = (jsonString: string): any => {
  try {
    if (!jsonString) return null;
    
    // Don't try to parse non-JSON content
    if (!jsonString.includes('{') && !jsonString.includes('[')) {
      return null;
    }
    
    // Log parsing attempt
    console.log("Attempting to parse JSON:", jsonString.substring(0, 150) + "...");
    
    // First try to fix any potential issues with the JSON
    const fixedJson = fixMalformedJson(jsonString);
    
    try {
      const parsed = JSON.parse(fixedJson);
      console.log("JSON parsed successfully!");
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
        }
      }
      
      return null;
    }
  } catch (error) {
    console.error("[JSON Parser] Unexpected error:", error);
    return null;
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
    
    // Remove comments (//...)
    fixedJson = fixedJson.replace(/\/\/.*$/gm, '');
    
    // Don't try to parse non-JSON content
    if (!fixedJson.includes('{') && !fixedJson.includes('[')) {
      return fixedJson;
    }
    
    // Log original content for debugging
    console.log('Original JSON before fixes:', fixedJson.substring(0, 100) + '...');
    
    // Fix unescaped quotes within string values
    fixedJson = fixedJson.replace(/(?<=([:,]\s*").*?)(?<!\\)"(?=.*?")/g, '\\"');
    
    // Fix missing quotes around property names
    fixedJson = fixedJson.replace(/([{,]\s*)([a-zA-Z0-9_]+)(\s*:)/g, '$1"$2"$3');
    
    // Fix missing commas between array items
    fixedJson = fixedJson.replace(/("(?:\\"|[^"])*")\s+("(?:\\"|[^"])*")/g, '$1, $2');
    
    // Fix missing commas between object properties
    fixedJson = fixedJson.replace(/("(?:\\"|[^"])*")\s*:\s*("(?:\\"|[^"])*"|\{[^}]*\}|\[[^\]]*\]|true|false|null|\d+(?:\.\d+)?)\s+("(?:\\"|[^"])*")/g, '$1: $2, $3');
    
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
    
    return fixedJson;
  } catch (error) {
    console.error("Error in JSON fixing:", error);
    return jsonString;
  }
};

/**
 * Main exports file for formatting utilities
 * @deprecated This file is kept for backward compatibility.
 * Please import directly from the specific utility files.
 */

// 重新导出其他模块的内容
export * from './json/jsonParser';
export * from './json/jsonExtractor';
export * from './json/responseFormatter';

// 导出本文件中定义的函数
export {
  isValidJson,
  safeJsonParse,
  cleanJsonString,
  fixMalformedJson,
  hasModalStructure,
  getResponseFromModalJson,
  isAIOProtocolMessage,
  isPlainTextWithUrls,
  formatProtocolMetadata,
  extractResponseFromRawJson,
  removeJsonComments,
  aggressiveBackslashFix
};

// Check if a string is valid JSON
export function isValidJson(str: string): boolean {
  try {
    JSON.parse(str);
    return true;
  } catch (e) {
    return false;
  }
}

// Safely parse JSON with fallback
export function safeJsonParse(str: string): any {
  if (!str) return null;
  
  // 1. 首先尝试直接解析
  try {
    return JSON.parse(str);
  } catch (e) {
    console.log("[safeJsonParse] Direct parse failed, trying alternatives");
  }
  
  // 2. 处理代码块中的 JSON
  let content = str;
  if (content.includes('```json')) {
    const parts = content.split('```json');
    if (parts.length > 1) {
      content = parts[1].split('```')[0].trim();
      console.log("[safeJsonParse] Extracted JSON from ```json block:", content);
    }
  } else if (content.includes('```')) {
    const parts = content.split('```');
    if (parts.length > 1) {
      content = parts[1].trim();
      console.log("[safeJsonParse] Extracted JSON from ``` block:", content);
    }
  }
  
  // 3. 移除注释
  content = removeJsonComments(content);
  console.log("[safeJsonParse] After removing comments:", content);
  
  // 4. 清理 JSON 字符串
  content = cleanJsonString(content);
  console.log("[safeJsonParse] After cleaning:", content);
  
  // 5. 尝试修复格式
  content = fixMalformedJson(content);
  console.log("[safeJsonParse] After fixing format:", content);
  
  // 6. 再次尝试解析
  try {
    return JSON.parse(content);
  } catch (e) {
    console.log("[safeJsonParse] Parse after cleaning failed:", e);
  }
  
  // 7. 最后尝试使用 eval（仅在受控环境中）
  try {
    // 确保字符串是有效的 JSON 格式
    if (content.trim().startsWith('{') && content.trim().endsWith('}')) {
      return eval(`(${content})`);
    }
  } catch (e) {
    console.log("[safeJsonParse] Final eval attempt failed:", e);
  }
  
  return null;
}

// Clean JSON string by removing common issues
export function cleanJsonString(jsonStr: string): string {
  // Replace single quotes with double quotes
  let cleaned = jsonStr.replace(/'/g, '"');
  
  // Fix keys without quotes
  cleaned = cleaned.replace(/(\w+):/g, '"$1":');
  
  // Remove trailing commas
  cleaned = cleaned.replace(/,\s*([}\]])/g, '$1');
  
  return cleaned;
}

// Try to fix malformed JSON
export function fixMalformedJson(str: string): string {
  // First, try to clean the string
  let cleaned = cleanJsonString(str);
  
  // Check if it's valid now
  if (isValidJson(cleaned)) {
    return cleaned;
  }
  
  // If not valid, try more aggressive fixing
  try {
    // Remove any characters before the first {
    const jsonStartIndex = str.indexOf('{');
    if (jsonStartIndex > 0) {
      cleaned = str.substring(jsonStartIndex);
    }
    
    // Remove any characters after the last }
    const jsonEndIndex = cleaned.lastIndexOf('}');
    if (jsonEndIndex > 0 && jsonEndIndex < cleaned.length - 1) {
      cleaned = cleaned.substring(0, jsonEndIndex + 1);
    }
    
    // Clean the result
    return cleanJsonString(cleaned);
  } catch (e) {
    return str; // Return original if all attempts fail
  }
}

// Check if JSON has modal structure (intent_analysis, etc.)
export function hasModalStructure(json: any): boolean {
  if (!json || typeof json !== 'object') {
    return false;
  }
  
  // Check for common modal structure fields
  return (
    json.intent_analysis !== undefined ||
    json.execution_plan !== undefined ||
    json.request_understanding !== undefined ||
    json.response !== undefined
  );
}

// Extract the response field from modal JSON
export function getResponseFromModalJson(json: any): string | null {
  if (!json || typeof json !== 'object') {
    return null;
  }
  
  if (json.response && typeof json.response === 'string') {
    return json.response;
  }
  
  if (json.completion && typeof json.completion === 'string') {
    return json.completion;
  }
  
  if (json.answer && typeof json.answer === 'string') {
    return json.answer;
  }
  
  return null;
}

// Check if an AIMessage is from the AIO protocol system
export function isAIOProtocolMessage(message: any): boolean {
  if (!message) {
    return false;
  }
  
  return (
    message.id?.startsWith('aio-protocol-') || 
    !!message.metadata?.protocolContext
  );
}

// Detect if content is plain text with URLs (to bypass JSON formatting)
export function isPlainTextWithUrls(content: string): boolean {
  if (!content || typeof content !== 'string') return false;
  
  // Check for URLs using a regex pattern
  const urlPattern = /(https?:\/\/[^\s]+)/g;
  const hasUrls = urlPattern.test(content);
  
  // Check if content lacks JSON structure indicators
  const hasJsonIndicators = (
    content.includes('```json') ||
    content.trim().startsWith('{') ||
    content.includes('"intent_analysis"') ||
    content.includes('"execution_plan"') ||
    content.includes('**Analysis:**')
  );
  
  return hasUrls && !hasJsonIndicators;
}

// Format protocol metadata for display
export function formatProtocolMetadata(metadata: any): string {
  if (!metadata?.protocolContext) {
    return '';
  }
  
  const { 
    contextId, 
    step, 
    operationKeywords, 
    isComplete, 
    operation, 
    mcp, 
    isFinalResponse 
  } = metadata.protocolContext;
  
  let display = `Protocol ID: ${contextId?.substring(0, 8) || 'Unknown'}\n`;
  
  if (operationKeywords && Array.isArray(operationKeywords)) {
    display += `Operations: ${operationKeywords.join(' → ')}\n`;
  }
  
  display += `Step: ${step || 0}${isComplete ? ' (Complete)' : ''}\n`;
  
  if (operation) {
    display += `Current Operation: ${operation}\n`;
  }
  
  if (mcp) {
    display += `Current MCP: ${mcp}\n`;
  }
  
  if (isFinalResponse) {
    display += `Final Response: Yes\n`;
  }
  
  return display;
}

// Extract response value from raw JSON string (specialized for dialog display)
export function extractResponseFromRawJson(jsonStr: string): string | null {
  if (!jsonStr || typeof jsonStr !== 'string') return null;
  
  // If the content is formatted with backticks (like ```json { ... } ```)
  if (jsonStr.includes('```')) {
    try {
      const parts = jsonStr.split('```');
      // Find the part that contains JSON
      for (const part of parts) {
        const trimmed = part.trim();
        if (trimmed.startsWith('{') && trimmed.includes('"response"')) {
          // Try to parse this part
          const parsed = safeJsonParse(trimmed);
          if (parsed && typeof parsed.response === 'string') {
            return parsed.response;
          }
        }
      }
    } catch (e) {
      // If extraction fails, try other methods
    }
  }
  
  // Try direct extraction
  try {
    // First try to clean the JSON
    const cleaned = cleanJsonString(jsonStr);
    // Then try to parse
    const parsed = safeJsonParse(cleaned);
    if (parsed && typeof parsed.response === 'string') {
      return parsed.response;
    }
  } catch (e) {
    // If parsing fails, try regex extraction
  }
  
  // Use regex extraction as a fallback
  const responseRegex = /"response"\s*:\s*"([^"]+)"/;
  const match = jsonStr.match(responseRegex);
  if (match && match[1]) {
    return match[1];
  }
  
  return null;
}

/**
 * Removes JavaScript-style comments from JSON strings
 * Handles both single-line and multi-line comments
 */
export function removeJsonComments(jsonString: string): string {
  if (!jsonString || typeof jsonString !== 'string') return jsonString;
  
  let inString = false;
  let escaped = false;
  let result = '';
  let i = 0;
  
  while (i < jsonString.length) {
    const current = jsonString[i];
    const next = i < jsonString.length - 1 ? jsonString[i + 1] : '';
    
    // Handle string literals
    if (current === '"' && !escaped) {
      inString = !inString;
      result += current;
      i++;
      continue;
    }
    
    // Handle escape character
    if (current === '\\' && !escaped) {
      escaped = true;
      result += current;
      i++;
      continue;
    } else {
      escaped = false;
    }
    
    // Skip comments (only when not inside a string)
    if (!inString && current === '/' && next === '/') {
      // Single-line comment
      i += 2; // Skip the "//"
      while (i < jsonString.length && jsonString[i] !== '\n') {
        i++;
      }
      // Add a space to replace the comment
      result += ' ';
      continue;
    }
    
    if (!inString && current === '/' && next === '*') {
      // Multi-line comment
      i += 2; // Skip the "/*"
      while (i < jsonString.length && !(jsonString[i] === '*' && jsonString[i + 1] === '/')) {
        i++;
      }
      if (i < jsonString.length) {
        i += 2; // Skip the "*/"
      }
      // Add a space to replace the comment
      result += ' ';
      continue;
    }
    
    // Add current character to result
    result += current;
    i++;
  }
  
  return result;
}

/**
 * Aggressively fixes backslash issues in JSON strings
 * This handles escaped characters, unicode sequences, and other backslash problems
 */
export function aggressiveBackslashFix(jsonString: string): string {
  if (!jsonString || typeof jsonString !== 'string') return jsonString;
  
  try {
    // First pass - replace any illegal escapes with double backslashes
    let fixed = jsonString.replace(/\\([^"\\\/bfnrtu])/g, '\\\\$1');
    
    // Fix unicode escapes that are malformed
    fixed = fixed.replace(/\\u([0-9a-fA-F]{0,3})(?![0-9a-fA-F])/g, '\\u0000');
    
    // Fix control characters that should be escaped
    fixed = fixed.replace(/[\n]/g, '\\n')
                 .replace(/[\r]/g, '\\r')
                 .replace(/[\t]/g, '\\t');
    
    return fixed;
  } catch (error) {
    console.error("[formatters] Error in aggressiveBackslashFix:", error);
    return jsonString; // Return original if fixing fails
  }
}

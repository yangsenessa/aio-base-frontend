/**
 * Main exports file for formatting utilities
 * @deprecated This file is kept for backward compatibility.
 * Please import directly from the specific utility files.
 */

export * from './json/jsonParser';
export * from './json/jsonExtractor';
export * from './json/responseFormatter';

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
export function safeJsonParse(str: string, fallback: any = null): any {
  try {
    return JSON.parse(str);
  } catch (e) {
    return fallback;
  }
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
    } catch (error) {
      console.warn('Failed to extract response from backtick content:', error);
    }
  }
  
  // If it's a plain JSON string
  if (jsonStr.trim().startsWith('{')) {
    try {
      const parsed = safeJsonParse(jsonStr);
      if (parsed && typeof parsed.response === 'string') {
        return parsed.response;
      }
    } catch (error) {
      console.warn('Failed to extract response from JSON string:', error);
    }
  }
  
  // If it has a response field but couldn't be parsed, try regex
  if (jsonStr.includes('"response"')) {
    try {
      const responseRegex = /"response"\s*:\s*"([^"]+)"/;
      const matches = jsonStr.match(responseRegex);
      if (matches && matches[1]) {
        return matches[1];
      }
    } catch (regexError) {
      console.warn('Regex extraction failed:', regexError);
    }
  }
  
  return null;
}

import { safeJsonParse } from './jsonParser';
import { cleanJsonString, extractJsonFromMarkdownSections } from './jsonExtractor';
import { fixBackslashEscapeIssues, aggressiveBackslashFix, fixMalformedJson } from './jsonParser';

/**
 * Process AI response content to extract the response field if available
 */
export const processAIResponseContent = (content: string): string => {
  // Check for direct response content first
  const directResponse = extractResponseFromJson(content);
  if (directResponse) {
    return directResponse;
  }
  
  // Default fallback if no specific processing is needed
  return content;
};

/**
 * Extract response field from JSON content
 */
export const extractResponseFromJson = (jsonStr: string): string | null => {
  try {
    if (!jsonStr) return null;
    
    // Additional safety check before parsing
    if (typeof jsonStr !== 'string') {
      console.error("[Response Extraction] Expected string but got:", typeof jsonStr);
      return null;
    }
    
    // Detect plain text with URLs and return immediately
    if ((jsonStr.includes('http://') || jsonStr.includes('https://')) &&
        !jsonStr.includes('```') &&
        !jsonStr.trim().startsWith('{')) {
      console.log("[Response Extraction] Detected plain text with URLs, returning as is");
      return jsonStr;
    }
    
    // First check for markdown-style response section
    if (jsonStr.includes("**Response:**")) {
      const parts = jsonStr.split("**Response:**");
      if (parts.length > 1) {
        return parts[1].trim();
      }
    }
    
    // Don't proceed with JSON parsing if content is clearly plain text
    const trimmed = jsonStr.trim();
    if (!trimmed.startsWith('{') && !trimmed.includes('```json')) {
      console.log("[Response Extraction] Content appears to be plain text");
      return jsonStr;
    }
    
    // Try to parse as JSON directly first without any modifications
    try {
      const parsed = JSON.parse(jsonStr);
      if (parsed.response && typeof parsed.response === 'string') {
        return parsed.response;
      }
      
      // Check for nested response in AIO protocol structure
      if (parsed.intent_analysis || parsed.execution_plan) {
        return getResponseFromModalJson(parsed) || null;
      }
    } catch (initialError) {
      // Only proceed with fixes if direct parsing fails
      console.log("[Response Extraction] Initial JSON parsing failed, attempting fixes");
    }
    
    // Try to parse as JSON with enhanced error handling
    try {
      console.log("[Response Extraction] Attempting to parse JSON response");
      
      // Parse with safe method that applies fixes only when needed
      const parsed = safeJsonParse(jsonStr);
      if (parsed) {
        if (parsed.response && typeof parsed.response === 'string') {
          console.log("[Response Extraction] Found direct response field");
          return parsed.response;
        }
        
        // Check for nested response in AIO protocol structure
        if (parsed.intent_analysis || parsed.execution_plan) {
          return getResponseFromModalJson(parsed) || null;
        }
      }
      
      return null;
    } catch (error) {
      console.error("[Response Extraction] JSON parsing failed:", error);
      return null;
    }
  } catch (error) {
    console.error("[Response Extraction] Unexpected error:", error);
    return null;
  }
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
  
  // Check for AIO protocol structure (new format from the example)
  const hasIntentAnalysis = obj.intent_analysis || 
    (typeof obj === 'object' && Object.keys(obj).some(key => 
      key.includes('intent') || 
      key.includes('analysis') || 
      key === 'request_understanding' || 
      key === 'modality_analysis' || 
      key === 'capability_mapping' ||
      key === 'primary_goal' ||
      key === 'tasks'
    ));
  
  const hasExecutionPlan = obj.execution_plan || 
    (typeof obj === 'object' && Object.keys(obj).some(key => 
      key.includes('execution') || 
      key.includes('plan') || 
      key.includes('steps') ||
      key === 'quality_metrics'
    ));
  
  return hasIntentAnalysis || hasExecutionPlan;
};

/**
 * Extract the response string from a modal-structured JSON object
 */
export const getResponseFromModalJson = (jsonObj: any): string | null => {
  if (!jsonObj) return null;
  
  // Log the structure for better debugging
  console.log("Processing JSON object structure:", 
    Object.keys(jsonObj).length > 0 ? Object.keys(jsonObj) : "empty object");
  
  // Direct response field
  if (jsonObj.response && typeof jsonObj.response === 'string') {
    console.log("Found direct response field");
    return jsonObj.response;
  }
  
  // Check inside execution_plan
  if (jsonObj.execution_plan?.response) {
    console.log("Found response in execution_plan");
    return jsonObj.execution_plan.response;
  }
  
  // Check inside intent_analysis
  if (jsonObj.intent_analysis?.response) {
    console.log("Found response in intent_analysis");
    return jsonObj.intent_analysis.response;
  }
  
  // Check for the new AIO protocol structure fields
  if (jsonObj.intent_analysis?.request_understanding?.primary_goal) {
    console.log("Found primary_goal in request_understanding");
    return `I understand your goal: ${jsonObj.intent_analysis.request_understanding.primary_goal}. How can I help you further with this?`;
  }
  
  // Check nested inside intent_analysis objects
  if (jsonObj.intent_analysis) {
    console.log("Checking nested intent_analysis fields");
    const keys = Object.keys(jsonObj.intent_analysis);
    for (const key of keys) {
      if (typeof jsonObj.intent_analysis[key] === 'object' && 
          jsonObj.intent_analysis[key]?.response) {
        console.log(`Found response in intent_analysis.${key}`);
        return jsonObj.intent_analysis[key].response;
      }
    }
  }
  
  console.log("No response field found in structured data");
  return null;
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

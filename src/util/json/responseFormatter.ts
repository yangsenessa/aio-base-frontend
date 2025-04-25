
import { safeJsonParse } from './jsonParser';
import { cleanJsonString, extractJsonFromMarkdownSections } from './jsonExtractor';

/**
 * Process AI response content to extract the response field if available
 */
export const processAIResponseContent = (content: string): string => {
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
    
    try {
      const parsed = JSON.parse(jsonStr);
      return parsed.response || null;
    } catch (error) {
      console.error("[Response Extraction] Error parsing JSON:", error);
      
      // Try fixing the JSON and parse again
      try {
        const parsed = safeJsonParse(jsonStr);
        return parsed?.response || null;
      } catch (innerError) {
        console.error("[Response Extraction] Error parsing fixed JSON:", innerError);
        return null;
      }
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

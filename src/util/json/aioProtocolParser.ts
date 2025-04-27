
/**
 * AIO Protocol JSON Parser
 * Specialized utility for handling AIO protocol JSON responses
 */

import { 
  cleanJsonString, 
  fixMalformedJson, 
  safeJsonParse, 
  removeJsonComments 
} from './jsonParser';

/**
 * Parse AIO Protocol JSON with multiple fallback methods
 */
export const parseAIOProtocolJSON = (content: string): any | null => {
  if (!content || typeof content !== 'string') {
    console.log('[AIO Parser] Invalid input content');
    return null;
  }

  // Trim and prepare the content
  let preparedContent = content.trim();
  
  // Remove markdown code block markers
  if (preparedContent.startsWith('```json')) {
    preparedContent = preparedContent.substring(7);
  } else if (preparedContent.startsWith('```')) {
    preparedContent = preparedContent.substring(3);
  }
  
  if (preparedContent.endsWith('```')) {
    preparedContent = preparedContent.substring(0, preparedContent.length - 3);
  }
  
  preparedContent = preparedContent.trim();
  
  // Try a direct parse first
  try {
    const directResult = JSON.parse(preparedContent);
    console.log('[AIO Parser] Direct JSON parsing successful');
    return directResult;
  } catch (directError) {
    console.log('[AIO Parser] Direct JSON parsing failed, trying with enhanced methods');
  }
  
  // Clean the JSON string
  const cleanedContent = cleanJsonString(preparedContent);
  
  // Try parsing cleaned content
  try {
    const result = JSON.parse(cleanedContent);
    console.log('[AIO Parser] Cleaned JSON parsing successful');
    return result;
  } catch (cleanError) {
    console.log('[AIO Parser] Cleaned JSON parsing failed, applying more robust fixes');
  }
  
  // Apply more aggressive fixes
  const fixedContent = fixMalformedJson(cleanedContent);
  
  // Try with fixed content
  try {
    const result = JSON.parse(fixedContent);
    console.log('[AIO Parser] Fixed JSON parsing successful');
    return result;
  } catch (fixError) {
    console.log('[AIO Parser] Fixed JSON parsing failed', fixError);
  }
  
  // Last attempt with our most robust parser
  try {
    const result = safeJsonParse(preparedContent);
    if (result) {
      console.log('[AIO Parser] Safe parse successful');
      return result;
    }
  } catch (safeError) {
    console.log('[AIO Parser] All parsing methods failed', safeError);
  }
  
  // Focus on extracting just what we need if full parsing fails
  return extractPartialData(preparedContent);
};

/**
 * Extract key fields even if full JSON parsing fails
 */
const extractPartialData = (content: string): any => {
  const result: any = {
    intent_analysis: {},
    execution_plan: { steps: [] },
    response: null
  };
  
  // Extract response field using regex
  const responseMatch = content.match(/"response"\s*:\s*"([^"]+)"/);
  if (responseMatch && responseMatch[1]) {
    result.response = responseMatch[1];
  }
  
  // Detect video creation intent
  if (content.includes('"primary_goal"') && content.includes('"create_video"')) {
    result.intent_analysis.request_understanding = {
      primary_goal: "create_video"
    };
    
    if (!result.response) {
      result.response = "Processing video creation request. Please use the Execute button if you wish to proceed.";
    }
    
    // Add minimal execution plan for video creation
    result.execution_plan = {
      steps: [
        {
          mcp: "VideoGenerationMCP",
          action: "create_video",
          synthetic: true,
          simplified: true
        }
      ]
    };
  }
  
  console.log('[AIO Parser] Extracted partial data through pattern matching');
  return result;
};

/**
 * Check if content likely contains AIO Protocol JSON
 */
export const isLikelyAIOProtocolJSON = (content: string): boolean => {
  if (!content || typeof content !== 'string') return false;
  
  const lowerContent = content.toLowerCase();
  
  // Check for key structural indicators
  const hasIntent = lowerContent.includes('"intent_analysis"') || 
                   lowerContent.includes('"request_understanding"');
  
  const hasExecution = lowerContent.includes('"execution_plan"') || 
                      lowerContent.includes('"steps"');
  
  const hasResponse = lowerContent.includes('"response"');
  
  // Check for video creation pattern specifically
  const hasVideoCreation = lowerContent.includes('"create_video"') || 
                          lowerContent.includes('"video_generation"');
  
  return (hasIntent && hasResponse) || 
         (hasExecution && hasResponse) || 
         hasVideoCreation;
};

/**
 * Extract execution plan safely from content
 */
export const extractExecutionPlan = (content: string): any => {
  const parsed = parseAIOProtocolJSON(content);
  
  if (!parsed) return null;
  
  return parsed.execution_plan || null;
};

/**
 * Extract intent analysis safely from content
 */
export const extractIntentAnalysis = (content: string): any => {
  const parsed = parseAIOProtocolJSON(content);
  
  if (!parsed) return null;
  
  return parsed.intent_analysis || null;
};

/**
 * Extract response text safely from content
 */
export const extractResponseText = (content: string): string | null => {
  const parsed = parseAIOProtocolJSON(content);
  
  if (!parsed) return null;
  
  return parsed.response || null;
};

/**
 * Simplified check for video creation pattern in content
 */
export const isVideoCreationRequest = (content: string): boolean => {
  if (!content) return false;
  
  return content.includes('"primary_goal"') && 
         content.includes('"create_video"');
};

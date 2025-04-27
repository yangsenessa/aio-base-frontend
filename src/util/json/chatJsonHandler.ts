
/**
 * Chat JSON Handler
 * Specialized utility for handling JSON content in chat contexts
 */

import { parseAIOProtocolJSON, isLikelyAIOProtocolJSON } from './aioProtocolParser';
import { cleanJsonString, fixMalformedJson, safeJsonParse } from './jsonParser';
import { extractJsonFromCodeBlock } from './codeBlockExtractor';

interface ChatJsonResult {
  success: boolean;
  intent_analysis?: any;
  execution_plan?: any;
  response?: string;
  error?: string;
}

/**
 * Extract JSON content from chat messages with robust error handling
 * @param content The message content to process
 * @returns Structured data extracted from the message
 */
export const extractJsonFromChatMessage = (content: string): ChatJsonResult => {
  if (!content) {
    return { 
      success: false, 
      error: 'No content provided' 
    };
  }
  
  console.log(`[Chat JSON] Processing message: ${content.substring(0, 50)}...`);
  
  // Step 1: Special handling for video creation
  if (content.includes('"primary_goal": "create_video"')) {
    console.log('[Chat JSON] Detected video creation intent, using simplified parsing');
    return {
      success: true,
      intent_analysis: {
        request_understanding: {
          primary_goal: "create_video"
        }
      },
      execution_plan: {
        steps: [{
          mcp: "VideoGenerationMCP",
          action: "create_video",
          simplified: true
        }]
      },
      response: "Processing video creation request. Please use the Execute button if you wish to proceed."
    };
  }
  
  // Step 2: Handle markdown code blocks
  if (content.includes('```json') || content.includes('```')) {
    try {
      const extractedJson = extractJsonFromCodeBlock(content);
      if (extractedJson) {
        // Attempt to parse the extracted JSON
        try {
          const parsed = JSON.parse(extractedJson);
          console.log('[Chat JSON] Successfully parsed JSON from code block');
          return {
            success: true,
            intent_analysis: parsed.intent_analysis,
            execution_plan: parsed.execution_plan,
            response: parsed.response
          };
        } catch (parseError) {
          console.log('[Chat JSON] Error parsing JSON from code block, will try with fixers');
        }
      }
    } catch (extractError) {
      console.log('[Chat JSON] Error extracting JSON from code block', extractError);
    }
  }
  
  // Step 3: Try our specialized AIO protocol parser
  if (isLikelyAIOProtocolJSON(content)) {
    try {
      const result = parseAIOProtocolJSON(content);
      if (result) {
        console.log('[Chat JSON] Successfully parsed using AIO protocol parser');
        return {
          success: true,
          intent_analysis: result.intent_analysis,
          execution_plan: result.execution_plan,
          response: result.response
        };
      }
    } catch (aioError) {
      console.log('[Chat JSON] Error using AIO protocol parser', aioError);
    }
  }
  
  // Step 4: Try our regular JSON parsing pipeline with fixers
  try {
    // First clean the content
    const cleanedContent = cleanJsonString(content);
    
    // Then fix any malformed parts
    const fixedContent = fixMalformedJson(cleanedContent);
    
    // Try to parse with our safe parser
    const result = safeJsonParse(fixedContent);
    if (result) {
      console.log('[Chat JSON] Successfully parsed using JSON pipeline');
      return {
        success: true,
        intent_analysis: result.intent_analysis,
        execution_plan: result.execution_plan,
        response: result.response
      };
    }
  } catch (jsonError) {
    console.log('[Chat JSON] Error in JSON parsing pipeline', jsonError);
  }
  
  // Step 5: Try looking for a direct response with regex
  if (content.includes('"response"')) {
    try {
      const responseMatch = content.match(/"response"\s*:\s*"([^"]+)"/);
      if (responseMatch && responseMatch[1]) {
        console.log('[Chat JSON] Extracted response using regex');
        return {
          success: true,
          response: responseMatch[1]
        };
      }
    } catch (regexError) {
      console.log('[Chat JSON] Error extracting response with regex', regexError);
    }
  }
  
  // Step 6: Check if this is plain text
  if (!content.includes('{') && !content.includes('}')) {
    console.log('[Chat JSON] Content appears to be plain text');
    return {
      success: true,
      response: content
    };
  }
  
  // If we reach here, all parsing attempts failed
  console.log('[Chat JSON] All parsing methods failed');
  return {
    success: false,
    error: 'Failed to parse JSON content',
    response: content // Return original content as fallback
  };
};

/**
 * Extract execution plan from chat message
 */
export const extractExecutionPlanFromChat = (content: string): any => {
  const result = extractJsonFromChatMessage(content);
  return result.success ? result.execution_plan : null;
};

/**
 * Extract intent analysis from chat message
 */
export const extractIntentAnalysisFromChat = (content: string): any => {
  const result = extractJsonFromChatMessage(content);
  return result.success ? result.intent_analysis : null;
};

/**
 * Extract response from chat message
 */
export const extractResponseFromChat = (content: string): string => {
  const result = extractJsonFromChatMessage(content);
  return result.response || content;
};

/**
 * Simplified function to check if content is likely JSON
 */
export const isLikelyJson = (content: string): boolean => {
  if (!content) return false;
  
  // Check for obvious JSON markers
  const hasJsonMarkers = content.includes('{') && content.includes('}');
  
  // Check for code blocks
  const hasCodeBlock = content.includes('```json') || content.includes('```');
  
  // Check for common field patterns
  const hasCommonFields = content.includes('"intent_analysis"') || 
                         content.includes('"execution_plan"') || 
                         content.includes('"response"');
  
  return hasJsonMarkers && (hasCodeBlock || hasCommonFields);
};

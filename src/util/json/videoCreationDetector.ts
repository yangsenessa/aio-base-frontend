
/**
 * Video Creation Detection Utility
 * Fast, specialized detection and handling for video creation requests
 */

const VIDEO_CREATION_PATTERNS = [
  '"primary_goal": "create_video"',
  '"action": "create_video"',
  '"action": "generate_video"',
  'VideoGenerationMCP',
  'VideoCreationMCP',
  'video_from_text_and_audio'
];

/**
 * Quickly check if content contains video creation patterns
 */
export const isVideoCreationContent = (content: string): boolean => {
  if (!content || typeof content !== 'string') return false;
  
  // Fast check for key patterns
  return VIDEO_CREATION_PATTERNS.some(pattern => content.includes(pattern));
};

/**
 * Generate a simplified response for video creation requests
 */
export const getVideoCreationResponse = (content: string | null): {
  intent_analysis: any,
  execution_plan: any,
  response: string
} => {
  return {
    intent_analysis: {
      request_understanding: {
        primary_goal: "create_video",
        secondary_goals: ["process_media"]
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
};

/**
 * Generate synthetic skeleton for video creation
 */
export const generateVideoCreationStructure = (content: string | null = null): any => {
  return {
    intent_analysis: {
      request_understanding: {
        primary_goal: "create_video",
        secondary_goals: ["process_media"]
      }
    },
    execution_plan: {
      steps: [{
        mcp: "VideoGenerationMCP",
        action: "create_video",
        simplified: true
      }]
    }
  };
};

/**
 * Extract prompts from content if available
 */
export const extractVideoPrompts = (content: string): string[] | null => {
  if (!content) return null;
  
  try {
    // Look for prompts in JSON structure
    if (content.includes('"prompts"')) {
      const promptsMatch = content.match(/"prompts"\s*:\s*\[(.*?)\]/);
      if (promptsMatch && promptsMatch[1]) {
        // Try to parse the array
        const promptsArray = JSON.parse(`[${promptsMatch[1]}]`);
        if (Array.isArray(promptsArray) && promptsArray.length > 0) {
          return promptsArray;
        }
      }
      
      // Look for single prompt
      const singlePromptMatch = content.match(/"prompt"\s*:\s*"([^"]+)"/);
      if (singlePromptMatch && singlePromptMatch[1]) {
        return [singlePromptMatch[1]];
      }
    }
  } catch (e) {
    console.log('[Video Detection] Error extracting prompts:', e);
  }
  
  return null;
};

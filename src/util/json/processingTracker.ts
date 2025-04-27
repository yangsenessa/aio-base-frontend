
/**
 * Global processing tracker to prevent redundant JSON parsing
 * and infinite processing loops across the application
 */

// Global registry to track which content has been processed
const processedRegistry = new Map<string, {
  result: any,
  timestamp: number,
  attempts: number
}>();

const MAX_REGISTRY_SIZE = 100;
const REGISTRY_TTL = 60000; // 1 minute time-to-live
const MAX_PROCESSING_ATTEMPTS = 2;

// Special content types that need different handling
const VIDEO_CREATION_MARKERS = [
  '"primary_goal": "create_video"',
  'Base64ConversionMCP',
  'video_quality_high',
  'combine media',
  'prompts_must_contain_product_name'
];

// Multi-step execution plan detection
const COMPLEX_EXECUTION_PLAN_MARKERS = [
  '"steps": [',
  '"action":',
  '"mcp":',
  '"dependencies":',
  '"quality_metrics"'
];

// Create a content fingerprint for tracking
export const createContentFingerprint = (content: string): string => {
  if (!content) return '';
  
  // Create a fingerprint using content length and a substring
  // This is more efficient than hashing the entire content
  const length = content.length;
  const sample = length > 40 
    ? content.substring(0, 20) + content.substring(length - 20) 
    : content;
  
  return `${sample}-${length}`;
};

// Check if content is currently being processed
export const isContentBeingProcessed = (content: string): boolean => {
  const fingerprint = createContentFingerprint(content);
  const entry = processedRegistry.get(fingerprint);
  
  if (!entry) return false;
  
  return entry.attempts < MAX_PROCESSING_ATTEMPTS;
};

// Get cached result for content if available
export const getCachedResult = (content: string): any => {
  const fingerprint = createContentFingerprint(content);
  const entry = processedRegistry.get(fingerprint);
  
  if (!entry) return null;
  
  // Check if result has expired
  if (Date.now() - entry.timestamp > REGISTRY_TTL) {
    processedRegistry.delete(fingerprint);
    return null;
  }
  
  return entry.result;
};

// Start processing content
export const startContentProcessing = (content: string): void => {
  const fingerprint = createContentFingerprint(content);
  const entry = processedRegistry.get(fingerprint);
  
  if (entry) {
    // Increment attempt counter
    processedRegistry.set(fingerprint, {
      ...entry,
      attempts: entry.attempts + 1,
      timestamp: Date.now() // Reset timer
    });
  } else {
    // Create new entry
    processedRegistry.set(fingerprint, {
      result: null,
      timestamp: Date.now(),
      attempts: 1
    });
    
    // Enforce size limit by removing oldest entry if needed
    if (processedRegistry.size > MAX_REGISTRY_SIZE) {
      let oldestKey = null;
      let oldestTime = Infinity;
      
      for (const [key, value] of processedRegistry.entries()) {
        if (value.timestamp < oldestTime) {
          oldestTime = value.timestamp;
          oldestKey = key;
        }
      }
      
      if (oldestKey) {
        processedRegistry.delete(oldestKey);
      }
    }
  }
};

// Store processed result
export const storeProcessedResult = (content: string, result: any): void => {
  const fingerprint = createContentFingerprint(content);
  
  processedRegistry.set(fingerprint, {
    result,
    timestamp: Date.now(),
    attempts: MAX_PROCESSING_ATTEMPTS // Mark as fully processed
  });
};

// Check if max processing attempts reached
export const hasReachedMaxAttempts = (content: string): boolean => {
  const fingerprint = createContentFingerprint(content);
  const entry = processedRegistry.get(fingerprint);
  
  if (!entry) return false;
  
  return entry.attempts >= MAX_PROCESSING_ATTEMPTS;
};

// Check if the content is likely a video creation request
export const isVideoCreationRequest = (content: string): boolean => {
  if (!content) return false;
  
  // Fast check for specific markers
  return VIDEO_CREATION_MARKERS.some(marker => content.includes(marker));
};

// Check if content has complex multi-step execution plan
export const hasComplexExecutionPlan = (content: string): boolean => {
  if (!content) return false;
  
  // Count marker occurrences to determine complexity
  let markerCount = 0;
  for (const marker of COMPLEX_EXECUTION_PLAN_MARKERS) {
    if (content.includes(marker)) {
      markerCount++;
      // Early exit if we have enough markers to indicate complexity
      if (markerCount >= 3) return true;
    }
  }
  
  // Additional check for multiple steps
  if (content.includes('"steps"')) {
    // Count step occurrences (rough estimate)
    const stepMatches = content.match(/"mcp":/g) || [];
    return stepMatches.length > 2; // More than 2 steps indicates complexity
  }
  
  return false;
};

// Get early response for video creation requests
export const getVideoCreationResponse = (content: string): any => {
  if (!isVideoCreationRequest(content)) return null;
  
  // Create a safe response that doesn't trigger infinite parsing
  return {
    intent_analysis: {
      request_understanding: {
        primary_goal: "create_video"
      }
    },
    execution_plan: {
      steps: [{
        mcp: "VideoCreationMCP",
        action: "create_video"
      }]
    },
    response: "I'll help you create a video. Please use the Execute button to proceed with this operation."
  };
};

// Get simplified response for complex execution plans
export const getSimplifiedExecutionPlan = (content: string): any => {
  if (!hasComplexExecutionPlan(content)) return null;
  
  try {
    // Attempt to extract primary goal from content
    let primaryGoal = "complex_operation";
    
    if (content.includes('"primary_goal"')) {
      const goalMatch = content.match(/"primary_goal":\s*"([^"]+)"/);
      if (goalMatch && goalMatch[1]) {
        primaryGoal = goalMatch[1];
      }
    }
    
    // Count approximate number of steps
    const stepMatches = content.match(/"mcp":/g) || [];
    const stepCount = stepMatches.length || 2;
    
    // Create a simplified response
    return {
      intent_analysis: {
        request_understanding: {
          primary_goal: primaryGoal
        }
      },
      execution_plan: {
        steps: Array(stepCount).fill(0).map((_, index) => ({
          mcp: `ProcessingMCP_${index + 1}`,
          action: `process_step_${index + 1}`,
          synthetic: true
        }))
      },
      response: `I'll help you with your ${primaryGoal.replace(/_/g, ' ')} request. Please use the Execute button to proceed with this ${stepCount}-step operation.`
    };
  } catch (error) {
    console.error('[ProcessingTracker] Error creating simplified execution plan:', error);
    
    // Fallback simplified plan
    return {
      intent_analysis: {
        request_understanding: {
          primary_goal: "complex_operation"
        }
      },
      execution_plan: {
        steps: [
          { mcp: "ProcessingMCP", action: "process_request", synthetic: true }
        ]
      },
      response: "I'll process your complex request. Please use the Execute button to proceed with this operation."
    };
  }
};

// Clear expired entries periodically
setInterval(() => {
  const now = Date.now();
  for (const [key, value] of processedRegistry.entries()) {
    if (now - value.timestamp > REGISTRY_TTL) {
      processedRegistry.delete(key);
    }
  }
}, 30000); // Check every 30 seconds

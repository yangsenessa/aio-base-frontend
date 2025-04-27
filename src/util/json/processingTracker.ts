
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

// Clear expired entries periodically
setInterval(() => {
  const now = Date.now();
  for (const [key, value] of processedRegistry.entries()) {
    if (now - value.timestamp > REGISTRY_TTL) {
      processedRegistry.delete(key);
    }
  }
}, 30000); // Check every 30 seconds


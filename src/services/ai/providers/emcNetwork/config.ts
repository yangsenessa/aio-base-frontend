
/**
 * EMC Network configuration and constants
 */

// API endpoints for EMC Network - adding HTTPS endpoints as primary
export const EMC_ENDPOINTS = [
   "https://openapi.emchub.ai/emchub/api/openapi/task/executeTaskByUser/edgematrix:deepseek7b/v1/chat/completions",
   "http://162.218.231.180:8101/v1/chat/completions"
];

// API key
export const EMC_API_KEY = "833_txLiSbJibu160317539183112192";

// Timeout for API calls in milliseconds
export const REQUEST_TIMEOUT = 20000; // 20 seconds


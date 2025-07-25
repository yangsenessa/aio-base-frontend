
/**
 * EMC Network configuration and constants
 */

// API endpoints for EMC Network - adding HTTPS endpoints as primary
export const EMC_ENDPOINTS = [
   "https://openapi.emchub.ai/emchub/api/openapi/task/executeTaskByUser/edgematrix:deepseek7b/v1/chat/completions"
];

// API key
export const EMC_API_KEY = "833_txLiSbJibu160317539183112192";

export const CFG_SILICONFLOW_API_KEY = "sk-sizdciquzgledafoqeguebohudunufoztppywmclondftwij";

// SiliconFlow endpoint
export const CFG_SILICONFLOW_ENDPOINT = "https://api.siliconflow.cn/v1/chat/completions";

// Timeout for API calls in milliseconds - unified with other services
export const REQUEST_TIMEOUT = 360000; // 6 minutes (same as SiliconFlow and Service Worker)


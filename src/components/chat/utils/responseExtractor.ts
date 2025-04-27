
import { 
  fixMalformedJson, 
  parseAIOProtocolJSON,
  isLikelyAIOProtocolJSON,
  extractResponseText
} from '@/util/formatters';
import { extractJsonFromChatMessage } from '@/util/json/chatJsonHandler';

export const extractResponseFromContent = (content: string): string => {
  if (!content) return "No response content available.";

  // Check for video creation pattern first (fastest check)
  if (content.includes('"primary_goal": "create_video"')) {
    return "Processing video creation request. Please use the Execute button if you wish to proceed.";
  }

  // Check for markdown structured format
  if (content.includes("**Response:**")) {
    const parts = content.split("**Response:**");
    if (parts.length > 1) {
      return parts[1].trim();
    }
  }

  // Try our new specialized extractor
  if (isLikelyAIOProtocolJSON(content)) {
    const responseText = extractResponseText(content);
    if (responseText) {
      return responseText;
    }
  }

  // Fallback to our robust chat JSON extractor
  const result = extractJsonFromChatMessage(content);
  if (result.success && result.response) {
    return result.response;
  }

  // Return original content if no special format is detected
  return content;
};

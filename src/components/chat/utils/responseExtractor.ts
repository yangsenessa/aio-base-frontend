
import { fixMalformedJson } from '@/util/formatters';

export const extractResponseFromContent = (content: string): string => {
  if (!content) return "No response content available.";

  // Check for markdown structured format
  if (content.includes("**Response:**")) {
    const parts = content.split("**Response:**");
    if (parts.length > 1) {
      return parts[1].trim();
    }
  }

  // Try parsing JSON response
  if (content.includes('"response":')) {
    try {
      const fixedJson = fixMalformedJson(content);
      const parsed = JSON.parse(fixedJson);
      if (parsed.response) {
        return parsed.response;
      }
    } catch (error) {
      console.warn("Failed to parse response from JSON:", error);
    }
  }

  // Return original content if no special format is detected
  return content;
};

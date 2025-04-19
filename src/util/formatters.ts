
import { extractJsonFromText, isValidJson } from "@/util/formatters";

export const extractAndValidateJson = (text: string): string | null => {
  try {
    // First, sanitize and clean the input text
    const cleanedText = text.trim()
      .replace(/\n/g, ' ')  // Remove newlines
      .replace(/\s+/g, ' ')  // Normalize whitespaces
      .replace(/,\s*}/g, '}')  // Remove trailing commas in objects
      .replace(/,\s*\]/g, ']');  // Remove trailing commas in arrays

    console.log("[JSON Extraction] Cleaned text:", cleanedText.substring(0, 500));

    // Try extracting JSON using more flexible regex
    const jsonRegex = /\{(?:[^{}]|(?:\{(?:[^{}]|(?:\{[^{}]*\})*)*\}))*\}/g;
    const matches = cleanedText.match(jsonRegex);

    if (matches && matches.length > 0) {
      for (const jsonCandidate of matches) {
        try {
          // Additional cleaning and validation
          const cleanedJson = jsonCandidate
            .replace(/(['"])?([a-zA-Z0-9_]+)(['"])?:/g, '"$2":')  // Ensure keys are quoted
            .replace(/:\s*(['"])?([^'"\n\r]+)(['"])?([,}])/g, ': "$2"$4');  // Quote unquoted values

          console.log("[JSON Extraction] Attempting to parse:", cleanedJson.substring(0, 500));

          const parsedJson = JSON.parse(cleanedJson);
          return JSON.stringify(parsedJson);  // Return a canonicalized version
        } catch (parseError) {
          console.warn("[JSON Extraction] Parse attempt failed:", parseError);
        }
      }
    }

    console.error("[JSON Extraction] No valid JSON found in text");
    return null;
  } catch (error) {
    console.error("[JSON Extraction] Unexpected error:", error);
    return null;
  }
};

// Optional: Override the existing extractJsonFromText if you want
export const extractJsonFromText = (text: string): string | null => {
  return extractAndValidateJson(text);
};


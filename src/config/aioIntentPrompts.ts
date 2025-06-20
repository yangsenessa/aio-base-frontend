/**
 * Specialized prompts for intent generation and processing
 */

export const aioIntentPrompts = {
  // Prompt for generating intent keywords based on input modality
  generate_intent_keywords: `You are Queen AI, an advanced AI system that processes multimodal inputs.

Your task is to analyze the input modality and generate a sequence of processing steps that would be required to handle the input effectively.

Input Processing:
- Analyze the provided modality type
- Consider the natural processing flow for this modality
- Generate a sequence of processing steps
- Ensure steps are logical and follow a natural progression
- Include both basic processing and advanced analysis steps
- Use the provided default keywords as reference but feel free to modify or enhance them

Output Format:
- Must be a valid JSON array of lowercase strings
- No explanations, comments, or markdown
- Up to 8 lowercase English intent keywords
- Keywords should represent sequential processing steps

Example Output:
["detect language", "transcribe speech", "extract entities", "analyze sentiment"]

Input Modality: <MODALITY_NAME>
Default Keywords for Reference: <INTENT_KEYWORDS>`,

  // Prompt for validating and normalizing intent keywords
  validate_intent_keywords: `You are an intent keyword validator for the AIO protocol.

Your task is to validate and normalize a list of intent keywords to ensure they meet the required standards.

Input Processing:
- Check if keywords are in lowercase
- Verify keywords are in English
- Ensure keywords are specific and actionable
- Remove duplicates
- Limit to maximum 8 keywords
- Normalize similar keywords to standard forms

Output Format:
- Must be a valid JSON array of normalized keywords
- No explanations, comments, or markdown
- All keywords must be lowercase English
- Maximum 8 keywords

Current Keywords we already have,you should match with them first: <CURRENT_KEYWORDS>

Input Keywords as example output you can follow and extend or match:
<INTENT_KEYWORDS>`,

  // Default intent keyword reference table
  default_intent_keywords: {
    "voice": [
      "speech-to-text",
      "voice-emotion-detect",
      "voice-language-detect",
      "voice-keyword-extract",
      "voice-transcript-create",
      "voice-translate"
    ],
    "pdf": [
      "pdf-text-extract",
      "pdf-structure-parse",
      "pdf-reference-extract",
      "pdf-table-extract",
      "pdf-format-convert",
      "pdf-content-analyze"
    ],
    "doc": [
      "doc-structure-parse",
      "doc-text-extract",
      "doc-grammar-check",
      "doc-format-convert",
      "doc-reference-extract",
      "doc-content-analyze"
    ],
    "markdown": [
      "md-syntax-validate",
      "md-code-extract",
      "md-link-analyze",
      "md-structure-parse",
      "md-format-convert",
      "md-content-extract"
    ],
    "image": [
      "image-object-detect",
      "image-text-extract",
      "image-face-detect",
      "image-caption-generate",
      "image-metadata-extract",
      "image-classify"
    ],
    "video": [
      "video-frame-extract",
      "video-caption-generate",
      "video-scene-detect",
      "video-speech-transcribe",
      "video-speaker-detect",
      "video-motion-analyze"
    ],
    "text": [
      "text-language-detect",
      "text-entity-extract",
      "text-sentiment-analyze",
      "text-grammar-check",
      "text-translate",
      "text-rewrite"
    ],
    "spreadsheet": [
      "sheet-structure-parse",
      "sheet-data-extract",
      "sheet-pattern-analyze",
      "sheet-anomaly-detect",
      "sheet-chart-generate",
      "sheet-format-convert"
    ],
    "webpage": [
      "web-article-extract",
      "web-layout-analyze",
      "web-metadata-extract",
      "web-markdown-convert",
      "web-link-analyze",
      "web-paywall-detect"
    ],
    "action": [
      "action-search",
      "action-summarize",
      "action-translate",
      "action-extract",
      "action-classify",
      "action-visualize"
    ],
    "intent": [
      "intent-query-understand",
      "intent-goal-identify",
      "intent-request-decompose",
      "intent-service-match",
      "intent-tool-select",
      "intent-input-validate"
    ],
    "target": [
      "target-question",
      "target-file",
      "target-stream",
      "target-history",
      "target-api",
      "target-knowledge"
    ],
    "plan": [
      "plan-task-decompose",
      "plan-subtask-assign",
      "plan-tool-select",
      "plan-sequence-determine",
      "plan-progress-track",
      "plan-fallback-handle"
    ],
    "tool": [
      "tool-search",
      "tool-pdf",
      "tool-ocr",
      "tool-transcribe",
      "tool-caption",
      "tool-code"
    ]
  }
  
}; 

export function getDefaultIntentKeywords() {
  return aioIntentPrompts.default_intent_keywords;
}

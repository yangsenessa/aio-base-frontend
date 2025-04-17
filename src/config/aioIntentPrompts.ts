/**
 * Specialized prompts for intent generation and processing
 */

export const aioIntentPrompts = {
  // Prompt for generating intent keywords based on input modality
  generate_intent_keywords: `You are an intent keyword generator for the AIO-2030 protocol.

Your task is to analyze the input modality and generate relevant intent keywords that describe possible user actions.

Input Processing:
- Analyze the provided modality type
- Consider common use cases and tasks for this modality
- Generate relevant intent keywords
- Ensure keywords are specific and actionable

Output Format:
- Must be a valid JSON array of lowercase strings
- No explanations, comments, or markdown
- Up to 8 lowercase English intent keywords
- Each keyword should describe a task or user intent

Example Output:
["summarize", "translate", "extract key phrases", "detect language"]

Input Modality:
<MODALITY_NAME>`,

  // Prompt for validating and normalizing intent keywords
  validate_intent_keywords: `You are an intent keyword validator for the AIO-2030 protocol.

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

Input Keywords:
<INTENT_KEYWORDS>`,

  // Prompt for mapping intent keywords to MCP services
  map_intent_to_mcp: `You are an intent-to-MCP mapper for the AIO-2030 protocol.

Your task is to analyze intent keywords and suggest the most appropriate MCP services.

Input Processing:
- Analyze the provided intent keywords
- Consider the input modality
- Match keywords to relevant MCP capabilities
- Rank MCP services by relevance

Output Format:
- Must be a valid JSON array of MCP service mappings
- Each mapping should include:
  - intent_keyword: string
  - mcp_name: string
  - confidence_score: number (0-1)
  - suggested_parameters: object

Example Output:
[
  {
    "intent_keyword": "summarize",
    "mcp_name": "text_summarizer",
    "confidence_score": 0.95,
    "suggested_parameters": {
      "max_length": 200,
      "format": "text"
    }
  }
]

Input Data:
{
  "modality": "<MODALITY_NAME>",
  "intent_keywords": <INTENT_KEYWORDS>,
  "available_mcps": <AVAILABLE_MCPS>
}`,

  // Default intent keyword reference table
  default_intent_keywords: {
    voice: [
      "speech recognition",
      "transcribe audio",
      "extract key phrases",
      "summarize speech",
      "convert to text",
      "translate audio",
      "detect language",
      "analyze emotion"
    ],
    pdf: [
      "extract text",
      "summarize",
      "search document",
      "convert to markdown",
      "extract table",
      "translate",
      "classify document"
    ],
    doc: [
      "summarize",
      "extract key points",
      "convert to pdf",
      "translate document",
      "check grammar",
      "detect topic"
    ],
    markdown: [
      "render preview",
      "convert to html",
      "summarize sections",
      "extract code blocks",
      "translate content",
      "analyze structure"
    ],
    image: [
      "image captioning",
      "object detection",
      "extract text from image",
      "classify image",
      "detect faces",
      "describe visual content"
    ],
    text: [
      "summarize",
      "translate",
      "extract entities",
      "rewrite text",
      "detect language",
      "analyze sentiment",
      "generate response"
    ],
    spreadsheet: [
      "extract table",
      "summarize data",
      "generate chart",
      "convert to csv",
      "detect anomalies",
      "analyze trends"
    ]
  }
}; 
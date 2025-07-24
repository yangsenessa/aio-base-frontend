/**
 * Specialized prompts for indexing and processing specific components
 */

export const aioIndexPrompts = {
  // Prompt for building MCP (Modular Capability Provider) index
  build_mcp_index: `You are an MCP Capability Indexer. Your task is to analyze the help response and 'Describe Content' to generate a standardized MCP Capability Index.

CRITICAL REQUIREMENTS:
1. Output MUST be a single, valid JSON object with no additional text
2. ALL text content MUST be in English
3. For each method:
   - Preserve the EXACT structure of inputSchema
   - Include complete inputSchema if it exists
   - Translate all descriptions to English
   - each methods[n].name should be put into the method_name field in the inverted index output directly
     don't modify the method_name, just copy it avoid to be empty
4. For evaluation_metrics:
   - ALL scores MUST be valid numbers between 0 and 1
   - NEVER use NaN, null, or undefined values
   - completeness_score: based on method coverage and documentation
   - accuracy_score: based on input validation and error handling
   - relevance_score: based on use case alignment
   - translation_quality: based on English translation accuracy
   - Default to 0.8 if unable to determine a specific score
   - use 1 if you think keyword reflects the mcp_name&method_name perfectly

DESCRIPTION FIELD RULES:
1. The description field MUST be a valid JSON string value
2. Remove or escape ALL special characters that could break JSON format:
   - Replace newlines with spaces
   - Escape double quotes with backslash
   - Remove or escape control characters
   - Remove or escape unicode characters
3. Maximum length: 500 characters
4. Must be a single line of text
5. Must be properly escaped for JSON
6. Cannot contain:
   - Line breaks
   - Unescaped quotes
   - Special characters
   - HTML tags
   - Markdown syntax
7. Example of valid description:
   "This service provides image processing capabilities including resizing and format conversion"
   
JSON STRUCTURE:
{
  "description": "string",          
  "capability_tags": ["string"],    // e.g. ["memory", "nlp", "retrieval"]
  "functional_keywords": ["string"],// e.g. ["search", "filter", "sort"]
  "scenario_phrases": ["string"],   // natural language use cases
  "methods": [
    {
      "name": "string",            // will be used as method_name in the inverted index output
      "description": "string",
      "inputSchema": {
        "type": "object",
        "properties": {
          "param1": {
            "type": "string",
            "description": "string"
          }
        },
        "required": ["string"]
      },
      "parameters": ["string"]
    }
  ],
  "source": {
    "author": "string",
    "version": "string",
    "github": "string"
  },
  "evaluation_metrics": {
    "completeness_score": number,   // 0-1, default 0.5 if uncertain
    "accuracy_score": number,       // 0-1, default 0.5 if uncertain
    "relevance_score": number,      // 0-1, default 0.5 if uncertain
    "translation_quality": number   // 0-1, default 0.5 if uncertain
  }
}

VALIDATION RULES:
1. No template placeholders in output
2. No text after closing brace
3. All JSON properties must be properly closed
4. All descriptions must be in English
5. All numeric values must be between 0-1
6. No empty strings or null values
7. No NaN values in evaluation_metrics
8. If unable to determine a specific score, use 0.5 as default
9. Description must be properly escaped for JSON format

--Input help JSON response:
help_response

--Input Describe Content:
describe_content`,

  // Prompt for reconstructing JSON responses
  reconstruct_json: `You are a JSON Response Reconstructor. Your task is to fix and reconstruct a JSON response while preserving ALL information from the original response.

Given an invalid or malformed JSON response, you must:
1. Carefully analyze the entire response, including any text before or after the JSON structure
2. Preserve ALL information from the original response - do not omit or modify any data
3. Return a properly formatted JSON object that maintains the exact same data structure and values
4. If there are any non-JSON text elements, include them in appropriate JSON fields
5. Ensure the output is valid JSON that can be parsed without errors

The response must be a single, valid JSON object with no additional text or explanations.
Do not add, remove, or modify any information from the original response.

Here is the response that needs reconstruction:

invalid_response`,

  // Prompt for creating inverted index for MCP services
  aioInvertedIndexPrompts: `You are an AI indexing assistant for AIO protocol. Analyze MCP service metadata and generate a structured inverted index.

🎯 CORE EXTRACTION RULES:
1. **method_name**: Copy EXACTLY from <MCP_JSON_INPUT>.methods[n].name - no modifications allowed
2. **mcp_name**: Extract from root level or infer from service context - use lowercase_with_underscores (e.g., "image_processor", "voice_assistant")
3. **standard_match**: Always string value "true" or "false" (never boolean)

📝 ENHANCED KEYWORD GENERATION STRATEGY:
1. **Multi-Layer Keywords** (Generate 3-6 per method):
   - **Primary Action**: Core functionality (e.g., "upload", "process", "analyze", "convert")
   - **Domain Context**: Business domain (e.g., "image-processing", "voice-recognition", "file-management")
   - **Use Case**: Practical applications (e.g., "batch-upload", "real-time-analysis", "format-conversion")
   - **Technical Terms**: Specific capabilities (e.g., "thumbnail-generation", "audio-transcription", "data-encryption")

2. **Keyword Expansion Techniques**:
   - Analyze method description for hidden capabilities
   - Extract technical terms from inputSchema parameters
   - Consider related workflows and use cases
   - Include both specific and general terms for better matching
   - Generate synonyms and alternative expressions

3. **Format Requirements**:
   - Use lowercase-with-hyphens (e.g., "image-processing", "voice-recognition")
   - Length: 3-50 characters
   - No spaces, underscores, or camelCase
   - Compound keywords preferred over single words
   - Examples: "file-upload", "batch-processing", "real-time-analysis", "format-conversion"

4. **Exclusion Rules**:
   - Avoid generic terms: "help", "prompt", "service", "tool", "debug", "error"
   - Skip UI terms: "button", "click", "input", "form"
   - No programming jargon without context

✅ JSON FORMAT REQUIREMENTS:
1. **Structure Validation**:
   - Start with '[' and end with ']'
   - Use proper object notation with '{' and '}'
   - Separate objects with commas (no trailing commas)
   - Each method_name creates separate index entry

2. **Data Type Enforcement**:
   - All strings in double quotes
   - Numbers without quotes (confidence: 0.95)
   - standard_match as string "true" or "false" 
   - Arrays with square brackets
   - No boolean true/false values

3. **Field Validation**:
   - keyword: domain-specific, hyphen-separated
   - primary_keyword: same as keyword
   - keyword_group: logical grouping (e.g., "file_ops", "image_proc", "voice_text")
   - mcp_name: descriptive service name with underscores
   - method_name: exact copy from input
   - source_field: same as method_name
   - confidence: 0.8-1.0 range
   - keyword_types: array of category strings

✅ VALID OUTPUT FORMAT:
[
  {
    "keyword": "voice-recognition",
    "primary_keyword": "voice-recognition", 
    "keyword_group": "voice_text",
    "mcp_name": "voice_service",
    "method_name": "identify_voice",
    "source_field": "identify_voice",
    "confidence": 0.95,
    "standard_match": "true",
    "keyword_types": ["recognition", "audio"]
  }
]

🚫 CRITICAL CONSTRAINTS:
- method_name must exist in input JSON methods[n].name (EXACT copy)
- mcp_name format: lowercase_underscore (good: "text_translator", bad: "service")
- keyword format: lowercase-hyphen (good: "image-processing", bad: "imageProcessing")
- standard_match: string "true"/"false" only (never boolean)
- confidence: minimum 0.8, prefer 0.9+ for clear matches
- Create separate entries for each method
- Generate multiple keyword variations per method for better discovery

🔽 Input:
<MCP_JSON_INPUT>`,
};
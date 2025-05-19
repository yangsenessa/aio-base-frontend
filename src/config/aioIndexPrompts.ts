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
    "completeness_score": number,   // 0-1
    "accuracy_score": number,       // 0-1
    "relevance_score": number,      // 0-1
    "translation_quality": number   // 0-1
  }
}

VALIDATION RULES:
1. No template placeholders in output
2. No text after closing brace
3. All JSON properties must be properly closed
4. All descriptions must be in English
5. All numeric values must be between 0-1
6. No empty strings or null values

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
  aioInvertedIndexPrompts: `You are an AI indexing assistant for the AIO-2030 protocol. Your task is to analyze MCP service metadata and generate an inverted index.

PROPER JSON FORMATTING:
1. Always use double quotes for property names and string values
2. Always use proper array and object brackets
3. Always separate array items with commas
4. Always format boolean values as strings "true" or "false"
5. Always use proper nesting and indentation

CORRECT FORMAT EXAMPLES:
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
    "keyword_types": ["recognition"]
  },
  {
    "keyword": "voice-identification",
    "primary_keyword": "voice-identification",
    "keyword_group": "voice_text",
    "mcp_name": "voice_service",
    "method_name": "identify_voice",
    "source_field": "identify_voice",
    "confidence": 0.95,
    "standard_match": "true",
    "keyword_types": ["identification"]
  }
]

FORMATTING CHECKLIST:
1. Structure:
   - Start with '[' and end with ']'
   - Use '{' and '}' for objects
   - Separate objects with commas
   - No trailing commas
   - Each method_name must be a single string, not an array
   - Create separate items for each method_name

2. Values:
   - Use double quotes for strings
   - Use unquoted numbers
   - Use "true" or "false" for booleans
   - Use square brackets for arrays
   - method_name must be a single string value

3. Content:
   - Use hyphen-separated keywords
   - Use proper string values
   - Use proper array values
   - Use proper numeric values
   - Each method_name should have its own index entry

📦 Required Output Format:
[
  {
    "keyword": "string",           // Must be hyphen-separated
    "primary_keyword": "string",   // Must be hyphen-separated
    "keyword_group": "string",     // Must be a valid group
    "mcp_name": "string",         // Must be non-empty
    "method_name": "string",      // Must be a single string, not an array
    "source_field": "string",     // Must be non-empty
    "confidence": 0.95,           // Must be between 0.0 and 1.0
    "standard_match": "true",     // Must be "true" or "false"
    "keyword_types": ["string"]   // Must be array of strings
  }
]

Additional Requirements:
- Use hyphen-separated keywords (e.g., "voice-recognition")
- Use English only
- Confidence must be >= 0.8
- Each method_name must be a single string
- Create separate index entries for each method_name
- If a keyword applies to multiple methods, create separate entries for each method
- Validate output before returning

🔽 Input:
<MCP_JSON_INPUT>`,
};
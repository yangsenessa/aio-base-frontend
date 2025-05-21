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

CRITICAL METHOD_NAME RULES:
1. method_name MUST be copied EXACTLY from <MCP_JSON_INPUT>.methods[n].name
2. DO NOT generate or create any method_name that doesn't exist in the input
3. DO NOT modify or transform the method_name in any way
4. Each method_name in the output MUST correspond to an existing method in the input
5. If a method doesn't exist in the input, DO NOT create an index entry for it

KEYWORD GENERATION RULES:
1. Business Context:
   - Keywords MUST reflect specific business domain and functionality
   - Avoid generic terms like "help", "prompt", "seed" unless they are domain-specific
   - Combine generic terms with domain context (e.g., "image-generation-prompt" instead of just "prompt")
   - Focus on unique, distinguishing features of the service

2. Keyword Quality:
   - Each keyword should be specific and meaningful
   - Keywords should be descriptive of actual functionality
   - Avoid overly generic or common terms
   - Prefer compound keywords that provide context
   - Minimum keyword length should be 3 characters
   - Maximum keyword length should be 50 characters

3. Keyword Format:
   - Use hyphen-separated compound words
   - Use lowercase letters only
   - No special characters except hyphens
   - No numbers unless they are part of a domain term
   - No single-word generic terms

4. Exclusion Rules:
   - Exclude common programming terms (e.g., "help", "error", "debug","seed")
   - Exclude generic UI terms (e.g., "button", "click", "input")
   - Exclude common technical terms without context
   - Exclude single-word generic terms

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
    "keyword": "string",           // Must be hyphen-separated, domain-specific
    "primary_keyword": "string",   // Must be hyphen-separated, domain-specific
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
- Keywords must be domain-specific and meaningful
- Use compound keywords with proper context
- Avoid generic terms without domain context
- Confidence must be >= 0.8
- Each method_name must be a single string
- Create separate index entries for each method_name
- If a keyword applies to multiple methods, create separate entries for each method
- Validate output before returning
- method_name MUST be copied exactly from input methods[n].name, no modifications allowed

🔽 Input:
<MCP_JSON_INPUT>`,
};
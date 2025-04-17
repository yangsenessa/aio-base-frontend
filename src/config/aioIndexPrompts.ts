/**
 * Specialized prompts for indexing and processing specific components
 */

export const aioIndexPrompts = {
  // Prompt for building MCP (Modular Capability Provider) index
  build_mcp_index: `You are an MCP Capability Indexer. Your task is to analyze the help response and 'Describe Content' to generate a standardized MCP Capability Index.

CRITICAL OUTPUT FORMAT REQUIREMENTS:
1. Your response MUST be a single, valid JSON object
2. NO additional text, explanations, or formatting before or after the JSON
3. NO markdown formatting, code blocks, or other wrappers
4. The JSON must be parseable by standard JSON parsers
5. All text content MUST be in English (translate non-English content)
6. DO NOT add any prefixes like \`\`\`json or suffixes like \`\`\`
7. DO NOT wrap the JSON in any formatting or code blocks
8. The response should start with { and end with } only

Input Processing:
- Analyze the \`help JSON response\` and \`Describe Content\`
- Extract key metadata and capabilities
- Translate any non-English content to English
- Generate scenario phrases based on semantic analysis of method names, parameters, and descriptions

Output JSON Structure:
{
  "description": "string",          // 200 words max, English only
  "capability_tags": ["string"],    // e.g. ["memory", "nlp", "retrieval"]
  "functional_keywords": ["string"],// e.g. ["search", "filter", "sort"]
  "scenario_phrases": ["string"],   // natural language use cases
  "methods": [
    {
      "name": "string",
      "description": "string",      // English only
      "inputSchema": object,        // from help.result.methods.{n}.inputSchema
      "parameters": ["string"]      // from inputSchema
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
  aioInvertedIndexPrompts: `You are an AI indexing assistant for the AIO-2030 protocol.

Your task is to analyze the metadata of a single MCP (Model Context Protocol) service described in JSON format.

Your output must be a valid JSON array representing a list of keyword-based inverted index records. These records will help other applications identify which MCP services match a given keyword.

---

🧩 Your Responsibilities:

1. Extract relevant keywords or phrases that describe:
   - The capabilities
   - The methods
   - The input/output parameters
   - The scenarios or example tasks
   - Any common synonyms a user might search

2. Assign each keyword to a **keyword group**, which categorizes the function area:
   Example groups: "voice_ai", "text_processing", "file_operation", "general_action", "data_format", "method", "input_param"

3. Identify the \`mcp_name\` field (assume it is provided in the JSON).

4. Annotate the \`source_field\` (where the keyword was derived from):
   e.g. "capability_tags", "scenario_phrases", "methods.name", "methods.description", "methods.inputSchema", "description"

5. Estimate a \`confidence\` score between \`0.0\` and \`1.0\` indicating how representative that keyword is of the MCP's functionality.

---

📦 Output Format:

You must return ONLY the following JSON array structure:

[
  {
    "keyword": "string",
    "keyword_group": "string",
    "mcp_name": "string",
    "source_field": "string",
    "confidence": float
  },
  ...
]

---

⚠️ Output Constraints:

- Output MUST begin with \`[\` and end with \`]\`
- Output MUST be a valid JSON array, with no explanation, comments, or markdown
- Output must be directly parsable with JSON.parse()
- All keywords and groups must be in English
- Do not return any text outside the JSON array

---

🔽 Inject the MCP JSON here :
<MCP_JSON_INPUT>`
}; 
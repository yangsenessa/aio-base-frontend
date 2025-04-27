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
5. ALL text content MUST be in English - this is MANDATORY
6. DO NOT add any prefixes like \`\`\`json or suffixes like \`\`\`
7. DO NOT wrap the JSON in any formatting or code blocks
8. The response should start with { and end with } only
9. For each method in the methods array:
   - You MUST preserve the EXACT structure of help_response.methods.{n}.inputSchema
   - DO NOT simplify or modify the inputSchema structure
   - If help_response.methods.{n}.inputSchema exists, you MUST include it in the output
   - The inputSchema field should be an exact copy of the original structure

LANGUAGE TRANSLATION REQUIREMENTS:
1. ALL text fields MUST be in English - this is MANDATORY:
   - description
   - capability_tags
   - functional_keywords
   - scenario_phrases
   - methods.{n}.name
   - methods.{n}.description
   - methods.{n}.inputSchema.properties.{n}.description
   - source.author
   - source.version
   - source.github

2. For methods.description:
   - You MUST translate ALL non-English content to English
   - Ensure technical accuracy in translation
   - Preserve any technical terms and proper nouns
   - Verify NO Chinese or other non-English characters remain
   - Example: "显示此帮助信息。" should be translated to "Display this help information."

3. Translation Quality Check:
   - Review ALL text fields for any non-English content
   - Ensure translations are contextually appropriate
   - Verify technical terms are correctly translated
   - Check for any mixed language content
   - Double-check each field for remaining non-English characters

Input Processing:
- Analyze the \`help JSON response\` and \`Describe Content\`
- Extract key metadata and capabilities
- Translate ALL non-English content to English
- Generate scenario phrases based on semantic analysis of method names, parameters, and descriptions
- Perform language verification on ALL text fields
- For each method:
  * You MUST preserve the EXACT structure of help_response.methods.{n}.inputSchema
  * DO NOT simplify or modify the inputSchema structure
  * If help_response.methods.{n}.inputSchema exists, you MUST include it in the output
  * Ensure ALL text fields are in English

Output JSON Structure:
{
  "description": "string",          // 200 words max, English ONLY
  "capability_tags": ["string"],    // e.g. ["memory", "nlp", "retrieval"], English ONLY
  "functional_keywords": ["string"],// e.g. ["search", "filter", "sort"], English ONLY
  "scenario_phrases": ["string"],   // natural language use cases, English ONLY
  "methods": [
    {
      "name": "string",             // English ONLY
      "description": "string",      // English ONLY, MUST translate from Chinese if present
      "inputSchema": {              // MUST be an exact copy of help_response.methods.{n}.inputSchema
        "type": "string",           // e.g. "object"
        "properties": {             // REQUIRED field
          "param1": {
            "type": "string",
            "description": "string"  // English ONLY
          }
        },
        "required": ["string"]      // Optional field
      },
      "parameters": ["string"]      // from inputSchema if present
    }
  ],
  "source": {
    "author": "string",             // English ONLY
    "version": "string",            // English ONLY
    "github": "string"              // English ONLY
  },
  "evaluation_metrics": {
    "completeness_score": number,   // 0-1
    "accuracy_score": number,       // 0-1
    "relevance_score": number,      // 0-1
    "translation_quality": number   // 0-1
  }
}

Example of complex inputSchema:
{
  "type": "object",
  "properties": {
    "relations": {
      "type": "array",
      "items": {
        "type": "object",
        "properties": {
          "from_": {
            "type": "string"
          },
          "to": {
            "type": "string"
          },
          "relationType": {
            "type": "string"
          }
        },
        "required": [
          "from_",
          "to",
          "relationType"
        ]
      }
    }
  },
  "required": [
    "relations"
  ]
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
  aioInvertedIndexPrompts: `You are an AI indexing assistant for the AIO-2030 protocol. Your task is to analyze MCP service metadata and generate an inverted index.

---

🧩 Core Rules:

1. Keyword Format:
   - Primary keyword MUST be in "noun_verb" format (e.g., "voice_detect", "text_extract")
   - For scenarios, extract and combine nouns/verbs (e.g., "voice_analyze" from "analyze voice content")
   - Each keyword set should include:
     * Primary keyword (most relevant)
     * Related keywords (semantically similar)
     * Contextual keywords (from input context)
     * Extended keywords (based on Core Rules categories)

2. Standard Categories:
   - Voice: ["detect_language", "transcribe_speech", "extract_phrases", "analyze_emotion"]
   - Document: ["extract_text", "parse_structure", "analyze_content", "convert_format"]
   - Image: ["detect_objects", "extract_text", "analyze_scene", "classify_content"]
   - Video: ["extract_frames", "generate_caption", "detect_scene", "analyze_motion"]
   - Text: ["detect_language", "extract_entities", "analyze_sentiment", "rewrite_content"]
   - Action: ["search_content", "summarize_text", "translate_content", "extract_data"]
   - Intent: ["understand_query", "identify_goal", "match_service", "validate_input"]

3. Keyword Groups:
   - voice_processing
   - document_processing
   - image_processing
   - video_processing
   - text_processing
   - action_processing
   - intent_processing
   - general_action
   - data_format
   - method
   - input_param

4. Match Rules:
   - standard_match: true for:
     * Direct capability_tags matches
     * Core functional_keywords
     * Explicit API action words
   - standard_match: false for:
     * Inferred from scenario_phrases
     * LLM-suggested variations
     * Semantic overlaps

---

📦 Output Format:

[
  {
    "keyword": "string",  // noun_verb format
    "primary_keyword": "string",  // most relevant keyword in noun_verb format
    "keyword_group": "string",
    "mcp_name": "string",
    "source_field": "string",
    "confidence": float,
    "standard_match": boolean,
    "keyword_types": ["string"]  // types of keywords included (primary, related, contextual, extended)
  }
]

---

⚠️ Constraints:

- Valid JSON array only
- All keywords in noun_verb format
- English only
- Confidence >= 0.8 for exact matches
- Generate multiple action sequences from scenarios
- Consider keyword source for standard_match
- Keywords field must contain at least one primary keyword
- Related keywords should be semantically relevant
- Contextual keywords should be derived from input context
- Extended keywords should be based on Standard Categories

---

🔽 Input:
<MCP_JSON_INPUT>`
}; 
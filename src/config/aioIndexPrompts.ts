/**
 * Specialized prompts for indexing and processing specific components
 */

export const aioIndexPrompts = {
  // Prompt for building MCP (Modular Capability Provider) index
  build_mcp_index: `You are an MCP Capability Indexer. Generate a standardized JSON index from MCP help response.

🚨 **JSON OUTPUT ONLY**: Pure JSON with NO comments, explanations, $comment fields, or additional text. 

🎯 **CORE REQUIREMENTS**:
- Extract ONLY valid data from input - skip malformed/corrupted content
- Perfect JSON syntax: quoted property names, quoted string values, proper arrays
- All text in English
- Numbers without quotes (0.8), strings with quotes ("value")

🚫 **CRITICAL JSON ERRORS TO AVOID**:
- Null values anywhere
- Unquoted property names (id: ❌, "id": ✅)  
- Non-JSON values (None, Some(), boolean true/false)
- Comments or $comment fields
- Format degradation during generation (losing quotes in nested objects)
- Mixed quote types (only use " never \")
- HTML entities (&amp;, &nbsp;, &lt;, &gt;) - convert to plain text
- Recursive/circular structures
- Non-standard fields like _value_, _content_

⚠️ **INPUT SANITIZATION RULES**:
- Clean HTML entities: &nbsp; → space, &amp; → &, &lt; → <, &gt; → >
- Skip malformed objects with recursive patterns
- Extract only standard JSON schema properties
- Ignore corrupted nested structures

⚠️ **FORMAT CONSISTENCY RULE**: Maintain PERFECT JSON from first to last character. Do NOT drop quotes in nested objects.

📋 **EXTRACTION TARGETS**:
- description: From input description (clean text only)
- capability_tags: Generate functional tags
- functional_keywords: Extract method names and key functions  
- scenario_phrases: Generate use cases
- methods: Copy ONLY valid methods from input.output.methods array
  - name: Copy exactly from input (string only)
  - description: Copy exactly from input (clean text)
  - inputSchema: Extract ONLY standard JSON schema properties (type, properties, required)
  - parameters: Extract parameter names from inputSchema.properties keys
- source: Extract author/version/github from input.output
- evaluation_metrics: Default scores 0.8

🚫 **SCHEMA PROPERTY FILTERING**:
For inputSchema.properties, include ONLY:
- Standard types: string, number, integer, boolean, array, object
- Standard fields: type, description, default, required
- Skip: HTML entities, _value_ fields, recursive structures

JSON STRUCTURE:
{
  "description": "string",
  "capability_tags": ["string"],
  "functional_keywords": ["string"], 
  "scenario_phrases": ["string"],
  "methods": [
    {
      "name": "string",
      "description": "string", 
      "inputSchema": {
        "type": "object",
        "properties": {
          "param_name": {
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
    "completeness_score": 0.8,
    "accuracy_score": 0.8,
    "relevance_score": 0.8,
    "translation_quality": 0.8
  }
}

🔥 **MANDATORY CHECKS BEFORE OUTPUT**:
1. ALL property names have quotes: "property"
2. ALL string values have quotes: "value" 
3. NO None, Some(), null values
4. NO format degradation in nested objects
5. NO HTML entities or _value_ fields
6. Valid JSON parseable by JSON.parse()
7. NO recursive or circular structures

--Input help JSON response:
help_response

--Input Describe Content:
describe_content`,

  // Prompt for reconstructing JSON responses
  reconstruct_json: `You are a JSON Response Reconstructor. Fix malformed JSON while preserving ALL original information.

REQUIREMENTS:
1. Analyze entire response including text before/after JSON
2. Preserve ALL information - do not omit or modify data
3. Return valid JSON object with exact same data structure
4. Include non-JSON text in appropriate JSON fields
5. Single JSON object output with no additional text

Here is the response that needs reconstruction:

invalid_response`,

  // Prompt for creating inverted index for MCP services  
  aioInvertedIndexPrompts: `You are an AI indexing assistant. Generate structured inverted index from MCP metadata.

🚨 **JSON OUTPUT ONLY**: Pure JSON array with NO comments or explanations.

🎯 **CORE RULE**: Keywords describe method functionality, not technical implementation.

🚫 **CRITICAL JSON ERRORS TO AVOID**:
- Null values in any field
- Boolean true/false (use string "true"/"false")
- JSON comments (# or //)
- Unquoted property names (property: ❌, "property": ✅)
- Unquoted string values (value ❌, "value" ✅)
- Keywords from inputSchema parameters
- Entries with missing required fields
- "_value_" fields or similar corrupted data
- HTML entities (&nbsp;, &amp;, etc.)

⚠️ **INPUT DATA FILTERING**:
- Skip any methods with "_value_" in name or description
- Ignore corrupted nested structures with "_value_" fields
- Filter out HTML entities from all text content
- Only process valid, clean method definitions

⚠️ **FIELD TYPE ENFORCEMENT**:
- standard_match: MUST be string "true"/"false" (NEVER boolean)
- confidence: MUST be number 0.8-1.0 (no quotes)
- All other fields: strings with quotes

✅ **EXTRACTION RULES**:
1. **method_name**: Copy EXACTLY from input methods[n].name (SKIP if contains "_value_")
2. **mcp_name**: Service name with underscores (e.g., "image_processor") 
3. **keywords**: From method description + relevant global context (4-6 per method)
   - Primary: Method description analysis
   - Secondary: MCP context for validation/extension
   - Format: lowercase-with-hyphens
   - Exclude generic terms: "help", "service", "tool"
   - Exclude corrupted terms containing "_value_"

🚫 **HELP KEYWORD FILTERING RULE**:
- If method_name is NOT "help": keyword and keyword_group MUST NOT contain "help"
- If method_name is "help": keyword and keyword_group can contain "help"
- Apply this filter STRICTLY to all generated entries

🚫 **DATA CORRUPTION FILTERING**:
- Skip entries where any field contains "_value_"
- Skip entries where method_name is "_value_" or similar corruption
- Skip entries with HTML entities in any field
- Only generate entries from valid, clean source data

📝 **KEYWORD GENERATION**:
- Extract action verbs from method description
- Identify functionality and use cases
- Add relevant domain context from MCP description
- Focus on what method does, not how it works

✅ **JSON FORMAT** (required fields, no null values, no "_value_" corruption):
[
  {
    "keyword": "action-verb",
    "primary_keyword": "action-verb",
    "keyword_group": "functional_category", 
    "mcp_name": "service_name",
    "method_name": "exact_method_name",
    "source_field": "exact_method_name",
    "confidence": 0.95,
    "standard_match": "true",
    "keyword_types": ["category1", "category2"]
  }
]

🔥 **FINAL VALIDATION**: 
- Every property name quoted
- Every string value quoted  
- NO null values anywhere
- NO "_value_" fields anywhere
- NO boolean values (use strings "true"/"false")
- Complete array structure []

🚫 **ENTRY FILTERING**: Exclude entries with null mcp_name, method_name, keyword, OR entries containing "_value_" in any field. Silent omission of invalid entries.

🔽 Input:
<MCP_JSON_INPUT>`,
};
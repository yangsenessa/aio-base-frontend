/**
 * Prompts for user case intent analysis and decomposition
 */

export const userCaseIntentPrompts = {
  // Prompt for decomposing user requests into structured actions and intents
  decompose_user_request: `You are the Queen Agent's Intent Analysis Module.

Your primary responsibility is to analyze and structure user requests according to the Queen Agent's framework.

## ANALYSIS FRAMEWORK

1. **Request Understanding**
   - Translate input to English if needed
   - Identify primary and secondary goals
   - Detect implicit requirements
   - Note any constraints or preferences

2. **Modality Analysis**
   - Determine input/output modalities (text, image, voice, etc.)
   - Identify required transformations
   - Note any format requirements
   - Consider accessibility needs

3. **Capability Mapping**
   - Match requirements to available MCPs
   - Identify capability gaps
   - Note any integration needs
   - Consider performance implications

4. **Task Decomposition**
   - Break down into atomic tasks
   - Define clear success criteria
   - Identify dependencies
   - Plan error handling

## ACTION TYPES

Use these standard actions when appropriate:

- \`analyze\`: Examine and understand data/requirements
- \`transform\`: Convert between formats or representations
- \`query\`: Search or retrieve information
- \`generate\`: Create new content or solutions
- \`validate\`: Check correctness or quality
- \`integrate\`: Combine multiple results
- \`optimize\`: Improve efficiency or quality
- \`deliver\`: Present final results

## INTENT CATEGORIES

Map tasks to these categories when possible:

- \`text processing\`: Natural language tasks
- \`image analysis\`: Visual content processing
- \`data manipulation\`: Structured data operations
- \`system control\`: Resource or process management
- \`knowledge retrieval\`: Information access
- \`content generation\`: Creative or synthetic tasks
- \`validation\`: Quality assurance
- \`integration\`: System or data combination

## OUTPUT FORMAT

Generate a structured analysis in this format:

\`\`\`json
{
  "primary_goal": "string",
  "modalities": ["string"],
  "required_capabilities": ["string"],
  "tasks": [
    {
      "action": "string",
      "intent": "string",
      "dependencies": ["string"],
      "success_criteria": "string"
    }
  ],
  "constraints": ["string"],
  "quality_requirements": ["string"]
}
\`\`\`

User Request: <USER_REQUEST>`
};

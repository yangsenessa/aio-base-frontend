/**
 * Prompts for Realtime Keywords Mapping
 */

export const realtimeKeywordsMappingPrompts = {
  // Template for matching user intent keywords to MCP keywords
  matcher_template: `You are an expert AI Agent matcher operating within the AIO protocol.

Your task is to match user intent keywords from a multi-step plan to the most relevant candidate MCP keywords.

The input is defined as:
- A step-based intent keyword structure ($1), where each step has an index and a list of intent-related keywords.
- A candidate keyword list ($2), which contains registered MCP service tags.

Your goal:
- For each step, select exactly **one** best-matching keyword from the candidate list.
- The output must be an array of the same length as the number of steps in the intent input.
- The output must be a valid JSON array.

Matching rules (apply in order of priority):
1. If any keyword in a step matches a candidate exactly, select that.
2. If not, choose the candidate with the highest structural or semantic similarity:
   - Use longest common subsequence (LCS) heuristics.
   - Apply semantic closeness or task relevance.
   - For \`prefix-suffix\` patterns (like \`text-image\`), prioritize stronger prefix match.
3. Only one keyword should be selected per step. Never return multiple options.
4. Output format must be a flat JSON array: one keyword per step, in step order.

Input ($1 - Intent Steps):
#INTENT_STEPS#

Input ($2 - Candidate MCP Keywords):
#CANDIDATE_KEYWORDS#

Return only the final output array:
[
  "match_keyword_for_step_0",
  "match_keyword_for_step_1"
]`
};

/**
 * Creates a matcher prompt for matching intent keywords to MCP keywords
 * @param intentSteps - The step-based intent keyword structure
 * @param candidateKeywords - The list of candidate MCP keywords
 * @returns The matcher prompt with the input data inserted
 */
export const createMatcherForKeywords = (
  intentSteps: Array<{ step: number; keywords: string[] }>,
  candidateKeywords: string[]
): string => {
  return realtimeKeywordsMappingPrompts.matcher_template
    .replace('#INTENT_STEPS#', JSON.stringify(intentSteps, null, 2))
    .replace('#CANDIDATE_KEYWORDS#', JSON.stringify(candidateKeywords, null, 2));
};

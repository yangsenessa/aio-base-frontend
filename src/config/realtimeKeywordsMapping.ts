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
- For each step, select the best-matching keywords from the candidate list.
- The output must be an array of arrays, where each inner array contains the matched keywords for that step.
- The output must be a valid JSON array.
- All returned keywords MUST be from the CANDIDATE_KEYWORDS list.

Matching rules (apply in order of priority):
1. Exact Match:
   - If any keyword in a step matches a candidate exactly, include that.
   - Case-insensitive matching is allowed.

2. Prefix-Suffix Pattern Match:
   - For \`prefix-suffix\` format keywords (like \`text-image\`):
     * Split both the intent keyword and candidate by \`-\`
     * Match each part separately
     * Calculate match score based on:
       - Exact match of prefix (higher weight)
       - Exact match of suffix (lower weight)
       - Partial match of prefix (medium weight)
       - Partial match of suffix (lowest weight)
     * Include candidates with high match scores

3. Semantic Similarity Match:
   - For remaining unmatched intent keywords:
     * Use longest common subsequence (LCS) to find structural similarity
     * Consider word-level semantic similarity
     * For single words, look for:
       - Synonyms
       - Related concepts
       - Task-relevant terms
     * Include candidates with high semantic relevance

4. Selection Criteria:
   - Each step can return multiple matching keywords
   - All returned keywords must be from CANDIDATE_KEYWORDS
   - For each step:
     * Include all keywords that meet the matching criteria
     * Order keywords by match quality (best matches first)
     * Prefer shorter keywords over longer ones
     * Prefer more specific keywords over general ones
     * Prefer standard format keywords over non-standard ones

Output format must be a JSON array of arrays: each inner array contains the matched keywords for that step, in step order.

Input ($1 - Intent Steps):
#INTENT_STEPS#

Input ($2 - Candidate MCP Keywords):
#CANDIDATE_KEYWORDS#

Return only the final output array:
[
  ["match_keyword1_for_step_0", "match_keyword2_for_step_0"],
  ["match_keyword1_for_step_1", "match_keyword2_for_step_1"]
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

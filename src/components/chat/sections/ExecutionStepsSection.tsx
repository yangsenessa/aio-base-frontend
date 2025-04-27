
import React, { useMemo } from 'react';
import { Workflow } from 'lucide-react';
import {
  createContentFingerprint,
  getCachedResult,
  isContentBeingProcessed,
  startContentProcessing,
  storeProcessedResult,
  hasReachedMaxAttempts
} from '@/util/json/processingTracker';
import { safeJsonParse, removeJsonComments } from '@/util/formatters';

interface ExecutionStepsSectionProps {
  content: string;
}

const ExecutionStepsSection: React.FC<ExecutionStepsSectionProps> = ({ content }) => {
  const processedContent = useMemo(() => {
    if (!content) return null;

    const contentFingerprint = createContentFingerprint(content);
    
    // Check for cached result first
    const cachedResult = getCachedResult(content);
    if (cachedResult) {
      console.log('[ExecutionStepsSection] Using cached result');
      return cachedResult;
    }
    
    // Check if content is already being processed and max attempts reached
    if (isContentBeingProcessed(content) && hasReachedMaxAttempts(content)) {
      console.log('[ExecutionStepsSection] Max processing attempts reached');
      return null;
    }
    
    // Mark content as being processed
    startContentProcessing(content);
    
    try {
      const cleanContent = removeJsonComments(content);
      const parsed = safeJsonParse(cleanContent);
      
      if (parsed?.execution_plan?.steps) {
        const processedSteps = parsed.execution_plan.steps.map((step: any, index: number) => ({
          id: index + 1,
          mcp: step.mcp || 'Unspecified MCP',
          action: step.action || 'Undefined Action',
          dependencies: step.dependencies || []
        }));
        
        // Store processed result in cache
        storeProcessedResult(content, processedSteps);
        
        return processedSteps;
      }
    } catch (error) {
      console.error('[ExecutionStepsSection] Processing error:', error);
    }
    
    return null;
  }, [content]);

  if (!processedContent) return null;

  return (
    <div className="p-4 mt-auto">
      <div className="flex items-center gap-2 mb-2 text-[#9b87f5]">
        <Workflow size={16} />
        <h3 className="font-semibold">Execution Plan</h3>
      </div>
      <div className="prose prose-invert max-w-none">
        <ol>
          {processedContent.map((step) => (
            <li key={step.id}>
              <strong>{step.mcp}: {step.action}</strong>
              {step.dependencies.length > 0 && (
                <div>
                  <small>Dependencies: {step.dependencies.join(', ')}</small>
                </div>
              )}
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
};

export default ExecutionStepsSection;

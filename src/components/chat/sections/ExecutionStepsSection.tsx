
import React from 'react';
import { Activity, ArrowRight } from 'lucide-react';

interface ExecutionStepsSectionProps {
  executionPlan?: {
    steps: Array<{
      mcp: string | string[];
      action: string;
    }>;
  };
  parsedStructuredData?: Record<string, any> | null;
  hideTitle?: boolean;
}

const ExecutionStepsSection: React.FC<ExecutionStepsSectionProps> = ({
  executionPlan,
  parsedStructuredData,
  hideTitle = false
}) => {
  const steps = parsedStructuredData?.execution_plan?.steps || executionPlan?.steps;
  
  if (!steps?.length) return null;

  return (
    <div className="p-4 border-b border-[#9b87f5]/20">
      {!hideTitle && (
        <div className="flex items-center gap-2 mb-2 text-[#9b87f5]">
          <Activity size={16} />
          <h3 className="font-semibold">Execution Steps</h3>
        </div>
      )}
      <div className="space-y-2">
        {steps.map((step, index) => (
          <div 
            key={index}
            className="flex items-center gap-2 p-2 rounded-md bg-[#2A2F3C] text-sm"
          >
            <ArrowRight size={14} className="text-[#9b87f5]" />
            <span>
              {Array.isArray(step.mcp) 
                ? step.mcp.map(m => String(m)).join(', ') 
                : String(step.mcp)}: {step.action}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ExecutionStepsSection;

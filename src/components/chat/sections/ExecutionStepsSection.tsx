
import React from 'react';
import { Activity, ArrowRight } from 'lucide-react';

interface ExecutionStep {
  mcp: string | string[];
  action: string;
}

interface ExecutionPlan {
  steps: ExecutionStep[];
}

interface ExecutionStepsSectionProps {
  executionPlan: ExecutionPlan | null;
  hideTitle?: boolean;
}

const ExecutionStepsSection: React.FC<ExecutionStepsSectionProps> = ({ 
  executionPlan,
  hideTitle = false
}) => {
  if (!executionPlan?.steps?.length) return null;

  return (
    <div className={hideTitle ? 'p-4' : 'p-4 border-b border-[#9b87f5]/20'}>
      <div className="flex items-center gap-2 mb-2 text-[#9b87f5]">
        <Activity size={16} />
        <h3 className="font-semibold">Execution Steps</h3>
      </div>
      <div className="space-y-2">
        {executionPlan.steps.map((step, index) => (
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

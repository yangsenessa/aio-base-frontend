
import React from 'react';
import { Card } from '../ui/card';
import { ScrollArea } from '../ui/scroll-area';
import { Info, Activity, ArrowRight } from 'lucide-react';

interface IntentStep {
  mcp: string;
  action: string;
  input: Record<string, any>;
  output: Record<string, any>;
  dependencies: string[];
}

interface ExecutionPlan {
  steps: IntentStep[];
  constraints: string[];
  quality_metrics: string[];
}

interface AIResponseCardProps {
  content: string;
  intentAnalysis?: Record<string, any>;
  executionPlan?: ExecutionPlan;
}

const AIResponseCard: React.FC<AIResponseCardProps> = ({ 
  content, 
  intentAnalysis, 
  executionPlan 
}) => {
  // For debugging
  React.useEffect(() => {
    console.log("AIResponseCard rendering with:", { 
      hasIntentAnalysis: !!intentAnalysis, 
      hasExecutionPlan: !!executionPlan,
      intentAnalysisKeys: intentAnalysis ? Object.keys(intentAnalysis) : [],
      executionSteps: executionPlan?.steps?.length || 0
    });
  }, [intentAnalysis, executionPlan]);

  return (
    <Card className="w-full bg-[#1A1F2C] text-white border-[#9b87f5]/20">
      {intentAnalysis && Object.keys(intentAnalysis).length > 0 && (
        <div className="p-4 border-b border-[#9b87f5]/20">
          <div className="flex items-center gap-2 mb-2 text-[#9b87f5]">
            <Info size={16} />
            <h3 className="font-semibold">Intent Analysis</h3>
          </div>
          <ScrollArea className="h-[150px] rounded-md bg-[#2A2F3C] p-2">
            <pre className="text-xs whitespace-pre-wrap">
              {JSON.stringify(intentAnalysis, null, 2)}
            </pre>
          </ScrollArea>
        </div>
      )}

      {executionPlan?.steps && executionPlan.steps.length > 0 && (
        <div className="p-4 border-b border-[#9b87f5]/20">
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
                  {step.mcp}: {step.action}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="p-4">
        <div className="prose prose-invert max-w-none">
          {content}
        </div>
      </div>
    </Card>
  );
};

export default AIResponseCard;

import React from 'react';
import { Card } from '../ui/card';
import { ScrollArea } from '../ui/scroll-area';
import { Info, Activity, ArrowRight, MessageCircle } from 'lucide-react';
import { Dialog, DialogContent, DialogTrigger } from '../ui/dialog';
import { Button } from '../ui/button';
import { isValidJson, extractJsonFromText } from '@/util/formatters';

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
  isModal?: boolean;
}

const AIResponseCard: React.FC<AIResponseCardProps> = ({ 
  content, 
  intentAnalysis, 
  executionPlan,
  isModal = false
}) => {
  React.useEffect(() => {
    console.log("AIResponseCard rendering with:", { 
      contentLength: content?.length || 0,
      hasIntentAnalysis: !!intentAnalysis, 
      intentAnalysisKeys: intentAnalysis ? Object.keys(intentAnalysis) : [],
      hasExecutionPlan: !!executionPlan,
      executionSteps: executionPlan?.steps?.length || 0,
      isModal
    });
  }, [content, intentAnalysis, executionPlan, isModal]);

  const getDisplayContent = (rawContent: string): string => {
    if (!rawContent) return '';
    
    try {
      // First, try to parse the content as JSON
      const extractedJson = extractJsonFromText(rawContent);
      
      if (extractedJson) {
        const parsedJson = JSON.parse(extractedJson);
        
        // Check if the JSON has all required structure for a modal
        const hasValidModalStructure = 
          (parsedJson.intent_analysis && Object.keys(parsedJson.intent_analysis).length > 0) ||
          (parsedJson.execution_plan && parsedJson.execution_plan.steps && parsedJson.execution_plan.steps.length > 0);
        
        // If JSON has valid modal structure, return full content for modal
        if (hasValidModalStructure) {
          return rawContent;
        }
        
        // If no valid modal structure, return the response text
        return parsedJson.response || rawContent;
      }
      
      // If no JSON found, return original content
      return rawContent;
    } catch (error) {
      console.error('Error parsing content:', error);
      return rawContent;
    }
  };

  const renderNestedObject = (obj: any, depth: number = 0): JSX.Element | JSX.Element[] => {
    if (!obj) return <span>null</span>;
    
    if (Array.isArray(obj)) {
      return (
        <ul className="list-disc pl-5 space-y-1">
          {obj.map((item, index) => (
            <li key={index} className="text-sm">
              {typeof item === 'object' && item !== null 
                ? renderNestedObject(item, depth + 1)
                : <span>{item}</span>}
            </li>
          ))}
        </ul>
      );
    }
    
    if (typeof obj === 'object' && obj !== null) {
      if (obj.action && obj.intent) {
        return (
          <div className="flex flex-col gap-1 p-2 rounded-md bg-[#2A2F3C] text-sm mb-2">
            <div className="font-medium text-[#9b87f5]">
              {obj.action}: {obj.intent}
            </div>
            {obj.dependencies && obj.dependencies.length > 0 && (
              <div className="text-xs pl-2">
                Dependencies: {obj.dependencies.join(', ')}
              </div>
            )}
          </div>
        );
      }
      
      return (
        <div className={`pl-${depth > 0 ? '2' : '0'}`}>
          {Object.entries(obj).map(([key, value], idx) => (
            <div key={idx} className="mb-1">
              {typeof value === 'object' && value !== null ? (
                <div>
                  <div className="font-medium text-[#9b87f5] text-sm">{key.replace(/_/g, ' ')}:</div>
                  <div className="pl-3">{renderNestedObject(value, depth + 1)}</div>
                </div>
              ) : (
                <div className="flex gap-1">
                  <span className="font-medium text-[#9b87f5] text-sm">{key.replace(/_/g, ' ')}:</span>
                  <span className="text-sm">{String(value)}</span>
                </div>
              )}
            </div>
          ))}
        </div>
      );
    }
    
    return <span>{String(obj)}</span>;
  };

  const renderIntentAnalysisItems = () => {
    if (!intentAnalysis) return null;
    
    // Check if intentAnalysis is an array (which shouldn't happen, but let's handle it)
    if (Array.isArray(intentAnalysis)) {
      return (
        <div className="p-2 rounded-md bg-[#2A2F3C] text-sm mb-2">
          {renderNestedObject(intentAnalysis)}
        </div>
      );
    }
    
    const items: JSX.Element[] = [];
    
    // Safely check for task decomposition with various possible key names
    const taskDecomposition = 
      intentAnalysis['Task_Decomposition'] || 
      intentAnalysis['task_decomposition'] || 
      intentAnalysis['Task Decomposition'] || 
      null;
    
    if (taskDecomposition && Array.isArray(taskDecomposition)) {
      taskDecomposition.forEach((task: any, index: number) => {
        items.push(
          <div key={`task-${index}`} className="flex items-center gap-2 p-2 rounded-md bg-[#2A2F3C] text-sm mb-2">
            <ArrowRight size={14} className="text-[#9b87f5]" />
            <span>
              {task.action}: {task.intent}
            </span>
          </div>
        );
      });
    }

    // Handle other properties in intentAnalysis
    Object.entries(intentAnalysis).forEach(([key, value]) => {
      if (Array.isArray(value) && (
        key === "Task Decomposition" || 
        key === "Task_Decomposition" || 
        key === "task_decomposition"
      )) {
        return; // Skip, already handled above
      }
      
      if (key === "constraints" || key === "quality_requirements") {
        return; // Skip, handled separately below
      }
      
      if (typeof value === 'string') {
        items.push(
          <div key={key} className="flex flex-col gap-1 p-2 rounded-md bg-[#2A2F3C] text-sm mb-2">
            <div className="font-medium text-[#9b87f5]">{key.replace(/_/g, ' ')}:</div>
            <div>{value}</div>
          </div>
        );
      }
    });

    // Safely handle constraints if they exist
    if (typeof intentAnalysis === 'object' && 
        !Array.isArray(intentAnalysis) && 
        intentAnalysis.constraints && 
        Array.isArray(intentAnalysis.constraints)) {
      items.push(
        <div key="constraints" className="flex flex-col gap-1 p-2 rounded-md bg-[#2A2F3C] text-sm mb-2">
          <div className="font-medium text-[#9b87f5]">Constraints:</div>
          <ul className="list-disc pl-5">
            {intentAnalysis.constraints.map((constraint, index) => (
              <li key={index}>{constraint}</li>
            ))}
          </ul>
        </div>
      );
    }

    // Safely handle quality requirements if they exist
    if (typeof intentAnalysis === 'object' && 
        !Array.isArray(intentAnalysis) && 
        intentAnalysis.quality_requirements && 
        Array.isArray(intentAnalysis.quality_requirements)) {
      items.push(
        <div key="quality" className="flex flex-col gap-1 p-2 rounded-md bg-[#2A2F3C] text-sm mb-2">
          <div className="font-medium text-[#9b87f5]">Quality Requirements:</div>
          <ul className="list-disc pl-5">
            {intentAnalysis.quality_requirements.map((req, index) => (
              <li key={index}>{req}</li>
            ))}
          </ul>
        </div>
      );
    }

    return items.length > 0 ? items : (
      <pre className="text-xs whitespace-pre-wrap">
        {JSON.stringify(intentAnalysis, null, 2)}
      </pre>
    );
  };

  const responseContent = (
    <Card className={`w-full bg-[#1A1F2C] text-white border-[#9b87f5]/20 ${isModal ? 'shadow-xl' : ''}`}>
      {intentAnalysis && Object.keys(intentAnalysis).length > 0 && (
        <div className="p-4 border-b border-[#9b87f5]/20">
          <div className="flex items-center gap-2 mb-2 text-[#9b87f5]">
            <Info size={16} />
            <h3 className="font-semibold">Intent Analysis</h3>
          </div>
          <ScrollArea className="h-[350px] rounded-md">
            <div className="space-y-1">
              {renderIntentAnalysisItems()}
            </div>
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
        <div className="flex items-center gap-2 mb-2 text-[#9b87f5]">
          <MessageCircle size={16} />
          <h3 className="font-semibold">Response</h3>
        </div>
        <div className="prose prose-invert max-w-none">
          {getDisplayContent(content)}
        </div>
      </div>
    </Card>
  );

  // Modify the rendering logic to prioritize modal
  if (isModal) {
    return responseContent;
  }

  // Try to parse the content and check if it warrants a modal
  const extractedJson = extractJsonFromText(content);
  if (extractedJson) {
    try {
      const parsedJson = JSON.parse(extractedJson);
      const hasValidModalStructure = 
        (parsedJson.intent_analysis && Object.keys(parsedJson.intent_analysis).length > 0) ||
        (parsedJson.execution_plan && parsedJson.execution_plan.steps && parsedJson.execution_plan.steps.length > 0);
      
      if (hasValidModalStructure) {
        return (
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline" className="w-full text-left justify-start">
                <div className="flex items-center gap-2">
                  <Info size={16} className="text-primary" />
                  <span className="truncate">View AI Analysis</span>
                </div>
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px] p-0 bg-transparent border-none">
              {responseContent}
            </DialogContent>
          </Dialog>
        );
      }
    } catch (error) {
      console.error('Error parsing JSON:', error);
    }
  }

  // If no modal structure, display plain text
  return (
    <div className="prose prose-invert max-w-none">
      {getDisplayContent(content)}
    </div>
  );
};

export default AIResponseCard;

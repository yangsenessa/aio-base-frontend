
import React from 'react';
import { Card } from '../ui/card';
import { ScrollArea } from '../ui/scroll-area';
import { Info, Activity, ArrowRight, MessageCircle } from 'lucide-react';
import { Dialog, DialogContent, DialogTrigger } from '../ui/dialog';
import { Button } from '../ui/button';

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
  // For debugging
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

  // Helper function to render nested objects and arrays recursively
  const renderNestedObject = (obj: any, depth: number = 0): JSX.Element | JSX.Element[] => {
    if (!obj) return <span>null</span>;
    
    // If it's an array
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
    
    // If it's an object
    if (typeof obj === 'object' && obj !== null) {
      // Special handling for Task Decomposition items
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
    
    // For primitive values
    return <span>{String(obj)}</span>;
  };

  // Format intent analysis items for better display
  const renderIntentAnalysisItems = () => {
    if (!intentAnalysis) return null;
    
    // If it's a nested structure, render it recursively
    if (typeof intentAnalysis === 'object' && !Array.isArray(intentAnalysis)) {
      return (
        <div className="p-2 rounded-md bg-[#2A2F3C] text-sm mb-2">
          {renderNestedObject(intentAnalysis)}
        </div>
      );
    }
    
    // For backward compatibility with the old display format
    const items = [];
    
    // Handle Task Decomposition specially if it exists
    if (typeof intentAnalysis === 'object' && !Array.isArray(intentAnalysis)) {
      // Safe access to potential task decomposition keys
      let taskDecomposition = null;
      
      if ('Task_Decomposition' in intentAnalysis) {
        taskDecomposition = intentAnalysis.Task_Decomposition;
      } else if ('task_decomposition' in intentAnalysis) {
        taskDecomposition = intentAnalysis.task_decomposition;
      } else if ('Task Decomposition' in intentAnalysis) {
        taskDecomposition = intentAnalysis['Task Decomposition'];
      }
      
      // Process task decomposition if found
      if (taskDecomposition && Array.isArray(taskDecomposition)) {
        taskDecomposition.forEach((task, index) => {
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
    }

    // Handle other items (skip arrays which we've handled specially)
    if (typeof intentAnalysis === 'object' && !Array.isArray(intentAnalysis)) {
      Object.entries(intentAnalysis).forEach(([key, value]) => {
        // Skip arrays we've already processed specially
        if (Array.isArray(value) && (key === "Task Decomposition" || key === "Task_Decomposition" || key === "task_decomposition")) {
          return;
        }
        
        // Skip constraints and quality metrics which might be handled separately
        if (key === "constraints" || key === "quality_requirements") {
          return;
        }
        
        // Format string values
        if (typeof value === 'string') {
          items.push(
            <div key={key} className="flex flex-col gap-1 p-2 rounded-md bg-[#2A2F3C] text-sm mb-2">
              <div className="font-medium text-[#9b87f5]">{key.replace(/_/g, ' ')}:</div>
              <div>{value}</div>
            </div>
          );
        }
      });
    }

    // Add constraints if they exist
    if (typeof intentAnalysis === 'object' && 
        !Array.isArray(intentAnalysis) && 
        'constraints' in intentAnalysis && 
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

    // Add quality requirements if they exist
    if (typeof intentAnalysis === 'object' && 
        !Array.isArray(intentAnalysis) && 
        'quality_requirements' in intentAnalysis && 
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
          {/* Extract just the response content, removing the **Response:** marker if present */}
          {content.includes("**Response:**") 
            ? content.split("**Response:**")[1].trim() 
            : content}
        </div>
      </div>
    </Card>
  );

  // If not using modal view, just return the card
  if (!isModal) {
    return responseContent;
  }

  // If modal view is enabled, wrap in dialog
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
};

export default AIResponseCard;

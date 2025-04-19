
import React from 'react';
import { Card } from '../ui/card';
import { ScrollArea } from '../ui/scroll-area';
import { Info, Activity, ArrowRight, MessageCircle } from 'lucide-react';
import { Dialog, DialogContent, DialogTrigger } from '../ui/dialog';
import { Button } from '../ui/button';
import { 
  cleanJsonString, 
  safeJsonParse, 
  hasModalStructure, 
  fixMalformedJson,
  getResponseFromModalJson
} from '@/util/formatters';

interface IntentStep {
  mcp: string | string[];
  action: string;
  input?: Record<string, any>;
  inputSchema?: Record<string, any>;
  output?: Record<string, any>;
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
      contentPreview: content?.substring(0, 100),
      hasIntentAnalysis: !!intentAnalysis, 
      intentAnalysisKeys: intentAnalysis ? Object.keys(intentAnalysis) : [],
      hasExecutionPlan: !!executionPlan,
      executionSteps: executionPlan?.steps?.length || 0,
      isModal
    });
  }, [content, intentAnalysis, executionPlan, isModal]);

  const getDisplayContent = (rawContent: string): string => {
    if (!rawContent) return '';
    
    // If we already have extracted structured data, just return the content
    if (intentAnalysis || executionPlan) {
      return rawContent;
    }
    
    try {
      // For JSON content
      if (rawContent.trim().startsWith('{')) {
        const fixedJson = fixMalformedJson(rawContent);
        try {
          const parsedJson = JSON.parse(fixedJson);
          
          // Check for response field
          if (parsedJson.response) {
            return parsedJson.response;
          }
          
          // Check modal structure
          if (hasModalStructure(parsedJson)) {
            const responseText = getResponseFromModalJson(parsedJson);
            if (responseText) return responseText;
          }
        } catch (error) {
          console.warn("Failed to parse JSON in getDisplayContent:", error);
        }
      }
      
      // For code blocks
      if (rawContent.includes('```json') || rawContent.includes('```')) {
        const cleanedJson = cleanJsonString(rawContent);
        try {
          const parsedJson = safeJsonParse(cleanedJson);
          
          if (parsedJson) {
            // Check for response field
            if (parsedJson.response) {
              return parsedJson.response;
            }
            
            // Check modal structure
            if (hasModalStructure(parsedJson)) {
              const responseText = getResponseFromModalJson(parsedJson);
              if (responseText) return responseText;
            }
          }
        } catch (error) {
          console.warn("Failed to parse cleaned JSON:", error);
        }
      }
      
      // For raw content with response marker
      if (rawContent.includes('"response"')) {
        const match = rawContent.match(/"response"\s*:\s*"([^"]+)"/);
        if (match && match[1]) {
          return match[1].replace(/\\n/g, '\n');
        }
      }
      
      return rawContent;
    } catch (error) {
      console.error('Error processing content in AIResponseCard:', error);
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
                : <span>{String(item)}</span>}
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
    
    if (Array.isArray(intentAnalysis)) {
      return (
        <div className="p-2 rounded-md bg-[#2A2F3C] text-sm mb-2">
          {renderNestedObject(intentAnalysis)}
        </div>
      );
    }
    
    const items: JSX.Element[] = [];
    
    // Process task decomposition if available
    const taskDecomposition = 
      intentAnalysis['Task_Decomposition'] || 
      intentAnalysis['task_decomposition'] || 
      intentAnalysis['Task Decomposition'] || 
      intentAnalysis['tasks'] ||
      (intentAnalysis['request_understanding'] ? null : intentAnalysis['task_decomposition']) ||
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

    // Process other keys (excluding certain ones)
    Object.entries(intentAnalysis).forEach(([key, value]) => {
      // Skip already processed task decomposition
      if (Array.isArray(value) && (
        key === "Task Decomposition" || 
        key === "Task_Decomposition" || 
        key === "task_decomposition" ||
        key === "tasks"
      )) {
        return;
      }
      
      // Skip constraints and quality requirements (handled separately)
      if (key === "constraints" || key === "quality_requirements") {
        return;
      }
      
      // Handle request_understanding specially
      if (key === "request_understanding" && typeof value === 'object') {
        items.push(
          <div key={key} className="flex flex-col gap-1 p-2 rounded-md bg-[#2A2F3C] text-sm mb-2">
            <div className="font-medium text-[#9b87f5]">Request Understanding:</div>
            <div>{renderNestedObject(value)}</div>
          </div>
        );
        return;
      }
      
      // Handle other fields based on their type
      if (typeof value === 'string' || typeof value === 'number' || Array.isArray(value)) {
        items.push(
          <div key={key} className="flex flex-col gap-1 p-2 rounded-md bg-[#2A2F3C] text-sm mb-2">
            <div className="font-medium text-[#9b87f5]">{key.replace(/_/g, ' ')}:</div>
            <div>
              {Array.isArray(value) ? (
                <ul className="list-disc pl-5">
                  {value.map((item, idx) => (
                    <li key={idx}>{typeof item === 'object' ? JSON.stringify(item) : String(item)}</li>
                  ))}
                </ul>
              ) : (
                value
              )}
            </div>
          </div>
        );
      } else if (typeof value === 'object' && value !== null) {
        items.push(
          <div key={key} className="flex flex-col gap-1 p-2 rounded-md bg-[#2A2F3C] text-sm mb-2">
            <div className="font-medium text-[#9b87f5]">{key.replace(/_/g, ' ')}:</div>
            <div>{renderNestedObject(value)}</div>
          </div>
        );
      }
    });

    // Handle constraints if present
    if (typeof intentAnalysis === 'object' && 
        !Array.isArray(intentAnalysis) && 
        intentAnalysis.constraints && 
        Array.isArray(intentAnalysis.constraints)) {
      items.push(
        <div key="constraints" className="flex flex-col gap-1 p-2 rounded-md bg-[#2A2F3C] text-sm mb-2">
          <div className="font-medium text-[#9b87f5]">Constraints:</div>
          <ul className="list-disc pl-5">
            {intentAnalysis.constraints.map((constraint: string, index: number) => (
              <li key={index}>{constraint}</li>
            ))}
          </ul>
        </div>
      );
    }

    // Handle quality requirements if present
    if (typeof intentAnalysis === 'object' && 
        !Array.isArray(intentAnalysis) && 
        intentAnalysis.quality_requirements && 
        Array.isArray(intentAnalysis.quality_requirements)) {
      items.push(
        <div key="quality" className="flex flex-col gap-1 p-2 rounded-md bg-[#2A2F3C] text-sm mb-2">
          <div className="font-medium text-[#9b87f5]">Quality Requirements:</div>
          <ul className="list-disc pl-5">
            {intentAnalysis.quality_requirements.map((req: string, index: number) => (
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

  const renderExecutionSteps = () => {
    if (!executionPlan?.steps || executionPlan.steps.length === 0) return null;
    
    return (
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
          {renderExecutionSteps()}
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

  if (isModal) {
    return responseContent;
  }

  const shouldShowModalButton = (): boolean => {
    // Always show modal button for structured content
    if ((intentAnalysis && Object.keys(intentAnalysis).length > 0) || 
        (executionPlan && executionPlan.steps && executionPlan.steps.length > 0)) {
      return true;
    }
    
    try {
      // Check for JSON content that might benefit from modal display
      if (content && content.trim().startsWith('{')) {
        const fixedJson = fixMalformedJson(content);
        try {
          const parsedJson = safeJsonParse(fixedJson);
          return parsedJson && hasModalStructure(parsedJson);
        } catch (error) {
          console.warn("JSON parse error in shouldShowModalButton:", error);
        }
      }
      
      // Check for code blocks that might contain structured data
      if (content && (content.includes('```json') || content.includes('```'))) {
        const cleanJson = cleanJsonString(content);
        const parsedJson = safeJsonParse(cleanJson);
        return parsedJson && hasModalStructure(parsedJson);
      }
      
      // Check for text indicators of structured content
      return content.includes('intent_analysis') || 
             content.includes('execution_plan') || 
             content.includes('response:') ||
             content.includes('"response"') ||
             content.includes('request_understanding');
    } catch (error) {
      console.error('Error checking for modal structure:', error);
      return false;
    }
  };

  if (shouldShowModalButton()) {
    console.log("Rendering modal dialog trigger button");
    return (
      <Dialog>
        <DialogTrigger asChild>
          <div className="space-y-1">
            <Button variant="outline" className="w-full text-left justify-start">
              <div className="flex items-center gap-2">
                <Info size={16} className="text-primary" />
                <span className="truncate">View AI Analysis</span>
              </div>
            </Button>
            <div className="text-center text-xs text-muted-foreground animate-pulse">
              Click to expand details
            </div>
          </div>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[600px] p-0 bg-transparent border-none">
          <AIResponseCard 
            content={content}
            intentAnalysis={intentAnalysis}
            executionPlan={executionPlan}
            isModal={true}
          />
        </DialogContent>
      </Dialog>
    );
  }

  const displayContent = getDisplayContent(content);
  return (
    <div className="prose prose-invert max-w-none">
      {displayContent}
    </div>
  );
};

export default AIResponseCard;

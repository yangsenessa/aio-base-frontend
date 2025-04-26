import React from 'react';
import { Activity, ArrowRight, Code } from 'lucide-react';

interface ExecutionStepsSectionProps {
  executionPlan?: {
    steps?: Array<{
      mcp?: string | string[];
      action?: string;
      [key: string]: any;
    }>;
    [key: string]: any;
  };
  parsedStructuredData?: Record<string, any> | null;
  hideTitle?: boolean;
  rawJson?: string;
}

const ExecutionStepsSection: React.FC<ExecutionStepsSectionProps> = ({
  executionPlan,
  parsedStructuredData,
  hideTitle = false,
  rawJson
}) => {
  // Enhanced steps extraction with extra debugging
  const getSteps = () => {
    let sourceDescription = '';
    let steps = null;
    
    // Debug exactly what's in the inputs
    console.log('[ExecutionStepsSection] Debug inputs:', {
      executionPlanRaw: executionPlan,
      stepsInExecutionPlan: executionPlan?.steps,
      parsedDataRaw: parsedStructuredData,
      executionPlanInParsedData: parsedStructuredData?.execution_plan,
      stepsInParsedData: parsedStructuredData?.execution_plan?.steps,
      hasRawJson: !!rawJson
    });
    
    // First, try to get steps directly from the executionPlan prop if it's not empty
    if (executionPlan?.steps?.length) {
      console.log('[ExecutionStepsSection] Found steps in direct executionPlan prop:', executionPlan.steps);
      sourceDescription = 'Direct executionPlan prop';
      steps = executionPlan.steps;
    }
    
    // Then, check if parsedStructuredData contains execution_plan with steps
    else if (parsedStructuredData?.execution_plan?.steps?.length) {
      console.log('[ExecutionStepsSection] Found steps in parsedStructuredData.execution_plan:', 
        parsedStructuredData.execution_plan.steps);
      sourceDescription = 'parsedStructuredData.execution_plan';
      steps = parsedStructuredData.execution_plan.steps;
    }
    
    // Handle case where steps exists but length check fails (steps might be an object)
    else if (parsedStructuredData?.execution_plan?.steps) {
      sourceDescription = 'parsedStructuredData.execution_plan.steps (without length)';
      
      // Try to convert to array if it's not already
      if (!Array.isArray(parsedStructuredData.execution_plan.steps)) {
        if (typeof parsedStructuredData.execution_plan.steps === 'object') {
          steps = Object.values(parsedStructuredData.execution_plan.steps);
          console.log('[ExecutionStepsSection] Converted object to array:', steps);
        }
      } else {
        steps = parsedStructuredData.execution_plan.steps;
      }
    }
    
    // Check direct property for backward compatibility with older formats
    else if (parsedStructuredData?.steps?.length) {
      sourceDescription = 'parsedStructuredData.steps';
      steps = parsedStructuredData.steps;
    }
    
    // Only create a synthetic step if we have no proper execution steps
    if (!steps || !steps.length) {
      // If still no steps and we have parsedStructuredData, create a synthetic step from intent analysis
      if (parsedStructuredData?.intent_analysis?.request_understanding) {
        const reqUnderstanding = parsedStructuredData.intent_analysis.request_understanding;
        if (reqUnderstanding.primary_goal) {
          sourceDescription = 'synthetic step from intent_analysis';
          const primaryGoal = reqUnderstanding.primary_goal;
          steps = [{
            mcp: 'IntentAnalysisMCP',
            action: primaryGoal,
            synthetic: true
          }];
          console.log('[ExecutionStepsSection] Created synthetic step from intent analysis:', steps);
        }
      }
      
      // Last resort - try to find any steps-like array in the parsed data
      if (!steps && parsedStructuredData) {
        // Try to recursively search for steps array
        const findSteps = (obj: any, path: string = ''): any[] | null => {
          if (!obj || typeof obj !== 'object') return null;
          
          // Check if this object has a steps property that's an array
          if (obj.steps && Array.isArray(obj.steps) && obj.steps.length > 0) {
            console.log(`[ExecutionStepsSection] Found steps at path: ${path}.steps`);
            return obj.steps;
          }
          
          // Check if this object has a property called 'execution_plan' with steps
          if (obj.execution_plan?.steps && Array.isArray(obj.execution_plan.steps) && obj.execution_plan.steps.length > 0) {
            console.log(`[ExecutionStepsSection] Found steps at path: ${path}.execution_plan.steps`);
            return obj.execution_plan.steps;
          }
          
          // Recurse into properties
          for (const key in obj) {
            if (typeof obj[key] === 'object' && obj[key] !== null) {
              const foundSteps = findSteps(obj[key], path ? `${path}.${key}` : key);
              if (foundSteps) return foundSteps;
            }
          }
          
          return null;
        };
        
        const foundSteps = findSteps(parsedStructuredData);
        if (foundSteps) {
          sourceDescription = 'found through recursive search';
          steps = foundSteps;
        }
      }
    }
    
    console.log(`[ExecutionStepsSection] Using steps from: ${sourceDescription}`);
    console.log('[ExecutionStepsSection] Final steps data:', steps);
    
    // Ensure we have an array of steps
    if (steps && !Array.isArray(steps)) {
      console.log('[ExecutionStepsSection] Converting non-array steps to array');
      steps = [steps]; // Wrap single step in array
    }
    
    // Ensure all steps are properly formatted
    if (Array.isArray(steps)) {
      steps = steps.map(step => ({
        ...step,
        mcp: step.mcp || 'UnknownMCP',
        action: step.action || 'unknown_action',
        synthetic: step.synthetic || false
      }));
    }
    
    return Array.isArray(steps) ? steps : [];
  };
  
  const steps = getSteps();
  
  // Debug logging
  React.useEffect(() => {
    console.log('[ExecutionStepsSection] Rendering with:', {
      hasExecutionPlan: !!executionPlan,
      hasParsedData: !!parsedStructuredData,
      hasRawJson: !!rawJson,
      stepsFromExecutionPlan: executionPlan?.steps?.length || 0,
      stepsFromParsedData: parsedStructuredData?.execution_plan?.steps?.length || 0,
      stepsFromDirectParsedData: parsedStructuredData?.steps?.length || 0,
      finalStepsCount: steps?.length || 0
    });
    
    if (parsedStructuredData?.execution_plan) {
      console.log('[ExecutionStepsSection] parsedStructuredData.execution_plan:', 
        JSON.stringify(parsedStructuredData.execution_plan, null, 2));
    }
    
    if (steps?.length) {
      console.log('[ExecutionStepsSection] Final Steps:', JSON.stringify(steps, null, 2));
    } else {
      console.log('[ExecutionStepsSection] No steps found');
    }
  }, [executionPlan, parsedStructuredData, rawJson, steps]);
  
  return (
    <div className="p-4">
      {!hideTitle && (
        <div className="flex items-center gap-2 mb-4 text-[#9b87f5]">
          <Activity size={18} />
          <h3 className="font-semibold text-lg">Execution Steps</h3>
        </div>
      )}
      
      {steps.length === 0 ? (
        <div className="rounded-md overflow-hidden mb-2">
          <div className="bg-[#1e2130] px-4 py-3 text-gray-400">
            No execution steps available
          </div>
        </div>
      ) : (
        <>
          {steps.map((step, index) => (
            <div 
              key={index}
              className="rounded-md overflow-hidden mb-3"
            >
              <div className="bg-[#1e2130] p-4">
                <div className="flex items-center mb-2">
                  <div className="flex items-center justify-center w-6 h-6 rounded-full bg-[#9b87f5]/20 text-[#9b87f5] mr-3">
                    {index + 1}
                  </div>
                  <div className="font-medium text-[#9b87f5] text-base">
                    {Array.isArray(step.mcp) 
                      ? step.mcp.map(m => String(m)).join(', ') 
                      : String(step.mcp || 'Step')}
                  </div>
                </div>
                
                {step.action && (
                  <div className="ml-9 flex items-center text-gray-200 mt-2">
                    <Code size={14} className="text-gray-400 mr-2 flex-shrink-0" />
                    <span className="mr-2">Action:</span>
                    <span className="font-mono bg-[#2A2F3C] px-2 py-1 rounded text-sm">{step.action}</span>
                  </div>
                )}
                
                {/* Only show synthetic origin if applicable */}
                {step.synthetic && (
                  <div className="ml-9 text-xs text-gray-400 italic mt-2">
                    Derived from intent analysis
                  </div>
                )}
              </div>
            </div>
          ))}
        </>
      )}
    </div>
  );
};

export default ExecutionStepsSection;

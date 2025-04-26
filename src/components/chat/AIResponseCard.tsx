import React from 'react';
import { Dialog, DialogContent, DialogTrigger } from '../ui/dialog';
import { Button } from '../ui/button';
import { Info } from 'lucide-react';
import { Card } from '../ui/card';
import IntentAnalysisSection from './sections/IntentAnalysisSection';
import ExecutionStepsSection from './sections/ExecutionStepsSection';
import ResponseSection from './sections/ResponseSection';
import { 
  extractJsonFromMarkdownSections, 
  safeJsonParse, 
  removeJsonComments, 
  cleanJsonString,
  fixMalformedJson,
  fixBackslashEscapeIssues,
  aggressiveBackslashFix
} from '@/util/formatters';
import { Box, Tab, Tabs } from '@mui/material';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';

interface AIResponseCardProps {
  content: string;
  intentAnalysis?: Record<string, any>;
  executionPlan?: {
    steps?: Array<{
      mcp?: string | string[];
      action?: string;
      [key: string]: any;
    }>;
    [key: string]: any;
  };
  isModal?: boolean;
  rawJson?: string;
}

const TabPanel = (props: any) => {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && <div>{children}</div>}
    </div>
  );
};

const AIResponseCard: React.FC<AIResponseCardProps> = ({ 
  content, 
  intentAnalysis, 
  executionPlan,
  isModal = false,
  rawJson
}) => {
  const [value, setValue] = React.useState(0);
  
  const parsedStructuredData = React.useMemo(() => {
    if (!content && !rawJson) return null;
    
    let result = null;
    console.log('Attempting to parse AI response data from:', { 
      contentLength: content?.length || 0, 
      rawJsonLength: rawJson?.length || 0 
    });
    
    if (content) {
      console.log('Content preview:', content.substring(0, 100));
    }
    if (rawJson) {
      console.log('RawJson preview:', rawJson.substring(0, 100));
    }
    
    // First try the specialized extractJsonFromMarkdownSections function
    // This handles formatted structured data like **Analysis:** sections
    if (content && (
      content.includes("**Analysis:**") || 
      content.includes("**Execution Plan:**") || 
      content.includes("**Response:**")
    )) {
      console.log('Found markdown sections, extracting structured data');
      const extractedData = extractJsonFromMarkdownSections(content);
      if (extractedData && Object.keys(extractedData).length > 0) {
        console.log('Successfully extracted data from markdown sections');
        result = extractedData;
      }
    }
    
    // If no result yet, try parsing from rawJson if available
    if (!result && rawJson) {
      console.log('Attempting to extract from rawJson');
      
      try {
        // First clean the rawJson by removing code block formatting
        let cleanJson = rawJson;
        if (cleanJson.startsWith('```json')) {
          cleanJson = cleanJson.substring(7); // Remove ```json prefix
          console.log('Removed ```json prefix');
        } else if (cleanJson.startsWith('```')) {
          cleanJson = cleanJson.substring(3); // Remove ``` prefix
          console.log('Removed ``` prefix');
        }
        
        if (cleanJson.endsWith('```')) {
          cleanJson = cleanJson.substring(0, cleanJson.length - 3); // Remove ``` suffix
          console.log('Removed ``` suffix');
        }
        
        cleanJson = cleanJson.trim(); // Remove any extra whitespace
        console.log('Cleaned json preview:', cleanJson.substring(0, 100));
        
        // Now try parsing the cleaned JSON
        const parsed = JSON.parse(cleanJson);
        if (parsed) {
          console.log('Successfully parsed JSON directly');
          result = parsed;
        }
      } catch (e) {
        console.log('Failed to parse JSON directly:', e);
        console.log('Trying cleanup methods');
        
        // Try our specialized utilities that handle JSON in code blocks
        const cleanedJson = cleanJsonString(rawJson);
        if (cleanedJson) {
          try {
            // Apply all our JSON fixing utilities in sequence
            const fixedJson = fixMalformedJson(cleanedJson);
            console.log('Fixed json preview:', fixedJson.substring(0, 100));
            
            const parsed = safeJsonParse(fixedJson);
            
            if (parsed) {
              console.log('Successfully parsed JSON using fixers');
              result = parsed;
            }
          } catch (e) {
            console.log('Failed to parse JSON after cleanup:', e);
          }
        }
      }
    }
    
    // If we still have no result, try parsing from content
    if (!result && content) {
      console.log('Attempting to parse from content');
      
      try {
        // First clean the content by removing code block formatting
        let cleanContent = content;
        if (cleanContent.startsWith('```json')) {
          cleanContent = cleanContent.substring(7); // Remove ```json prefix
          console.log('Removed ```json prefix from content');
        } else if (cleanContent.startsWith('```')) {
          cleanContent = cleanContent.substring(3); // Remove ``` prefix
          console.log('Removed ``` prefix from content');
        }
        
        if (cleanContent.endsWith('```')) {
          cleanContent = cleanContent.substring(0, cleanContent.length - 3); // Remove ``` suffix
          console.log('Removed ``` suffix from content');
        }
        
        cleanContent = cleanContent.trim(); // Remove any extra whitespace
        console.log('Cleaned content preview:', cleanContent.substring(0, 100));
        
        // Now try parsing the cleaned content
        const parsed = JSON.parse(cleanContent);
        if (parsed) {
          console.log('Successfully parsed content JSON directly');
          result = parsed;
        }
      } catch (e) {
        console.log('Failed to parse content JSON directly:', e);
        console.log('Trying content cleanup methods');
        
        // Try our specialized utilities that handle JSON in content
        const cleanedContent = cleanJsonString(content);
        if (cleanedContent) {
          try {
            // Apply all our JSON fixing utilities in sequence
            const fixedContent = fixMalformedJson(cleanedContent);
            console.log('Fixed content preview:', fixedContent.substring(0, 100));
            
            const parsed = safeJsonParse(fixedContent);
            
            if (parsed) {
              console.log('Successfully parsed content JSON using fixers');
              result = parsed;
            }
          } catch (e) {
            console.log('Failed to parse content JSON after cleanup:', e);
          }
        }
      }
    }
    
    // Only create a minimal structure if we have no structured data at all
    if (!result && content && content.trim() !== "") {
      console.log('Creating minimal structured data from content');
      
      // Check if content contains any keywords to identify potential goals
      const contentLower = content.toLowerCase();
      let primaryGoal = "general_chat";
      
      if (contentLower.includes("hello") || contentLower.includes("hi there") || contentLower.includes("hey") ||
          contentLower.includes("greetings") || contentLower.includes("welcome")) {
        primaryGoal = "greeting";
      } else if (contentLower.includes("how can i assist") || contentLower.includes("how can i help") ||
                contentLower.includes("checking in") || contentLower.includes("what do you need")) {
        primaryGoal = "check_in";
      }
      
      // Create a synthetic structured data object
      result = {
        intent_analysis: {
          request_understanding: {
            primary_goal: primaryGoal
          },
          text_representation: content
        },
        response: content
      };
    }
    
    // Add text_representation if we have raw content that wasn't included
    if (result && !result.intent_analysis?.text_representation && content) {
      if (!result.intent_analysis) {
        result.intent_analysis = {};
      }
      result.intent_analysis.text_representation = content;
    }
    
    // Always ensure response is available if we have content
    if (result && !result.response && content) {
      result.response = content;
    }
    
    console.log('Final parsedStructuredData result:', result);
    
    return result;
  }, [content, rawJson]);

  // For debugging
  React.useEffect(() => {
    console.log('AIResponseCard rendering with: ', {
      contentLength: content?.length || 0,
      contentPreview: content?.substring(0, 50),
      hasIntentAnalysis: !!intentAnalysis || !!(parsedStructuredData?.intent_analysis),
      intentAnalysisKeys: Object.keys(intentAnalysis || parsedStructuredData?.intent_analysis || {}),
      hasExecutionPlan: !!(executionPlan?.steps?.length) || !!(parsedStructuredData?.execution_plan?.steps?.length),
      executionSteps: executionPlan?.steps || parsedStructuredData?.execution_plan?.steps || [],
      parsedData: parsedStructuredData ? true : false,
      rawJsonLength: rawJson?.length || 0
    });
    
    if (parsedStructuredData) {
      console.log('parsedStructuredData:', JSON.stringify(parsedStructuredData, null, 2));
    }
    
    // Debug the execution plan structure specifically
    if (executionPlan) {
      console.log('ExecutionPlan structure:', JSON.stringify(executionPlan, null, 2));
    } else if (parsedStructuredData?.execution_plan) {
      console.log('Using parsedStructuredData.execution_plan instead');
      console.log('Parsed execution_plan structure:', JSON.stringify(parsedStructuredData.execution_plan, null, 2));
    }
    
    if (parsedStructuredData?.intent_analysis?.task_decomposition) {
      console.log('Task decomposition (fallback execution steps):', 
        JSON.stringify(parsedStructuredData.intent_analysis.task_decomposition, null, 2));
    }
    
    // Debug the response field
    if (parsedStructuredData?.response) {
      console.log('Response from parsedStructuredData:', parsedStructuredData.response);
    }
  }, [content, intentAnalysis, executionPlan, parsedStructuredData, rawJson]);

  // This is a critical function that prepares intent analysis data
  const getProcessedIntentAnalysis = () => {
    // Extract data from rawJson if available
    if (rawJson) {
      try {
        const jsonMatch = rawJson.match(/```json\s*([\s\S]*?)\s*```/);
        const jsonContent = jsonMatch ? jsonMatch[1] : rawJson;
        
        try {
          const parsed = JSON.parse(jsonContent);
          if (parsed && parsed.intent_analysis) {
            console.log('Using intent_analysis from rawJson');
            // Process the intent analysis data
            const processedAnalysis = { ...parsed.intent_analysis };
            // Remove fields we don't want to display
            delete processedAnalysis.text_representation;
            
            // If request_understanding exists, extract important fields and remove it
            if (processedAnalysis.request_understanding) {
              // Extract values we want to keep
              if (!processedAnalysis.primary_goal && processedAnalysis.request_understanding.primary_goal) {
                processedAnalysis.primary_goal = processedAnalysis.request_understanding.primary_goal;
              }
              if (!processedAnalysis.secondary_goals && processedAnalysis.request_understanding.secondary_goals) {
                processedAnalysis.secondary_goals = processedAnalysis.request_understanding.secondary_goals;
              }
              if (!processedAnalysis.constraints && processedAnalysis.request_understanding.constraints) {
                processedAnalysis.constraints = processedAnalysis.request_understanding.constraints;
              }
              if (!processedAnalysis.preferences && processedAnalysis.request_understanding.preferences) {
                processedAnalysis.preferences = processedAnalysis.request_understanding.preferences;
              }
              if (!processedAnalysis.background_info && processedAnalysis.request_understanding.background_info) {
                processedAnalysis.background_info = processedAnalysis.request_understanding.background_info;
              }
              // Remove the original request_understanding
              delete processedAnalysis.request_understanding;
            }
            
            return processedAnalysis;
          }
        } catch (e) {
          console.log('Failed to parse JSON from rawJson');
        }
      } catch (e) {
        console.log('Error processing rawJson');
      }
    }
    
    // First check if we have direct intentAnalysis prop
    if (intentAnalysis && Object.keys(intentAnalysis).length > 0) {
      console.log('Using direct intentAnalysis prop');
      // Process the intent analysis data
      const processedAnalysis = { ...intentAnalysis };
      // Remove fields we don't want to display
      delete processedAnalysis.text_representation;
      
      // If request_understanding exists, extract important fields and remove it
      if (processedAnalysis.request_understanding) {
        // Extract values we want to keep
        if (!processedAnalysis.primary_goal && processedAnalysis.request_understanding.primary_goal) {
          processedAnalysis.primary_goal = processedAnalysis.request_understanding.primary_goal;
        }
        if (!processedAnalysis.secondary_goals && processedAnalysis.request_understanding.secondary_goals) {
          processedAnalysis.secondary_goals = processedAnalysis.request_understanding.secondary_goals;
        }
        if (!processedAnalysis.constraints && processedAnalysis.request_understanding.constraints) {
          processedAnalysis.constraints = processedAnalysis.request_understanding.constraints;
        }
        if (!processedAnalysis.preferences && processedAnalysis.request_understanding.preferences) {
          processedAnalysis.preferences = processedAnalysis.request_understanding.preferences;
        }
        if (!processedAnalysis.background_info && processedAnalysis.request_understanding.background_info) {
          processedAnalysis.background_info = processedAnalysis.request_understanding.background_info;
        }
        // Remove the original request_understanding
        delete processedAnalysis.request_understanding;
      }
      
      return processedAnalysis;
    }
    
    // Then check parsedStructuredData
    if (parsedStructuredData?.intent_analysis) {
      console.log('Using intent_analysis from parsedStructuredData');
      // Process the intent analysis data
      const processedAnalysis = { ...parsedStructuredData.intent_analysis };
      // Remove fields we don't want to display
      delete processedAnalysis.text_representation;
      
      // If request_understanding exists, extract important fields and remove it
      if (processedAnalysis.request_understanding) {
        // Extract values we want to keep
        if (!processedAnalysis.primary_goal && processedAnalysis.request_understanding.primary_goal) {
          processedAnalysis.primary_goal = processedAnalysis.request_understanding.primary_goal;
        }
        if (!processedAnalysis.secondary_goals && processedAnalysis.request_understanding.secondary_goals) {
          processedAnalysis.secondary_goals = processedAnalysis.request_understanding.secondary_goals;
        }
        if (!processedAnalysis.constraints && processedAnalysis.request_understanding.constraints) {
          processedAnalysis.constraints = processedAnalysis.request_understanding.constraints;
        }
        if (!processedAnalysis.preferences && processedAnalysis.request_understanding.preferences) {
          processedAnalysis.preferences = processedAnalysis.request_understanding.preferences;
        }
        if (!processedAnalysis.background_info && processedAnalysis.request_understanding.background_info) {
          processedAnalysis.background_info = processedAnalysis.request_understanding.background_info;
        }
        // Remove the original request_understanding
        delete processedAnalysis.request_understanding;
      }
      
      return processedAnalysis;
    }
    
    // Check if we have any data at root level that could be intent analysis
    if (parsedStructuredData && !parsedStructuredData.intent_analysis) {
      // Check if we have keys that suggest this is actually intent analysis data
      const possibleIntentKeys = [
        'primary_goal', 'request_understanding', 'secondary_goals',
        'implicit_needs', 'constraints', 'preferences'
      ];
      
      const hasIntentKeys = possibleIntentKeys.some(key => 
        parsedStructuredData[key] !== undefined
      );
      
      if (hasIntentKeys) {
        console.log('Using root level data as intent analysis');
        // Process the intent analysis data
        const processedAnalysis = { ...parsedStructuredData };
        // Remove fields we don't want to display
        delete processedAnalysis.text_representation;
        
        // If request_understanding exists, extract important fields and remove it
        if (processedAnalysis.request_understanding) {
          // Extract values we want to keep
          if (!processedAnalysis.primary_goal && processedAnalysis.request_understanding.primary_goal) {
            processedAnalysis.primary_goal = processedAnalysis.request_understanding.primary_goal;
          }
          if (!processedAnalysis.secondary_goals && processedAnalysis.request_understanding.secondary_goals) {
            processedAnalysis.secondary_goals = processedAnalysis.request_understanding.secondary_goals;
          }
          if (!processedAnalysis.constraints && processedAnalysis.request_understanding.constraints) {
            processedAnalysis.constraints = processedAnalysis.request_understanding.constraints;
          }
          if (!processedAnalysis.preferences && processedAnalysis.request_understanding.preferences) {
            processedAnalysis.preferences = processedAnalysis.request_understanding.preferences;
          }
          if (!processedAnalysis.background_info && processedAnalysis.request_understanding.background_info) {
            processedAnalysis.background_info = processedAnalysis.request_understanding.background_info;
          }
          // Remove the original request_understanding
          delete processedAnalysis.request_understanding;
        }
        
        return processedAnalysis;
      }
    }
    
    // Create a simple intent analysis object if no structured data
    if (content) {
      console.log('Creating basic intent analysis from content');
      return {
        primary_goal: "greeting"
      };
    }
    
    return {}; // Empty object as fallback
  };

  const shouldShowModalButton = (): boolean => {
    // Always show for formatted content with markdown sections
    if (content?.includes("**Analysis:**") || 
        content?.includes("**Execution Plan:**") || 
        content?.includes("**Response:**")) {
      return true;
    }
    
    // Show if we have structured data
    if (intentAnalysis || 
        executionPlan?.steps?.length || 
        parsedStructuredData?.execution_plan?.steps?.length || 
        parsedStructuredData?.intent_analysis) {
      return true;
    }
    
    // Always show if we have the AI's response available and it's not empty
    if (content && content.trim() !== "" && 
        (content.includes("Hello") || 
         content.includes("Hi") || 
         content.includes("Hey") || 
         content.includes("assist") || 
         content.includes("help"))) {
      return true;
    }
    
    // Show if we have JSON content
    if (rawJson && rawJson.trim() !== "") {
      return true;
    }
    
    return false;
  };

  // Get execution steps from parsed data if not provided directly
  const getExecutionSteps = () => {
    // Check direct executionPlan prop
    if (executionPlan?.steps?.length) {
      console.log('Using direct executionPlan steps prop');
      return executionPlan.steps;
    }
    
    // Check parsedStructuredData
    if (parsedStructuredData?.execution_plan?.steps?.length) {
      console.log('Using execution_plan steps from parsedStructuredData');
      return parsedStructuredData.execution_plan.steps;
    }
    
    // Create a synthetic step from intent analysis
    const processedIntentAnalysis = getProcessedIntentAnalysis();
    const primaryGoal = processedIntentAnalysis.primary_goal || 
                        processedIntentAnalysis.request_understanding?.primary_goal;
    
    if (primaryGoal) {
      console.log('Creating synthetic step from primary goal:', primaryGoal);
      return [{
        mcp: 'IntentAnalysisMCP',
        action: primaryGoal,
        synthetic: true
      }];
    }
    
    return [];
  };

  // Get the best available execution plan
  const effectiveExecutionPlan = React.useMemo(() => {
    // First prioritize the direct executionPlan prop if it exists and has content
    if (executionPlan && Object.keys(executionPlan).length > 0) {
      console.log('Using direct executionPlan with steps:', executionPlan.steps?.length);
      return executionPlan;
    }
    
    // Then use the parsed structured data's execution_plan if available
    if (parsedStructuredData?.execution_plan) {
      console.log('Using parsedStructuredData.execution_plan with steps:', 
        parsedStructuredData.execution_plan.steps?.length);
      return parsedStructuredData.execution_plan;
    }
    
    // If we have rawJson, try to parse it directly
    if (rawJson) {
      try {
        const jsonMatch = rawJson.match(/```json\s*([\s\S]*?)\s*```/);
        const jsonContent = jsonMatch ? jsonMatch[1] : rawJson;
        const parsed = JSON.parse(jsonContent);
        
        if (parsed?.execution_plan) {
          console.log('Using execution_plan from rawJson');
          return parsed.execution_plan;
        }
      } catch (e) {
        console.log('Failed to parse execution_plan from rawJson:', e);
      }
    }
    
    // Try creating a plan directly from the content if it contains the word "respond" or similar
    if (content) {
      const responsePatterns = [
        /respond/i, /reply/i, /answer/i, /chat/i, /greeting/i, /hello/i, /hi there/i,
        /checking in/i, /how can I assist/i, /how can I help/i
      ];
      
      if (responsePatterns.some(pattern => pattern.test(content))) {
        console.log('Creating execution plan from content response pattern match');
        return {
          steps: [{
            mcp: 'TextUnderstandingMCP',
            action: 'respond',
            synthetic: true
          }]
        };
      }
    }
    
    // If no execution plan is found but we have intent analysis, create a synthetic one
    if (parsedStructuredData?.intent_analysis) {
      const primaryGoal = parsedStructuredData.intent_analysis.primary_goal || 
                          parsedStructuredData.intent_analysis.request_understanding?.primary_goal;
      
      if (primaryGoal) {
        console.log('Creating execution plan from intent analysis primary goal');
        return {
          steps: [{
            mcp: 'IntentAnalysisMCP',
            action: primaryGoal,
            synthetic: true
          }]
        };
      }
    }
    
    // Last resort - create a generic response step if nothing else is available
    if (content) {
      console.log('Creating generic execution plan as last resort');
      return {
        steps: [{
          mcp: 'TextUnderstandingMCP',
          action: 'respond',
          synthetic: true
        }]
      };
    }
    
    return undefined;
  }, [executionPlan, parsedStructuredData, content, rawJson]);

  // Debug logging for execution plan
  React.useEffect(() => {
    console.log('AIResponseCard execution plan debug:', {
      directExecutionPlan: executionPlan,
      parsedExecutionPlan: parsedStructuredData?.execution_plan,
      effectiveExecutionPlan,
      hasSteps: effectiveExecutionPlan?.steps?.length > 0,
      stepsCount: effectiveExecutionPlan?.steps?.length || 0
    });
  }, [executionPlan, parsedStructuredData, effectiveExecutionPlan]);

  const responseContent = (
    <div>
      <Box sx={{ 
        width: '100%', 
        borderBottom: 1, 
        borderColor: 'divider'
      }}>
        <Tabs 
          value={value} 
          onChange={(event, newValue) => setValue(newValue)} 
          aria-label="ai response tabs"
          sx={{ 
            '& .MuiTabs-indicator': { backgroundColor: '#9b87f5' },
            '& .MuiTab-root': { 
              color: 'rgba(255, 255, 255, 0.7)', 
              textTransform: 'uppercase', 
              fontWeight: 'bold',
              fontSize: '0.875rem',
              padding: '12px 16px',
              '&.Mui-selected': { color: '#9b87f5' } 
            }
          }}
        >
          <Tab label="Intent Analysis" />
          <Tab label="Execution Steps" />
          <Tab label="Response" />
        </Tabs>
      </Box>
      <TabPanel value={value} index={0}>
        <IntentAnalysisSection 
          intentAnalysis={getProcessedIntentAnalysis()} 
          hideTitle={!isModal}
        />
      </TabPanel>
      <TabPanel value={value} index={1}>
        <ExecutionStepsSection 
          executionPlan={effectiveExecutionPlan}
          parsedStructuredData={parsedStructuredData}
          hideTitle={!isModal}
          rawJson={rawJson}
        />
      </TabPanel>
      <TabPanel value={value} index={2}>
        <div className="p-4">
          <div className="prose prose-invert max-w-none whitespace-pre-wrap">
            {parsedStructuredData?.response || content || "No response available."}
          </div>
        </div>
      </TabPanel>
    </div>
  );

  if (isModal) {
    return responseContent;
  }

  if (shouldShowModalButton()) {
    return (
      <div>
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
          <DialogContent 
            className="sm:max-w-[800px] p-0 max-h-[90vh] overflow-y-auto bg-[#18192E] border-[#3A3F4C]"
            aria-description="AI Analysis Details"
          >
            <div className="dialog-header bg-[#18192E] p-4 pb-0">
              <div className="text-xl font-semibold text-white mb-2">
                Dialog content
              </div>
            </div>
            <div className="dialog-content">
              <AIResponseCard 
                content={content}
                intentAnalysis={intentAnalysis || parsedStructuredData?.intent_analysis}
                executionPlan={effectiveExecutionPlan}
                isModal={true}
              />
            </div>
          </DialogContent>
        </Dialog>
        
        <div className="mt-4 prose prose-invert max-w-none">
          {parsedStructuredData?.response || content || "No content available."}
        </div>
      </div>
    );
  }

  // Always show content as fallback, even if JSON parsing fails
  return (
    <div className="prose prose-invert max-w-none">
      {content ? (
        <>
          {/* Check if content looks like JSON in code blocks and clean it up for display */}
          {content.startsWith('```json') && content.endsWith('```') ? (
            <div>
              <p className="text-gray-400 text-sm mb-2">AI Response:</p>
              <div className="whitespace-pre-wrap">
                {parsedStructuredData?.response || content.substring(7, content.length - 3).trim()}
              </div>
            </div>
          ) : (
            <div className="whitespace-pre-wrap">{content}</div>
          )}
        </>
      ) : (
        "No content available."
      )}
    </div>
  );
};

export default AIResponseCard;


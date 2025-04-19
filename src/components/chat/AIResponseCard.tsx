
import React from 'react';
import { Card } from '../ui/card';
import { Dialog, DialogContent, DialogTrigger } from '../ui/dialog';
import { Button } from '../ui/button';
import { Info } from 'lucide-react';
import { extractJsonFromMarkdownSections } from '@/util/formatters';
import IntentAnalysisSection from './IntentAnalysisSection';
import ExecutionStepsSection from './ExecutionStepsSection';
import ResponseSection from './ResponseSection';

interface AIResponseCardProps {
  content: string;
  intentAnalysis?: Record<string, any>;
  executionPlan?: {
    steps: Array<{
      mcp: string | string[];
      action: string;
    }>;
  };
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

  const parsedStructuredData = React.useMemo(() => {
    if (!content) return null;
    
    if (
      content.includes("**Analysis:**") || 
      content.includes("**Execution Plan:**") || 
      content.includes("**Response:**")
    ) {
      try {
        return extractJsonFromMarkdownSections(content);
      } catch (error) {
        console.error("Failed to parse markdown sections:", error);
        return null;
      }
    }
    
    return null;
  }, [content]);

  const responseContent = (
    <Card className={`w-full bg-[#1A1F2C] text-white border-[#9b87f5]/20 ${isModal ? 'shadow-xl' : ''}`}>
      <IntentAnalysisSection 
        intentAnalysis={intentAnalysis} 
        parsedStructuredData={parsedStructuredData} 
      />
      <ExecutionStepsSection 
        executionPlan={executionPlan} 
        parsedStructuredData={parsedStructuredData}
      />
      <ResponseSection content={content} />
    </Card>
  );

  const shouldShowModalButton = (): boolean => {
    if (content.includes("**Analysis:**") || 
        content.includes("**Execution Plan:**") || 
        content.includes("**Response:**")) {
      return true;
    }
    
    return !!(intentAnalysis || executionPlan?.steps?.length);
  };

  if (isModal) {
    return responseContent;
  }

  if (shouldShowModalButton()) {
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
        <DialogContent 
          className="sm:max-w-[600px] p-0 bg-transparent border-none" 
          hideTitle
          description="AI Analysis Details"
        >
          <AIResponseCard 
            content={content}
            intentAnalysis={intentAnalysis || parsedStructuredData?.intent_analysis}
            executionPlan={executionPlan || parsedStructuredData?.execution_plan}
            isModal={true}
          />
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <div className="prose prose-invert max-w-none">
      {content || "No content available."}
    </div>
  );
};

export default AIResponseCard;

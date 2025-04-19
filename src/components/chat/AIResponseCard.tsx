
import React from 'react';
import { Dialog, DialogContent, DialogTrigger } from '../ui/dialog';
import { Button } from '../ui/button';
import { Info } from 'lucide-react';
import { Card } from '../ui/card';
import IntentAnalysisSection from './sections/IntentAnalysisSection';
import ExecutionStepsSection from './sections/ExecutionStepsSection';
import ResponseSection from './sections/ResponseSection';
import { extractJsonFromMarkdownSections } from '@/util/formatters';

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
  const parsedStructuredData = React.useMemo(() => {
    if (!content) return null;
    
    if (
      content.includes("**Analysis:**") || 
      content.includes("**Execution Plan:**") || 
      content.includes("**Response:**")
    ) {
      return extractJsonFromMarkdownSections(content);
    }
    
    return null;
  }, [content]);

  // For debugging
  React.useEffect(() => {
    console.log('AIResponseCard rendering with: ', {
      contentLength: content?.length || 0,
      contentPreview: content?.substring(0, 50),
      hasIntentAnalysis: !!intentAnalysis || !!(parsedStructuredData?.intent_analysis),
      intentAnalysisKeys: Object.keys(intentAnalysis || parsedStructuredData?.intent_analysis || {}),
      hasExecutionPlan: !!(executionPlan?.steps?.length) || !!(parsedStructuredData?.execution_plan?.steps?.length),
      parsedData: !!parsedStructuredData
    });
  }, [content, intentAnalysis, executionPlan, parsedStructuredData]);

  const shouldShowModalButton = (): boolean => {
    if (content?.includes("**Analysis:**") || 
        content?.includes("**Execution Plan:**") || 
        content?.includes("**Response:**")) {
      return true;
    }
    
    return !!(intentAnalysis || executionPlan?.steps?.length);
  };

  const responseContent = (
    <Card className={`w-full bg-[#1A1F2C] text-white border-[#9b87f5]/20 ${isModal ? 'shadow-xl' : ''}`}>
      <IntentAnalysisSection 
        intentAnalysis={intentAnalysis || parsedStructuredData?.intent_analysis} 
        hideTitle={!isModal}
      />
      <ExecutionStepsSection 
        executionPlan={executionPlan || parsedStructuredData?.execution_plan}
        hideTitle={!isModal}
      />
      <ResponseSection 
        content={content} 
        hideTitle={!isModal}
      />
    </Card>
  );

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
          aria-description="AI Analysis Details"
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

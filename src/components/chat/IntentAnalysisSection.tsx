
import React from 'react';
import { ScrollArea } from '../ui/scroll-area';
import { Info } from 'lucide-react';
import { renderNestedObject } from '@/util/renderUtils';

interface IntentAnalysisSectionProps {
  intentAnalysis: Record<string, any> | null;
  parsedStructuredData?: Record<string, any> | null;
}

const IntentAnalysisSection: React.FC<IntentAnalysisSectionProps> = ({
  intentAnalysis,
  parsedStructuredData
}) => {
  if (!intentAnalysis && !parsedStructuredData?.intent_analysis) return null;

  return (
    <div className="p-4 border-b border-[#9b87f5]/20">
      <div className="flex items-center gap-2 mb-2 text-[#9b87f5]">
        <Info size={16} />
        <h3 className="font-semibold">Intent Analysis</h3>
      </div>
      <ScrollArea className="h-[350px] rounded-md">
        <div className="space-y-1">
          {renderNestedObject(parsedStructuredData?.intent_analysis || intentAnalysis)}
        </div>
      </ScrollArea>
    </div>
  );
};

export default IntentAnalysisSection;

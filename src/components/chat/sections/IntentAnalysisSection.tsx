
import React from 'react';
import { Info } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';

interface IntentAnalysisSectionProps {
  intentAnalysis: Record<string, any> | null;
  hideTitle?: boolean;
}

const IntentAnalysisSection: React.FC<IntentAnalysisSectionProps> = ({ 
  intentAnalysis,
  hideTitle = false
}) => {
  if (!intentAnalysis || Object.keys(intentAnalysis).length === 0) {
    return null;
  }

  return (
    <div className={hideTitle ? 'p-4' : 'p-4 border-b border-[#9b87f5]/20'}>
      <div className="flex items-center gap-2 mb-2 text-[#9b87f5]">
        <Info size={16} />
        <h3 className="font-semibold">Intent Analysis</h3>
      </div>
      <ScrollArea className="h-[350px] rounded-md">
        <div className="space-y-1">
          {renderIntentAnalysis(intentAnalysis)}
        </div>
      </ScrollArea>
    </div>
  );
};

const renderIntentAnalysis = (analysis: Record<string, any>): JSX.Element => {
  return (
    <div className="pl-0">
      {Object.entries(analysis).map(([key, value], idx) => (
        <div key={idx} className="mb-1">
          {typeof value === 'object' && value !== null ? (
            <div>
              <div className="font-medium text-[#9b87f5] text-sm">
                {key.replace(/_/g, ' ')}:
              </div>
              <div className="pl-3">
                {renderIntentAnalysis(value)}
              </div>
            </div>
          ) : (
            <div className="flex gap-1">
              <span className="font-medium text-[#9b87f5] text-sm">
                {key.replace(/_/g, ' ')}:
              </span>
              <span className="text-sm">{String(value)}</span>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default IntentAnalysisSection;

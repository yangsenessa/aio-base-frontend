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
  const {
    primary_goal,
    secondary_goals,
    implicit_needs,
    request_understanding,
    constraints,
    preferences,
    background_info,
  } = intentAnalysis || {};

  if (!intentAnalysis && !parsedStructuredData?.intent_analysis) return null;

  return (
    <div className="intent-analysis-section w-full p-0 pt-2">
      {/* Primary Goal Section */}
      {primary_goal && (
        <div className="rounded-md overflow-hidden mb-2">
          <div className="text-[#9b87f5] text-sm px-4 py-2">primary goal:</div>
          <div className="bg-[#1e2130] px-4 py-3 text-white">
            {primary_goal}
          </div>
        </div>
      )}

      {/* Secondary Goals Section */}
      {secondary_goals && secondary_goals.length > 0 && (
        <div className="rounded-md overflow-hidden mb-2">
          <div className="text-[#9b87f5] text-sm px-4 py-2">secondary goals:</div>
          <div className="bg-[#1e2130] px-4 py-3 text-white">
            <ul className="list-disc pl-5">
              {secondary_goals.map((goal, index) => (
                <li key={index}>{goal}</li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* Implicit Needs Section */}
      {implicit_needs && implicit_needs.length > 0 && (
        <div className="rounded-md overflow-hidden mb-2">
          <div className="text-[#9b87f5] text-sm px-4 py-2">implicit needs:</div>
          <div className="bg-[#1e2130] px-4 py-3 text-white">
            <ul className="list-disc pl-5">
              {implicit_needs.map((need, index) => (
                <li key={index}>{need}</li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* Constraints Section */}
      {constraints && constraints.length > 0 && (
        <div className="rounded-md overflow-hidden mb-2">
          <div className="text-[#9b87f5] text-sm px-4 py-2">constraints:</div>
          <div className="bg-[#1e2130] px-4 py-3 text-white">
            <ul className="list-disc pl-5">
              {constraints.map((constraint, index) => (
                <li key={index}>{constraint}</li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* Preferences Section */}
      {preferences && preferences.length > 0 && (
        <div className="rounded-md overflow-hidden mb-2">
          <div className="text-[#9b87f5] text-sm px-4 py-2">preferences:</div>
          <div className="bg-[#1e2130] px-4 py-3 text-white">
            <ul className="list-disc pl-5">
              {preferences.map((preference, index) => (
                <li key={index}>{preference}</li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* Background Info Section */}
      {background_info && background_info.length > 0 && (
        <div className="rounded-md overflow-hidden mb-2">
          <div className="text-[#9b87f5] text-sm px-4 py-2">background info:</div>
          <div className="bg-[#1e2130] px-4 py-3 text-white">
            <ul className="list-disc pl-5">
              {background_info.map((info, index) => (
                <li key={index}>{info}</li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};

export default IntentAnalysisSection;

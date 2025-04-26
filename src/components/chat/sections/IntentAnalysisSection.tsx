import React from 'react';
import { InfoIcon } from 'lucide-react';

interface IntentAnalysisSectionProps {
  intentAnalysis?: Record<string, any>;
  hideTitle?: boolean;
}

const IntentAnalysisSection: React.FC<IntentAnalysisSectionProps> = ({ 
  intentAnalysis, 
  hideTitle = false 
}) => {
  // No analysis data available
  if (!intentAnalysis || Object.keys(intentAnalysis).length === 0) {
    return (
      <div className="p-4">
        {!hideTitle && (
          <div className="flex items-center gap-2 mb-2 text-[#9b87f5]">
            <InfoIcon size={16} />
            <h3 className="font-semibold">Intent Analysis</h3>
          </div>
        )}
        <div className="rounded-md overflow-hidden mb-2">
          <div className="bg-[#1e2130] px-4 py-3 text-gray-400">
            No intent analysis available
          </div>
        </div>
      </div>
    );
  }

  // Log the data we're working with for debugging
  console.log('IntentAnalysisSection rendering with data:', intentAnalysis);

  // Handle minimal case with just primary_goal
  if (typeof intentAnalysis === 'object' && Object.keys(intentAnalysis).length === 1 && intentAnalysis.primary_goal) {
    return (
      <div className="p-4">
        {!hideTitle && (
          <div className="flex items-center gap-2 mb-4 text-[#9b87f5]">
            <InfoIcon size={18} />
            <h3 className="font-semibold text-lg">Intent Analysis</h3>
          </div>
        )}
        
        <div className="rounded-md overflow-hidden mb-2">
          <div className="text-[#9b87f5] text-sm px-4 py-2">primary goal:</div>
          <div className="bg-[#1e2130] px-4 py-3 text-white">
            {intentAnalysis.primary_goal}
          </div>
        </div>
      </div>
    );
  }

  const requestUnderstanding = intentAnalysis.request_understanding || {};
  const primaryGoal = requestUnderstanding.primary_goal || intentAnalysis.primary_goal || "";
  const secondaryGoals = requestUnderstanding.secondary_goals || intentAnalysis.secondary_goals || [];
  const constraints = requestUnderstanding.constraints || intentAnalysis.constraints || [];
  const preferences = requestUnderstanding.preferences || intentAnalysis.preferences || [];
  const backgroundInfo = requestUnderstanding.background_info || intentAnalysis.background_info || [];
  const implicitNeeds = intentAnalysis.implicit_needs || [];

  return (
    <div className="p-4">
      {!hideTitle && (
        <div className="flex items-center gap-2 mb-4 text-[#9b87f5]">
          <InfoIcon size={18} />
          <h3 className="font-semibold text-lg">Intent Analysis</h3>
        </div>
      )}
      
      {/* Primary Goal Section */}
      {primaryGoal && (
        <div className="rounded-md overflow-hidden mb-2">
          <div className="text-[#9b87f5] text-sm px-4 py-2">primary goal:</div>
          <div className="bg-[#1e2130] px-4 py-3 text-white">
            {primaryGoal}
          </div>
        </div>
      )}
      
      {/* Request Understanding Section */}
      {requestUnderstanding && 
       (requestUnderstanding.description || typeof requestUnderstanding === 'string' || 
        (typeof requestUnderstanding === 'object' && Object.keys(requestUnderstanding).length > 0 &&
         !requestUnderstanding.primary_goal && !requestUnderstanding.secondary_goals && 
         !requestUnderstanding.constraints && !requestUnderstanding.preferences && 
         !requestUnderstanding.background_info)) && (
        <div className="rounded-md overflow-hidden mb-2">
          <div className="text-[#9b87f5] text-sm px-4 py-2">request understanding:</div>
          <div className="bg-[#1e2130] px-4 py-3 text-white">
            {typeof requestUnderstanding === 'string' 
              ? requestUnderstanding 
              : (requestUnderstanding.description || JSON.stringify(requestUnderstanding, null, 2))}
          </div>
        </div>
      )}
      
      {/* Secondary Goals Section */}
      {secondaryGoals && secondaryGoals.length > 0 && (
        <div className="rounded-md overflow-hidden mb-2">
          <div className="text-[#9b87f5] text-sm px-4 py-2">secondary goals:</div>
          <div className="bg-[#1e2130] px-4 py-3 text-white">
            <ul className="list-disc pl-5 space-y-1">
              {secondaryGoals.map((goal: any, index: number) => (
                <li key={index}>
                  {typeof goal === 'string' ? goal : JSON.stringify(goal)}
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
      
      {/* Implicit Needs Section */}
      {implicitNeeds && implicitNeeds.length > 0 && (
        <div className="rounded-md overflow-hidden mb-2">
          <div className="text-[#9b87f5] text-sm px-4 py-2">implicit needs:</div>
          <div className="bg-[#1e2130] px-4 py-3 text-white">
            <ul className="list-disc pl-5 space-y-1">
              {implicitNeeds.map((need: any, index: number) => (
                <li key={index}>
                  {typeof need === 'string' ? need : JSON.stringify(need)}
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
      
      {/* Constraints Section */}
      {constraints && (
        <div className="rounded-md overflow-hidden mb-2">
          <div className="text-[#9b87f5] text-sm px-4 py-2">Constraints:</div>
          <div className="bg-[#1e2130] px-4 py-3 text-white">
            {constraints.length === 0 ? (
              <div className="text-gray-400">None specified</div>
            ) : (
              <ul className="list-disc pl-5 space-y-1">
                {constraints.map((constraint: any, index: number) => (
                  <li key={index}>
                    {typeof constraint === 'string' ? constraint : JSON.stringify(constraint)}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}
      
      {/* Preferences Section */}
      {preferences && (
        <div className="rounded-md overflow-hidden mb-2">
          <div className="text-[#9b87f5] text-sm px-4 py-2">Preferences:</div>
          <div className="bg-[#1e2130] px-4 py-3 text-white">
            {preferences.length === 0 ? (
              <div className="text-gray-400">None specified</div>
            ) : (
              <ul className="list-disc pl-5 space-y-1">
                {preferences.map((pref: any, index: number) => (
                  <li key={index}>
                    {typeof pref === 'string' ? pref : JSON.stringify(pref)}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}
      
      {/* Background Info Section */}
      {backgroundInfo && (
        <div className="rounded-md overflow-hidden mb-2">
          <div className="text-[#9b87f5] text-sm px-4 py-2">Background Info:</div>
          <div className="bg-[#1e2130] px-4 py-3 text-white">
            {backgroundInfo.length === 0 ? (
              <div className="text-gray-400">None specified</div>
            ) : (
              <ul className="list-disc pl-5 space-y-1">
                {backgroundInfo.map((info: any, index: number) => (
                  <li key={index}>
                    {typeof info === 'string' ? info : JSON.stringify(info)}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}
      
      {/* Handle other properties that might be at the root level */}
      {Object.keys(intentAnalysis)
        .filter(key => 
          !['request_understanding', 'primary_goal', 'secondary_goals', 
            'constraints', 'preferences', 'background_info', 'implicit_needs', 
            'text_representation', 'task_decomposition', 'execution_plan', 'modality_analysis', 'capability_mapping'].includes(key)
        )
        .map(key => {
          const value = intentAnalysis[key];
          if (!value || (Array.isArray(value) && value.length === 0)) return null;
          
          return (
            <div key={key} className="rounded-md overflow-hidden mb-2">
              <div className="text-[#9b87f5] text-sm px-4 py-2">{key.replace(/_/g, ' ')}:</div>
              <div className="bg-[#1e2130] px-4 py-3 text-white">
                {typeof value === 'string' ? (
                  value
                ) : Array.isArray(value) ? (
                  <ul className="list-disc pl-5 space-y-1">
                    {value.map((item: any, index: number) => (
                      <li key={index}>
                        {typeof item === 'string' ? item : JSON.stringify(item)}
                      </li>
                    ))}
                  </ul>
                ) : (
                  JSON.stringify(value)
                )}
              </div>
            </div>
          );
        })}
    </div>
  );
};

export default IntentAnalysisSection;

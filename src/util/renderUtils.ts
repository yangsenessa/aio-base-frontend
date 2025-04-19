
export const renderNestedObject = (obj: any, depth: number = 0): JSX.Element | JSX.Element[] => {
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

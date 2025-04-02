
import { useState, useEffect } from 'react';
import { useToast } from '@/components/ui/use-toast';
import type { AgentItem } from 'declarations/aio-base-backend/aio-base-backend.did.d.ts';

export function useAgentTesting(agent: AgentItem) {
  const { toast } = useToast();
  const [inputData, setInputData] = useState('');
  const [outputData, setOutputData] = useState('');
  const [isExecuting, setIsExecuting] = useState(false);

  // Initialize default input data based on agent info
  useEffect(() => {
    const defaultInput = {
      jsonrpc: "2.0",
      method: `${agent.name}::process`,
      inputs: [
        {
          type: "text",
          value: "This is a test input"
        }
      ],
      id: 1,
      trace_id: `test-${Date.now()}`
    };
    
    // Use agent's input_params if available, otherwise use default
    if (agent.input_params.length > 0) {
      try {
        const parsedInput = JSON.parse(agent.input_params[0]);
        setInputData(JSON.stringify(parsedInput, null, 2));
      } catch {
        setInputData(JSON.stringify(defaultInput, null, 2));
      }
    } else {
      setInputData(JSON.stringify(defaultInput, null, 2));
    }
  }, [agent]);

  const handleExecute = () => {
    setIsExecuting(true);

    // Simulate API call to execute agent
    setTimeout(() => {
      try {
        const inputJson = JSON.parse(inputData);
        const outputJson = {
          jsonrpc: "2.0",
          id: inputJson.id,
          trace_id: inputJson.trace_id,
          outputs: [
            {
              type: "text",
              value: `Processed by ${agent.name}: ${inputJson.inputs?.[0]?.value || 'No input provided'}`
            }
          ]
        };
        
        // Use agent's output_example if available
        if (agent.output_example.length > 0) {
          try {
            const parsedOutput = JSON.parse(agent.output_example[0]);
            setOutputData(JSON.stringify(parsedOutput, null, 2));
          } catch {
            setOutputData(JSON.stringify(outputJson, null, 2));
          }
        } else {
          setOutputData(JSON.stringify(outputJson, null, 2));
        }
        
        toast({
          title: "Agent executed successfully",
          description: "The agent has processed your input"
        });
      } catch (error) {
        console.error('Error parsing input JSON:', error);
        toast({
          title: "Invalid JSON",
          description: "Please provide valid JSON input",
          variant: "destructive"
        });
      } finally {
        setIsExecuting(false);
      }
    }, 1500);
  };

  return {
    inputData,
    setInputData,
    outputData,
    isExecuting,
    handleExecute
  };
}

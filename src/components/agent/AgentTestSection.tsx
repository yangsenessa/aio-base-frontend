
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/components/ui/use-toast';
import type { AgentItem } from 'declarations/aio-base-backend/aio-base-backend.did.d.ts';

interface AgentTestSectionProps {
  agent: AgentItem;
}

const AgentTestSection = ({ agent }: AgentTestSectionProps) => {
  const { toast } = useToast();
  const [inputData, setInputData] = useState('');
  const [outputData, setOutputData] = useState('');
  const [isExecuting, setIsExecuting] = useState(false);

  // Initialize default input data based on agent info
  React.useEffect(() => {
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

  return (
    <Card>
      <CardHeader>
        <CardTitle>Test Agent</CardTitle>
        <CardDescription>
          Send inputs to the agent and see outputs in real-time
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="test">
          <TabsList className="mb-4">
            <TabsTrigger value="test">Test Agent</TabsTrigger>
            <TabsTrigger value="examples">Examples</TabsTrigger>
          </TabsList>
          
          <TabsContent value="test" className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Input JSON (AIO Protocol Format)</label>
              <Textarea 
                value={inputData} 
                onChange={e => setInputData(e.target.value)} 
                className="font-mono text-sm"
                size="lg"
              />
            </div>
            
            <Button onClick={handleExecute} disabled={isExecuting} className="w-full">
              {isExecuting ? 'Executing...' : 'Execute Agent'}
            </Button>
            
            {outputData && (
              <div>
                <label className="text-sm font-medium mb-2 block">Output</label>
                <pre className="bg-slate-100 dark:bg-slate-800 p-4 rounded overflow-auto h-40 text-sm">
                  {outputData}
                </pre>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="examples">
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium">Example 1: Basic Text Input</h3>
                <pre className="p-3 rounded mt-1 text-xs overflow-auto bg-slate-700 text-white">
                {`{
  "jsonrpc": "2.0",
  "method": "${agent.name}::process",
  "inputs": [
    {
      "type": "text",
      "value": "Analyze this document"
    }
  ],
  "id": 1,
  "trace_id": "example-1"
}`}
                </pre>
              </div>
              
              <div>
                <h3 className="text-sm font-medium">Example 2: Multiple Inputs</h3>
                <pre className="p-3 rounded mt-1 text-xs overflow-auto bg-gray-700 text-white">
                {`{
  "jsonrpc": "2.0",
  "method": "${agent.name}::process",
  "inputs": [
    {
      "type": "text",
      "value": "Compare these two items"
    },
    {
      "type": "file",
      "value": "base64-encoded-file-data"
    }
  ],
  "id": 2,
  "trace_id": "example-2"
}`}
                </pre>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default AgentTestSection;

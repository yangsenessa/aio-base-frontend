
import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Terminal, FileCode, Play, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/components/ui/use-toast';
import { getAgentItemByName } from '@/services/can/agentOperations';
import type { AgentItem } from 'declarations/aio-base-backend/aio-base-backend.did.d.ts';
import { SERVER_PATHS } from '@/services/apiService';

const AgentDetails = () => {
  const { id } = useParams<{ id: string }>();
  const { toast } = useToast();

  const [agent, setAgent] = useState<AgentItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [inputData, setInputData] = useState('');
  const [outputData, setOutputData] = useState('');
  const [isExecuting, setIsExecuting] = useState(false);

  // Fetch agent details
  useEffect(() => {
    const fetchAgentDetails = async () => {
      setLoading(true);
      try {
        if (id) {
          const agentData = await getAgentItemByName(id);
          setAgent(agentData || null);
          
          // Set default input data once we have the agent info
          if (agentData) {
            const defaultInput = {
              jsonrpc: "2.0",
              method: `${agentData.name}::process`,
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
            if (agentData.input_params.length > 0) {
              try {
                const parsedInput = JSON.parse(agentData.input_params[0]);
                setInputData(JSON.stringify(parsedInput, null, 2));
              } catch {
                setInputData(JSON.stringify(defaultInput, null, 2));
              }
            } else {
              setInputData(JSON.stringify(defaultInput, null, 2));
            }
          }
        }
      } catch (error) {
        console.error('Error fetching agent details:', error);
        toast({
          title: "Error",
          description: "Failed to fetch agent details",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchAgentDetails();
  }, [id, toast]);

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
              value: `Processed by ${id}: ${inputJson.inputs?.[0]?.value || 'No input provided'}`
            }
          ]
        };
        
        // Use agent's output_example if available
        if (agent && agent.output_example.length > 0) {
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

  if (loading) {
    return (
      <div className="py-8 flex justify-center items-center">
        <p>Loading agent details...</p>
      </div>
    );
  }

  if (!agent) {
    return (
      <div className="py-8">
        <div className="flex items-center mb-8">
          <Link to="/home/agent-store" className="mr-4">
            <Button variant="outline" size="icon">
              <ArrowLeft size={18} />
            </Button>
          </Link>
          <h1 className="text-2xl font-bold">Agent not found</h1>
        </div>
        <Card>
          <CardContent className="py-8">
            <p>The agent "{id}" could not be found.</p>
            <Link to="/home/agent-store">
              <Button className="mt-4">Return to Agent Store</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="py-8">
      <div className="flex items-center mb-8">
        <Link to="/home/agent-store" className="mr-4">
          <Button variant="outline" size="icon">
            <ArrowLeft size={18} />
          </Button>
        </Link>
        <h1 className="text-2xl font-bold">{agent.name}</h1>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-10">
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Agent Information</CardTitle>
            <CardDescription>AIO Protocol v1.2 Compatible</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="text-sm font-medium mb-1">Author</h3>
              <p className="text-sm text-muted-foreground">{agent.author}</p>
            </div>
            
            <div>
              <h3 className="text-sm font-medium mb-1">Owner</h3>
              <p className="text-sm text-muted-foreground">{agent.owner || 'Unknown'}</p>
            </div>
            
            <div>
              <h3 className="text-sm font-medium mb-1">Version</h3>
              <p className="text-sm text-muted-foreground">{agent.version || '1.0.0'}</p>
            </div>
            
            {agent.git_repo && (
              <div>
                <h3 className="text-sm font-medium mb-1">Repository</h3>
                <a 
                  href={agent.git_repo} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="text-sm text-blue-600 hover:underline"
                >
                  {agent.git_repo}
                </a>
              </div>
            )}
            
            {agent.homepage.length > 0 && (
              <div>
                <h3 className="text-sm font-medium mb-1">Homepage</h3>
                <a 
                  href={agent.homepage[0]} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="text-sm text-blue-600 hover:underline"
                >
                  {agent.homepage[0]}
                </a>
              </div>
            )}
            
            <div className="pt-2">
              <h3 className="text-sm font-medium mb-2">Actions</h3>
              <div className="flex flex-wrap gap-2">
                {agent.git_repo && (
                  <Button variant="outline" size="sm" className="gap-1" asChild>
                    <a href={agent.git_repo} target="_blank" rel="noopener noreferrer">
                      <FileCode size={14} />
                      View Source
                    </a>
                  </Button>
                )}
                <Button variant="outline" size="sm" className="gap-1">
                  <Terminal size={14} />
                  View Logs
                </Button>
                {agent.exec_file_url.length > 0 && (
                  <Button variant="outline" size="sm" className="gap-1" asChild>
                    <a href={agent.exec_file_url[0]} target="_blank" rel="noopener noreferrer">
                      <Download size={14} />
                      Download
                    </a>
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="lg:col-span-2">
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
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Agent Documentation</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <h3 className="text-lg font-medium mb-2">About this Agent</h3>
            <p className="text-muted-foreground">
              {agent.description}
            </p>
          </div>
          
          <div>
            <h3 className="text-lg font-medium mb-2">Usage Instructions</h3>
            <ol className="list-decimal pl-5 space-y-2 text-muted-foreground">
              <li>Format your input according to the AIO protocol JSON-RPC 2.0 specification.</li>
              <li>Send the JSON input to the agent via stdin.</li>
              <li>Receive the JSON output from the agent via stdout.</li>
              <li>The agent will process each input and return corresponding outputs.</li>
            </ol>
          </div>
          
          <div>
            <h3 className="text-lg font-medium mb-2">Input Types Supported</h3>
            <ul className="list-disc pl-5 space-y-1 text-muted-foreground">
              <li><strong>text</strong>: Plain text input</li>
              <li><strong>file</strong>: Base64-encoded file data</li>
              <li><strong>image</strong>: Base64-encoded image data</li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-lg font-medium mb-2">Output Types</h3>
            <ul className="list-disc pl-5 space-y-1 text-muted-foreground">
              <li><strong>text</strong>: Plain text results</li>
              <li><strong>file</strong>: Base64-encoded file data</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AgentDetails;

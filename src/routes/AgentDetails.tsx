import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Terminal, FileCode, Play, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/components/ui/use-toast';
import { agents } from '@/components/agentStore/agentData';
import { SERVER_PATHS } from '@/services/apiService';
const AgentDetails = () => {
  const {
    id
  } = useParams<{
    id: string;
  }>();
  const {
    toast
  } = useToast();

  // Find the agent in our data
  const agent = agents.find(a => a.id === id);
  const agentName = agent?.title || id || 'unknown-agent';
  const [inputData, setInputData] = useState(`{
  "jsonrpc": "2.0",
  "method": "${id}::process",
  "inputs": [
    {
      "type": "text",
      "value": "This is a test input"
    }
  ],
  "id": 1,
  "trace_id": "test-${Date.now()}"
}`);
  const [outputData, setOutputData] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const handleExecute = () => {
    setIsLoading(true);

    // Simulate API call to execute agent
    setTimeout(() => {
      setOutputData(`{
  "jsonrpc": "2.0",
  "id": 1,
  "trace_id": "test-${Date.now()}",
  "outputs": [
    {
      "type": "text",
      "value": "Processed by ${id}: This is a test input"
    }
  ]
}`);
      setIsLoading(false);
      toast({
        title: "Agent executed successfully",
        description: "The agent has processed your input"
      });
    }, 1500);
  };
  return <div className="py-8">
      <div className="flex items-center mb-8">
        <Link to="/home/agent-store" className="mr-4">
          <Button variant="outline" size="icon">
            <ArrowLeft size={18} />
          </Button>
        </Link>
        <h1 className="text-2xl font-bold">{agentName}</h1>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-10">
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Agent Information</CardTitle>
            <CardDescription>AIO Protocol {agent?.protocolVersion || 'v1.2'} Compatible</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              
              
            </div>
            
            <div>
              
              
            </div>
            
            <div className="pt-2">
              <h3 className="text-sm font-medium mb-2">Actions</h3>
              <div className="flex flex-wrap gap-2">
                <Button variant="outline" size="sm" className="gap-1">
                  <FileCode size={14} />
                  View Source
                </Button>
                <Button variant="outline" size="sm" className="gap-1">
                  <Terminal size={14} />
                  View Logs
                </Button>
                <Button variant="outline" size="sm" className="gap-1">
                  <Download size={14} />
                  Download
                </Button>
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
                <TabsTrigger value="schema">Input Schema</TabsTrigger>
              </TabsList>
              
              <TabsContent value="test" className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Input JSON (AIO Protocol Format)</label>
                  <Textarea value={inputData} onChange={e => setInputData(e.target.value)} className="font-mono text-sm h-40" />
                </div>
                
                <Button onClick={handleExecute} disabled={isLoading} className="w-full">
                  {isLoading ? 'Executing...' : 'Execute Agent'}
                </Button>
                
                {outputData && <div>
                    <label className="text-sm font-medium mb-2 block">Output</label>
                    <pre className="bg-slate-100 dark:bg-slate-800 p-4 rounded overflow-auto h-40 text-sm">
                      {outputData}
                    </pre>
                  </div>}
              </TabsContent>
              
              <TabsContent value="examples">
                <div className="space-y-4">
                  <div>
                    <h3 className="text-sm font-medium">Example 1: Basic Text Input</h3>
                    <pre className="bg-slate-100 dark:bg-slate-800 p-3 rounded mt-1 text-xs overflow-auto">
                    {`{
  "jsonrpc": "2.0",
  "method": "${id}::process",
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
                    <pre className="bg-slate-100 dark:bg-slate-800 p-3 rounded mt-1 text-xs overflow-auto">
                    {`{
  "jsonrpc": "2.0",
  "method": "${id}::process",
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
              
              <TabsContent value="schema">
                <div className="space-y-4">
                  <div>
                    <h3 className="text-sm font-medium">AIO Protocol Request Format</h3>
                    <pre className="bg-slate-100 dark:bg-slate-800 p-3 rounded mt-1 text-xs overflow-auto">
                    {`{
  "jsonrpc": "2.0",           // JSON-RPC version
  "method": "agent::method",  // Namespace::method format
  "inputs": [                 // Array of input objects
    {
      "type": "text|image|audio|video|file",
      "value": "content-or-base64"
    }
  ],
  "id": 1,                   // Request ID (integer)
  "trace_id": "unique-id"    // Trace ID for request tracking
}`}
                    </pre>
                  </div>
                  
                  <div>
                    <h3 className="text-sm font-medium">AIO Protocol Response Format</h3>
                    <pre className="bg-slate-100 dark:bg-slate-800 p-3 rounded mt-1 text-xs overflow-auto">
                    {`{
  "jsonrpc": "2.0",        // JSON-RPC version
  "id": 1,                 // Same as request ID
  "trace_id": "unique-id", // Same as request trace_id
  "outputs": [             // Array of output objects
    {
      "type": "text|image|audio|video|file",
      "value": "content-or-base64"
    }
  ]
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
              {agent?.description || `This agent implements the AIO protocol specification ${agent?.protocolVersion || 'v1.2'}, communicating via standard input/output (stdio).
              It accepts text and file inputs and produces outputs according to the AIO protocol.`}
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
    </div>;
};
export default AgentDetails;
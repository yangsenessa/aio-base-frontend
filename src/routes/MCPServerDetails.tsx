
import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Server, FileCode, Play, Download, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/components/ui/use-toast';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const MCPServerDetails = () => {
  const { id } = useParams<{ id: string }>();
  const { toast } = useToast();
  
  // For a production app, fetch MCP server details from API
  // For now, generate placeholder data based on ID
  const serverName = id || 'unknown-server';
  
  const [moduleType, setModuleType] = useState('resources');
  const [methodName, setMethodName] = useState('list');
  const [inputData, setInputData] = useState(`{
  "jsonrpc": "2.0",
  "method": "${serverName}::resources.list",
  "params": {},
  "id": 1,
  "trace_id": "test-${Date.now()}"
}`);
  const [outputData, setOutputData] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const updateMethodAndInput = (module: string, method: string) => {
    setModuleType(module);
    setMethodName(method);
    
    // Update the input JSON with the new method
    const fullMethod = `${module}.${method}`;
    const defaultParams = method === 'call' ? 
      { tool: 'example', args: { param1: "value1" } } : 
      {};
    
    setInputData(`{
  "jsonrpc": "2.0",
  "method": "${serverName}::${fullMethod}",
  "params": ${JSON.stringify(defaultParams, null, 2)},
  "id": ${Date.now()},
  "trace_id": "test-${Date.now()}"
}`);
  };
  
  const handleExecute = () => {
    setIsLoading(true);
    
    // Simulate API call to execute MCP server
    setTimeout(() => {
      // Create response based on module and method
      let responseData = {};
      
      if (moduleType === 'resources' && methodName === 'list') {
        responseData = {
          resources: [
            { id: "doc-001", title: "Sample Document 1", type: "pdf" },
            { id: "doc-002", title: "Sample Document 2", type: "text" }
          ]
        };
      } else if (moduleType === 'prompts' && methodName === 'list') {
        responseData = {
          prompts: [
            { id: "prompt-001", title: "Summarization Template" },
            { id: "prompt-002", title: "Question Answering Template" }
          ]
        };
      } else if (moduleType === 'tools' && methodName === 'list') {
        responseData = {
          tools: [
            { name: "calculate", description: "Performs calculations" },
            { name: "search", description: "Searches for information" }
          ]
        };
      } else if (moduleType === 'sampling' && methodName === 'start') {
        responseData = {
          sampling_id: "sampling-001",
          content: "Initial content generation has started."
        };
      } else {
        responseData = {
          message: `Executed ${moduleType}.${methodName} successfully`,
          status: "ok"
        };
      }
      
      setOutputData(`{
  "jsonrpc": "2.0",
  "id": 1,
  "trace_id": "test-${Date.now()}",
  "result": ${JSON.stringify(responseData, null, 2)}
}`);
      setIsLoading(false);
      
      toast({
        title: "MCP Server executed successfully",
        description: `${moduleType}.${methodName} executed successfully`,
      });
    }, 1500);
  };
  
  return (
    <div className="py-8">
      <div className="flex items-center mb-8">
        <Link to="/home/mcp-store" className="mr-4">
          <Button variant="outline" size="icon">
            <ArrowLeft size={18} />
          </Button>
        </Link>
        <h1 className="text-2xl font-bold">{serverName}</h1>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-10">
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>MCP Server Information</CardTitle>
            <CardDescription>MCP Protocol v1.2 Compatible</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="text-sm font-medium mb-1">Execution Path</h3>
              <div className="bg-slate-100 dark:bg-slate-800 p-2 rounded text-xs font-mono">
                /opt/aio/mcp-servers/{serverName}
              </div>
            </div>
            
            <div>
              <h3 className="text-sm font-medium mb-1">Communication</h3>
              <p className="text-sm text-muted-foreground">
                Communicates via standard input/output (stdio) using JSON-RPC 2.0 format with MCP protocol extensions
              </p>
            </div>
            
            <div className="pt-2">
              <h3 className="text-sm font-medium mb-2">Module Support</h3>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-sm">Resources</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-sm">Prompts</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-sm">Tools</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-sm">Sampling</span>
                </div>
              </div>
            </div>
            
            <div className="pt-2">
              <h3 className="text-sm font-medium mb-2">Actions</h3>
              <div className="flex flex-wrap gap-2">
                <Button variant="outline" size="sm" className="gap-1">
                  <FileCode size={14} />
                  View Source
                </Button>
                <Button variant="outline" size="sm" className="gap-1">
                  <Server size={14} />
                  View Status
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
            <CardTitle>Test MCP Server</CardTitle>
            <CardDescription>
              Send MCP protocol requests to the server and receive responses
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="test">
              <TabsList className="mb-4">
                <TabsTrigger value="test">Test Server</TabsTrigger>
                <TabsTrigger value="examples">Examples</TabsTrigger>
                <TabsTrigger value="schema">Protocol Schema</TabsTrigger>
              </TabsList>
              
              <TabsContent value="test" className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">Module</label>
                    <Select value={moduleType} onValueChange={(value) => updateMethodAndInput(value, methodName)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select module" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="resources">Resources</SelectItem>
                        <SelectItem value="prompts">Prompts</SelectItem>
                        <SelectItem value="tools">Tools</SelectItem>
                        <SelectItem value="sampling">Sampling</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium mb-2 block">Method</label>
                    <Select value={methodName} onValueChange={(value) => updateMethodAndInput(moduleType, value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select method" />
                      </SelectTrigger>
                      <SelectContent>
                        {moduleType === 'resources' && (
                          <>
                            <SelectItem value="list">resources.list</SelectItem>
                            <SelectItem value="get">resources.get</SelectItem>
                          </>
                        )}
                        {moduleType === 'prompts' && (
                          <>
                            <SelectItem value="list">prompts.list</SelectItem>
                            <SelectItem value="get">prompts.get</SelectItem>
                          </>
                        )}
                        {moduleType === 'tools' && (
                          <>
                            <SelectItem value="list">tools.list</SelectItem>
                            <SelectItem value="call">tools.call</SelectItem>
                          </>
                        )}
                        {moduleType === 'sampling' && (
                          <>
                            <SelectItem value="start">sampling.start</SelectItem>
                            <SelectItem value="step">sampling.step</SelectItem>
                          </>
                        )}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div>
                  <label className="text-sm font-medium mb-2 block">Input JSON (MCP Protocol Format)</label>
                  <Textarea 
                    value={inputData}
                    onChange={(e) => setInputData(e.target.value)}
                    className="font-mono text-sm h-40"
                  />
                </div>
                
                <Button 
                  onClick={handleExecute}
                  disabled={isLoading}
                  className="w-full"
                >
                  {isLoading ? 'Executing...' : 'Execute MCP Request'}
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
                  <div className="border rounded-md overflow-hidden">
                    <div className="bg-slate-100 dark:bg-slate-800 p-3 flex justify-between items-center">
                      <h3 className="text-sm font-medium">Resources - List all resources</h3>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="h-8 w-8 p-0" 
                        onClick={() => updateMethodAndInput('resources', 'list')}
                      >
                        <ChevronRight size={16} />
                      </Button>
                    </div>
                    <div className="p-3">
                      <pre className="text-xs overflow-auto">
{`{
  "jsonrpc": "2.0",
  "method": "${serverName}::resources.list",
  "params": {},
  "id": 1,
  "trace_id": "example-1"
}`}
                      </pre>
                    </div>
                  </div>
                  
                  <div className="border rounded-md overflow-hidden">
                    <div className="bg-slate-100 dark:bg-slate-800 p-3 flex justify-between items-center">
                      <h3 className="text-sm font-medium">Tools - Call a specific tool</h3>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="h-8 w-8 p-0" 
                        onClick={() => updateMethodAndInput('tools', 'call')}
                      >
                        <ChevronRight size={16} />
                      </Button>
                    </div>
                    <div className="p-3">
                      <pre className="text-xs overflow-auto">
{`{
  "jsonrpc": "2.0",
  "method": "${serverName}::tools.call",
  "params": {
    "tool": "calculate",
    "args": {
      "x": 10,
      "y": 5,
      "operation": "multiply"
    }
  },
  "id": 2,
  "trace_id": "example-2"
}`}
                      </pre>
                    </div>
                  </div>
                  
                  <div className="border rounded-md overflow-hidden">
                    <div className="bg-slate-100 dark:bg-slate-800 p-3 flex justify-between items-center">
                      <h3 className="text-sm font-medium">Sampling - Start a content generation</h3>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="h-8 w-8 p-0" 
                        onClick={() => updateMethodAndInput('sampling', 'start')}
                      >
                        <ChevronRight size={16} />
                      </Button>
                    </div>
                    <div className="p-3">
                      <pre className="text-xs overflow-auto">
{`{
  "jsonrpc": "2.0",
  "method": "${serverName}::sampling.start",
  "params": {
    "input": {
      "type": "text",
      "value": "Generate a summary of the following text..."
    },
    "options": {
      "temperature": 0.7,
      "max_tokens": 500
    }
  },
  "id": 3,
  "trace_id": "example-3"
}`}
                      </pre>
                    </div>
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="schema">
                <div className="space-y-4">
                  <div>
                    <h3 className="text-sm font-medium">MCP Protocol Request Format</h3>
                    <pre className="bg-slate-100 dark:bg-slate-800 p-3 rounded mt-1 text-xs overflow-auto">
{`{
  "jsonrpc": "2.0",           // JSON-RPC version
  "method": "server::module.method",  // Namespace::module.method format
  "params": {                 // Module-specific parameters
    // Parameter object structure depends on the module and method
  },
  "id": 1,                   // Request ID (integer)
  "trace_id": "unique-id"    // Trace ID for request tracking
}`}
                    </pre>
                  </div>
                  
                  <div>
                    <h3 className="text-sm font-medium">MCP Protocol Response Format</h3>
                    <pre className="bg-slate-100 dark:bg-slate-800 p-3 rounded mt-1 text-xs overflow-auto">
{`{
  "jsonrpc": "2.0",        // JSON-RPC version
  "id": 1,                 // Same as request ID
  "trace_id": "unique-id", // Same as request trace_id
  "result": {              // Module-specific result
    // Result object structure depends on the module and method
  }
}`}
                    </pre>
                  </div>
                  
                  <div>
                    <h3 className="text-sm font-medium">MCP Modules</h3>
                    <ul className="space-y-2 mt-2">
                      <li className="p-2 border rounded">
                        <strong>resources</strong>: Access and manage resource objects
                        <ul className="mt-1 pl-4 text-xs text-muted-foreground">
                          <li>resources.list: Get all available resources</li>
                          <li>resources.get: Get a specific resource by ID</li>
                        </ul>
                      </li>
                      <li className="p-2 border rounded">
                        <strong>prompts</strong>: Retrieve and work with prompt templates
                        <ul className="mt-1 pl-4 text-xs text-muted-foreground">
                          <li>prompts.list: Get all available prompts</li>
                          <li>prompts.get: Get a specific prompt by ID</li>
                        </ul>
                      </li>
                      <li className="p-2 border rounded">
                        <strong>tools</strong>: Execute functions and tools
                        <ul className="mt-1 pl-4 text-xs text-muted-foreground">
                          <li>tools.list: Get all available tools</li>
                          <li>tools.call: Call a specific tool with arguments</li>
                        </ul>
                      </li>
                      <li className="p-2 border rounded">
                        <strong>sampling</strong>: Generate content through sampling methods
                        <ul className="mt-1 pl-4 text-xs text-muted-foreground">
                          <li>sampling.start: Start a new sampling process</li>
                          <li>sampling.step: Continue an existing sampling process</li>
                        </ul>
                      </li>
                    </ul>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>MCP Server Documentation</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <h3 className="text-lg font-medium mb-2">About this MCP Server</h3>
            <p className="text-muted-foreground">
              This MCP server implements the MCP protocol specification v1.2, providing access to resources, prompts, tools, and sampling capabilities.
              It communicates via standard input/output (stdio) using JSON-RPC 2.0 format with MCP protocol extensions.
            </p>
          </div>
          
          <div>
            <h3 className="text-lg font-medium mb-2">Usage Instructions</h3>
            <ol className="list-decimal pl-5 space-y-2 text-muted-foreground">
              <li>Format your request according to the MCP protocol JSON-RPC 2.0 specification.</li>
              <li>Send the JSON request to the MCP server via stdin.</li>
              <li>Receive the JSON response from the server via stdout.</li>
              <li>Use the appropriate module and method for your specific task.</li>
            </ol>
          </div>
          
          <div>
            <h3 className="text-lg font-medium mb-2">Module Capabilities</h3>
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2 px-2">Module</th>
                  <th className="text-left py-2 px-2">Description</th>
                  <th className="text-left py-2 px-2">Methods</th>
                </tr>
              </thead>
              <tbody className="text-sm text-muted-foreground">
                <tr className="border-b">
                  <td className="py-2 px-2 font-medium">resources</td>
                  <td className="py-2 px-2">Manage and access resource objects</td>
                  <td className="py-2 px-2">list, get</td>
                </tr>
                <tr className="border-b">
                  <td className="py-2 px-2 font-medium">prompts</td>
                  <td className="py-2 px-2">Manage prompt templates</td>
                  <td className="py-2 px-2">list, get</td>
                </tr>
                <tr className="border-b">
                  <td className="py-2 px-2 font-medium">tools</td>
                  <td className="py-2 px-2">Access utility functions and tools</td>
                  <td className="py-2 px-2">list, call</td>
                </tr>
                <tr className="border-b">
                  <td className="py-2 px-2 font-medium">sampling</td>
                  <td className="py-2 px-2">Generate content via sampling methods</td>
                  <td className="py-2 px-2">start, step</td>
                </tr>
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default MCPServerDetails;

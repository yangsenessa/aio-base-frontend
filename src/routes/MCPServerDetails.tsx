
import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Server, FileCode, Download, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/components/ui/use-toast';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { getMcpItemByName } from '@/services/can/mcpOperations';
import type { McpItem } from 'declarations/aio-base-backend/aio-base-backend.did.d.ts';

// Create a logger utility for consistent logging
const log = (area: string, message: string, data?: any) => {
  if (data) {
    console.log(`[MCPServerDetails][${area}] ${message}`, data);
  } else {
    console.log(`[MCPServerDetails][${area}] ${message}`);
  }
};

const MCPServerDetails = () => {
  log('INIT', 'Component initializing');
  const params = useParams();
  log('PARAMS', 'All URL parameters', params);

  const { id } = useParams<{ id: string }>();
  log('PARAM', 'Received server name param', id);

  const { toast } = useToast();
  const [mcpServer, setMcpServer] = useState<McpItem | null>(null);
  const [loading, setLoading] = useState(true);

  // Module and method state
  const [moduleType, setModuleType] = useState('resources');
  const [methodName, setMethodName] = useState('list');
  const [inputData, setInputData] = useState('');
  const [outputData, setOutputData] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Fetch MCP server data
  useEffect(() => {
    log('FETCH', 'Starting to fetch MCP server data');

    const fetchMcpServer = async () => {
      if (!id) {
        log('FETCH', 'No server name provided, skipping fetch');
        return;
      }

      try {
        log('FETCH', 'Setting loading state to true');
        setLoading(true);

        log('FETCH', `Calling getMcpItemByName with name: ${id}`);
        const serverData = await getMcpItemByName(id);

        if (serverData) {
          log('FETCH', 'Server data received successfully', serverData);
          setMcpServer(serverData);

          // Initialize input data with the first available module
          log('MODULE', 'Determining initial module based on server capabilities');

          if (serverData.resources) {
            log('MODULE', 'Server supports resources module, initializing');
            updateMethodAndInput('resources', 'help', serverData.name);
            updateMethodAndInput('resources', 'list', serverData.name);
          } else if (serverData.prompts) {
            log('MODULE', 'Server supports prompts module, initializing');
            updateMethodAndInput('prompts', 'help', serverData.name);
            updateMethodAndInput('prompts', 'list', serverData.name);
          } else if (serverData.tools) {
            log('MODULE', 'Server supports tools module, initializing');
            updateMethodAndInput('tools', 'help', serverData.name);
            updateMethodAndInput('tools', 'list', serverData.name);
          } else if (serverData.sampling) {
            log('MODULE', 'Server supports sampling module, initializing');
            updateMethodAndInput('sampling', 'help', serverData.name);
            updateMethodAndInput('sampling', 'start', serverData.name);
          } else {
            log('MODULE', 'No supported modules found on server');
          }
        } else {
          log('FETCH', 'Server data not found', { id });
          toast({
            title: "Server not found",
            description: `No MCP server found with name ${id}`,
            variant: "destructive"
          });
        }
      } catch (error) {
        log('FETCH', 'Error fetching MCP server data', error);
        console.error("Error fetching MCP server:", error);
        toast({
          title: "Error fetching server",
          description: "Failed to load MCP server details",
          variant: "destructive"
        });
      } finally {
        log('FETCH', 'Setting loading state to false');
        setLoading(false);
      }
    };

    fetchMcpServer();

    // Cleanup function
    return () => {
      log('CLEANUP', 'Component unmounting');
    };
  }, [id, toast]);

  const updateMethodAndInput = (module: string, method: string, serverName: string = id || 'unknown-server') => {
    log('UPDATE', `Updating method and input: module=${module}, method=${method}, serverName=${serverName}`);

    setModuleType(module);
    setMethodName(method);

    // Update the input JSON with the new method
    const fullMethod = `${module}.${method}`;

    log('UPDATE', `Creating input data for ${fullMethod}`);

    let defaultParams = {};
    if (method === 'call') {
      log('UPDATE', 'Using call method template with tool params');
      defaultParams = {
        tool: 'example',
        args: {
          param1: "value1"
        }
      };
    } else if (method === 'get') {
      log('UPDATE', 'Using get method template with id param');
      defaultParams = {
        id: "example-id"
      };
    } else if (method === 'start') {
      log('UPDATE', 'Using sampling start method template');
      defaultParams = {
        prompt: "Example prompt for sampling"
      };
    } else if (method === 'step') {
      log('UPDATE', 'Using sampling step method template');
      defaultParams = {
        sampling_id: "sampling-001"
      };
    } else {
      log('UPDATE', 'Using default empty params for list/help methods');
    }

    const requestId = Date.now();
    const traceId = `test-${requestId}`;

    const inputJson = {
      jsonrpc: "2.0",
      method: `${serverName}::${fullMethod}`,
      params: defaultParams,
      id: requestId,
      trace_id: traceId
    };

    log('UPDATE', 'Setting input data', inputJson);
    setInputData(JSON.stringify(inputJson, null, 2));
  };

  const handleExecute = () => {
    log('EXECUTE', 'Starting execution', { moduleType, methodName });
    setIsLoading(true);

    // Simulate API call to execute MCP server
    setTimeout(() => {
      // Create response based on module and method
      let responseData = {};

      log('EXECUTE', `Generating mock response for ${moduleType}.${methodName}`);

      if (moduleType === 'resources' && methodName === 'list') {
        log('EXECUTE', 'Branch: resources.list');
        responseData = {
          resources: [{
            id: "doc-001",
            title: "Sample Document 1",
            type: "pdf"
          }, {
            id: "doc-002",
            title: "Sample Document 2",
            type: "text"
          }]
        };
      } else if (moduleType === 'resources' && methodName === 'get') {
        log('EXECUTE', 'Branch: resources.get');
        responseData = {
          resource: {
            id: "doc-001",
            title: "Sample Document 1",
            type: "pdf",
            content: "Sample document content..."
          }
        };
      } else if (moduleType === 'prompts' && methodName === 'list') {
        log('EXECUTE', 'Branch: prompts.list');
        responseData = {
          prompts: [{
            id: "prompt-001",
            title: "Summarization Template"
          }, {
            id: "prompt-002",
            title: "Question Answering Template"
          }]
        };
      } else if (moduleType === 'prompts' && methodName === 'get') {
        log('EXECUTE', 'Branch: prompts.get');
        responseData = {
          prompt: {
            id: "prompt-001",
            title: "Summarization Template",
            template: "Summarize the following text: {{text}}"
          }
        };
      } else if (moduleType === 'tools' && methodName === 'list') {
        log('EXECUTE', 'Branch: tools.list');
        responseData = {
          tools: [{
            name: "calculate",
            description: "Performs calculations"
          }, {
            name: "search",
            description: "Searches for information"
          }]
        };
      } else if (moduleType === 'tools' && methodName === 'call') {
        log('EXECUTE', 'Branch: tools.call');
        responseData = {
          result: "Tool execution result",
          metadata: {
            execution_time: "125ms",
            status: "success"
          }
        };
      } else if (moduleType === 'sampling' && methodName === 'start') {
        log('EXECUTE', 'Branch: sampling.start');
        responseData = {
          sampling_id: "sampling-001",
          content: "Initial content generation has started."
        };
      } else if (moduleType === 'sampling' && methodName === 'step') {
        log('EXECUTE', 'Branch: sampling.step');
        responseData = {
          sampling_id: "sampling-001",
          content: "Additional generated content after step.",
          is_complete: false
        };
      } else {
        log('EXECUTE', 'Branch: default/unknown method', { moduleType, methodName });
        responseData = {
          message: `Executed ${moduleType}.${methodName} successfully`,
          status: "ok"
        };
      }

      const responseObj = {
        jsonrpc: "2.0",
        id: 1,
        trace_id: `test-${Date.now()}`,
        result: responseData
      };

      log('EXECUTE', 'Setting response output', responseObj);
      setOutputData(JSON.stringify(responseObj, null, 2));

      log('EXECUTE', 'Setting isLoading to false');
      setIsLoading(false);

      log('EXECUTE', 'Showing success toast');
      toast({
        title: "MCP Server executed successfully",
        description: `${moduleType}.${methodName} executed successfully`
      });
    }, 1500);
  };

  // Render loading state
  if (loading) {
    log('RENDER', 'Rendering loading state');
    return (
      <div className="py-8 px-4">
        <div className="flex items-center mb-8">
          <Link to="/home/mcp-store" className="mr-4">
            <Button variant="outline" size="icon">
              <ArrowLeft size={18} />
            </Button>
          </Link>
          <h1 className="text-2xl font-bold">Loading MCP Server...</h1>
        </div>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  const serverName = mcpServer?.name || id || 'unknown-server';
  log('RENDER', `Rendering details for server: ${serverName}`);

  return (
    <div className="py-8 px-4">
      <div className="flex items-center mb-8">
        <Link to="/home/mcp-store" className="mr-4">
          <Button variant="outline" size="icon">
            <ArrowLeft size={18} />
          </Button>
        </Link>
        <h1 className="text-2xl font-bold">{serverName}</h1>
      </div>

      {/* Layout changed: MCP Server Info Card (top) */}
      <div className="flex flex-col gap-8 mb-8">
        <Card className="w-full bg-card/50">
          <CardHeader>
            <CardTitle>MCP Server Information</CardTitle>
            <CardDescription>
              Get more diagnostic information about the URL parameters. Handle missing parameters 
              gracefully with clear user feedback. Add a fallback mechanism for different URL formats. 
              Properly encode the server name in the URL to prevent issues with special characters.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {mcpServer && (
              <>
                <div>
                  <h3 className="text-sm font-medium mb-2">Details</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Author:</span>
                      <span>{mcpServer.author}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Type:</span>
                      <span>{mcpServer.mcp_type}</span>
                    </div>
                    {mcpServer.remote_endpoint && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Endpoint:</span>
                        <span className="truncate max-w-[200px]">{mcpServer.remote_endpoint}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-medium mb-2">Module Support</h3>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${mcpServer.resources ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                      <span className="text-sm">Resources</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${mcpServer.prompts ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                      <span className="text-sm">Prompts</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${mcpServer.tools ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                      <span className="text-sm">Tools</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${mcpServer.sampling ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                      <span className="text-sm">Sampling</span>
                    </div>
                  </div>
                </div>

                {mcpServer.git_repo && (
                  <div>
                    <h3 className="text-sm font-medium mb-2">Repository</h3>
                    <a
                      href={mcpServer.git_repo}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-blue-500 hover:underline break-all"
                    >
                      {mcpServer.git_repo}
                    </a>
                  </div>
                )}
              </>
            )}

            <div>
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

        {/* Test Server Card (bottom) */}
        <Card className="w-full">
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
              </TabsList>

              <TabsContent value="test" className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">Module</label>
                    <Select
                      value={moduleType}
                      onValueChange={value => updateMethodAndInput(value, methodName, serverName)}
                      disabled={!mcpServer}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select module" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="resources" disabled={!mcpServer?.resources}>Resources</SelectItem>
                        <SelectItem value="prompts" disabled={!mcpServer?.prompts}>Prompts</SelectItem>
                        <SelectItem value="tools" disabled={!mcpServer?.tools}>Tools</SelectItem>
                        <SelectItem value="sampling" disabled={!mcpServer?.sampling}>Sampling</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-2 block">Method</label>
                    <Select
                      value={methodName}
                      onValueChange={value => updateMethodAndInput(moduleType, value, serverName)}
                      disabled={!mcpServer}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select method" />
                      </SelectTrigger>
                      <SelectContent>
                        {moduleType === 'resources' && <>
                          <SelectItem value="list">resources.list</SelectItem>
                          <SelectItem value="get">resources.get</SelectItem>
                        </>}
                        {moduleType === 'prompts' && <>
                          <SelectItem value="list">prompts.list</SelectItem>
                          <SelectItem value="get">prompts.get</SelectItem>
                        </>}
                        {moduleType === 'tools' && <>
                          <SelectItem value="list">tools.list</SelectItem>
                          <SelectItem value="call">tools.call</SelectItem>
                        </>}
                        {moduleType === 'sampling' && <>
                          <SelectItem value="start">sampling.start</SelectItem>
                          <SelectItem value="step">sampling.step</SelectItem>
                        </>}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Input JSON (MCP Protocol Format)</label>
                  <Textarea
                    value={inputData}
                    onChange={e => setInputData(e.target.value)}
                    className="font-mono text-sm h-40"
                    disabled={!mcpServer}
                  />
                </div>

                <Button
                  onClick={handleExecute}
                  disabled={isLoading || !mcpServer}
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
            </Tabs>
          </CardContent>
        </Card>
      </div>

      {/* Documentation Section - Full Width */}
      <Card>
        <CardHeader>
          <CardTitle>MCP Server Documentation</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <h3 className="text-lg font-medium mb-2">About this MCP Server</h3>
            <p className="text-muted-foreground">
              {mcpServer?.community_body ||
                "This MCP server implements the MCP protocol specification v1.2, providing access to resources, prompts, tools, and sampling capabilities. It communicates via standard input/output (stdio) using JSON-RPC 2.0 format with MCP protocol extensions."}
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
                <tr className={`border-b ${!mcpServer?.resources ? 'opacity-50' : ''}`}>
                  <td className="py-2 px-2 font-medium">resources</td>
                  <td className="py-2 px-2">Manage and access resource objects</td>
                  <td className="py-2 px-2">list, get</td>
                </tr>
                <tr className={`border-b ${!mcpServer?.prompts ? 'opacity-50' : ''}`}>
                  <td className="py-2 px-2 font-medium">prompts</td>
                  <td className="py-2 px-2">Manage prompt templates</td>
                  <td className="py-2 px-2">list, get</td>
                </tr>
                <tr className={`border-b ${!mcpServer?.tools ? 'opacity-50' : ''}`}>
                  <td className="py-2 px-2 font-medium">tools</td>
                  <td className="py-2 px-2">Access utility functions and tools</td>
                  <td className="py-2 px-2">list, call</td>
                </tr>
                <tr className={`border-b ${!mcpServer?.sampling ? 'opacity-50' : ''}`}>
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

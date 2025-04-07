import React, { useState } from 'react';
import { ArrowLeft, InfoIcon } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Form } from '@/components/ui/form';
import { useToast } from '@/components/ui/use-toast';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { MCPServerFormValues, mcpServerFormSchema } from '@/types/agent';
import { submitMCPServer } from '@/services/api/mcpService';
import { executeRpc } from '@/services/ExecFileCommonBuss';
import { validateFileNameMatches } from '@/components/form/FileValidator';
import MCPServerBasicInfo from '@/components/form/MCPServerBasicInfo';
import MCPServerTechnicalInfo from '@/components/form/MCPServerTechnicalInfo';
import MCPServerFileUpload from '@/components/form/MCPServerFileUpload';
import MCPServerTemplate from '@/components/form/MCPServerTemplate';
import ProtocolDetails from '@/components/protocol/ProtocolDetails';
import ParameterInfoCard from '@/components/protocol/ParameterInfoCard';
import { isValidJson } from '@/util/formatters';
import { getAIOSample } from '@/services/aiAgentService';
import { createAioIndexFromJson } from '@/services/can/mcpOperations';

// Add logger utility for AddMCPServer component
const logMCP = (area: string, message: string, data?: any) => {
  if (data) {
    console.log(`[AddMCPServer][${area}] ${message}`, data);
  } else {
    console.log(`[AddMCPServer][${area}] ${message}`);
  }
};

/**
 * Creates a help request for the MCP server and gets AI analysis of its capabilities
 * @param serverName Name of the server to identify
 * @returns Analysis of the server's capabilities
 */
const identifyMCPServer = async (serverName: string): Promise<string> => {
  logMCP('IDENTIFY', `Creating help request for MCP server: ${serverName}`);
  
  try {
    // Format the help request in JSON-RPC 2.0 format similar to MCPServerDetails
    const helpRequest = JSON.stringify({
      jsonrpc: "2.0",
      //method: `${serverName}::help`,
      method: "help",
      id: Date.now()
      //trace_id: "AIO-TR-" + new Date().toISOString().slice(0, 10).replace(/-/g, '') + "-HELP"
    }, null, 2);
    // Construct a valid RPC call to the MCP server
    const mcpParams = {};
    const requestId = Date.now();
    const traceId = `AIO-TR-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${requestId}`;

    logMCP('IDENTIFY', 'Calling executeRpc with help method', { serverName });
    // Call the MCP server with the help command
    const response = await executeRpc(
      'mcp',      // service
      serverName, // server name
      'help',     // method
      mcpParams,  // empty params for help command
      requestId   // request id
    );

    logMCP('IDENTIFY', 'MCP server response received', response);

    // Format the response for the AI analysis
    const formattedResponse = JSON.stringify(response, null, 2);
    
    
    // Get AI sample/analysis of the MCP server's capabilities
    const analysisResult = await getAIOSample(formattedResponse);
    logMCP('IDENTIFY', 'Sending help request to AIO Sample service', analysisResult);

    
    logMCP('IDENTIFY', 'Received analysis from AIO Sample service', {
      length: analysisResult.length,
      preview: analysisResult.substring(0, 100) + '...'
    });
    
    return analysisResult;
  } catch (error) {
    logMCP('IDENTIFY', 'Error identifying MCP server', error);
    throw new Error(`Failed to identify MCP server capabilities: ${error instanceof Error ? error.message : String(error)}`);
  }
};

const AddMCPServer = () => {
  const [serverFile, setServerFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showProtocolInfo, setShowProtocolInfo] = useState(false);
  
  const navigate = useNavigate();
  const { toast } = useToast();

  const form = useForm<MCPServerFormValues>({
    resolver: zodResolver(mcpServerFormSchema),
    defaultValues: {
      name: '',
      description: '',
      author: '',
      gitRepo: '',
      homepage: '',
      remoteEndpoint: '',
      type: 'sse',
      communityBody: JSON.stringify({
        method: "mcp_server::module.method",
        params: {
          // Default empty params
        },
        id: 1,
        trace_id: "AIO-TR-" + new Date().toISOString().slice(0, 10).replace(/-/g, '') + "-0001"
      }, null, 2),
      resources: false,
      prompts: false,
      tools: false,
      sampling: false,
    },
  });

  const onSubmit = async (data: MCPServerFormValues) => {
    logMCP('SUBMIT', 'Form submitted', data);
    
    // Validate JSON format for communityBody
    if (data.communityBody && !isValidJson(data.communityBody)) {
      logMCP('VALIDATION', 'Invalid JSON format in communityBody');
      toast({
        title: "Invalid JSON Format",
        description: "The Community Body must be valid JSON. Please check your syntax.",
        variant: "destructive",
      });
      return;
    }
    
    // If there's a file selected, validate its name matches the server name
    if (serverFile && !validateFileNameMatches(serverFile, data.name)) {
      return;
    }
    
    try {
      setIsSubmitting(true);
      
      logMCP('SUBMIT', 'Submitting MCP server data to backend', { 
        data,
        hasFile: !!serverFile
      });
      
      // Prepare data according to AIO-MCP protocol format
      const serverData = {
        name: data.name,
        description: data.description,
        author: data.author,
        gitRepo: data.gitRepo,
        homepage: data.homepage,
        remoteEndpoint: data.remoteEndpoint,
        type: data.type,
        communityBody: data.communityBody,
        resources: data.resources,
        prompts: data.prompts,
        tools: data.tools,
        sampling: data.sampling
      };
      
      // Submit the MCP server data and file in a single call
      const response = await submitMCPServer(serverData, serverFile);
      
      logMCP('SUBMIT', 'Submission response received', response);
      
      if (response.success) {
        // After successful submission, identify the MCP server capabilities
        try {
          logMCP('SUBMIT', 'Starting MCP server identification');
          const serverAnalysis = await identifyMCPServer(data.name);
          
          logMCP('SUBMIT', 'MCP server identification completed', {
            analysisLength: serverAnalysis.length,
            serverAnalysis:serverAnalysis
          });
          
          // Can use serverAnalysis for additional operations if needed
          toast({
            title: "MCP Server Analyzed",
            description: `Your MCP server has been submitted and analyzed successfully with ID: ${response.id}`,
          });

          // Submit the server analysis to the backend for indexing
          const indexResponse = await createAioIndexFromJson(data.name, serverAnalysis);
          logMCP('SUBMIT', 'AIO index submission response', indexResponse);

          if ('Err' in indexResponse) {
            console.warn(`[AddMCPServer][INDEX] Warning: AIO index creation had an error: ${indexResponse.Err}`);
            // We don't fail the overall process if indexing fails, just log the warning
          }
        } catch (identifyError) {
          logMCP('SUBMIT', 'MCP server identification failed, continuing with basic success', identifyError);
          
          toast({
            title: "MCP Server Submitted",
            description: `Your MCP server has been submitted successfully with ID: ${response.id}`,
          });
        }
        
        setTimeout(() => {
          navigate('/home/mcp-store');
        }, 2000);
      } else {
        throw new Error(response.message);
      }
    } catch (error) {
      logMCP('SUBMIT', 'Error submitting MCP server', error);
      toast({
        title: "Submission Failed",
        description: error instanceof Error ? error.message : "Failed to submit MCP server. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="py-8 max-w-3xl mx-auto">
      <div className="flex items-center mb-8">
        <Link to="/home/mcp-store" className="mr-4">
          <Button variant="outline" size="icon">
            <ArrowLeft size={18} />
          </Button>
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold">Add My MCP Server</h1>
          <p className="text-sm text-muted-foreground">Register your MCP server to the AIO-MCP ecosystem</p>
        </div>
        <Button 
          variant="outline" 
          size="sm"
          className="flex items-center gap-1"
          onClick={() => setShowProtocolInfo(!showProtocolInfo)}
        >
          <InfoIcon size={16} />
          {showProtocolInfo ? "Hide Protocol Info" : "Show Protocol Info"}
        </Button>
      </div>

      {showProtocolInfo && (
        <div className="mb-8">
          <Alert className="mb-4 bg-blue-50 border-blue-200">
            <InfoIcon className="h-4 w-4 text-blue-600" />
            <AlertTitle>AIO-MCP Protocol v1.2.1</AlertTitle>
            <AlertDescription>
              The AIO-MCP protocol defines how MCP servers interact within the AIO ecosystem. 
              Your server should implement one or more of the core modules: resources, prompts, tools, or sampling.
            </AlertDescription>
          </Alert>
          <ProtocolDetails type="mcp" />
          <ParameterInfoCard type="mcp" />
        </div>
      )}

      <div className="bg-card border rounded-lg p-6">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            {/* Template section */}
            <MCPServerTemplate form={form} />
            
            {/* Basic information section */}
            <MCPServerBasicInfo form={form} />
            
            {/* File upload section */}
            <MCPServerFileUpload
              form={form}
              serverFile={serverFile}
              setServerFile={setServerFile}
            />
            
            {/* Technical information section */}
            <MCPServerTechnicalInfo form={form} />

            <div className="pt-4">
              <Button 
                type="submit" 
                className="w-full" 
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Submitting...' : 'Submit MCP Server'}
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
};

export default AddMCPServer;

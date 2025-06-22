import React, { useEffect, useState } from 'react';
import { ArrowLeft, InfoIcon } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Form } from '@/components/ui/form';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { MCPServerFormValues, mcpServerFormSchema } from '@/types/agent';
import { submitMCPServer, storeMcpInvertIndex } from '@/services/api/mcpService';
import { executeRpc } from '@/services/ExecFileCommonBuss';
import MCPServerBasicInfo from '@/components/form/MCPServerBasicInfo';
import MCPServerTechnicalInfo from '@/components/form/MCPServerTechnicalInfo';
import MCPServerFileUpload from '@/components/form/MCPServerFileUpload';
import MCPServerTemplate from '@/components/form/MCPServerTemplate';
import MCPImageTemplate from '@/components/form/MCPImageTemplate';
import MCPImplementationGuide from '@/components/form/MCPImplementationGuide';
import MCPCodeExplorer from '@/components/form/MCPCodeExplorer';
import MCPAIGuide from '@/components/form/MCPAIGuide';
import ProtocolDetails from '@/components/protocol/ProtocolDetails';
import ParameterInfoCard from '@/components/protocol/ParameterInfoCard';
import { isValidJson } from '@/util/formatters';
import { getAIOSample, createAioInvertIndex } from '@/services/aiAgentService';
import { createAioIndexFromJson } from '@/services/can/mcpOperations';
import { toast, useToast } from '@/components/ui/use-toast';
import { useChat } from '@/contexts/ChatContext';
import { ApiProvider } from '@/contexts/ApiContext';
import { checkIsNewUser, createAndClaimNewMcpGrant, getAccountInfo, createAndClaimNewUserGrant, AccountInfoDisplay } from '@/services/can/financeOperation';
import { add } from 'date-fns';
import { usePlugConnect } from '@/lib/plug-wallet';

const logMCP = (area: string, message: string, data?: any) => {
  if (data) {
    console.log(`[AddMCPServer][${area}] ${message}`, data);
  } else {
    console.log(`[AddMCPServer][${area}] ${message}`);
  }
};

const identifyMCPServer = async (serverName: string, describeContent: string): Promise<string> => {
  logMCP('IDENTIFY', `Creating help request for MCP server: ${serverName}`);
  
  try {
    const helpRequest = JSON.stringify({
      jsonrpc: "2.0",
      method: "help",
      id: Date.now()
    }, null, 2);
    const mcpParams = {};
    const requestId = Date.now();
    const traceId = `AIO-TR-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${requestId}`;

    logMCP('IDENTIFY', 'Calling executeRpc with help method', { serverName });
    const response = await executeRpc(
      'mcp',      // service
      serverName, // server name
      'help',     // method
      mcpParams,  // empty params for help command
      requestId   // request id
    );

    logMCP('IDENTIFY', 'MCP server response received', response);

    const formattedResponse = JSON.stringify(response, null, 2);
    
    const analysisResult = await getAIOSample(formattedResponse, describeContent);
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

const AddMCPServerContent = () => {
  const [serverFile, setServerFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showProtocolInfo, setShowProtocolInfo] = useState(false);
  
  const navigate = useNavigate();
  const { toast } = useToast();
  const { addDirectMessage } = useChat();

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
    
    if (data.communityBody && !isValidJson(data.communityBody)) {
      logMCP('VALIDATION', 'Invalid JSON format in communityBody');
      toast({
        title: "Invalid JSON Format",
        description: "The Community Body must be valid JSON. Please check your syntax.",
        variant: "destructive",
      });
      return;
    }
    
    try {
      setIsSubmitting(true);
      
      logMCP('SUBMIT', 'Submitting MCP server data to backend', { 
        data,
        hasFile: !!serverFile
      });

      addDirectMessage(
        `Processing MCP server submission for "${data.name}"... Please wait while I analyze the implementation.`
      );
      
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
      
      const response = await submitMCPServer(serverData, serverFile);
      
      logMCP('SUBMIT', 'Submission response received', response);
      
      if (response.success) {
        try {
          logMCP('SUBMIT', 'Starting MCP server identification');
          const serverAnalysis = await identifyMCPServer(data.name, data.description);
          
          logMCP('SUBMIT', 'MCP server identification completed', {
            analysisLength: serverAnalysis.length
          });

          addDirectMessage(
            `✅ MCP Server "${data.name}" has been successfully registered!\n\nMy analysis shows the following capabilities:\n${serverAnalysis}\n\nI'll proceed with indexing this information for future reference.`
          );
          
          addDirectMessage(
            "Indexing server capabilities and integrating with the AIO network..."
          );
          // create inverted index
          try {
            const invertedIndex = await createAioInvertIndex(serverAnalysis);
            logMCP('SUBMIT', 'Created inverted index successfully', invertedIndex);
            
            // Store the inverted index
            const storeResult = await storeMcpInvertIndex(data.name, invertedIndex);
            if ('Ok' in storeResult) {
              logMCP('SUBMIT', 'Stored inverted index successfully');
              addDirectMessage('Successfully indexed server capabilities for search and discovery.');
            } else {
              logMCP('SUBMIT', 'Failed to store inverted index', storeResult.Err);
              addDirectMessage(`Warning: Failed to index server capabilities: ${storeResult.Err}`);
            }
          } catch (indexError) {
            console.warn('[AddMCPServer][INVERT-INDEX] warning: create inverted index failed:', indexError);
            // continue, because this is not a critical error
          }

          const createIndexWithRetry = async (serverName: string, analysis: string, maxRetries = 3) => {
            for (let attempt = 1; attempt <= maxRetries; attempt++) {
              try {
                const response = await createAioIndexFromJson(serverName, analysis);
                if (!('Err' in response)) {
                  return response;
                }
                logMCP('SUBMIT', `AIO index creation attempt ${attempt} failed`, response.Err);
                if (attempt < maxRetries) {
                  // Wait for 5 seconds before retrying
                  await new Promise(resolve => setTimeout(resolve, 5000));
                }
              } catch (error) {
                logMCP('SUBMIT', `AIO index creation attempt ${attempt} threw error`, error);
                if (attempt < maxRetries) {
                  await new Promise(resolve => setTimeout(resolve, 5000));
                }
              }
            }
            // If all retries failed, return the last error response
            return await createAioIndexFromJson(serverName, analysis);
          };

          const indexResponse = await createIndexWithRetry(data.name, serverAnalysis);
          logMCP('SUBMIT', 'AIO index submission response after retries', indexResponse);

          if ('Err' in indexResponse) {
            console.warn(`[AddMCPServer][INDEX] Warning: AIO index creation failed after all retry attempts: ${indexResponse.Err}`);
            addDirectMessage(
              "⚠️ Note: While your server was registered successfully, I encountered a minor issue during capability indexing. This won't affect your server's functionality."
            );
          } else {
            addDirectMessage(
              "✨ Registration complete! Your MCP server is now fully integrated into the AIO network. You can view and manage it in the MCP Store."
            );
          
            // Create and claim new MCP grant for the user
            try {
              const grantAmount = await createAndClaimNewMcpGrant(data.name);
               addDirectMessage(
                  `🎉 Bonus! You've received ${grantAmount} credits for registering your MCP server. Check your user profile page to see your updated balance.`
               );
            } catch (grantError) {
                logMCP('SUBMIT', 'Failed to create MCP grant', grantError);
                addDirectMessage(
                  `❌ Failed to create MCP grant, please email us and describe the details of the error.`
                );
               // Don't show error to user as this is a bonus feature
            }
          }
        } catch (identifyError) {
          logMCP('SUBMIT', 'MCP server identification failed', identifyError);
          
          addDirectMessage(
            `Your MCP server "${data.name}" has been registered, but I couldn't complete the capability analysis. You can still manage it through the MCP Store.`
          );
        }
        
        setTimeout(() => {
          navigate('/home/mcp-store');
        }, 2000);
      } else {
        throw new Error(response.message);
      }
    } catch (error) {
      logMCP('SUBMIT', 'Error submitting MCP server', error);
      
      addDirectMessage(
        `❌ I encountered an error while processing your MCP server submission: ${error instanceof Error ? error.message : 'Unknown error occurred'}. Please try again.`
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="py-8 max-w-5xl mx-auto">
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

      <div className="space-y-6">
        <div className="bg-card border rounded-lg p-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              <MCPServerTemplate form={form} />
              <MCPServerBasicInfo form={form} />
              <MCPServerFileUpload
                form={form}
                serverFile={serverFile}
                setServerFile={setServerFile}
              />
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
    </div>
  );
};

// Wrap the component with ApiProvider
const AddMCPServer = () => {
  const { 
    principalId, 
    handleConnectWallet, 
    disconnectWallet, 
    isConnecting, 
    shortenAddress 
  } = usePlugConnect();
  const [accountInfo, setAccountInfo] = useState<AccountInfoDisplay | null>(null);
  const [isNewUser, setIsNewUser] = useState<boolean>(false);
  useEffect(() => {
    const fetchAccountInfo = async () => {
      try {
        const info = await getAccountInfo();
        setAccountInfo(info);
        
        // Check if user is new after getting account info
        const isNew = await checkIsNewUser();
        setIsNewUser(isNew);
        
        // Show toast for new users
        if (isNew) {
          let grantAmount = await createAndClaimNewUserGrant();
          let descriptionText = `You're eligible for ${grantAmount} credits as grant! Visit user profile to claim your grant.`;
          toast({
            title: "Welcome! 🎉",
            description: descriptionText,
            duration: 5000, // Show for 5 seconds
          });
        }
      } catch (error) {
        console.error('Error fetching account info:', error);
      }
    };
    fetchAccountInfo();
  }, [toast]);
  return (
    <ApiProvider>
      <AddMCPServerContent />
    </ApiProvider>
  );
};

export default AddMCPServer;

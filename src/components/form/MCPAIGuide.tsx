
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Copy, Check, Info } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

interface PromptTemplate {
  title: string;
  content: string;
  description: string;
  icon: React.ReactNode;
  category: string;
}

const MCPAIGuide: React.FC = () => {
  const { toast } = useToast();
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const copyToClipboard = async (text: string, id: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(id);
      toast({
        title: "Copied to clipboard",
        description: "You can now paste this prompt to your AI assistant",
      });
      setTimeout(() => setCopiedId(null), 2000);
    } catch (err) {
      toast({
        title: "Failed to copy",
        description: "Please try again or copy manually",
        variant: "destructive",
      });
    }
  };

  const promptTemplates: PromptTemplate[] = [
    {
      title: "Create MCP Server",
      content: `Please help me create a Model Context Protocol (MCP) server for image generation using the AIO-MCP protocol v1.2.1. 

I want to build a service that can generate images from text prompts using the Silicon Flow API.

The server should implement:
1. A JSON-RPC 2.0 interface over stdio
2. MCP protocol tools for image generation
3. Proper help method that describes the capabilities
4. Error handling for API failures

I'd like the following methods:
- generate_image - To create images from text prompts
- image_generation_prompt - To create prompt templates

Please provide the Python code for the core service, MCP server implementation, and stdio server implementation. Also include a requirements.txt file.`,
      description: "Generate a complete MCP server implementation for image generation",
      icon: <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="m9 12 2 2 4-4"/></svg>
      </div>,
      category: "Implementation"
    },
    {
      title: "MCP Test Scripts",
      content: `I need help creating test scripts for my MCP image generation server. The server implements the AIO-MCP protocol v1.2.1 and provides image generation capabilities.

Please create the following shell scripts:
1. test_help.sh - To test the help method via stdio
2. test_generate.sh - To test image generation with a sample prompt
3. test_generate_exec.sh - To test the compiled executable

The test scripts should:
- Send JSON-RPC 2.0 requests to the server
- Handle the responses appropriately
- Provide meaningful feedback on success/failure

My server implements these methods:
- help - Shows help information about the server capabilities
- generate_image - Generates an image from a text prompt with parameters for negative_prompt, num_inference_steps, guidance_scale, seed, and image_size`,
      description: "Create shell scripts to test your MCP server implementation",
      icon: <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center text-green-600">
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 5h4"/><path d="M11 9h7"/><path d="M11 13h10"/><path d="m3 17 2 2 4-4"/><path d="M11 17h9"/></svg>
      </div>,
      category: "Testing"
    },
    {
      title: "MCP Build Script",
      content: `I need help creating build scripts for my MCP image generation server. The server implements the AIO-MCP protocol v1.2.1 and provides image generation capabilities using the Silicon Flow API.

Please create the following build scripts:
1. build.py - A Python script to build standalone executables using PyInstaller
2. build_exec.sh - A shell script wrapper to install dependencies and run the build process

The build scripts should:
- Support building in two modes: stdio and mcp
- Handle dependencies properly
- Create standalone executables
- Place the output in a 'dist' directory

For the stdio mode, the entry point is stdio_server.py
For the MCP mode, the entry point is mcp_server.py

The PyInstaller configuration should include:
- One-file mode (--onefile)
- Clean build (--clean)
- No confirmation prompts (--noconfirm)
- Include .env file as data
- Include necessary hidden imports`,
      description: "Create build scripts to compile your MCP server into executables",
      icon: <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center text-amber-600">
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></svg>
      </div>,
      category: "Building"
    },
    {
      title: "API Integration",
      content: `I need help integrating the Silicon Flow API into my MCP image generation service. The service implements the AIO-MCP protocol v1.2.1.

Please help me implement an ImageService class in Python that:
1. Handles authentication with the Silicon Flow API
2. Sends image generation requests with proper parameters
3. Processes and returns the results in a format compatible with AIO-MCP
4. Includes proper error handling

The ImageService should support these methods:
- get_help_info() - Returns metadata about the service capabilities
- generate_image() - Sends requests to the Silicon Flow API to generate images
  - Parameters: prompt, negative_prompt, num_inference_steps, guidance_scale, seed, image_size
  - Returns: Base64 encoded image and metadata

The API endpoint for Silicon Flow is:
https://api.siliconflow.cn/v1/images/generations

The API expects:
- Authorization header with bearer token
- JSON body with model, prompt, and other parameters
- Returns image URLs that need to be downloaded and converted to base64`,
      description: "Implement API integration with Silicon Flow for image generation",
      icon: <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center text-purple-600">
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/><polyline points="16 6 12 2 8 6"/><line x1="12" y1="2" x2="12" y2="15"/></svg>
      </div>,
      category: "Integration"
    },
    {
      title: "AIO-MCP Documentation",
      content: `I need help creating comprehensive documentation for my MCP image generation server. The server implements the AIO-MCP protocol v1.2.1 and provides image generation capabilities using the Silicon Flow API.

Please help me create a detailed README.md that includes:

1. Introduction
   - Brief description of the service
   - Key features and capabilities

2. Installation
   - Prerequisites
   - Dependency installation instructions
   - Environment configuration

3. Usage
   - stdio Mode
     - Building executables
     - JSON-RPC request format with examples
     - Response format with examples
     - Error handling

   - MCP Mode
     - Building MCP mode executables
     - Available tools and methods
     - Example usage in Python

4. API Reference
   - Detailed description of methods
   - Parameter descriptions
   - Return value descriptions
   - Examples for each method

5. Testing
   - Instructions for running test scripts
   - Example test commands and expected outputs

6. Troubleshooting
   - Common issues and solutions
   - Debugging tips

Include proper formatting with markdown, code blocks for examples, and clear explanations suitable for both beginner and advanced users.`,
      description: "Create comprehensive documentation for your MCP image server",
      icon: <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center text-red-600">
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>
      </div>,
      category: "Documentation"
    }
  ];

  return (
    <Card className="mb-8">
      <CardHeader className="bg-slate-50 dark:bg-slate-900 rounded-t-lg">
        <CardTitle className="text-lg font-medium flex items-center gap-2">
          <Info size={18} />
          AI Prompts for MCP Server Development
        </CardTitle>
      </CardHeader>
      
      <CardContent>
        <p className="text-sm text-gray-500 mb-4">
          Use these ready-made prompts with your favorite AI assistant to help you develop your AIO-MCP image processing server
        </p>
        
        <Tabs defaultValue="all" className="mb-4">
          <TabsList className="w-full">
            <TabsTrigger value="all" className="flex-1">All Prompts</TabsTrigger>
            <TabsTrigger value="implementation" className="flex-1">Implementation</TabsTrigger>
            <TabsTrigger value="testing" className="flex-1">Testing</TabsTrigger>
            <TabsTrigger value="documentation" className="flex-1">Documentation</TabsTrigger>
          </TabsList>
          
          <TabsContent value="all" className="pt-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {promptTemplates.map((template, index) => (
                <div key={index} className="border border-slate-200 dark:border-slate-700 rounded-lg p-4 hover:border-primary transition-all bg-gradient-to-b from-white to-slate-50 dark:from-slate-900 dark:to-slate-950 shadow-sm">
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex gap-3">
                      {template.icon}
                      <div>
                        <h4 className="font-medium">{template.title}</h4>
                        <div className="text-xs px-2 py-0.5 bg-primary/10 text-primary rounded-full inline-block mt-1">
                          {template.category}
                        </div>
                      </div>
                    </div>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => copyToClipboard(template.content, `prompt-${index}`)}
                      className="bg-white hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-700"
                    >
                      {copiedId === `prompt-${index}` ? (
                        <Check size={14} className="mr-1 text-green-500" />
                      ) : (
                        <Copy size={14} className="mr-1" />
                      )}
                      {copiedId === `prompt-${index}` ? 'Copied' : 'Copy'}
                    </Button>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">{template.description}</p>
                  <div className="text-xs bg-slate-100 dark:bg-slate-800 p-3 rounded-md max-h-32 overflow-y-auto border border-slate-200 dark:border-slate-700">
                    {template.content.split('\n').map((line, i) => (
                      <div key={i} className="mb-1">{line}</div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>
          
          <TabsContent value="implementation" className="pt-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {promptTemplates.filter(t => t.category === "Implementation" || t.category === "Integration").map((template, index) => (
                <div key={index} className="border border-slate-200 dark:border-slate-700 rounded-lg p-4 hover:border-primary transition-all bg-gradient-to-b from-white to-slate-50 dark:from-slate-900 dark:to-slate-950 shadow-sm">
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex gap-3">
                      {template.icon}
                      <div>
                        <h4 className="font-medium">{template.title}</h4>
                        <div className="text-xs px-2 py-0.5 bg-primary/10 text-primary rounded-full inline-block mt-1">
                          {template.category}
                        </div>
                      </div>
                    </div>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => copyToClipboard(template.content, `prompt-impl-${index}`)}
                      className="bg-white hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-700"
                    >
                      {copiedId === `prompt-impl-${index}` ? (
                        <Check size={14} className="mr-1 text-green-500" />
                      ) : (
                        <Copy size={14} className="mr-1" />
                      )}
                      {copiedId === `prompt-impl-${index}` ? 'Copied' : 'Copy'}
                    </Button>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">{template.description}</p>
                  <div className="text-xs bg-slate-100 dark:bg-slate-800 p-3 rounded-md max-h-32 overflow-y-auto border border-slate-200 dark:border-slate-700">
                    {template.content.split('\n').map((line, i) => (
                      <div key={i} className="mb-1">{line}</div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>
          
          <TabsContent value="testing" className="pt-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {promptTemplates.filter(t => t.category === "Testing" || t.category === "Building").map((template, index) => (
                <div key={index} className="border border-slate-200 dark:border-slate-700 rounded-lg p-4 hover:border-primary transition-all bg-gradient-to-b from-white to-slate-50 dark:from-slate-900 dark:to-slate-950 shadow-sm">
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex gap-3">
                      {template.icon}
                      <div>
                        <h4 className="font-medium">{template.title}</h4>
                        <div className="text-xs px-2 py-0.5 bg-primary/10 text-primary rounded-full inline-block mt-1">
                          {template.category}
                        </div>
                      </div>
                    </div>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => copyToClipboard(template.content, `prompt-test-${index}`)}
                      className="bg-white hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-700"
                    >
                      {copiedId === `prompt-test-${index}` ? (
                        <Check size={14} className="mr-1 text-green-500" />
                      ) : (
                        <Copy size={14} className="mr-1" />
                      )}
                      {copiedId === `prompt-test-${index}` ? 'Copied' : 'Copy'}
                    </Button>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">{template.description}</p>
                  <div className="text-xs bg-slate-100 dark:bg-slate-800 p-3 rounded-md max-h-32 overflow-y-auto border border-slate-200 dark:border-slate-700">
                    {template.content.split('\n').map((line, i) => (
                      <div key={i} className="mb-1">{line}</div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>
          
          <TabsContent value="documentation" className="pt-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {promptTemplates.filter(t => t.category === "Documentation").map((template, index) => (
                <div key={index} className="border border-slate-200 dark:border-slate-700 rounded-lg p-4 hover:border-primary transition-all bg-gradient-to-b from-white to-slate-50 dark:from-slate-900 dark:to-slate-950 shadow-sm">
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex gap-3">
                      {template.icon}
                      <div>
                        <h4 className="font-medium">{template.title}</h4>
                        <div className="text-xs px-2 py-0.5 bg-primary/10 text-primary rounded-full inline-block mt-1">
                          {template.category}
                        </div>
                      </div>
                    </div>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => copyToClipboard(template.content, `prompt-doc-${index}`)}
                      className="bg-white hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-700"
                    >
                      {copiedId === `prompt-doc-${index}` ? (
                        <Check size={14} className="mr-1 text-green-500" />
                      ) : (
                        <Copy size={14} className="mr-1" />
                      )}
                      {copiedId === `prompt-doc-${index}` ? 'Copied' : 'Copy'}
                    </Button>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">{template.description}</p>
                  <div className="text-xs bg-slate-100 dark:bg-slate-800 p-3 rounded-md max-h-32 overflow-y-auto border border-slate-200 dark:border-slate-700">
                    {template.content.split('\n').map((line, i) => (
                      <div key={i} className="mb-1">{line}</div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default MCPAIGuide;

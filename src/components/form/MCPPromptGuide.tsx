
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Copy, Check, Info, FileCode, Wand } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

interface PromptTemplate {
  title: string;
  content: string;
  description: string;
  icon: React.ReactNode;
  category: string;
  color: string;
}

const MCPPromptGuide: React.FC = () => {
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

  // Added color property to each template for clear visual identification
  const promptTemplates: PromptTemplate[] = [
    {
      title: "Create Image Generation MCP Server",
      content: `I need help creating an AIO-MCP server for image generation using Silicon Flow's API. The server should support both stdio and MCP modes and follow the AIO-MCP protocol v1.2.1.

Project structure:
- image_service.py: Core service logic with API integration
- stdio_server.py: JSON-RPC over stdin/stdout server implementation
- mcp_server.py: MCP protocol server implementation
- build.py: Build script for creating executables
- requirements.txt: Dependencies list

The API should support:
1. Help method that describes capabilities
2. Image generation with parameters:
   - prompt (required)
   - negative_prompt (optional)
   - num_inference_steps (default: 20)
   - guidance_scale (default: 7.5)
   - seed (optional)
   - image_size (default: "1024x1024")

Using Silicon Flow API (endpoint: https://api.siliconflow.cn/v1/images/generations)

Please write the code for all files including build scripts and test files following best practices for AIO-MCP protocol implementation.`,
      description: "Create a complete image generation MCP server using Silicon Flow API",
      icon: <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
        <Wand className="h-5 w-5" />
      </div>,
      category: "Implementation",
      color: "blue"
    },
    {
      title: "Create Audio Processing MCP Server",
      content: `I need help creating an AIO-MCP server for audio processing and transcription that implements the AIO-MCP protocol v1.2.1. 

The server should:
1. Accept audio files or base64 encoded audio input
2. Process the audio to convert speech to text
3. Return structured results with the transcript and confidence metrics
4. Support both stdio and MCP protocol modes

Please include:
- Core audio processing service with Whisper model integration
- JSON-RPC 2.0 server for stdio communication
- MCP protocol server implementation with proper tools
- Build scripts for creating standalone executables
- Test scripts for validation
- Complete protocol documentation

The project structure should follow AIO-2030 standards:
- audio_service.py - Core logic and API integration
- stdio_server.py - JSON-RPC implementation
- mcp_server.py - MCP protocol server
- build_exec.sh - Build script
- test files for validation

The MCP server should provide tools for:
- transcribe_audio - Convert speech to text
- analyze_audio - Detect language and quality metrics
- audio_to_segments - Split audio into segments with transcription`,
      description: "Create a complete audio processing and transcription MCP server",
      icon: <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center text-purple-600">
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="22"/></svg>
      </div>,
      category: "Implementation",
      color: "purple"
    },
    {
      title: "Create NLP Analysis MCP Server",
      content: `I need help creating an AIO-MCP natural language processing server implementing the AIO-MCP protocol v1.2.1.

The MCP server should provide advanced NLP capabilities including:
1. Entity extraction from text 
2. Sentiment analysis
3. Text classification
4. Keyword extraction
5. Language detection

Please implement the server with:
- Core NLP service using spaCy or another suitable library
- JSON-RPC 2.0 interface over stdio
- MCP protocol support with appropriate tools definitions
- Resources module support for persistent data
- Complete error handling and validation
- Build scripts for creating distributable executables
- Test scripts for all capabilities

Project structure should include:
- nlp_service.py - Core NLP functionality
- stdio_server.py - JSON-RPC over stdin/stdout
- mcp_server.py - MCP protocol server
- build.py - Build script
- requirements.txt - Dependencies
- Test files for all methods

The MCP server should implement a help method that provides comprehensive information about its capabilities according to the AIO-MCP v1.2.1 specification.`,
      description: "Create a comprehensive NLP analysis MCP server with multiple capabilities",
      icon: <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center text-green-600">
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M7 20h10"/><path d="M10 20c5.5-2.5.8-6.4 3-10"/><path d="M9.5 9.4c1.1.8 1.8 2.2 2.3 3.7-2 .4-3.6.4-4.9-.3"/><path d="M14.1 6.5c.9 0 1.6.7 1.6 1.6s-.7 1.6-1.6 1.6-1.6-.7-1.6-1.6.7-1.6 1.6-1.6"/></svg>
      </div>,
      category: "Implementation",
      color: "green"
    },
    {
      title: "Create PDF Processing MCP Server",
      content: `I need help developing an AIO-MCP server for PDF document processing that follows the AIO-MCP protocol v1.2.1.

The server should provide the following capabilities:
1. Extract text from PDF documents
2. Convert PDFs to images
3. Extract metadata from PDFs
4. Extract tables from PDFs as structured data
5. Search for keywords and return page references

Please implement:
- Core PDF service using PyPDF2, pdfplumber, or another suitable library
- JSON-RPC 2.0 interface over stdio
- MCP protocol server with appropriate tools definitions
- Resources module for handling file data
- Comprehensive error handling
- Build scripts to create standalone executables
- Test scripts for each capability

The project structure should include:
- pdf_service.py - Core PDF processing logic
- stdio_server.py - JSON-RPC implementation
- mcp_server.py - MCP protocol server
- build.py - Build script for executables
- requirements.txt - Dependencies
- Test files for all methods

The server should provide detailed help information and proper documentation of all methods according to the AIO-MCP v1.2.1 specification.`,
      description: "Create a feature-rich PDF document processing MCP server",
      icon: <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center text-red-600">
        <FileCode className="h-5 w-5" />
      </div>,
      category: "Implementation",
      color: "red"
    },
    {
      title: "MCP Building Guide Prompt",
      content: `I need guidance on building and packaging an MCP server for the AIO-2030 ecosystem following the AIO-MCP protocol v1.2.1.

Please provide a step-by-step guide covering:

1. Project Structure
   - Recommended file organization
   - Key components needed for AIO-MCP compliance
   - Configuration approach

2. Development Setup
   - Required dependencies and environment
   - Development workflow recommendations
   - Testing approach during development

3. Building for Distribution
   - Creating standalone executables with PyInstaller
   - Handling dependencies in the build process
   - Cross-platform considerations

4. Testing and Validation
   - Verifying AIO-MCP protocol compliance
   - Test script templates for various methods
   - Validation workflow

5. Deployment Best Practices
   - Containerization recommendations
   - Environment variable handling
   - Security considerations

6. Integration with AIO-2030
   - Registration with endpoint canister
   - Publish to the MCP directory
   - Verification process

Please include code examples for build scripts, test scripts, and explain the requirements for passing the AIO-MCP validation process.`,
      description: "Get comprehensive guidance on building and packaging MCP servers",
      icon: <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center text-amber-600">
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></svg>
      </div>,
      category: "Guidance",
      color: "amber"
    },
    {
      title: "MCP Protocol Compliance Checklist",
      content: `I need to ensure my MCP server complies with the AIO-MCP protocol v1.2.1 specification. Please create a comprehensive checklist I can follow for validation.

Please include:

1. Core Protocol Requirements
   - Required method implementations
   - JSON-RPC 2.0 format compliance
   - Error handling specifications
   - Command-line interface requirements

2. Module Implementation Requirements
   - Resources module implementation checklist
   - Prompts module implementation checklist
   - Tools module implementation checklist
   - Sampling module implementation checklist

3. Help Method Requirements
   - Required fields in help response
   - Method documentation standards
   - Schema documentation requirements
   - Capability tag definitions

4. Trace ID and Command Accountability
   - Trace ID handling and propagation
   - Proper logging for audit trails
   - Performance metrics collection

5. Security Requirements
   - Input validation
   - Error handling that doesn't expose sensitive information
   - Authentication considerations

6. Testing Requirements
   - Test coverage expectations
   - Validation test scenarios
   - Performance benchmarking

Please organize this as a detailed checklist with specific criteria for passing each requirement, and include example code snippets for critical sections.`,
      description: "Get a detailed compliance checklist for AIO-MCP protocol implementation",
      icon: <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600">
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10 2h4"/><path d="M12 14v-4"/><path d="M4 13a8 8 0 0 1 8-7 8 8 0 1 1-5.3 14L4 17.6"/></svg>
      </div>,
      category: "Guidance",
      color: "indigo"
    },
    {
      title: "MCP Server Documentation Template",
      content: `I need help creating comprehensive documentation for my AIO-MCP image generation server that follows the AIO-MCP protocol v1.2.1. Please provide a detailed documentation template.

The documentation should include:

1. Overview
   - Service description
   - AIO-MCP compliance declaration
   - Key capabilities summary
   - Target use cases

2. Installation & Setup
   - Prerequisites
   - Installation instructions
   - Configuration options
   - Environment variables

3. AIO-MCP Protocol Implementation
   - Module support (resources, prompts, tools, sampling)
   - Help method response format
   - JSON-RPC request/response formats
   - Error handling approach

4. API Reference
   - Detailed method documentation for each endpoint
   - Parameter descriptions with types and constraints
   - Response format specifications
   - Example requests and responses

5. Integration Examples
   - Example usage from AIO agents
   - Code snippets for common scenarios
   - Chain integration patterns

6. Testing & Validation
   - Test scripts usage
   - Validation approaches
   - Common issues and solutions

7. Security & Performance
   - Security considerations
   - Performance characteristics
   - Rate limiting information

8. Contributing & Development
   - Development setup
   - Contribution guidelines
   - Build process

Please provide this as a complete markdown template I can adapt for my specific MCP server implementation.`,
      description: "Get a comprehensive documentation template for your MCP server",
      icon: <div className="w-10 h-10 rounded-full bg-teal-100 flex items-center justify-center text-teal-600">
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>
      </div>,
      category: "Documentation",
      color: "teal"
    },
    {
      title: "MCP Server Architecture Design",
      content: `I need help designing a scalable and maintainable architecture for an AIO-MCP server that implements AIO-MCP protocol v1.2.1.

Please provide a comprehensive architecture design covering:

1. Component Architecture
   - Core service layer design
   - Protocol adaptation layers
   - Service registry and discovery
   - Dependency injection patterns

2. Module Organization
   - Module boundaries and interfaces
   - Inter-module communication
   - State management approach
   - Configuration management

3. Request Processing Pipeline
   - Request validation and sanitization
   - Processing middleware layers
   - Response formatting
   - Error handling strategy

4. Resource Management
   - Memory allocation strategy
   - File system interactions
   - External API connection pooling
   - Caching strategies

5. Scalability Considerations
   - Stateless design patterns
   - Horizontal scaling approach
   - Load balancing considerations
   - Rate limiting implementation

6. Testing Architecture
   - Unit testing approach
   - Integration testing strategy
   - Performance testing methodology
   - Continuous integration recommendations

7. Security Architecture
   - Input validation framework
   - Authentication and authorization
   - Sensitive data handling
   - Logging and auditing

8. DevOps Considerations
   - Build pipeline design
   - Deployment strategy
   - Monitoring and observability
   - Configuration management

Please include diagrams and code snippets where appropriate to illustrate the architectural patterns.`,
      description: "Get a comprehensive architecture design for your AIO-MCP server",
      icon: <div className="w-10 h-10 rounded-full bg-pink-100 flex items-center justify-center text-pink-600">
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="8" rx="2" ry="2"/><rect x="2" y="14" width="20" height="8" rx="2" ry="2"/><line x1="6" y1="6" x2="6.01" y2="6"/><line x1="6" y1="18" x2="6.01" y2="18"/></svg>
      </div>,
      category: "Architecture",
      color: "pink"
    }
  ];

  return (
    <Card className="mb-8">
      <CardHeader className="bg-slate-50 dark:bg-slate-900 rounded-t-lg border-b border-slate-200 dark:border-slate-800">
        <CardTitle className="text-lg font-medium flex items-center gap-2">
          <Info size={18} />
          AI Prompts for AIO-MCP Server Development
        </CardTitle>
      </CardHeader>
      
      <CardContent className="bg-white dark:bg-slate-950">
        <p className="text-sm text-muted-foreground mb-4">
          Use these ready-made prompts with your favorite AI assistant to help you develop AIO-MCP servers with various capabilities
        </p>
        
        <Tabs defaultValue="all" className="mb-4">
          <TabsList className="w-full">
            <TabsTrigger value="all" className="flex-1">All Prompts</TabsTrigger>
            <TabsTrigger value="implementation" className="flex-1">Implementation</TabsTrigger>
            <TabsTrigger value="guidance" className="flex-1">Guidance</TabsTrigger>
            <TabsTrigger value="architecture" className="flex-1">Architecture</TabsTrigger>
          </TabsList>
          
          <TabsContent value="all" className="pt-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {promptTemplates.map((template, index) => (
                <div 
                  key={index} 
                  className={`border border-${template.color}-200 dark:border-${template.color}-800 rounded-lg p-4 hover:border-${template.color}-500 transition-all bg-white dark:bg-slate-800 shadow-md`}
                >
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex gap-3">
                      {template.icon}
                      <div>
                        <h4 className="font-medium">{template.title}</h4>
                        <div className={`text-xs px-2 py-0.5 bg-${template.color}-100 text-${template.color}-700 dark:bg-${template.color}-900 dark:text-${template.color}-300 rounded-full inline-block mt-1 font-semibold`}>
                          {template.category}
                        </div>
                      </div>
                    </div>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => copyToClipboard(template.content, `prompt-${index}`)}
                      className="bg-white hover:bg-slate-50 dark:bg-slate-700 dark:hover:bg-slate-600 border border-slate-200 dark:border-slate-600"
                    >
                      {copiedId === `prompt-${index}` ? (
                        <Check size={14} className="mr-1 text-green-500" />
                      ) : (
                        <Copy size={14} className="mr-1" />
                      )}
                      {copiedId === `prompt-${index}` ? 'Copied' : 'Copy'}
                    </Button>
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">{template.description}</p>
                  <div className="text-xs bg-slate-50 dark:bg-slate-900 p-3 rounded-md max-h-32 overflow-y-auto border border-slate-200 dark:border-slate-700">
                    {template.content.split('\n\n').map((paragraph, i) => (
                      <div key={i} className="mb-2">
                        {paragraph.split('\n').map((line, j) => (
                          <div key={j} className="mb-1">{line}</div>
                        ))}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>
          
          <TabsContent value="implementation" className="pt-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {promptTemplates.filter(t => t.category === "Implementation").map((template, index) => (
                <div 
                  key={index} 
                  className={`border border-${template.color}-200 dark:border-${template.color}-800 rounded-lg p-4 hover:border-${template.color}-500 transition-all bg-white dark:bg-slate-800 shadow-md`}
                >
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex gap-3">
                      {template.icon}
                      <div>
                        <h4 className="font-medium">{template.title}</h4>
                        <div className={`text-xs px-2 py-0.5 bg-${template.color}-100 text-${template.color}-700 dark:bg-${template.color}-900 dark:text-${template.color}-300 rounded-full inline-block mt-1 font-semibold`}>
                          {template.category}
                        </div>
                      </div>
                    </div>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => copyToClipboard(template.content, `prompt-impl-${index}`)}
                      className="bg-white hover:bg-slate-50 dark:bg-slate-700 dark:hover:bg-slate-600 border border-slate-200 dark:border-slate-600"
                    >
                      {copiedId === `prompt-impl-${index}` ? (
                        <Check size={14} className="mr-1 text-green-500" />
                      ) : (
                        <Copy size={14} className="mr-1" />
                      )}
                      {copiedId === `prompt-impl-${index}` ? 'Copied' : 'Copy'}
                    </Button>
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">{template.description}</p>
                  <div className="text-xs bg-slate-50 dark:bg-slate-900 p-3 rounded-md max-h-32 overflow-y-auto border border-slate-200 dark:border-slate-700">
                    {template.content.split('\n\n').map((paragraph, i) => (
                      <div key={i} className="mb-2">
                        {paragraph.split('\n').map((line, j) => (
                          <div key={j} className="mb-1">{line}</div>
                        ))}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>
          
          <TabsContent value="guidance" className="pt-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {promptTemplates.filter(t => t.category === "Guidance" || t.category === "Documentation").map((template, index) => (
                <div 
                  key={index} 
                  className={`border border-${template.color}-200 dark:border-${template.color}-800 rounded-lg p-4 hover:border-${template.color}-500 transition-all bg-white dark:bg-slate-800 shadow-md`}
                >
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex gap-3">
                      {template.icon}
                      <div>
                        <h4 className="font-medium">{template.title}</h4>
                        <div className={`text-xs px-2 py-0.5 bg-${template.color}-100 text-${template.color}-700 dark:bg-${template.color}-900 dark:text-${template.color}-300 rounded-full inline-block mt-1 font-semibold`}>
                          {template.category}
                        </div>
                      </div>
                    </div>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => copyToClipboard(template.content, `prompt-guide-${index}`)}
                      className="bg-white hover:bg-slate-50 dark:bg-slate-700 dark:hover:bg-slate-600 border border-slate-200 dark:border-slate-600"
                    >
                      {copiedId === `prompt-guide-${index}` ? (
                        <Check size={14} className="mr-1 text-green-500" />
                      ) : (
                        <Copy size={14} className="mr-1" />
                      )}
                      {copiedId === `prompt-guide-${index}` ? 'Copied' : 'Copy'}
                    </Button>
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">{template.description}</p>
                  <div className="text-xs bg-slate-50 dark:bg-slate-900 p-3 rounded-md max-h-32 overflow-y-auto border border-slate-200 dark:border-slate-700">
                    {template.content.split('\n\n').map((paragraph, i) => (
                      <div key={i} className="mb-2">
                        {paragraph.split('\n').map((line, j) => (
                          <div key={j} className="mb-1">{line}</div>
                        ))}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>
          
          <TabsContent value="architecture" className="pt-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {promptTemplates.filter(t => t.category === "Architecture").map((template, index) => (
                <div 
                  key={index} 
                  className={`border border-${template.color}-200 dark:border-${template.color}-800 rounded-lg p-4 hover:border-${template.color}-500 transition-all bg-white dark:bg-slate-800 shadow-md`}
                >
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex gap-3">
                      {template.icon}
                      <div>
                        <h4 className="font-medium">{template.title}</h4>
                        <div className={`text-xs px-2 py-0.5 bg-${template.color}-100 text-${template.color}-700 dark:bg-${template.color}-900 dark:text-${template.color}-300 rounded-full inline-block mt-1 font-semibold`}>
                          {template.category}
                        </div>
                      </div>
                    </div>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => copyToClipboard(template.content, `prompt-arch-${index}`)}
                      className="bg-white hover:bg-slate-50 dark:bg-slate-700 dark:hover:bg-slate-600 border border-slate-200 dark:border-slate-600"
                    >
                      {copiedId === `prompt-arch-${index}` ? (
                        <Check size={14} className="mr-1 text-green-500" />
                      ) : (
                        <Copy size={14} className="mr-1" />
                      )}
                      {copiedId === `prompt-arch-${index}` ? 'Copied' : 'Copy'}
                    </Button>
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">{template.description}</p>
                  <div className="text-xs bg-slate-50 dark:bg-slate-900 p-3 rounded-md max-h-32 overflow-y-auto border border-slate-200 dark:border-slate-700">
                    {template.content.split('\n\n').map((paragraph, i) => (
                      <div key={i} className="mb-2">
                        {paragraph.split('\n').map((line, j) => (
                          <div key={j} className="mb-1">{line}</div>
                        ))}
                      </div>
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

export default MCPPromptGuide;

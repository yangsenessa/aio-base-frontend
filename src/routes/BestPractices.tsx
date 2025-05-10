
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { ExternalLink, Play, FileCode, Info } from 'lucide-react';
import { Button } from "@/components/ui/button";
import AgentCodeBlock from '../components/agent/AgentCodeBlock';

const BestPractices = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Best Practices: Voice Identification MCP</h1>
        <p className="text-lg text-muted-foreground">
          A comprehensive guide for integrating and deploying the mcp_voice_identify service 
          within the AIO-2030 ecosystem.
        </p>
        
        <div className="flex items-center gap-2 mt-4">
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => window.open('https://github.com/AIO-2030/mcp_voice_identify', '_blank')}
            className="flex items-center gap-2"
          >
            <ExternalLink size={16} />
            Repository
          </Button>
          <Badge variant="secondary">AIO-2030</Badge>
          <Badge variant="secondary">Best Practice</Badge>
          <Badge variant="secondary">MCP Server</Badge>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Sidebar with section navigation */}
        <div className="lg:col-span-1">
          <Card className="sticky top-[5.5rem]">
            <CardHeader className="pb-3">
              <CardTitle>Sections</CardTitle>
            </CardHeader>
            <CardContent className="space-y-1 p-3">
              <a href="#overview" className="flex items-center gap-2 p-3 rounded-md hover:bg-secondary transition-colors">
                <span className="w-6 h-6 flex items-center justify-center rounded-full bg-primary/10 text-primary">🎤</span>
                <span>Overview</span>
              </a>
              <a href="#deployment" className="flex items-center gap-2 p-3 rounded-md hover:bg-secondary transition-colors">
                <span className="w-6 h-6 flex items-center justify-center rounded-full bg-primary/10 text-primary">🧩</span>
                <span>Deployment Best Practices</span>
              </a>
              <a href="#api" className="flex items-center gap-2 p-3 rounded-md hover:bg-secondary transition-colors">
                <span className="w-6 h-6 flex items-center justify-center rounded-full bg-primary/10 text-primary">📡</span>
                <span>API Usage & Format</span>
              </a>
              <a href="#debugging" className="flex items-center gap-2 p-3 rounded-md hover:bg-secondary transition-colors">
                <span className="w-6 h-6 flex items-center justify-center rounded-full bg-primary/10 text-primary">🧪</span>
                <span>Debugging & Testing</span>
              </a>
              <a href="#integration" className="flex items-center gap-2 p-3 rounded-md hover:bg-secondary transition-colors">
                <span className="w-6 h-6 flex items-center justify-center rounded-full bg-primary/10 text-primary">🔗</span>
                <span>Integration with AIO-2030</span>
              </a>
              <a href="#repo" className="flex items-center gap-2 p-3 rounded-md hover:bg-secondary transition-colors">
                <span className="w-6 h-6 flex items-center justify-center rounded-full bg-primary/10 text-primary">🌐</span>
                <span>GitHub Repository</span>
              </a>
            </CardContent>
          </Card>
        </div>
        
        {/* Main content */}
        <div className="lg:col-span-2 space-y-10">
          {/* Overview section */}
          <section id="overview" className="scroll-mt-20">
            <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
              <span className="w-8 h-8 flex items-center justify-center rounded-full bg-primary/10 text-primary">🎤</span>
              Overview
            </h2>
            <div className="space-y-4">
              <p>
                This guide covers best practices for integrating and deploying the <code>mcp_voice_identify</code> service 
                within the AIO-2030 ecosystem.
              </p>
              <p>
                It supports voice transcription from audio files and base64 input, runs in both stdio and 
                MCP modes, and returns structured results including transcript text, confidence score, and audio hash.
              </p>
              
              <div className="bg-secondary/30 border border-secondary/40 p-4 rounded-md">
                <h3 className="font-semibold flex items-center mb-2">
                  <Info size={16} className="mr-2" />
                  Key Features
                </h3>
                <ul className="list-disc pl-6 space-y-1">
                  <li>Multi-format audio input (file/base64)</li>
                  <li>Structured output with confidence scoring</li>
                  <li>Compatible with AIO-2030 protocols</li>
                  <li>Modular architecture for pipeline integration</li>
                  <li>Built-in test assets and verification tools</li>
                </ul>
              </div>
              
              <div className="aspect-video w-full overflow-hidden rounded-md border">
                <img 
                  src="/lovable-uploads/e68cde0c-7e5a-48a4-a902-7cb133626cdd.png"
                  alt="Voice Identification MCP Architecture"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </section>
          
          {/* Deployment section */}
          <section id="deployment" className="scroll-mt-20">
            <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
              <span className="w-8 h-8 flex items-center justify-center rounded-full bg-primary/10 text-primary">🧩</span>
              Deployment Best Practices
            </h2>
            <div className="space-y-4">
              <ul className="list-disc pl-6 space-y-2">
                <li>Use containerization (e.g., Docker) to isolate execution environments.</li>
                <li>Include FFmpeg and necessary audio libraries in the image.</li>
                <li>Secure file upload endpoints to prevent injection attacks.</li>
                <li>Ensure executable permissions with <code>chmod +x</code>, support fallback for <code>.bin</code> suffixes.</li>
                <li>Log transcripts in structured files for post-processing and audit.</li>
              </ul>
              
              <Card className="mt-6">
                <CardHeader>
                  <CardTitle className="text-lg">Example Docker Configuration</CardTitle>
                </CardHeader>
                <CardContent>
                  <AgentCodeBlock
                    title="Dockerfile"
                    language="dockerfile"
                    code={`FROM python:3.9-slim

# Install FFmpeg and required libraries
RUN apt-get update && \\
    apt-get install -y ffmpeg libsndfile1 && \\
    apt-get clean

WORKDIR /app

# Install Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application files
COPY . .

# Set executable permissions
RUN chmod +x mcp_voice_identify.py

EXPOSE 8080

CMD ["python", "mcp_server.py"]
`}
                  />
                </CardContent>
              </Card>
            </div>
          </section>
          
          {/* API section */}
          <section id="api" className="scroll-mt-20">
            <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
              <span className="w-8 h-8 flex items-center justify-center rounded-full bg-primary/10 text-primary">📡</span>
              API Usage & Format
            </h2>
            <div className="space-y-4">
              <p>
                API Endpoint: <code>/api/v1/mcp/{voice_model}</code>
              </p>
              <p>
                Accepts audio via <code>multipart/form-data</code> or <code>base64</code> JSON input.
              </p>
              <p>
                Returns the following JSON structure:
              </p>
              
              <AgentCodeBlock
                language="json"
                code={`{
  "transcript": "...",
  "confidence": 0.91,
  "audio_hash": "md5string"
}`}
              />
              
              <p className="mt-4 text-sm text-muted-foreground">
                Includes CLI examples using <code>curl</code> and internal AIO calls via stdio or MCP runner.
              </p>
              
              <Tabs defaultValue="curl" className="mt-6">
                <TabsList>
                  <TabsTrigger value="curl">curl Example</TabsTrigger>
                  <TabsTrigger value="stdio">stdio Example</TabsTrigger>
                  <TabsTrigger value="mcp">MCP Protocol</TabsTrigger>
                </TabsList>
                
                <TabsContent value="curl" className="pt-4">
                  <AgentCodeBlock
                    language="bash"
                    code={`curl -X POST \\
  -H "Content-Type: multipart/form-data" \\
  -F "audio=@./test.wav" \\
  http://localhost:8080/api/v1/mcp/default`}
                  />
                </TabsContent>
                
                <TabsContent value="stdio" className="pt-4">
                  <AgentCodeBlock
                    language="json"
                    code={`{
  "jsonrpc": "2.0", 
  "method": "voice_identify::input",
  "inputs": [{
    "type": "audio",
    "value": "base64encodedaudio..."
  }],
  "id": 1,
  "trace_id": "AIO-TR-20250510-0001"
}`}
                  />
                </TabsContent>
                
                <TabsContent value="mcp" className="pt-4">
                  <AgentCodeBlock
                    language="json"
                    code={`{
  "jsonrpc": "2.0",
  "method": "voice_identify::tools.call",
  "params": {
    "tool": "transcribe_audio",
    "args": {
      "audio_data": "base64encodedaudio..."
    }
  },
  "id": 1,
  "trace_id": "AIO-TR-20250510-0001"
}`}
                  />
                </TabsContent>
              </Tabs>
            </div>
          </section>
          
          {/* Debugging section */}
          <section id="debugging" className="scroll-mt-20">
            <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
              <span className="w-8 h-8 flex items-center justify-center rounded-full bg-primary/10 text-primary">🧪</span>
              Debugging & Testing
            </h2>
            <div className="space-y-4">
              <ul className="list-disc pl-6 space-y-2">
                <li>Use included test scripts: <code>test_voice_base64.sh</code>, <code>test.wav</code>.</li>
                <li>Capture both <code>stderr</code> and <code>stdout</code> from subprocess execution.</li>
                <li>Handle corrupted files or silent audio gracefully.</li>
              </ul>
              
              <Card className="mt-6">
                <CardHeader>
                  <CardTitle className="text-lg">Testing Example</CardTitle>
                </CardHeader>
                <CardContent>
                  <AgentCodeBlock
                    language="bash"
                    code={`# Test with provided sample
./test_voice_base64.sh

# Test with custom file
python -m mcp_voice_identify --file ./my_audio.mp3 --debug

# Test error handling with empty file
touch empty.wav
python -m mcp_voice_identify --file ./empty.wav --verbose`}
                  />
                </CardContent>
              </Card>
              
              <div className="flex items-center justify-center p-6 bg-secondary/30 border border-secondary/40 rounded-md">
                <Button 
                  className="flex items-center gap-2"
                  onClick={() => window.open('https://github.com/AIO-2030/mcp_voice_identify/tree/main/tests', '_blank')}
                >
                  <FileCode size={18} />
                  View Test Files Repository
                </Button>
              </div>
            </div>
          </section>
          
          {/* Integration section */}
          <section id="integration" className="scroll-mt-20">
            <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
              <span className="w-8 h-8 flex items-center justify-center rounded-full bg-primary/10 text-primary">🔗</span>
              Integration with AIO-2030
            </h2>
            <div className="space-y-4">
              <ul className="list-disc pl-6 space-y-2">
                <li>Register the MCP via <code>EndPoint Canister</code> and expose capabilities using the <code>help</code> protocol.</li>
                <li>Ensure returned output adheres to AIO Protocol's JSON-RPC structure.</li>
                <li>Enable traceable execution logs for submission to the <code>Arbiter</code> for incentive validation.</li>
              </ul>
              
              <div className="mt-6">
                <h3 className="font-semibold mb-3">MCP Integration Example</h3>
                <AgentCodeBlock
                  language="json"
                  code={`// help method response
{
  "type": "mcp",
  "methods": [
    "tools.list",
    "tools.call",
    "resources.list",
    "resources.get"
  ],
  "modalities": [
    "audio",
    "text"
  ],
  "mcp": {
    "resources": true,
    "tools": true,
    "sampling": false,
    "prompts": false
  }
}`}
                />
              </div>
              
              <Card className="mt-6">
                <CardHeader>
                  <CardTitle className="text-lg">AIO Protocol Trace Example</CardTitle>
                </CardHeader>
                <CardContent>
                  <AgentCodeBlock
                    language="json"
                    code={`{
  "trace_id": "AIO-TR-20250510-0001",
  "calls": [
    {
      "id": 1,
      "protocol": "aio",
      "agent": "file_upload",
      "type": "stdio",
      "method": "file_upload::input",
      "inputs": [{"type": "file", "value": "base64-audio-data"}],
      "outputs": [{"type": "text", "value": "File uploaded"}],
      "status": "ok"
    },
    {
      "id": 2,
      "protocol": "mcp",
      "agent": "voice_identify",
      "type": "mcp",
      "method": "voice_identify::tools.call",
      "inputs": [{"type": "audio", "value": "audio-ref"}],
      "outputs": [
        {
          "type": "text", 
          "value": {
            "transcript": "This is a voice transcription test",
            "confidence": 0.91,
            "audio_hash": "e8f2a0b9c7d6..."
          }
        }
      ],
      "status": "ok"
    }
  ]
}`}
                  />
                </CardContent>
              </Card>
            </div>
          </section>
          
          {/* Repository section */}
          <section id="repo" className="scroll-mt-20">
            <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
              <span className="w-8 h-8 flex items-center justify-center rounded-full bg-primary/10 text-primary">🌐</span>
              GitHub Repository
            </h2>
            <div className="space-y-4">
              <Card className="border border-primary/20 overflow-hidden">
                <div className="aspect-video w-full">
                  <img 
                    src="/lovable-uploads/e68cde0c-7e5a-48a4-a902-7cb133626cdd.png"
                    alt="MCP Voice Identify Repository"
                    className="w-full h-full object-cover"
                  />
                </div>
                
                <CardContent className="p-6">
                  <h3 className="text-xl font-bold mb-2">mcp_voice_identify</h3>
                  <p className="text-muted-foreground mb-4">
                    An audio processing MCP Server offering voice recognition and transcription services. 
                    It supports audio input via file or base64 encoding and outputs structured results 
                    for downstream tasks.
                  </p>
                  
                  <div className="flex flex-wrap gap-2 mb-6">
                    <Badge variant="secondary">Voice</Badge>
                    <Badge variant="secondary">Speech</Badge>
                    <Badge variant="secondary">Transcription</Badge>
                    <Badge variant="secondary">Multimodal</Badge>
                  </div>
                  
                  <div className="flex justify-center">
                    <Button 
                      className="flex items-center gap-2"
                      onClick={() => window.open('https://github.com/AIO-2030/mcp_voice_identify', '_blank')}
                    >
                      <Play size={16} />
                      Visit Repository
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </section>
          
          <div className="border-t pt-6 mt-10">
            <p className="text-sm text-muted-foreground text-center">
              &copy; 2025 AIO-2030 Protocol Foundation. Documentation and best practices provided under MIT license.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BestPractices;

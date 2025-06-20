
import React, { useState } from 'react';
import { ChevronDown, ChevronRight, FileCode, Folder } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface FileTreeItem {
  name: string;
  type: 'file' | 'folder';
  children?: FileTreeItem[];
  language?: string;
  description?: string;
  content?: string;
}

interface MCPCodeExplorerProps {
  className?: string;
}

const MCPCodeExplorer: React.FC<MCPCodeExplorerProps> = ({ className }) => {
  const [expandedFolders, setExpandedFolders] = useState<string[]>(['mcp_image', 'mcp_image/mcp_image_generate']);
  const [selectedFile, setSelectedFile] = useState<FileTreeItem | null>(null);
  
  const toggleFolder = (path: string) => {
    setExpandedFolders(prev => 
      prev.includes(path) ? prev.filter(f => f !== path) : [...prev, path]
    );
  };

  const fileTree: FileTreeItem[] = [
    {
      name: 'mcp_image',
      type: 'folder',
      children: [
        {
          name: 'LICENSE',
          type: 'file',
          language: 'text',
          description: 'MIT License file for the project',
          content: `MIT License\n\nCopyright (c) 2025 ALAYA Dao\n\nPermission is hereby granted...`
        },
        {
          name: 'README.md',
          type: 'file',
          language: 'markdown',
          description: 'Main project documentation',
          content: `# mcp_image`
        },
        {
          name: 'mcp_image_generate',
          type: 'folder',
          children: [
            {
              name: 'README.md',
              type: 'file',
              language: 'markdown',
              description: 'Documentation for the image generation service',
              content: `# Image Generation Service\n\nThis service provides image generation capabilities...`
            },
            {
              name: 'build.py',
              type: 'file',
              language: 'python',
              description: 'Python script to build executables',
              content: `import os\nimport PyInstaller.__main__\n\n# Build functions...`
            },
            {
              name: 'build_exec.sh',
              type: 'file',
              language: 'bash',
              description: 'Shell script to run the build process',
              content: `#!/bin/bash\n\n# Install required packages...`
            },
            {
              name: 'image_service.py',
              type: 'file',
              language: 'python',
              description: 'Core implementation of the image service',
              content: `import os\nimport time\nimport base64\nfrom typing import Dict, Any, Optional\nimport requests\n\nclass ImageService:\n    # Service implementation...`
            },
            {
              name: 'mcp_server.py',
              type: 'file',
              language: 'python',
              description: 'MCP protocol server implementation',
              content: `import asyncio\nimport time\nfrom mcp.server import Server\nfrom mcp.server.stdio import stdio_server\nfrom mcp.server.fastmcp.tools import Tool\n\n# MCP server implementation...`
            },
            {
              name: 'requirements.txt',
              type: 'file',
              language: 'text',
              description: 'Python package dependencies',
              content: `python-dotenv>=1.0.1,<2.0.0\nrequests>=2.26.0,<3.0.0\n# More dependencies...`
            },
            {
              name: 'stdio_server.py',
              type: 'file',
              language: 'python',
              description: 'Standard IO server implementation',
              content: `import json\nimport sys\nfrom image_service import ImageService\n\n# STDIO server implementation...`
            },
            {
              name: 'test_generate.sh',
              type: 'file',
              language: 'bash',
              description: 'Test script for image generation',
              content: `#!/bin/bash\n\n# Test image generation...`
            },
            {
              name: 'test_generate_exec.sh',
              type: 'file',
              language: 'bash',
              description: 'Test script for executable',
              content: `#!/bin/bash\n\n# 测试图像生成功能...`
            },
            {
              name: 'test_help.sh',
              type: 'file',
              language: 'bash',
              description: 'Test script for help command',
              content: `#!/bin/bash\n\n# Test help method via stdio...`
            }
          ]
        }
      ]
    }
  ];

  const renderFileTree = (items: FileTreeItem[], basePath: string = '') => {
    return items.map(item => {
      const path = `${basePath}/${item.name}`;
      
      if (item.type === 'folder') {
        const isExpanded = expandedFolders.includes(path);
        
        return (
          <div key={path} className="select-none">
            <button
              className="flex items-center w-full py-1 px-1 hover:bg-slate-100 rounded text-left"
              onClick={() => toggleFolder(path)}
            >
              {isExpanded ? <ChevronDown size={16} className="mr-1" /> : <ChevronRight size={16} className="mr-1" />}
              <Folder size={16} className="mr-1 text-amber-500" />
              <span>{item.name}</span>
            </button>
            
            {isExpanded && item.children && (
              <div className="ml-6 border-l pl-2 border-slate-200">
                {renderFileTree(item.children, path)}
              </div>
            )}
          </div>
        );
      }
      
      return (
        <button
          key={path}
          className={`flex items-center py-1 px-1 w-full text-left hover:bg-slate-100 rounded ${selectedFile?.name === item.name ? 'bg-blue-100 hover:bg-blue-100' : ''}`}
          onClick={() => setSelectedFile(item)}
        >
          <FileCode size={16} className="mr-1 text-blue-500" />
          <span>{item.name}</span>
          {item.language && (
            <Badge variant="outline" className="ml-auto text-xs">
              {item.language}
            </Badge>
          )}
        </button>
      );
    });
  };

  return (
    <Card className={cn("border overflow-hidden", className)}>
      <div className="grid grid-cols-1 md:grid-cols-3 h-[500px]">
        <div className="border-r p-2 overflow-auto">
          <h3 className="font-medium mb-2 px-1">MCP Image Project Files</h3>
          <ScrollArea className="h-[460px]">
            {renderFileTree(fileTree)}
          </ScrollArea>
        </div>
        
        <div className="md:col-span-2 flex flex-col">
          {selectedFile ? (
            <Tabs defaultValue="preview" className="flex flex-col h-full">
              <div className="px-4 py-2 border-b flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <FileCode size={16} />
                  <span className="font-medium">{selectedFile.name}</span>
                </div>
                <TabsList>
                  <TabsTrigger value="preview">Preview</TabsTrigger>
                  <TabsTrigger value="info">Info</TabsTrigger>
                </TabsList>
              </div>
              
              <TabsContent value="preview" className="flex-grow p-0 m-0 overflow-hidden">
                <ScrollArea className="h-full">
                  <pre className="p-4 text-sm font-mono bg-slate-50">
                    {selectedFile.content}
                  </pre>
                </ScrollArea>
              </TabsContent>
              
              <TabsContent value="info" className="flex-grow p-4 space-y-4 m-0">
                <div>
                  <h4 className="font-medium mb-1">File Description</h4>
                  <p className="text-sm text-gray-600">{selectedFile.description}</p>
                </div>
                
                <div>
                  <h4 className="font-medium mb-1">File Type</h4>
                  <Badge variant="outline">{selectedFile.language}</Badge>
                </div>
                
                <div>
                  <h4 className="font-medium mb-1">Role in MCP Implementation</h4>
                  <p className="text-sm text-gray-600">
                    {selectedFile.name === 'image_service.py' && 'Core service implementation that handles image processing requests.'}
                    {selectedFile.name === 'mcp_server.py' && 'MCP protocol server that exposes the service via the Model Context Protocol.'}
                    {selectedFile.name === 'stdio_server.py' && 'Standard IO server that processes JSON-RPC requests via stdin/stdout.'}
                    {selectedFile.name === 'requirements.txt' && 'Lists all Python package dependencies needed for the MCP implementation.'}
                    {selectedFile.name === 'build.py' && 'Script to build standalone executables for the MCP service.'}
                    {selectedFile.name === 'README.md' && 'Documentation that explains how to use and integrate the MCP service.'}
                  </p>
                </div>
              </TabsContent>
            </Tabs>
          ) : (
            <div className="flex items-center justify-center h-full text-gray-500">
              <div className="text-center">
                <FileCode size={48} className="mx-auto mb-2 text-gray-400" />
                <p>Select a file to view its content</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
};

export default MCPCodeExplorer;

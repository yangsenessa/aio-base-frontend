
import React from 'react';
import { mcpServers } from '@/components/mcpStore/mcpData';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const MCPStore = () => {
  return (
    <div className="py-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">MCP Servers</h1>
        <div className="text-sm text-muted-foreground">
          MCP Servers
        </div>
      </div>

      {/* Description */}
      <p className="text-xl text-center mb-12 text-muted-foreground max-w-4xl mx-auto">
        Explore our collection of powerful server resources for enhanced functionality
      </p>

      {/* Server Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {mcpServers.map((server) => (
          <Card key={server.id} className="bg-[#1A1F2C] border-[#403E43] hover:shadow-md transition-shadow">
            <CardContent className="pt-6 pb-5 px-6">
              <div className="flex justify-between items-start mb-2">
                <h3 className="text-xl font-semibold text-white">{server.title}</h3>
                {server.isNew && (
                  <Badge className="bg-green-500 text-white hover:bg-green-600">
                    New
                  </Badge>
                )}
              </div>
              <p className="text-gray-300 mb-4 min-h-[60px]">{server.description}</p>
              
              {server.githubUrl && (
                <a 
                  href={server.githubUrl} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-blue-400 flex items-center hover:underline text-sm"
                >
                  View on GitHub <ArrowRight size={14} className="ml-1" />
                </a>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default MCPStore;

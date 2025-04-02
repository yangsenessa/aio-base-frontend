
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { AgentItem } from 'declarations/aio-base-backend/aio-base-backend.did.d.ts';

interface AgentDocumentationSectionProps {
  agent: AgentItem;
}

const AgentDocumentationSection = ({ agent }: AgentDocumentationSectionProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Agent Documentation</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <h3 className="text-lg font-medium mb-2">About this Agent</h3>
          <p className="text-muted-foreground">
            {agent.description}
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
  );
};

export default AgentDocumentationSection;


import React from 'react';
import { Card } from "../../components/ui/card";

const Chapter1 = () => {
  return (
    <div className="chapter">
      <h2 className="text-3xl font-bold mb-6 border-b pb-2">Chapter 1: Introducing Protocol Analysis for Web3 AIOps</h2>
      
      <div className="space-y-4">
        <p className="mb-4">
          The AIO Protocol serves as the foundation for intelligent operational systems in decentralized networks, 
          providing a standardized way for agents and services to communicate and collaborate.
        </p>

        <Card className="p-6 shadow-md">
          <h3 className="text-xl font-semibold mb-4">Key Protocol Features</h3>
          <ul className="list-disc pl-5 space-y-2">
            <li>JSON-RPC based communication standard</li>
            <li>Built-in trace-id mechanism for cross-agent coordination</li>
            <li>Support for diverse modalities (text, images, audio)</li>
            <li>MCP-compatible for integration with existing systems</li>
            <li>Chain-aware primitives for on-chain operations</li>
          </ul>
        </Card>

        <p className="mt-4">
          With the AIO Protocol, Web3 systems gain operational intelligence through coordinated agent actions, 
          enabling automation of complex workflows across distributed environments.
        </p>
      </div>
    </div>
  );
};

export default Chapter1;

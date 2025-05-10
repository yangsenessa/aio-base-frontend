
import React from 'react';
import { Card } from "../../components/ui/card";

const Chapter2 = () => {
  return (
    <div className="chapter">
      <h2 className="text-3xl font-bold mb-6 border-b pb-2">Chapter 2: Architecture & Implementation</h2>
      
      <div className="space-y-4">
        <p className="mb-4">
          The AIO Protocol architecture is designed to support scalable agent networks with intelligent coordination capabilities.
        </p>

        <Card className="p-6 shadow-md bg-neutral-50">
          <h3 className="text-xl font-semibold mb-4">Core Components</h3>
          <div className="space-y-3">
            <div>
              <h4 className="font-medium">1. Protocol Layer</h4>
              <p>Defines the JSON-RPC interface and communication standards</p>
            </div>
            <div>
              <h4 className="font-medium">2. Coordination Layer</h4>
              <p>Manages multi-agent workflows and resource allocation</p>
            </div>
            <div>
              <h4 className="font-medium">3. Execution Layer</h4>
              <p>Handles task processing and result aggregation</p>
            </div>
            <div>
              <h4 className="font-medium">4. Persistence Layer</h4>
              <p>Provides storage solutions for state management</p>
            </div>
          </div>
        </Card>

        <div className="mt-6">
          <h3 className="text-xl font-semibold mb-4">Implementation Strategy</h3>
          <p>
            Our reference implementation uses TypeScript for the core protocol layers, 
            with Rust implementations for performance-critical components. Smart contracts 
            written in Solidity handle on-chain interactions and token economics.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Chapter2;

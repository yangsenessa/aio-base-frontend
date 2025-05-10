
import React from 'react';
import { Card } from "../../components/ui/card";

const Chapter3 = () => {
  return (
    <div className="chapter">
      <h2 className="text-3xl font-bold mb-6 border-b pb-2">Chapter 3: Agent Network Topology</h2>
      
      <div className="space-y-6">
        <div className="mb-6">
          <h3 className="text-2xl font-semibold mb-3">Key Roles and Components</h3>
          <p>
            The AIO-2030 ecosystem consists of multiple interconnected roles and components that work together
            to form a dynamic, adaptable network topology. This hierarchical yet flexible structure allows for 
            efficient resource allocation while maintaining the ability to handle complex workflows.
          </p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-xl font-semibold mb-4">Network Roles</h3>
          
          <div className="space-y-6">
            <div>
              <h4 className="font-medium text-lg">Queen Agent</h4>
              <p className="mb-2">The core superintelligence of AIO-2030 that orchestrates workflow and delegates tasks.</p>
              <ul className="list-disc pl-5 text-sm">
                <li>Transcends individual agents by serving as a high-dimensional orchestrator</li>
                <li>Manages capability discovery, thought-chain execution, and ecosystem-wide intelligence integration</li>
                <li>Constructs dynamic invocation chains through Think Context Chains</li>
                <li>Supervises the entire lifecycle of each multi-agent task</li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-medium text-lg">Worker Agents & MCP Servers</h4>
              <p className="mb-2">Execute specific tasks with specialized capabilities and provide AI services.</p>
              <ul className="list-disc pl-5 text-sm">
                <li>Register through standardized contract mechanisms to join the network</li>
                <li>Implement the AIO-MCP-help protocol to declare capabilities</li>
                <li>Can be deployed as AIO-POD containers, Wasm modules, or hosted APIs</li>
                <li>Include commercial providers (OpenAI, Claude, Gemini) and independent services</li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-medium text-lg">Arbiter</h4>
              <p className="mb-2">The execution layer of the AIO-Tokenization Protocol.</p>
              <ul className="list-disc pl-5 text-sm">
                <li>Implemented as smart contracts via ICP Canisters</li>
                <li>Validates task traces, execution quality, and reported workloads</li>
                <li>Governs token-based operations including grants and incentive distribution</li>
                <li>Ensures fair execution measurement across the agent network</li>
              </ul>
            </div>

            <div>
              <h4 className="font-medium text-lg">Users & Developers</h4>
              <p className="mb-2">Participants who interact with and contribute to the ecosystem.</p>
              <ul className="list-disc pl-5 text-sm">
                <li>Users initiate AI tasks by submitting intent-based requests</li>
                <li>Developers contribute by registering custom-built AI Agents or MCP Servers</li>
                <li>Both gain access to grants and rewards through AIO-Tokenize smart contracts</li>
                <li>Participate in governance through staked token voting</li>
              </ul>
            </div>

            <div>
              <h4 className="font-medium text-lg">Smart Contracts & AI Pins</h4>
              <p className="mb-2">Infrastructure components that enable trust and integration.</p>
              <ul className="list-disc pl-5 text-sm">
                <li>Smart Contracts act as trust anchors, managing registration and incentives</li>
                <li>AI Pins serve as bridges between the agent ecosystem and external services</li>
                <li>EndPoint Canister contracts store agent metadata and capabilities</li>
                <li>On-chain Workload Ledger maintains transparent execution records</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="mt-6">
          <h3 className="text-2xl font-semibold mb-3">Ecosystem Compatibility</h3>
          <p className="mb-3">
            AIO is designed with broad compatibility across diverse agent types and deployment environments:
          </p>
          
          <Card className="p-5">
            <ul className="list-disc pl-5 space-y-2">
              <li>Supports both self-hosted agents (Docker/API) and hosted platforms like Eliza or Wordware</li>
              <li>Integrates with commercial inference providers including OpenAI, Claude, and other MCP Servers</li>
              <li>Enables multi-agent task composition while maintaining traceable invocation paths</li>
              <li>Allows third-party developers to participate in the incentive economy through registration</li>
              <li>Facilitates comparison and interoperation with other agent systems like Doubao, Coze, and POE</li>
            </ul>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Chapter3;

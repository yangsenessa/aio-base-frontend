
import React from 'react';
import { Card } from "../../components/ui/card";

const Chapter2 = () => {
  return (
    <div className="chapter">
      <h2 className="text-3xl font-bold mb-6 border-b pb-2">Chapter 2: Architecture & Implementation</h2>
      
      <div className="space-y-6">
        <div className="mb-6">
          <h3 className="text-2xl font-semibold mb-3">AIO Protocol Stack</h3>
          <p>
            The AIO Protocol architecture is designed to support scalable agent networks with intelligent coordination capabilities.
            It defines a unified interface and execution framework for agentic AI capabilities, enabling seamless integration
            across heterogeneous AI Agents and intelligent services.
          </p>
        </div>

        <Card className="p-6 shadow-md bg-neutral-50">
          <h3 className="text-xl font-semibold mb-4">Modular Architecture Layers</h3>
          <div className="space-y-4">
            <div>
              <h4 className="font-medium">1. Application Layer (Intent & Interaction Interface)</h4>
              <p>Captures user goals, system-level prompts, or inter-agent requests, and structures them into actionable tasks.</p>
              <ul className="list-disc pl-5 mt-1 text-sm">
                <li>Task Type – Defines goal semantics (e.g., generate, translate, verify)</li>
                <li>Prompts/Input – Structured input: user instructions or upstream output</li>
                <li>Target Agent – Specifies destination (e.g., chat.agent, vision.agent)</li>
                <li>Output Format – Expected result type (text, image, audio, JSON)</li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-medium">2. Protocol Layer (Inter-Agent Communication Format)</h4>
              <p>AIO agents communicate using an extended JSON-RPC 2.0 standard.</p>
              <ul className="list-disc pl-5 mt-1 text-sm">
                <li>Base Fields: method, params, id, result, error</li>
                <li>Extended Fields: trace_id for multi-agent call chains, namespace.method for scoped method names</li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-medium">3. Transport Layer (Message Transmission Protocols)</h4>
              <p>Defines how messages are routed between agents, executors, and orchestrators.</p>
              <ul className="list-disc pl-5 mt-1 text-sm">
                <li>Supported Channels: stdio, HTTP, SSE (Server-Sent Events)</li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-medium">4. Execution Layer (Runtime Abstraction for AI Agents)</h4>
              <p>Abstracts where and how agents run within the AIO network.</p>
              <ul className="list-disc pl-5 mt-1 text-sm">
                <li>AIO_POD – Default for dynamic, isolated tasks</li>
                <li>Wasm Modules – For ICP Canister or edge-based execution</li>
                <li>Hosted APIs – For integrating third-party AI</li>
              </ul>
            </div>

            <div>
              <h4 className="font-medium">5. Coordination Layer (Meta-AIO)</h4>
              <p>Drives multi-agent scheduling, invocation routing, and capability selection.</p>
              <ul className="list-disc pl-5 mt-1 text-sm">
                <li>Queen Agent – Constructs execution chains & resolves intent</li>
                <li>EndPoint Canister – Smart contracts storing agent metadata</li>
                <li>Arbiter Canister – Validates work records, ensures reward eligibility</li>
              </ul>
            </div>

            <div>
              <h4 className="font-medium">6. Ledger Layer (On-Chain Execution & Incentive Settlement)</h4>
              <p>Implements a distributed ledger via ICP Canisters for computation proof and token rewards.</p>
              <ul className="list-disc pl-5 mt-1 text-sm">
                <li>Logs execution history, quality scores, and staking events</li>
                <li>Distributes $AIO token rewards based on validated workload</li>
                <li>Supports future cross-chain interoperability</li>
              </ul>
            </div>
          </div>
        </Card>

        <div className="mt-8">
          <h3 className="text-2xl font-semibold mb-3">Implementation Strategy</h3>
          <p>
            The AIO-2030 reference implementation uses a combination of technologies to create a scalable, 
            secure, and performant system:
          </p>
          
          <ul className="list-disc pl-5 mt-3 space-y-2">
            <li>
              <span className="font-medium">Core Protocol Layers:</span> Implemented in TypeScript for flexibility and developer accessibility
            </li>
            <li>
              <span className="font-medium">Performance-Critical Components:</span> Rust implementations for computationally intensive operations
            </li>
            <li>
              <span className="font-medium">On-Chain Interactions:</span> Smart contracts written for the Internet Computer Protocol (ICP)
            </li>
            <li>
              <span className="font-medium">Agent Runtime:</span> Docker-based AIO-POD for isolation and deployment flexibility
            </li>
            <li>
              <span className="font-medium">Distributed Networking:</span> WebRTC and P2P communication for resilient agent coordination
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Chapter2;


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
          
          <div className="my-8 space-y-5">
            <div className="rounded-lg bg-slate-800 border border-slate-600 p-5 shadow-md">
              <h4 className="text-lg font-semibold mb-2 text-blue-300">Unified Agentic AI Interface</h4>
              <p className="text-white">A standardized protocol for capability registration, invocation, and result formatting across all agent types.</p>
            </div>
            
            <div className="rounded-lg bg-slate-800 border border-slate-600 p-5 shadow-md">
              <h4 className="text-lg font-semibold mb-2 text-blue-300">Multimodal Task Compatibility</h4>
              <p className="text-white">Native support for chat, voice, vision, and code-driven agents, enabling flexible expression of user intents across diverse input/output modalities.</p>
            </div>
            
            <div className="rounded-lg bg-slate-800 border border-slate-600 p-5 shadow-md">
              <h4 className="text-lg font-semibold mb-2 text-blue-300">Versatile MCP Server Hosting</h4>
              <p className="text-white">AIO-MCP Servers can be hosted in a variety of environments, including AIO-Pod containers, HTTP endpoints, Server-Sent Events (SSE) streams, and Wasm-based execution modules.</p>
            </div>
            
            <div className="rounded-lg bg-slate-800 border border-slate-600 p-5 shadow-md">
              <h4 className="text-lg font-semibold mb-2 text-blue-300">End-to-End AI Orchestration</h4>
              <p className="text-white">Supports intent recognition, task decomposition, MCP Server discovery, and the real-time construction of generative Think Context Chains for chain-of-thought execution.</p>
            </div>
            
            <div className="rounded-lg bg-slate-800 border border-slate-600 p-5 shadow-md">
              <h4 className="text-lg font-semibold mb-2 text-blue-300">Full Traceability & Auditing</h4>
              <p className="text-white">Each task execution is captured via a comprehensive trace log, recording the entire reasoning chain and MCP Agent participation—enabling transparency and verifiability.</p>
            </div>
            
            <div className="rounded-lg bg-slate-800 border border-slate-600 p-5 shadow-md">
              <h4 className="text-lg font-semibold mb-2 text-blue-300">Tokenized Incentive Infrastructure</h4>
              <p className="text-white">Integrated with on-chain smart contracts, the AIO Protocol features a transparent and open token incentive model, ensuring fair compensation for developers, operators, and data contributors.</p>
            </div>
          </div>
          
          <div className="my-10 flex justify-center">
            <figure className="text-center">
              <img 
                src="/lovable-uploads/7abced6a-dff2-456a-9e9c-4a2a113d989c.png" 
                alt="AIO Protocol Architecture Diagram" 
                className="max-w-full rounded-lg border border-gray-300 shadow-lg"
              />
              <figcaption className="mt-3 text-sm text-gray-600">Figure 2.1: AIO Protocol Stack Architecture</figcaption>
            </figure>
          </div>
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

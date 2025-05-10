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
            <div className="rounded-lg bg-slate-800 border border-slate-700 p-5 shadow-md">
              <h4 className="text-lg font-semibold mb-2 text-blue-300">Unified Agentic AI Interface</h4>
              <p className="text-white">A standardized protocol for capability registration, invocation, and result formatting across all agent types.</p>
            </div>
            
            <div className="rounded-lg bg-slate-800 border border-slate-700 p-5 shadow-md">
              <h4 className="text-lg font-semibold mb-2 text-blue-300">Multimodal Task Compatibility</h4>
              <p className="text-white">Native support for chat, voice, vision, and code-driven agents, enabling flexible expression of user intents across diverse input/output modalities.</p>
            </div>
            
            <div className="rounded-lg bg-slate-800 border border-slate-700 p-5 shadow-md">
              <h4 className="text-lg font-semibold mb-2 text-blue-300">Versatile MCP Server Hosting</h4>
              <p className="text-white">AIO-MCP Servers can be hosted in a variety of environments, including AIO-Pod containers, HTTP endpoints, Server-Sent Events (SSE) streams, and Wasm-based execution modules.</p>
            </div>
            
            <div className="rounded-lg bg-slate-800 border border-slate-700 p-5 shadow-md">
              <h4 className="text-lg font-semibold mb-2 text-blue-300">End-to-End AI Orchestration</h4>
              <p className="text-white">Supports intent recognition, task decomposition, MCP Server discovery, and the real-time construction of generative Think Context Chains for chain-of-thought execution.</p>
            </div>
            
            <div className="rounded-lg bg-slate-800 border border-slate-700 p-5 shadow-md">
              <h4 className="text-lg font-semibold mb-2 text-blue-300">Full Traceability & Auditing</h4>
              <p className="text-white">Each task execution is captured via a comprehensive trace log, recording the entire reasoning chain and MCP Agent participation—enabling transparency and verifiability.</p>
            </div>
            
            <div className="rounded-lg bg-slate-800 border border-slate-700 p-5 shadow-md">
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

        <Card className="p-6 shadow-md bg-slate-800 text-white border border-slate-700">
          <h3 className="text-xl font-semibold mb-4 text-blue-300">Modular Architecture Layers</h3>
          <div className="space-y-4">
            <div>
              <h4 className="font-medium text-blue-200">1. Application Layer (Intent & Interaction Interface)</h4>
              <p>Captures user goals, system-level prompts, or inter-agent requests, and structures them into actionable tasks.</p>
              <ul className="list-disc pl-5 mt-1 text-sm text-gray-300">
                <li>Task Type – Defines goal semantics (e.g., generate, translate, verify)</li>
                <li>Prompts/Input – Structured input: user instructions or upstream output</li>
                <li>Target Agent – Specifies destination (e.g., chat.agent, vision.agent)</li>
                <li>Output Format – Expected result type (text, image, audio, JSON)</li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-medium text-blue-200">2. Protocol Layer (Inter-Agent Communication Format)</h4>
              <p>AIO agents communicate using an extended JSON-RPC 2.0 standard.</p>
              <ul className="list-disc pl-5 mt-1 text-sm text-gray-300">
                <li>Base Fields: method, params, id, result, error</li>
                <li>Extended Fields: trace_id for multi-agent call chains, namespace.method for scoped method names</li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-medium text-blue-200">3. Transport Layer (Message Transmission Protocols)</h4>
              <p>Defines how messages are routed between agents, executors, and orchestrators.</p>
              <ul className="list-disc pl-5 mt-1 text-sm text-gray-300">
                <li>Supported Channels: stdio, HTTP, SSE (Server-Sent Events)</li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-medium text-blue-200">4. Execution Layer (Runtime Abstraction for AI Agents)</h4>
              <p>Abstracts where and how agents run within the AIO network.</p>
              <ul className="list-disc pl-5 mt-1 text-sm text-gray-300">
                <li>AIO_POD – Default for dynamic, isolated tasks</li>
                <li>Wasm Modules – For ICP Canister or edge-based execution</li>
                <li>Hosted APIs – For integrating third-party AI</li>
              </ul>
            </div>

            <div>
              <h4 className="font-medium text-blue-200">5. Coordination Layer (Meta-AIO)</h4>
              <p>Drives multi-agent scheduling, invocation routing, and capability selection.</p>
              <ul className="list-disc pl-5 mt-1 text-sm text-gray-300">
                <li>Queen Agent – Constructs execution chains & resolves intent</li>
                <li>EndPoint Canister – Smart contracts storing agent metadata</li>
                <li>Arbiter Canister – Validates work records, ensures reward eligibility</li>
              </ul>
            </div>

            <div>
              <h4 className="font-medium text-blue-200">6. Ledger Layer (On-Chain Execution & Incentive Settlement)</h4>
              <p>Implements a distributed ledger via ICP Canisters for computation proof and token rewards.</p>
              <ul className="list-disc pl-5 mt-1 text-sm text-gray-300">
                <li>Logs execution history, quality scores, and staking events</li>
                <li>Distributes $AIO token rewards based on validated workload</li>
                <li>Supports future cross-chain interoperability</li>
              </ul>
            </div>
          </div>
        </Card>

        {/* Smart contract registration system section */}
        <Card className="p-6 shadow-md bg-[#1A1F2C] text-white border border-[#2D3748]">
          <h3 className="text-2xl font-semibold mb-4 text-[#9b87f5]">Smart Contract Registration System</h3>
          <p className="mb-4">
            AIO-2030 introduces a contract-based registration mechanism to onboard and verify decentralized intelligence 
            providers (MCP Servers) into the AIO Network. Each participant is encapsulated in a NFT-like smart contract instance, 
            ensuring transparency, traceability, and incentive alignment.
          </p>
          
          <div className="grid md:grid-cols-2 gap-6 my-6">
            <div className="bg-[#252B3B] p-5 rounded-lg">
              <h4 className="text-lg font-semibold mb-2 text-[#D6BCFA]">NFT-Like MCP Registration Contracts</h4>
              <p className="text-gray-200">
                Each AIO-MCP Server is registered via a unique smart contract, functioning similarly to an NFT with rich 
                metadata and lifecycle management.
              </p>
            </div>
            
            <div className="bg-[#252B3B] p-5 rounded-lg">
              <h4 className="text-lg font-semibold mb-2 text-[#D6BCFA]">Standardized Metadata Schema</h4>
              <p className="text-gray-200">Each registration contract contains essential metadata, including:</p>
              <ul className="list-disc pl-5 mt-2 space-y-1 text-gray-300">
                <li>Capability Declarations</li>
                <li>Personality Descriptions</li>
                <li>Staked Token Amounts</li>
                <li>Incentive Receiving Address</li>
                <li>Service Quality Score (SQS) based on historical performance metrics</li>
              </ul>
            </div>
            
            <div className="bg-[#252B3B] p-5 rounded-lg">
              <h4 className="text-lg font-semibold mb-2 text-[#D6BCFA]">Capability Declaration via Help Protocol</h4>
              <p className="text-gray-200">
                MCP Servers must implement the AIO-MCP-help protocol to declare their capabilities in a machine-readable format, 
                enabling Queen Agent to verify functionality and context.
              </p>
            </div>
            
            <div className="bg-[#252B3B] p-5 rounded-lg">
              <h4 className="text-lg font-semibold mb-2 text-[#D6BCFA]">On-Chain Verification & Submission</h4>
              <p className="text-gray-200">
                The Queen Agent evaluates the response from the help protocol and, upon successful verification, submits 
                the MCP registration contract to the blockchain for inclusion in the network.
              </p>
            </div>
          </div>
          
          <div className="bg-[#252B3B] p-5 rounded-lg">
            <h4 className="text-lg font-semibold mb-2 text-[#D6BCFA]">Decentralized Indexing for Intelligent Discovery</h4>
            <p className="text-gray-200">
              Using both developer-declared metadata and verified help protocol results, the Queen Agent performs reasoning to 
              generate a keyword–group–mcp–mcpMethod inverted index, which is then submitted and stored on-chain via an 
              ICP Canister for high-performance discovery and scheduling.
            </p>
          </div>
          
          <div className="flex justify-between mt-8">
            <div className="flex-1 border-r border-gray-700 pr-6">
              <h5 className="font-semibold text-[#1EAEDB] mb-3">MCP Server Template Selection</h5>
              <p className="text-gray-300 mb-3">Select from pre-configured templates for different MCP module types:</p>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-opacity-20 bg-blue-900 p-3 rounded border border-blue-700">
                  <h6 className="text-[#33C3F0] font-medium">Math Tools Server</h6>
                  <p className="text-sm text-gray-400">Provides mathematical utility functions</p>
                  <span className="inline-block bg-yellow-200 text-yellow-800 text-xs px-2 py-1 rounded mt-2">Tools</span>
                </div>
                <div className="bg-opacity-20 bg-purple-900 p-3 rounded border border-purple-700">
                  <h6 className="text-[#D6BCFA] font-medium">LLM Sampling Server</h6>
                  <p className="text-sm text-gray-400">Handles text generation capabilities</p>
                  <div className="flex gap-1 mt-2">
                    <span className="inline-block bg-purple-200 text-purple-800 text-xs px-2 py-1 rounded">Prompts</span>
                    <span className="inline-block bg-green-200 text-green-800 text-xs px-2 py-1 rounded">Sampling</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex-1 pl-6">
              <h5 className="font-semibold text-[#1EAEDB] mb-3">Protocol Configuration</h5>
              <p className="text-gray-300 mb-3">MCP servers implement the AIO-MCP protocol with modular capabilities:</p>
              <div className="bg-[#181C27] p-3 rounded border border-gray-700 text-sm font-mono">
                <div className="text-gray-300">
                  <span className="text-blue-400">"type":</span> <span className="text-green-400">"mcp"</span>,
                </div>
                <div className="text-gray-300">
                  <span className="text-blue-400">"methods":</span> [<span className="text-green-400">"tools.list"</span>, <span className="text-green-400">"tools.call"</span>],
                </div>
                <div className="text-gray-300">
                  <span className="text-blue-400">"modalities":</span> [<span className="text-green-400">"text"</span>]
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* New Queen Agent Platform section */}
        <Card className="p-6 shadow-md bg-[#1A1F2C] text-white border border-[#2D3748]">
          <h3 className="text-2xl font-semibold mb-4 text-[#9b87f5]">Queen Agent Platform</h3>
          <p className="mb-4">
            The Queen Agent is the central orchestrator within the AIO-2030 architecture, functioning as a superintelligent
            coordination layer that binds user intent with distributed AI capabilities. It encapsulates cognition, reasoning, 
            discovery, execution, and incentive coordination. The Queen Agent transforms task requests into structured 
            execution workflows by leveraging both symbolic and generative reasoning.
          </p>
          
          <div className="grid gap-6 my-6">
            <div className="bg-[#252B3B] p-5 rounded-lg">
              <h4 className="text-lg font-semibold mb-2 text-[#D6BCFA]">3.1 Entry Point for AIO Protocol Tasks</h4>
              <p className="text-gray-200 mb-2">
                The Queen Agent serves as the primary ingress point for all tasks submitted via the AIO Protocol. 
                Each task is wrapped in a structured request that includes:
              </p>
              <ul className="list-disc pl-5 mt-2 space-y-1 text-gray-300">
                <li>User intent and contextual metadata</li>
                <li>Input modalities (e.g., text, voice, vision)</li>
                <li>Execution constraints and performance expectations</li>
              </ul>
              <p className="text-gray-200 mt-2">
                Upon receiving a task, the Queen Agent instantiates an AIO-Context Instance—a dynamic, 
                session-scoped context that drives intent resolution and downstream agent coordination.
              </p>
            </div>
            
            <div className="bg-[#252B3B] p-5 rounded-lg">
              <h4 className="text-lg font-semibold mb-2 text-[#D6BCFA]">3.2 Cognitive Scheduling & Chain Construction</h4>
              <p className="text-gray-200 mb-2">Queen Agent constructs dynamic invocation chains by:</p>
              <ul className="list-disc pl-5 mt-2 space-y-1 text-gray-300">
                <li>Parsing and interpreting user intent through Think Context Chains</li>
                <li>Discovering relevant AIO-MCP Servers and AI Agents via on-chain keyword-group–MCP–method inverted indexes</li>
                <li>Evaluating candidate agents based on declared capabilities, historical service quality, stake weight, and recent workload</li>
                <li>Assembling agents into an execution graph (linear or DAG), optimized for performance, cost-efficiency, and capability match</li>
              </ul>
              <p className="text-gray-200 mt-2">
                These invocation chains serve as the reasoning scaffolding for multi-agent execution, 
                enabling modular composition of AI services in real time.
              </p>
            </div>
          </div>
          
          <div className="flex justify-center my-6">
            <figure className="text-center">
              <img 
                src="/lovable-uploads/0d36187e-ae24-42f7-99fc-d306f8acd643.png" 
                alt="Queen Agent Execution Plan" 
                className="max-w-full rounded-lg border border-gray-600 shadow-lg"
              />
              <figcaption className="mt-2 text-sm text-gray-400">Figure 2.3: Queen Agent Execution Plan Interface</figcaption>
            </figure>
          </div>
          
          <div className="grid md:grid-cols-2 gap-6 my-6">
            <div className="bg-[#252B3B] p-5 rounded-lg">
              <h4 className="text-lg font-semibold mb-2 text-[#D6BCFA]">3.3 Multi-Agent Lifecycle Management</h4>
              <p className="text-gray-200 mb-2">
                The Queen Agent supervises the entire lifecycle of each multi-agent task, including:
              </p>
              <ul className="list-disc pl-5 mt-2 space-y-1 text-gray-300">
                <li>Task decomposition into atomic subtasks</li>
                <li>Prompt schema resolution and input transformation</li>
                <li>Capability dispatch to selected agents or tools</li>
                <li>Result aggregation, feedback loops, and intermediate reasoning</li>
                <li>Output packaging for downstream consumption</li>
              </ul>
              <p className="text-gray-200 mt-2">
                Execution metadata—including task step logs, latencies, failure traces, and outputs—is captured 
                in a traceable task record and linked to the original trace_id and session_id.
              </p>
            </div>
            
            <div className="bg-[#252B3B] p-5 rounded-lg">
              <h4 className="text-lg font-semibold mb-2 text-[#D6BCFA]">3.4 Workload Reporting & Token Metering</h4>
              <p className="text-gray-200 mb-2">
                Upon task completion, the Queen Agent compiles a workload report containing:
              </p>
              <ul className="list-disc pl-5 mt-2 space-y-1 text-gray-300">
                <li>Invocation chain topology</li>
                <li>Participation records of each agent</li>
                <li>Execution time, success metrics, and quality ratings</li>
              </ul>
              <p className="text-gray-200 mt-2">
                This report is submitted to the Arbiter, a ICP Canister-based system responsible for:
              </p>
              <ul className="list-disc pl-5 mt-2 space-y-1 text-gray-300">
                <li>Verifying the validity and completeness of the execution</li>
                <li>Token metering based on participation, quality, and stake</li>
                <li>Distributing $AIO incentives to eligible developers and operators</li>
              </ul>
            </div>
          </div>
          
          <div className="bg-[#252B3B] p-5 rounded-lg">
            <h4 className="text-lg font-semibold mb-2 text-[#D6BCFA]">3.5 Session Awareness & Conversational Memory</h4>
            <p className="text-gray-200 mb-2">Each user task is bound to an AIO Session, enabling:</p>
            <ul className="list-disc pl-5 mt-2 space-y-1 text-gray-300">
              <li>Multi-turn context awareness</li>
              <li>Long-range memory linking prior invocations and responses</li>
              <li>Personalization of agent selection based on prior interaction history</li>
            </ul>
            <p className="text-gray-200 mt-2">
              This enables conversational agentic AI, where the Queen Agent can evolve its reasoning pathways 
              and agent selection heuristics over time, creating persistent and intelligent user experiences.
            </p>
          </div>
          
          <div className="flex justify-center mt-6 mb-4">
            <figure className="text-center">
              <img 
                src="/lovable-uploads/0f74ab47-36da-47d9-bc01-cba0869a1b15.png" 
                alt="Queen Agent Conversation Interface" 
                className="max-w-full rounded-lg border border-gray-600 shadow-lg"
              />
              <figcaption className="mt-2 text-sm text-gray-400">Figure 2.4: Queen Agent Conversational Interface</figcaption>
            </figure>
          </div>
        </Card>

        {/* New Intent Recognition & Task-Driven Reasoning section */}
        <Card className="p-6 shadow-md bg-[#1A1F2C] text-white border border-[#2D3748]">
          <h3 className="text-2xl font-semibold mb-4 text-[#9b87f5]">Intent Recognition & Task-Driven Reasoning</h3>
          <p className="mb-4">
            AIO-2030 introduces a generative, intent-driven reasoning model as the cognitive engine behind agentic task execution. 
            Unlike traditional static AI services, the Queen Agent and the broader AIO Network evolve dynamically—not through 
            versioned model updates, but through compositional intelligence expansion as new capabilities and MCPs are added on-chain.
          </p>
          
          <div className="grid gap-6 my-6">
            <div className="bg-[#252B3B] p-5 rounded-lg">
              <h4 className="text-lg font-semibold mb-2 text-[#D6BCFA]">4.1 Generative Thought-Chain Execution</h4>
              <p className="text-gray-200 mb-2">
                Every task begins with natural language intent, parsed and interpreted by the Queen Agent into a multi-step 
                reasoning process known as a Think Context Chain. These reasoning chains:
              </p>
              <ul className="list-disc pl-5 mt-2 space-y-1 text-gray-300">
                <li>Are dynamically constructed per session</li>
                <li>Reflect multi-modal inputs and real-time agent availability</li>
                <li>Leverage generative prompting to coordinate downstream AI responses</li>
              </ul>
              <p className="text-gray-200 mt-2">
                As the ecosystem grows, the network's collective intelligence increases—not by retraining, but by dynamically 
                composing more specialized, verified capabilities on demand.
              </p>
            </div>
            
            <div className="bg-[#252B3B] p-5 rounded-lg">
              <h4 className="text-lg font-semibold mb-2 text-[#D6BCFA]">4.2 Full On-Chain Cognitive Growth</h4>
              <ul className="list-disc pl-5 mt-2 space-y-1 text-gray-300">
                <li>
                  The Queen AI, in conjunction with a fully on-chain AIO-MCP Network, leverages Internet Computer Protocol (ICP) 
                  to host, verify, and invoke distributed intelligence.
                </li>
                <li>
                  As new MCP Servers are registered and verified on-chain, the capability pool expands, enabling the system to 
                  learn and grow at the protocol level.
                </li>
                <li>
                  The Queen Agent's cognitive graph is thus self-reinforcing, allowing for scalable general intelligence to 
                  emerge through decentralized composition.
                </li>
              </ul>
            </div>
            
            <div className="bg-[#252B3B] p-5 rounded-lg">
              <h4 className="text-lg font-semibold mb-2 text-[#D6BCFA]">4.3 Multi-Round Conversational Refinement</h4>
              <ul className="list-disc pl-5 mt-2 space-y-1 text-gray-300">
                <li>
                  Intent correction and refinement is enabled through multi-turn conversation and contextual memory.
                </li>
                <li>
                  The system incrementally improves intent resolution accuracy and capability recall rate by leveraging feedback 
                  from past interactions.
                </li>
                <li>
                  Over time, Queen Agent develops semantic priors based on task type, user profile, and interaction history—boosting 
                  relevance and minimizing hallucination.
                </li>
              </ul>
            </div>
          </div>
          
          <div className="flex justify-center flex-col items-center space-y-8 mt-6">
            <figure className="text-center">
              <img 
                src="/lovable-uploads/c08649b1-57f8-46b5-aa09-2b2605ecf8e6.png" 
                alt="Dialog Content Interface" 
                className="max-w-full rounded-lg border border-gray-600 shadow-lg"
              />
              <figcaption className="mt-2 text-sm text-gray-400">Figure 2.5: Dialog Content Interface with Response, Intent Analysis, and Execution Plan</figcaption>
            </figure>
            
            <figure className="text-center">
              <img 
                src="/lovable-uploads/df790484-8580-4d27-b0ae-95d829a61d2b.png" 
                alt="Conversational Intent Analysis" 
                className="max-w-full rounded-lg border border-gray-600 shadow-lg"
              />
              <figcaption className="mt-2 text-sm text-gray-400">Figure 2.6: Conversational Intent Analysis with Action Controls</figcaption>
            </figure>
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

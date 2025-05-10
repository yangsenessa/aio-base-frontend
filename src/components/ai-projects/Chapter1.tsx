
import React from 'react';
import { Card } from "../../components/ui/card";

const Chapter1 = () => {
  return (
    <div className="chapter">
      <h2 className="text-3xl font-bold mb-6 border-b pb-2">Chapter 1: Introducing Protocol Analysis for Web3 AIOps</h2>
      
      <div className="space-y-6">
        <div className="mb-6">
          <h3 className="text-2xl font-semibold mb-3">Vision & Core Concepts</h3>
          <p className="mb-4">
            AIO-2030 (Super AI Decentralized Network) aims to fundamentally reconstruct the AI ecosystem and interaction paradigm. 
            By leveraging decentralized networks and blockchain technology, AIO-2030 introduces the De-Super Agentic AI Network, 
            a contract-based agent registration framework, on-chain task traceability, and incentive mechanisms—ultimately 
            building an open, trustworthy, and composable AI Agent collaboration network.
          </p>
          <p className="mb-4">
            At the core of AIO-2030 lies the belief that agentic AI reasoning is driven by a Queen Agent, which orchestrates 
            cognitive processes via large language models (LLMs). Human contributors participate by providing generalized AIO-MCPs 
            (Model Capability Protocols) and assist the reasoning chain through structured inputs under the AIO Protocol.
          </p>
        </div>

        <Card className="p-6 shadow-md">
          <h3 className="text-xl font-semibold mb-4">Key Protocol Features</h3>
          <ul className="list-disc pl-5 space-y-2">
            <li>JSON-RPC based communication standard with trace-id mechanism for cross-agent coordination</li>
            <li>Support for diverse modalities (text, images, audio) and multi-modal task compatibility</li>
            <li>MCP-compatible for integration with existing systems through standardized interfaces</li>
            <li>Chain-aware primitives for on-chain operations and task traceability</li>
            <li>NFT-like smart contract framework for agent registration and verification</li>
            <li>Tokenized incentive infrastructure for fair compensation across the network</li>
          </ul>
        </Card>

        <div className="mt-6">
          <h3 className="text-2xl font-semibold mb-3">Toward Unbounded Super AI</h3>
          <p>
            The ultimate vision of Web3 + AI is to build a free and unbounded Super AI through cryptographic trust, 
            decentralized infrastructure, and collective intelligence. By aggregating decentralized AIO MCP Server nodes 
            through consensus-driven coordination, the AIO-2030 Agentic AI Network is poised to become a foundational 
            architecture capable of hosting and evolving toward Superintelligence.
          </p>
          <p className="mt-3">
            AIO-2030 establishes a unified AIO Protocol that leverages blockchain-native smart contracts to enable 
            seamless interoperability between AI Agents and MCP Servers. This framework transforms the AI ecosystem 
            from isolated intelligence to collective cognition and knowledge.
          </p>
          
          <div className="my-6 flex justify-center">
            <img 
              src="/lovable-uploads/01387ace-1f59-4ae4-809c-2ef1ff8931fb.png" 
              alt="AIO-2030 Queen Agent Network" 
              className="max-w-full rounded-lg shadow-lg"
            />
          </div>
        </div>

        <div className="bg-blue-50 p-5 rounded-lg mt-6">
          <h3 className="text-xl font-semibold mb-3">Core Benefits</h3>
          <ul className="list-disc pl-5 space-y-1">
            <li>Developers retain ownership of their digital assets and models</li>
            <li>Invocation records and workload contributions are transparently logged on a distributed ledger</li>
            <li>User data benefits from on-chain provenance and privacy-preserving controls</li>
            <li>Tokenized incentive system fosters a transparent, automated, and self-sustaining AI ecosystem</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Chapter1;

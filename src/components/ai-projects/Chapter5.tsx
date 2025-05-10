
import React from 'react';
import { Card } from "../../components/ui/card";

const Chapter5 = () => {
  return (
    <div className="chapter">
      <h2 className="text-3xl font-bold mb-6 border-b pb-2">Chapter 5: Queen Agent & Intent-Driven Reasoning</h2>
      
      <div className="space-y-6">
        <div className="mb-6">
          <h3 className="text-2xl font-semibold mb-3">Queen Agent Platform</h3>
          <p>
            The Queen Agent is the central orchestrator within the AIO-2030 architecture, functioning as a 
            superintelligent coordination layer that binds user intent with distributed AI capabilities. It encapsulates 
            cognition, reasoning, discovery, execution, and incentive coordination.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="p-5 bg-white">
            <h4 className="font-semibold mb-3">Entry Point for AIO Protocol Tasks</h4>
            <p className="mb-2">The Queen Agent serves as the primary ingress point for all tasks, wrapping each in a structured request that includes:</p>
            <ul className="list-disc pl-5 text-sm">
              <li>User intent and contextual metadata</li>
              <li>Input modalities (text, voice, vision)</li>
              <li>Execution constraints and expectations</li>
              <li>AIO-Context Instance creation for session management</li>
            </ul>
          </Card>

          <Card className="p-5 bg-white">
            <h4 className="font-semibold mb-3">Cognitive Scheduling</h4>
            <p className="mb-2">Queen Agent constructs dynamic invocation chains by:</p>
            <ul className="list-disc pl-5 text-sm">
              <li>Parsing user intent through Think Context Chains</li>
              <li>Discovering relevant AIO-MCP Servers via on-chain indexes</li>
              <li>Evaluating agents based on capabilities and performance</li>
              <li>Assembling optimized execution graphs</li>
            </ul>
          </Card>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
          <Card className="p-5 bg-white">
            <h4 className="font-semibold mb-3">Multi-Agent Lifecycle Management</h4>
            <p className="mb-2">The Queen Agent supervises the entire lifecycle of each task:</p>
            <ul className="list-disc pl-5 text-sm">
              <li>Task decomposition into atomic subtasks</li>
              <li>Prompt schema resolution and input transformation</li>
              <li>Capability dispatch to selected agents</li>
              <li>Result aggregation and feedback loops</li>
              <li>Traceable task records linked to trace_id and session_id</li>
            </ul>
          </Card>

          <Card className="p-5 bg-white">
            <h4 className="font-semibold mb-3">Workload Reporting & Token Metering</h4>
            <p className="mb-2">Upon task completion, the Queen Agent compiles reports containing:</p>
            <ul className="list-disc pl-5 text-sm">
              <li>Invocation chain topology</li>
              <li>Participation records of each agent</li>
              <li>Execution metrics and quality ratings</li>
              <li>Submission to the Arbiter for verification and rewards</li>
            </ul>
          </Card>
        </div>

        <div className="mt-8">
          <h3 className="text-2xl font-semibold mb-4">Intent Recognition & Task-Driven Reasoning</h3>
          
          <p className="mb-4">
            AIO-2030 introduces a generative, intent-driven reasoning model as the cognitive engine behind agentic 
            task execution. The system evolves dynamically through compositional intelligence expansion rather than 
            traditional versioned model updates.
          </p>
          
          <div className="bg-neutral-50 p-6 rounded-lg">
            <h4 className="font-semibold mb-3">Generative Thought-Chain Execution</h4>
            <p>
              Every task begins with natural language intent, parsed into a multi-step reasoning process known as a Think Context Chain. These reasoning chains:
            </p>
            <ul className="list-disc pl-5 mt-2 space-y-1">
              <li>Are dynamically constructed per session</li>
              <li>Reflect multi-modal inputs and agent availability</li>
              <li>Leverage generative prompting for coordination</li>
              <li>Increase collective intelligence through composition</li>
            </ul>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
            <div className="bg-white p-5 rounded shadow-sm">
              <h4 className="font-semibold mb-3">Full On-Chain Cognitive Growth</h4>
              <ul className="list-disc pl-5 text-sm space-y-1">
                <li>Queen AI leverages ICP to host and invoke distributed intelligence</li>
                <li>Capability pool expands as new MCP Servers are verified</li>
                <li>System learns at the protocol level without retraining</li>
                <li>Self-reinforcing cognitive graph enables scalable intelligence</li>
              </ul>
            </div>
            
            <div className="bg-white p-5 rounded shadow-sm">
              <h4 className="font-semibold mb-3">Multi-Round Conversational Refinement</h4>
              <ul className="list-disc pl-5 text-sm space-y-1">
                <li>Intent correction through multi-turn conversation</li>
                <li>Incremental improvement in resolution accuracy</li>
                <li>Development of semantic priors based on interaction history</li>
                <li>Enhanced relevance and reduced hallucination over time</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="mt-8">
          <h3 className="text-2xl font-semibold mb-3">Modality-Aware Processing</h3>
          
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h4 className="font-semibold mb-3">Example: Multimodal Task Processing</h4>
            
            <p className="mb-2">The system identifies input and output modalities to construct the correct processing pipeline:</p>
            
            <div className="font-mono bg-neutral-50 p-3 rounded text-sm mb-3">
              "modalities": ["text", "image"],<br/>
              "transformations": [<br/>
              &nbsp;&nbsp;"extract_text",<br/>
              &nbsp;&nbsp;"convert_text_to_image",<br/>
              &nbsp;&nbsp;"generate_image_collection"<br/>
              ]
            </div>
            
            <p className="mb-3">This informs the Queen Agent to:</p>
            <ul className="list-disc pl-5 text-sm">
              <li>Bind OCR capabilities to text extraction</li>
              <li>Invoke generative models for text-to-image translation</li>
              <li>Assemble outputs into multi-image packaging workflows</li>
            </ul>
            <p className="text-sm mt-2">
              This multimodal transformation is not hard-coded but reasoned dynamically,
              ensuring agent flexibility and extensibility.
            </p>
          </div>
        </div>

        <div className="mt-6">
          <p className="italic text-sm text-gray-600 mt-4">
            Through structured intent parsing, goal decomposition, and modality mapping, the AIO-2030 system 
            translates abstract user intent into a verifiable, multi-agent execution graph, enabling no-code 
            orchestration, transparent workload attribution, and scalable intelligence assembly.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Chapter5;

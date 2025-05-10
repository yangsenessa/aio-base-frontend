
import React from 'react';
import { Card } from "../../components/ui/card";

const Chapter6 = () => {
  return (
    <div className="chapter">
      <h2 className="text-3xl font-bold mb-6 border-b pb-2">Chapter 6: Roadmap & Ecosystem Comparison</h2>
      
      <div className="space-y-6">
        <div className="mb-6">
          <h3 className="text-2xl font-semibold mb-3">Milestone Plan | AIO-2030 Roadmap</h3>
          <p>
            The AIO Protocol represents an evolving framework with a clear development roadmap across multiple quarters.
            Each phase builds upon previous achievements to create a comprehensive, decentralized agent ecosystem.
          </p>
        </div>

        <div className="space-y-6">
          <Card className="p-6 shadow-md">
            <h4 className="text-lg font-semibold text-blue-700 mb-2">Q1 | AIO-2030 Platform Foundation & Core Contract Implementation</h4>
            <p className="text-sm text-gray-500 mb-3">March 17, 2025 – June 14, 2025</p>
            
            <p className="mb-3 italic">
              "The first step in the AIO Protocol's rollout, focusing on building the foundational infrastructure for the agent autonomous network."
            </p>
            
            <div>
              <h5 className="font-medium mb-1">Targets & Products:</h5>
              <ul className="list-disc pl-5 text-sm space-y-1">
                <li>Complete EndPoint Canister Contract for agent registration and staking</li>
                <li>Build the Queen Agent Prototype for task parsing and trace_id chains</li>
                <li>Design the Arbiter Interface and task record model</li>
                <li>Launch AIO-2030 Dev Portal with documentation and testing interfaces</li>
                <li>Release AIO-2030 Whitepaper V1 detailing protocol specifications</li>
              </ul>
            </div>
          </Card>

          <Card className="p-6 shadow-md">
            <h4 className="text-lg font-semibold text-blue-700 mb-2">Q2 | Full AIO Protocol Launch & Economic Model Kickoff</h4>
            <p className="text-sm text-gray-500 mb-3">June 15, 2025 – September 12, 2025</p>
            
            <p className="mb-3 italic">
              "Release the standardized AIO Protocol v1 and corresponding product implementation alongside the token economic model."
            </p>
            
            <div>
              <h5 className="font-medium mb-1">Targets & Products:</h5>
              <ul className="list-disc pl-5 text-sm space-y-1">
                <li>Launch AIO Protocol v1.0 with task types and trace_id tracking</li>
                <li>Complete $AIO Economic Model with staking rules and SNS mechanisms</li>
                <li>Implement Arbiter Canister v1 for incentive tracking</li>
                <li>Initiate AIO Genesis Grant program for developers</li>
                <li>Establish MCP/LLM Service Provider integration options</li>
              </ul>
            </div>
          </Card>

          <Card className="p-6 shadow-md">
            <h4 className="text-lg font-semibold text-blue-700 mb-2">Q3 | Queen AI: Full Agent Ecosystem Launch</h4>
            <p className="text-sm text-gray-500 mb-3">September 13, 2025 – December 11, 2025</p>
            
            <p className="mb-3 italic">
              "Upgrade Queen Agent to serve as the central AI orchestrator, enabling automated agent onboarding and collaboration."
            </p>
            
            <div>
              <h5 className="font-medium mb-1">Targets & Products:</h5>
              <ul className="list-disc pl-5 text-sm space-y-1">
                <li>Release Queen Agent v2.0 with full orchestration capabilities</li>
                <li>Enable Agent Auto-Registration Interface via JSON-RPC</li>
                <li>Develop Capability Classification & Time-Tracking System</li>
                <li>Launch AIO Agent Integration Model and Container SDK</li>
                <li>Start AIO-DAO Governance Version 1 for community participation</li>
              </ul>
            </div>
          </Card>

          <Card className="p-6 shadow-md">
            <h4 className="text-lg font-semibold text-blue-700 mb-2">Q4 | Ecosystem Expansion & Commercial Application Launch</h4>
            <p className="text-sm text-gray-500 mb-3">December 12, 2025 – March 2026</p>
            
            <p className="mb-3 italic">
              "Build a neutral community network and attract external AI platforms to integrate with the AIO ecosystem."
            </p>
            
            <div>
              <h5 className="font-medium mb-1">Targets & Products:</h5>
              <ul className="list-disc pl-5 text-sm space-y-1">
                <li>Open integrations with platforms like Doubao, Coze, POE, and others</li>
                <li>Release AIO Webhook SDK for rapid SaaS/Agent API registration</li>
                <li>Launch AIO Nebula Market System for agent search and collaboration</li>
                <li>Establish AIO Service Provider Generative Registry for quick onboarding</li>
                <li>Release complete AIO-DAO Governance Framework with voting models</li>
              </ul>
            </div>
          </Card>
        </div>

        <div className="mt-10">
          <h3 className="text-2xl font-semibold mb-4">Ecosystem Comparison: AIO vs Mainstream Agent Platforms</h3>
          
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white border border-gray-200 text-sm">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border p-2">Dimension</th>
                  <th className="border p-2">AIO-2030</th>
                  <th className="border p-2">Other Platforms</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="border p-2 font-medium">Positioning</td>
                  <td className="border p-2">Decentralized agent protocol + incentive economy</td>
                  <td className="border p-2">Primarily SaaS-style tools or closed ecosystems</td>
                </tr>
                <tr>
                  <td className="border p-2 font-medium">Multi-agent Collaboration</td>
                  <td className="border p-2">✅ Fully supported via Queen Agent & traceable task chains</td>
                  <td className="border p-2">⚠️ Limited or not supported by most platforms</td>
                </tr>
                <tr>
                  <td className="border p-2 font-medium">Open-source / Self-hosting</td>
                  <td className="border p-2">✅ Docker/KVM/API-supported deployments</td>
                  <td className="border p-2">❌ Mostly closed SaaS offerings</td>
                </tr>
                <tr>
                  <td className="border p-2 font-medium">Protocol Standardization</td>
                  <td className="border p-2">✅ JSON-RPC + AIO extension</td>
                  <td className="border p-2">❌ Custom functions or internal message models</td>
                </tr>
                <tr>
                  <td className="border p-2 font-medium">Runtime Abstraction</td>
                  <td className="border p-2">✅ Docker / Wasm / Remote API flexibility</td>
                  <td className="border p-2">❌ Mostly server-based SaaS only</td>
                </tr>
                <tr>
                  <td className="border p-2 font-medium">On-chain Traceability</td>
                  <td className="border p-2">✅ Full task history and incentives on ICP</td>
                  <td className="border p-2">❌ Generally non-existent</td>
                </tr>
                <tr>
                  <td className="border p-2 font-medium">Token Incentive Model</td>
                  <td className="border p-2">✅ Comprehensive $AIO staking and reward system</td>
                  <td className="border p-2">❌ Typically subscription-based with no tokens</td>
                </tr>
                <tr>
                  <td className="border p-2 font-medium">External AI Interoperability</td>
                  <td className="border p-2">✅ Any registered agent via Queen Agent</td>
                  <td className="border p-2">⚠️ Usually limited to platform-specific options</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <div className="mt-8">
          <h3 className="text-2xl font-semibold mb-4">Future Research Directions</h3>
          
          <div className="space-y-4">
            <div>
              <h4 className="font-medium">1. Zero-Knowledge Proofs for Agent Verification</h4>
              <p className="text-sm">
                Implementing zk-proofs to verify agent computations without revealing sensitive data or proprietary algorithms
              </p>
            </div>
            
            <div>
              <h4 className="font-medium">2. Cross-Chain Interoperability</h4>
              <p className="text-sm">
                Extending the protocol to enable seamless agent operations across multiple blockchain networks
              </p>
            </div>
            
            <div>
              <h4 className="font-medium">3. Advanced Cryptoeconomic Mechanisms</h4>
              <p className="text-sm">
                Research into novel token models that can better align incentives in complex multi-agent systems
              </p>
            </div>
            
            <div>
              <h4 className="font-medium">4. Decentralized Computational Markets</h4>
              <p className="text-sm">
                Creating efficient markets for AI computation with provable fairness and transparency
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Chapter6;

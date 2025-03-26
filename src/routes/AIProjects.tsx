import { ExternalLink, Star, GitFork, Users, Zap, Link2 } from 'lucide-react';
import { cn } from '@/lib/utils';
const AIProjects = () => {
  return <div className="space-y-8">
      <section className="space-y-4 mb-8">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent"> AIO-MCP Protocol Technical Whitepaper </h1>
        <p className="text-muted-foreground max-w-3xl">
          A Decentralized AI Agent Network Based on Smart Contracts
        </p>
      </section>

      <div className="space-y-10">
        {/* Background Section */}
        <section className="web3-card p-6 space-y-4">
          
          <p className="text-muted-foreground">
            Artificial Intelligence (AI) technology is advancing at an accelerated pace. The development and deployment of AI Agents based on large AI models (LLM) have reached a stage of industrial maturity. Before the emergence of Artificial Superintelligence (ASI), we are about to enter an era where multiple AI agents coexist. However, current AI Agents face many limitations in real-world applications, which hinder the full realization of their capabilities.
          </p>
          
          <div className="mt-6">
            <h3 className="text-xl font-medium mb-3">1.1 Existing Issues</h3>
            <div className="space-y-4">
              <div>
                <h4 className="font-semibold mb-1">1. Closed Ecosystem of Legacy Applications</h4>
                <p className="text-muted-foreground">
                  Most traditional applications (including internet applications) lack open standards, which prevents AI Agents from collaborating efficiently. For example:
                </p>
                <ul className="list-disc pl-8 mt-2 text-muted-foreground space-y-1">
                  <li>AI Agents within office suites can only run within their host applications and cannot call on external agents for collaboration.</li>
                  <li>There is a lack of interoperability between AI Agents; for instance, a Music AI Agent that generates music cannot automatically insert its output into a PowerPoint AI Agent.</li>
                  <li>Poor API compatibility forces developers to adapt separately for different platforms.</li>
                </ul>
              </div>

              <div>
                <h4 className="font-semibold mb-1">2. Limitations in AI Agent Economic Models</h4>
                <p className="text-muted-foreground">
                  Currently, there are mainly two business models for AI Agents:
                </p>
                <ul className="list-disc pl-8 mt-2 text-muted-foreground space-y-1">
                  <li><strong>Closed Ecosystems:</strong> For example, GitHub Copilot and Office AI Agents operate only within their internal environments and cannot collaborate with external AI Agents, resulting in complex tasks that still require manual intervention.</li>
                  <li><strong>Subscription Dilemma:</strong> Some specialized AI Agents (such as Music AI Agents) cannot attract enough subscribers, while enterprise-level AI Agents lack economic incentive mechanisms, preventing the formation of a healthy ecosystem.</li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* AIO-2030 Solution */}
        <section className="web3-card p-6 space-y-4">
          <h2 className="text-2xl font-semibold">2. AIO-2030 Solution</h2>
          <p className="text-muted-foreground">
            AIO-2030 builds an open AI Agent ecosystem through a decentralized smart contract architecture, providing:
          </p>
          <ul className="list-disc pl-8 text-muted-foreground space-y-1">
            <li>A standardized AIO protocol that enables free interaction and combination among AI Agents.</li>
            <li>An economic incentive mechanism that allocates token rewards based on computational contributions and task quality.</li>
            <li>A decentralized identity and reputation system to ensure that AI Agents are trustworthy, transparent, and traceable.</li>
          </ul>

          <div className="mt-6">
            <h3 className="text-xl font-medium mb-3">2.1 Core Architecture</h3>
            <p className="text-muted-foreground">
              AIO-2030 is based on the ICP (Internet Computer Protocol) public chain and utilizes Canister smart contracts to implement:
            </p>
            <ul className="list-disc pl-8 mt-2 text-muted-foreground space-y-1">
              <li><strong>EndPoint Canister:</strong> For AI Agent registration, staking, and reputation management.</li>
              <li><strong>Queen Agent:</strong> For task scheduling, AI Agent discovery, and reputation scoring.</li>
              <li><strong>Arbiter Canister:</strong> For recording task execution, token settlement, and incentive distribution.</li>
              <li><strong>AIO Economic Contract:</strong> For managing $AIO staking and SNS governance.</li>
            </ul>
          </div>
        </section>

        {/* AIO-2030 Protocol & Contract Design */}
        <section className="web3-card p-6 space-y-4">
          <h2 className="text-2xl font-semibold">3. AIO-2030 Protocol & Contract Design</h2>
          
          <div>
            <h3 className="text-xl font-medium mb-3">3.1 AIO JSON-RPC Protocol</h3>
            <p className="text-muted-foreground">
              AIO-2030 adopts JSON-RPC 2.0 as the standard for AI Agent interaction, supporting:
            </p>
            <ul className="list-disc pl-8 mt-2 text-muted-foreground space-y-1">
              <li>Standard input/output (stdio)</li>
              <li>Server-Sent Events (SSE)</li>
              <li>Task types: generation, verification, testing, abstraction, and invocation</li>
              <li>Target objects: chat_agent, image_model, inference engine</li>
              <li>Result types: text, image, audio, video, aio_command</li>
            </ul>
          </div>

          <div className="mt-6">
            <h4 className="font-semibold mb-2">Example Request:</h4>
            <div className="bg-secondary/60 p-4 rounded-md overflow-x-auto">
              <pre className="text-sm text-muted-foreground">{`
{
  "jsonrpc": "2.0",
  "id": "task-001",
  "method": "aio.task",
  "params": {
    "task_type": "invocation",
    "target": "music_ai",
    "input": {
      "prompts": ["Generate 30 seconds of light music"],
      "context": "Suitable as background music"
    },
    "output_type": "audio"
  }
}`}</pre>
            </div>
          </div>
        </section>

        {/* AI Agent Economic Model */}
        <section className="web3-card p-6 space-y-4">
          <h2 className="text-2xl font-semibold">4. AI Agent Economic Model</h2>
          
          <div>
            <h3 className="text-xl font-medium mb-3">4.1 $AIO Token</h3>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr>
                    <th className="border border-border/40 bg-secondary/30 p-2 text-left">Parameter</th>
                    <th className="border border-border/40 bg-secondary/30 p-2 text-left">Value</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="border border-border/40 p-2">Total Supply</td>
                    <td className="border border-border/40 p-2">21,000,000,000,000,000 ($AIO, Decimal 8)</td>
                  </tr>
                  <tr>
                    <td className="border border-border/40 p-2">Initial Circulation</td>
                    <td className="border border-border/40 p-2">Released according to SNS rules</td>
                  </tr>
                  <tr>
                    <td className="border border-border/40 p-2">Staking Requirement</td>
                    <td className="border border-border/40 p-2">≥10 ICP equivalent in $AIO</td>
                  </tr>
                  <tr>
                    <td className="border border-border/40 p-2">Consensus Mechanism</td>
                    <td className="border border-border/40 p-2">Executed automatically by the large AI model</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <div className="mt-6">
            <h3 className="text-xl font-medium mb-3">4.2 Economic Incentive Model</h3>
            
            <div>
              <h4 className="font-semibold mb-1">AI Agent Staking:</h4>
              <ul className="list-disc pl-8 text-muted-foreground space-y-1">
                <li>Only those staking ≥10 ICP equivalent in $AIO can join the AIO ecosystem.</li>
                <li>Higher staking amounts confer higher priority.</li>
                <li>This ensures economic security.</li>
              </ul>
            </div>
            
            <div className="mt-4">
              <h4 className="font-semibold mb-1">AI Task Mining:</h4>
              <ul className="list-disc pl-8 text-muted-foreground space-y-1">
                <li>Tokens are rewarded based on computational contributions and reputation scores.</li>
                <li>The contribution of computing resources (CPU/GPU) determines the distribution ratio.</li>
                <li>Task complexity and reputation score influence the final reward.</li>
              </ul>
            </div>
          </div>
        </section>

        {/* $AIO Pricing Model */}
        <section className="web3-card p-6 space-y-4">
          <h2 className="text-2xl font-semibold">5. $AIO Pricing Model</h2>
          
          <div>
            <h3 className="text-xl font-medium mb-3">5.1 Estimated AI Agent Scale</h3>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr>
                    <th className="border border-border/40 bg-secondary/30 p-2 text-left">Stage</th>
                    <th className="border border-border/40 bg-secondary/30 p-2 text-left">AI Agent Scale</th>
                    <th className="border border-border/40 bg-secondary/30 p-2 text-left">Growth in Computational Tasks</th>
                    <th className="border border-border/40 bg-secondary/30 p-2 text-left">$AIO Demand</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="border border-border/40 p-2">Startup</td>
                    <td className="border border-border/40 p-2">5 - 10</td>
                    <td className="border border-border/40 p-2">Low</td>
                    <td className="border border-border/40 p-2">Initial staking demand</td>
                  </tr>
                  <tr>
                    <td className="border border-border/40 p-2">Expansion</td>
                    <td className="border border-border/40 p-2">100 - 500</td>
                    <td className="border border-border/40 p-2">Gradual increase</td>
                    <td className="border border-border/40 p-2">Increased computational tasks</td>
                  </tr>
                  <tr>
                    <td className="border border-border/40 p-2">Maturity</td>
                    <td className="border border-border/40 p-2">5,000 - 10,000</td>
                    <td className="border border-border/40 p-2">High</td>
                    <td className="border border-border/40 p-2">Thriving task market</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <div className="mt-6">
            <h3 className="text-xl font-medium mb-3">5.2 Initial $AIO Price</h3>
            <ul className="list-disc pl-8 text-muted-foreground space-y-1">
              <li><strong>Initial AI Agent Target:</strong> 10</li>
              <li><strong>Initial Staking Requirement:</strong> 10 × 10 ICP</li>
              <li><strong>Assumed ICP Price:</strong> 5 USD</li>
              <li><strong>Initial Staking Pool:</strong> 100 ICP (500 USD)</li>
              <li><strong>Assumed 1% $AIO in circulation</strong></li>
              <li><strong>Initial $AIO Price ≈ 0.00000000238 ICP</strong></li>
            </ul>
          </div>
        </section>

        {/* Token Allocation */}
        <section className="web3-card p-6 space-y-4">
          <h2 className="text-2xl font-semibold">6. Token Allocation</h2>
          
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr>
                  <th className="border border-border/40 bg-secondary/30 p-2 text-left">Allocation Category</th>
                  <th className="border border-border/40 bg-secondary/30 p-2 text-left">Percentage</th>
                  <th className="border border-border/40 bg-secondary/30 p-2 text-left">Quantity</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="border border-border/40 p-2">SNS DAO Issuance</td>
                  <td className="border border-border/40 p-2">55%</td>
                  <td className="border border-border/40 p-2">11,550,000,000,000,000</td>
                </tr>
                <tr>
                  <td className="border border-border/40 p-2">AI Agent Developers (Miners)</td>
                  <td className="border border-border/40 p-2">20%</td>
                  <td className="border border-border/40 p-2">4,200,000,000,000,000</td>
                </tr>
                <tr>
                  <td className="border border-border/40 p-2">Team & Ecosystem Development</td>
                  <td className="border border-border/40 p-2">15%</td>
                  <td className="border border-border/40 p-2">3,150,000,000,000,000</td>
                </tr>
                <tr>
                  <td className="border border-border/40 p-2">Strategic Partnerships & Institutional Investment</td>
                  <td className="border border-border/40 p-2">7%</td>
                  <td className="border border-border/40 p-2">1,470,000,000,000,000</td>
                </tr>
                <tr>
                  <td className="border border-border/40 p-2">Liquidity & Exchange Markets</td>
                  <td className="border border-border/40 p-2">3%</td>
                  <td className="border border-border/40 p-2">630,000,000,000,000</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* Milestone Plan */}
        <section className="web3-card p-6 space-y-4">
          <h2 className="text-2xl font-semibold">7. Milestone Plan (6 Months)</h2>
          
          <div className="space-y-6">
            <div className="p-4 bg-secondary/30 rounded-lg border border-border/40">
              <h3 className="flex items-center text-lg font-medium mb-3">
                <Zap className="mr-2 text-primary" size={20} />
                Months 1-2
              </h3>
              <ul className="list-disc pl-8 text-muted-foreground space-y-1">
                <li>Complete the ICP Canister architecture design</li>
                <li>Develop the EndPoint Canister & Queen Agent</li>
                <li>Test AI Agent task scheduling</li>
              </ul>
            </div>
            
            <div className="p-4 bg-secondary/30 rounded-lg border border-border/40">
              <h3 className="flex items-center text-lg font-medium mb-3">
                <Zap className="mr-2 text-primary" size={20} />
                Months 3-4
              </h3>
              <ul className="list-disc pl-8 text-muted-foreground space-y-1">
                <li>Deploy the SNS economic contract</li>
                <li>Launch the AI Agent staking mechanism</li>
                <li>Test the $AIO pricing model</li>
              </ul>
            </div>
            
            <div className="p-4 bg-secondary/30 rounded-lg border border-border/40">
              <h3 className="flex items-center text-lg font-medium mb-3">
                <Zap className="mr-2 text-primary" size={20} />
                Months 5-6
              </h3>
              <ul className="list-disc pl-8 text-muted-foreground space-y-1">
                <li>Pre-launch of the mainnet</li>
                <li>Open AI Agent staking</li>
                <li>Officially initiate decentralized SNS governance</li>
              </ul>
            </div>
          </div>
        </section>

        {/* Conclusion */}
        <section className="web3-card p-6 space-y-4">
          <h2 className="text-2xl font-semibold">8. Conclusion</h2>
          
          <p className="text-muted-foreground">
            AIO-2030 builds a decentralized AI Agent ecosystem through a Web3 + AI economic model, featuring:
          </p>
          
          <ul className="pl-8 text-muted-foreground space-y-1">
            <li className="flex items-start">
              <span className="inline-block text-primary mr-2">✅</span>
              <span>Open Standards (AIO Protocol)</span>
            </li>
            <li className="flex items-start">
              <span className="inline-block text-primary mr-2">✅</span>
              <span>Decentralized Economic System ($AIO staking & mining)</span>
            </li>
            <li className="flex items-start">
              <span className="inline-block text-primary mr-2">✅</span>
              <span>AI Reputation Scoring & Task Incentives</span>
            </li>
            <li className="flex items-start">
              <span className="inline-block text-primary mr-2">✅</span>
              <span>A Governance System Compliant with ICP SNS Rules</span>
            </li>
          </ul>
          
          <p className="mt-6 text-primary font-medium">
            🚀 AIO-2030 will drive AI Agents into the Web3 era, achieving true decentralized collaboration and a computational economy!
          </p>
        </section>
      </div>
    </div>;
};
export default AIProjects;

import React from 'react';
import { Card } from "../../components/ui/card";

const Chapter4 = () => {
  return (
    <div className="chapter">
      <h2 className="text-3xl font-bold mb-6 border-b pb-2">Token Incentives & Economic Model</h2>
      
      <div className="space-y-10">
        <section>
          <h3 className="text-2xl font-semibold mb-4">1. Token Issuance</h3>
          <Card className="p-6 bg-white dark:bg-neutral-800 shadow-md">
            <div className="space-y-4">
              <div>
                <h4 className="font-semibold text-lg">Total Supply</h4>
                <p>The total supply of <strong>{"$AIO tokens"}</strong> is <strong>21,000,000,000,000,000</strong> (with 8 decimal places of precision).</p>
              </div>
              
              <div>
                <h4 className="font-semibold text-lg">Initial Circulating Supply</h4>
                <p>Tokens will be released in batches according to community governance rules (SNS), ensuring a smooth market transition and the healthy development of the ecosystem.</p>
              </div>
              
              <div>
                <h4 className="font-semibold text-lg">Staking Requirements & Incentive Coefficients</h4>
                <p>Users and developers must stake <strong>{"$AIO tokens"}</strong> to participate in the ecosystem. The staked amount not only serves as the <strong>participation threshold</strong> but also acts as an <strong>incentive coefficient</strong> (denoted as <code>κ</code>). The higher the stake, the greater the reward multiplier.</p>
              </div>
            </div>
          </Card>
        </section>
        
        <section>
          <h3 className="text-2xl font-semibold mb-4">2. Developer & Participant Incentive Structure</h3>
          <p className="text-lg mb-4">
            To encourage active participation, high-quality contributions, and long-term alignment with the AIO-2030 ecosystem, 
            a structured and tokenized incentive framework has been established. Rewards are transparently distributed via 
            on-chain smart contracts based on verifiable actions and workload proofs.
          </p>
          
          <Card className="p-6 mb-6 bg-white dark:bg-neutral-800 shadow-md">
            <h4 className="text-xl font-semibold mb-3">2.1 Developer Onboarding & Initial Grant</h4>
            <ul className="list-disc pl-5 space-y-2">
              <li>Developers integrate into the AIO ecosystem by submitting <strong>AIO-MCP Servers</strong>.</li>
              <li>
                Upon successful verification through the <code>help</code> protocol and LLM-based inverted index reasoning, 
                developers receive an <strong>initial grant</strong> calculated as:
              </li>
            </ul>
            
            <div className="bg-neutral-100 dark:bg-neutral-900 p-4 my-4 rounded-md text-center">
              <code className="text-lg">Initial Grant = LLM Capability Score × Indexing Weight</code>
            </div>
            
            <h5 className="font-semibold mt-4 mb-2">Grant Composition:</h5>
            <ul className="list-disc pl-5 space-y-1">
              <li><strong>50% is auto-staked</strong> as mandatory collateral</li>
              <li>The remaining <strong>50% is linearly released</strong> over 18 months, based on workload contribution and active uptime</li>
              <li>Developers may increase their <strong>staking weight</strong> by voluntarily locking additional {"$AIO"} tokens, which boosts future incentive multipliers.</li>
            </ul>
          </Card>
          
          <Card className="p-6 mb-6 bg-white dark:bg-neutral-800 shadow-md">
            <h4 className="text-xl font-semibold mb-3">2.2 Token Distribution Formula</h4>
            <p className="mb-3">For each task, token rewards are determined by the following weighted factors:</p>
            
            <div className="bg-neutral-100 dark:bg-neutral-900 p-4 my-4 rounded-md text-center">
              <code className="text-lg">Reward = Participation Volume × Execution Quality × Staking Weight</code>
            </div>
            
            <p>All rewards are recorded in the on-chain <strong>Incentive Ledger</strong> after being validated by the Arbiter consensus mechanism.</p>
          </Card>
          
          <Card className="p-6 bg-white dark:bg-neutral-800 shadow-md">
            <h4 className="text-xl font-semibold mb-4">2.3 Reward Categories</h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-blue-50 dark:bg-blue-900/30 p-5 rounded-lg shadow-sm border border-blue-100 dark:border-blue-800">
                <h5 className="font-semibold text-lg mb-2 text-blue-800 dark:text-blue-200">Submission Reward</h5>
                <p className="mb-2">Developers submitting new AI Agents or MCP Servers (compliant with AIO Protocol and verified on-chain) receive:</p>
                <ul className="list-disc pl-5 space-y-1">
                  <li><strong>Base Reward:</strong> 10,000 {"$AIO"}</li>
                  <li><strong>Boost Multiplier:</strong> Proportional to developer's current staking coefficient</li>
                </ul>
              </div>
              
              <div className="bg-green-50 dark:bg-green-900/30 p-5 rounded-lg shadow-sm border border-green-100 dark:border-green-800">
                <h5 className="font-semibold text-lg mb-2 text-green-800 dark:text-green-200">Invocation Reward</h5>
                <p className="mb-2">Every successful call to a registered AI Agent or MCP Server receives:</p>
                <ul className="list-disc pl-5 space-y-1">
                  <li><strong>Base Reward:</strong> 3,000 {"$AIO"}</li>
                  <li><strong>Adjusted by:</strong> User's staking amount (higher stake → higher multiplier)</li>
                </ul>
              </div>
              
              <div className="bg-purple-50 dark:bg-purple-900/30 p-5 rounded-lg shadow-sm border border-purple-100 dark:border-purple-800">
                <h5 className="font-semibold text-lg mb-2 text-purple-800 dark:text-purple-200">Subscription Revenue Sharing</h5>
                <p className="mb-2">When users subscribe to <strong>Queen Agent services</strong>:</p>
                <ul className="list-disc pl-5 space-y-1">
                  <li><strong>50% of the subscription fee</strong> is pooled</li>
                  <li>The pool is evenly redistributed across all contributing MCP Servers and AI Agents in that execution path</li>
                  <li><strong>Staking Coefficients</strong> amplify each participant's share</li>
                </ul>
              </div>
              
              <div className="bg-amber-50 dark:bg-amber-900/30 p-5 rounded-lg shadow-sm border border-amber-100 dark:border-amber-800">
                <h5 className="font-semibold text-lg mb-2 text-amber-800 dark:text-amber-200">Asset Download Reward</h5>
                <p className="mb-2">Whenever users download ecosystem resources (e.g., open-source code, models, datasets):</p>
                <ul className="list-disc pl-5 space-y-1">
                  <li><strong>Base Reward:</strong> 1,000 {"$AIO"}</li>
                  <li><strong>Bonus:</strong> Additional rewards based on user staking amount</li>
                </ul>
              </div>
            </div>
            
            <div className="mt-6 bg-indigo-50 dark:bg-indigo-900/30 p-5 rounded-lg shadow-sm border border-indigo-100 dark:border-indigo-800">
              <h5 className="font-semibold text-lg mb-2 text-indigo-800 dark:text-indigo-200">Long-Term Contribution Bonus</h5>
              <p className="mb-2">To reward developers or teams that contribute significantly over time, the protocol includes periodic bonus distributions based on:</p>
              <ul className="list-disc pl-5 space-y-1">
                <li><strong>Cumulative Stake Volume</strong></li>
                <li><strong>Depth and frequency of ecosystem contributions</strong></li>
                <li><strong>Token Multiplier:</strong> Directly proportional to the contributor's stake weight</li>
              </ul>
            </div>
            
            <div className="mt-6">
              <p className="text-lg">
                The {"$AIO"} token incentive framework aligns all ecosystem participants—from developers and operators to consumers—through 
                a transparent, measurable, and stake-weighted reward model. This approach supports sustainable growth, encourages 
                high-value contributions, and promotes long-term network health.
              </p>
            </div>
          </Card>
        </section>
        
        <section>
          <h3 className="text-2xl font-semibold mb-4">3. Token Economic Model</h3>
          <Card className="p-6 bg-white dark:bg-neutral-800 shadow-md">
            <p className="mb-4">
              The AIO-2030 economic model is driven by smart contracts that enable self-incentivizing mechanisms and value transfer.
              The core components of the model include:
            </p>
            
            <div className="space-y-4">
              <div>
                <h4 className="font-semibold text-lg">Endogenous Economic Loop</h4>
                <p><strong>{"$AIO tokens"}</strong> are used within the ecosystem to pay for calls, storage, and compute fees, creating an internal token circulation system.</p>
              </div>
              
              <div>
                <h4 className="font-semibold text-lg">Staking & Incentive Linkage</h4>
                <p>
                  Staking is not only a participation threshold but also a critical factor for incentive rewards (denoted as <code>κ</code>), 
                  encouraging long-term token holding, higher governance rights, and economic returns.
                </p>
              </div>
              
              <div>
                <h4 className="font-semibold text-lg">Compute Support & Payment</h4>
                <p>
                  AIO-2030 is powered by <strong>{"$EMC"}</strong>, which supports Queen Agent's compute resources. Based on 
                  <strong>{"$AIO traffic * compute coefficient"}</strong> $ U $, the corresponding <strong>{"$AIO tokens"}</strong> will be 
                  burned, with <strong>{"$EMC payments"}</strong> made for the compute power used.
                </p>
              </div>
              
              <div>
                <h4 className="font-semibold text-lg">Token Burn Mechanism</h4>
                <p>
                  A portion of service fees is used to <strong>burn {"$AIO tokens"}</strong> through smart contracts, 
                  reducing circulating supply and increasing token scarcity and long-term value.
                </p>
              </div>
              
              <div>
                <h4 className="font-semibold text-lg">Decentralized Governance</h4>
                <p>
                  Through a DAO model, <strong>{"$AIO token holders"}</strong> participate in governance, voting on protocol upgrades, 
                  parameter adjustments, and resource allocation. Governance weight is tied to the amount of tokens staked by each user, 
                  ensuring transparency and fairness in the decision-making process.
                </p>
              </div>
              
              <div>
                <h4 className="font-semibold text-lg">Market Liquidity & Scalability</h4>
                <p>
                  In addition to internal ecosystem transactions, <strong>{"$AIO tokens"}</strong> will circulate on external exchanges, 
                  providing additional economic incentives and investment returns to users, while also supporting a broader range of real-world use cases.
                </p>
              </div>
            </div>
          </Card>
        </section>
        
        <section>
          <h3 className="text-2xl font-semibold mb-4">4. Token Economic Model Metrics & Expected Calculations</h3>
          <Card className="p-6 bg-white dark:bg-neutral-800 shadow-md">
            <div className="flex justify-center mb-6">
              <figure className="text-center">
                <img 
                  src="https://cdn.nlark.com/yuque/0/2025/png/42987799/1743860411043-61d3184b-ddad-4493-867c-bf02a64396bd.png" 
                  alt="Token Economic Model Metrics" 
                  className="max-w-full rounded-lg border border-gray-200 shadow-lg"
                />
              </figure>
            </div>
            
            <p className="mb-4">
              To assess the market performance and liquidity of the <strong>{"$AIO"}</strong> token, the following key metrics 
              and expected calculation formulas are proposed:
            </p>
            
            <div className="bg-slate-50 dark:bg-slate-900/50 p-5 rounded-lg shadow-sm mb-6 border border-slate-200 dark:border-slate-700">
              <h4 className="font-semibold text-lg mb-3">Parameter Definitions</h4>
              <ul className="list-disc pl-5 space-y-2">
                <li><strong>Total Supply (TS):</strong> 21,000,000,000,000,000 {"$AIO"}</li>
                <li><strong>Circulating Supply (CS):</strong> The actual circulating tokens released according to governance rules.</li>
                <li><strong>Total Staked (S):</strong> The total amount of <strong>{"$AIO"}</strong> staked by all users within the ecosystem</li>
                <li><strong>Market Value (M):</strong> $ M = {"P_{AIO}"} \times CS $</li>
                <li><strong>Liquidity (L):</strong> L = Trading Volume / M<br/>
                (Reflects the ratio of actual trading volume relative to the market value)</li>
              </ul>
            </div>
            
            <div className="bg-slate-50 dark:bg-slate-900/50 p-5 rounded-lg shadow-sm mb-6 border border-slate-200 dark:border-slate-700">
              <h4 className="font-semibold text-lg mb-3">Token Price Forecasting Formula</h4>
              <p className="mb-3">
                Assuming that the total network value is composed of <strong>ecosystem utility</strong>, <strong>compute-backed value</strong>, 
                and <strong>governance value</strong>, the expected price of <strong>{"$AIO"}</strong> is calculated as follows:
              </p>
              
              <div className="bg-neutral-100 dark:bg-neutral-900 p-4 my-4 rounded-md text-center">
                <p className="font-mono">P<sub>AIO</sub> = (V<sub>usage</sub> + V<sub>compute</sub> + V<sub>governance</sub>) / CS</p>
              </div>
              
              <p className="mb-2">Where:</p>
              <ul className="list-disc pl-5 space-y-1">
                <li><strong>V<sub>usage</sub>:</strong> Total value generated by services within the ecosystem</li>
                <li><strong>V<sub>compute</sub>:</strong> Value derived from payments for compute resources through <strong>{"$EMC"}</strong></li>
                <li><strong>V<sub>governance</sub>:</strong> Long-term value driven by DAO governance participation</li>
              </ul>
              
              <p className="mt-4">
                Considering the staking incentive coefficient <strong>κ</strong> (the higher the stake, the greater the coefficient, 
                with <strong>κ {`>`} 1</strong>), the expected market price of the token is:
              </p>
              
              <div className="bg-neutral-100 dark:bg-neutral-900 p-4 my-4 rounded-md text-center">
                <p className="font-mono">P<sub>AIO</sub><sup>expected</sup> = ((V<sub>usage</sub> + V<sub>compute</sub> + V<sub>governance</sub>) × κ) / CS</p>
              </div>
            </div>
            
            <div className="bg-slate-50 dark:bg-slate-900/50 p-5 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700">
              <h4 className="font-semibold text-lg mb-3">Diagram Explanation</h4>
              <ul className="list-disc pl-5 space-y-2">
                <li><strong>Total Supply (TS)</strong> and <strong>Circulating Supply (CS)</strong> form the base of the token economy.</li>
                <li><strong>Total Staked (S)</strong>, influenced by the <strong>incentive coefficient (κ)</strong>, determines the amplification effect of rewards.</li>
                <li><strong>Ecosystem Usage</strong>, <strong>Compute Support</strong>, and <strong>Governance Value</strong> collectively contribute to the <strong>Market Value (M)</strong>, which is divided by the circulating supply and multiplied by the incentive coefficient to derive the <strong>expected token market price</strong>.</li>
                <li><strong>Liquidity (L)</strong> reflects the ratio of actual trading volume to market value, representing market activity and liquidity.</li>
              </ul>
            </div>
          </Card>
        </section>
        
        <section>
          <h3 className="text-2xl font-semibold mb-4">Incentive Model Overview</h3>
          <Card className="p-6 bg-white dark:bg-neutral-800 shadow-md">
            <ul className="list-disc pl-5 space-y-3">
              <li><strong>Native Token:</strong> <code>{"$AIO"}</code></li>
              <li>
                <strong>Incentive Rules:</strong>
                <ul className="list-disc pl-5 mt-2 space-y-2">
                  <li>Agents are required to stake <code>{"$AIO"}</code> in order to register and operate within the AIO network.</li>
                  <li>
                    Token rewards are distributed based on the formula:<br/>
                    <strong className="ml-2">Task Participation × Service Quality × Staking Weight</strong>
                  </li>
                  <li>Each task execution is validated by the <strong>Arbiter</strong> through a decentralized consensus mechanism and recorded into the on-chain incentive ledger.</li>
                </ul>
              </li>
            </ul>
          </Card>
        </section>
      </div>
    </div>
  );
};

export default Chapter4;


import React from 'react';
import { Card } from "../../components/ui/card";

const Chapter4 = () => {
  return (
    <div className="chapter">
      <h2 className="text-3xl font-bold mb-6 border-b pb-2">Chapter 4: Protocol Economics</h2>
      
      <div className="space-y-6">
        <div className="mb-6">
          <h3 className="text-2xl font-semibold mb-3">Token Issuance & Economic Model</h3>
          <p>
            The AIO Protocol incorporates economic mechanisms to incentivize quality contributions 
            and maintain network health through a balanced token economy. The $AIO token serves as
            the backbone of this system, providing incentives and enabling decentralized governance.
          </p>
        </div>

        <Card className="p-6 shadow-md">
          <h3 className="text-xl font-semibold mb-4">Token Supply Model</h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span>Total Supply:</span>
              <span className="font-medium">21,000,000,000,000,000 $AIO</span>
            </div>
            <div>
              <p><strong>Initial Circulating Supply:</strong> Released in batches according to community governance rules (SNS) for healthy ecosystem development.</p>
            </div>
            <div>
              <p><strong>Staking Requirements:</strong> Users and developers must stake $AIO tokens to participate, serving both as a threshold and as an incentive coefficient (κ) that amplifies rewards.</p>
            </div>
          </div>
        </Card>

        <div className="mt-8">
          <h3 className="text-2xl font-semibold mb-3">Developer & Participant Incentives</h3>
          
          <div className="bg-neutral-50 p-6 rounded-lg">
            <h4 className="font-semibold mb-3">Developer Onboarding & Initial Grant</h4>
            <p className="mb-3">
              Developers integrate into the ecosystem by submitting AIO-MCP Servers. Upon verification,
              they receive an initial grant calculated as:
            </p>
            <p className="font-mono bg-white p-2 rounded mb-2">
              Initial Grant = LLM Capability Score × Indexing Weight
            </p>
            <p className="text-sm">
              50% is auto-staked as collateral, with the remaining 50% linearly released over 18 months
              based on workload contribution and active uptime.
            </p>
          </div>

          <div className="bg-neutral-50 p-6 rounded-lg mt-4">
            <h4 className="font-semibold mb-3">Token Distribution Formula</h4>
            <p className="mb-3">For each task, token rewards are determined by weighted factors:</p>
            <p className="font-mono bg-white p-2 rounded">
              Reward = Participation Volume × Execution Quality × Staking Weight
            </p>
            <p className="text-sm mt-2">
              All rewards are recorded in the on-chain Incentive Ledger after Arbiter validation.
            </p>
          </div>

          <div className="mt-6">
            <h4 className="text-xl font-semibold mb-3">Reward Categories</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-white p-4 rounded shadow-sm">
                <h5 className="font-medium">1. Submission Reward</h5>
                <p className="text-sm">For new AI Agents or MCP Servers:</p>
                <ul className="list-disc pl-5 text-sm">
                  <li>Base Reward: 10,000 $AIO</li>
                  <li>Boost: Proportional to staking coefficient</li>
                </ul>
              </div>
              
              <div className="bg-white p-4 rounded shadow-sm">
                <h5 className="font-medium">2. Invocation Reward</h5>
                <p className="text-sm">For successful agent calls:</p>
                <ul className="list-disc pl-5 text-sm">
                  <li>Base Reward: 3,000 $AIO</li>
                  <li>Adjusted by user's staking amount</li>
                </ul>
              </div>
              
              <div className="bg-white p-4 rounded shadow-sm">
                <h5 className="font-medium">3. Subscription Revenue Sharing</h5>
                <p className="text-sm">From Queen Agent services:</p>
                <ul className="list-disc pl-5 text-sm">
                  <li>50% of fees pooled and redistributed</li>
                  <li>Staking coefficients amplify share</li>
                </ul>
              </div>
              
              <div className="bg-white p-4 rounded shadow-sm">
                <h5 className="font-medium">4. Asset Download Reward</h5>
                <p className="text-sm">For ecosystem resources:</p>
                <ul className="list-disc pl-5 text-sm">
                  <li>Base Reward: 1,000 $AIO</li>
                  <li>Bonus based on user staking</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8">
          <h3 className="text-2xl font-semibold mb-3">Economic Formulations</h3>
          
          <div className="bg-neutral-50 p-4 rounded-lg">
            <p className="mb-2 font-medium">Token Price Forecasting Formula:</p>
            <p className="font-mono bg-white p-2 rounded">
              PAIO = (Vusage + Vcompute + Vgovernance) × κ / CS
            </p>
            <p className="text-sm mt-2">
              Where Vusage is ecosystem service value, Vcompute is compute resource value, 
              Vgovernance is governance participation value, κ is the staking incentive coefficient, 
              and CS is the circulating supply.
            </p>
          </div>

          <div className="mt-6">
            <h4 className="font-semibold mb-3">Economic Loop Components</h4>
            <ul className="list-disc pl-5 space-y-2">
              <li><strong>Endogenous Economic Loop:</strong> $AIO tokens circulate within the ecosystem for calls, storage, and compute fees</li>
              <li><strong>Staking & Incentive Linkage:</strong> Higher stakes lead to higher rewards, encouraging long-term holding</li>
              <li><strong>Compute Support & Payment:</strong> Powered by $EMC for compute resources, with $AIO burned based on traffic</li>
              <li><strong>Token Burn Mechanism:</strong> Service fees partially burned to reduce supply over time</li>
              <li><strong>Decentralized Governance:</strong> DAO model where staked token holders vote on protocol decisions</li>
              <li><strong>Market Liquidity:</strong> External exchange listings provide additional economic incentives</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Chapter4;

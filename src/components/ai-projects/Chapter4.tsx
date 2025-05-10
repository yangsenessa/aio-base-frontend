
import React from 'react';
import { Card } from "../../components/ui/card";

const Chapter4 = () => {
  return (
    <div className="chapter">
      <h2 className="text-3xl font-bold mb-6 border-b pb-2">Chapter 4: Protocol Economics</h2>
      
      <div className="space-y-6">
        <p>
          The AIO Protocol incorporates economic mechanisms to incentivize quality contributions 
          and maintain network health through a balanced token economy.
        </p>

        <Card className="p-6 shadow-md">
          <h3 className="text-xl font-semibold mb-4">Token Utility Model</h3>
          <p>AIO tokens serve multiple functions in the ecosystem:</p>
          
          <ul className="list-disc pl-5 mt-3 space-y-2">
            <li>Access to premium agent capabilities</li>
            <li>Staking for agent service providers</li>
            <li>Governance participation rights</li>
            <li>Fee payment for computational resources</li>
          </ul>
        </Card>

        <div className="mt-6">
          <h3 className="text-xl font-semibold mb-4">Economic Formulations</h3>
          
          <div className="bg-neutral-50 p-4 rounded-lg">
            <p className="mb-2 font-medium">Reward Function for Agent Services:</p>
            <p className="font-mono bg-white p-2 rounded">
              R = α × (quality_score) + β × (computational_resources) + γ × (uniqueness_factor)
            </p>
            <p className="text-sm mt-2">
              Where α, β, and γ are adjustable parameters set by governance.
            </p>
          </div>

          <div className="bg-neutral-50 p-4 rounded-lg mt-4">
            <p className="mb-2 font-medium">Staking Incentive Model:</p>
            <p className="font-mono bg-white p-2 rounded">
              APY = base_rate × (1 + (stake_amount / total_stake)^0.5) × performance_multiplier
            </p>
          </div>

          <p className="mt-3">
            These economic mechanisms ensure sustainable operation of the network while 
            fairly compensating participants according to their contributions.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Chapter4;

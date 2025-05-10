
import React from 'react';

const Chapter5 = () => {
  return (
    <div className="chapter">
      <h2 className="text-3xl font-bold mb-6 border-b pb-2">Chapter 5: Token Economics & Governance</h2>
      
      <div className="space-y-6">
        <p>
          The AIO token serves as the backbone of the protocol's economic system, 
          providing incentives for network participants and enabling decentralized governance.
        </p>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-xl font-semibold mb-4">Token Distribution</h3>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span>Protocol Development:</span>
              <span className="font-medium">20%</span>
            </div>
            <div className="flex justify-between">
              <span>Community Treasury:</span>
              <span className="font-medium">15%</span>
            </div>
            <div className="flex justify-between">
              <span>Early Backers:</span>
              <span className="font-medium">15%</span>
            </div>
            <div className="flex justify-between">
              <span>Agent Provider Incentives:</span>
              <span className="font-medium">25%</span>
            </div>
            <div className="flex justify-between">
              <span>User Growth Fund:</span>
              <span className="font-medium">25%</span>
            </div>
          </div>
        </div>

        <div className="mt-6">
          <h3 className="text-xl font-semibold mb-4">Mathematical Token Models</h3>
          
          <div className="space-y-4">
            <p>
              Token velocity in the network can be modeled as:
            </p>
            <p className="font-mono bg-neutral-50 p-2 rounded">
              V = Transaction_Volume / Market_Cap
            </p>
            
            <p className="mt-3">
              Considering the staking incentive coefficient κ (the higher the stake, the greater the coefficient, with {`κ > 1`}), the expected market price of the token is:
            </p>
            <p className="font-mono bg-neutral-50 p-2 rounded">
              P = (NMV × κ) / Token_Supply
            </p>
            <p className="text-sm mt-1">
              Where NMV is the Network Monetary Value derived from service usage.
            </p>
          </div>
        </div>

        <div className="mt-6">
          <h3 className="text-xl font-semibold mb-4">Governance Structure</h3>
          <p>
            The AIO Protocol embraces a hybrid governance model combining on-chain voting 
            with delegated expertise for technical decisions, ensuring both broad participation 
            and informed technical development.
          </p>
          <ul className="list-disc pl-5 mt-3">
            <li>Token-weighted voting for protocol upgrades</li>
            <li>Technical council for implementation details</li>
            <li>Agent quality assurance through reputation staking</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Chapter5;

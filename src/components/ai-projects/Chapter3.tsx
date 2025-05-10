
import React from 'react';

const Chapter3 = () => {
  return (
    <div className="chapter">
      <h2 className="text-3xl font-bold mb-6 border-b pb-2">Chapter 3: Agent Network Topology</h2>
      
      <div className="space-y-4">
        <p className="mb-4">
          The agent network in AIO forms a dynamic topology that adapts to computational demands 
          and specialized capabilities required for different tasks.
        </p>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-xl font-semibold mb-4">Network Roles</h3>
          
          <div className="space-y-4">
            <div>
              <h4 className="font-medium text-lg">Queen Agent</h4>
              <p>Coordinates workflow and delegates tasks to specialized agents</p>
            </div>
            
            <div>
              <h4 className="font-medium text-lg">Worker Agents</h4>
              <p>Execute specific tasks with specialized capabilities</p>
              <ul className="list-disc pl-5 mt-2">
                <li>Data Processing Agents</li>
                <li>Inference Agents</li>
                <li>Storage Agents</li>
                <li>On-chain Operation Agents</li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-medium text-lg">Service Agents</h4>
              <p>Provide continuous background services to the network</p>
            </div>
          </div>
        </div>

        <p className="mt-6">
          This hierarchical yet flexible structure allows for efficient resource allocation 
          while maintaining the ability to handle complex, multi-step workflows through 
          intelligent coordination.
        </p>
      </div>
    </div>
  );
};

export default Chapter3;

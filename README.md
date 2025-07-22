# AIO-2030 Frontend

[View this project's code on GitHub](https://github.com/yangsenessa/aio-base-frontend)

This repository is meant to give [React](https://reactjs.org/) developers an easy on-ramp to get started with developing decentralized applications (Dapps) for Internet Computer (ICP). Dapps, also known as smart contracts, are specialized software that runs on a blockchain.

This template contains a React app under `src/aio-base-frontend` that can be hosted onchain on ICP.

### What is the Internet Computer?

The Internet Computer (ICP) is a novel blockchain that has the unique capability to serve web content while not requiring the end users to use a browser extension, such as Metamask.

Coupled with super-fast execution, ICP provides the world's first truly user-friendly Web 3.0 experience.

### What are canisters?

Dapps on ICP live in canisters, which are special smart contracts that run WebAssembly, and can respond to regular HTTP requests, among other capabilities.

This repository uses React for the frontend, and that is uploaded to an `asset` type canister once deployed.

## Security considerations and best practices

If you base your application on this example, we recommend you familiarize yourself with and adhere to the [Security Best Practices](https://internetcomputer.org/docs/current/references/security/) for developing on ICP. This example may not implement all the best practices.

For example, the following aspects are particularly relevant for creating frontends:
* [Use a well-audited authentication service and client-side IC libraries](https://internetcomputer.org/docs/current/references/security/web-app-development-security-best-practices#use-a-well-audited-authentication-service-and-client-side-ic-libraries).
* [Define security headers, including a Content Security Policy (CSP)](https://internetcomputer.org/docs/current/references/security/web-app-development-security-best-practices#define-security-headers-including-a-content-security-policy-csp).
* [Don't load JavaScript (and other assets) from untrusted domains](https://internetcomputer.org/docs/current/references/security/web-app-development-security-best-practices#dont-load-javascript-and-other-assets-from-untrusted-domains).

## License

MIT License

Copyright (c) 2025 AIO-2030 Project

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.

## Install dependencies

Make sure you have [node.js](https://nodejs.org/) installed.

### DFX

Install `dfx` by running

```
sh -ci "$(curl -fsSL https://internetcomputer.org/install.sh)"
```

## Start the local replica

Open a new terminal window in the project directory, and run the following command to start the local replica. The replica will not start unless `dfx.json` exists in the current directory.

```
dfx start --background
```

When you're done with development, or you're switching to a different dfx project, running

```
dfx stop
```

from the project directory will stop the local replica.

## Build and run the dapp

Make sure you switch back to the project root directory.

First, install the frontend dependencies by running:

```
cd src/aio-base-frontend
npm install
cd ../..
```

To build and deploy the project, you can use the provided build script:

```
./build.sh
```

The build script will:
1. Stop existing dfx processes
2. Clean and start dfx
3. Deploy aio-base-frontend
4. Add recharge principal account
5. Execute token mint operations

When the process completes, you'll have a frontend canister running locally. To find the frontend canister's ID, run

```
dfx canister id aio-base-frontend
```

It will output something similar to `be2us-64aaa-aaaaa-qaabq-cai`. Copy this ID and open it in the browser using `http://localhost:4943?canisterId=<canister ID>`.

## Local development

You can serve the frontend in development mode like you normally develop a React app using the command:

```
cd src/aio-base-frontend
npm run dev
```

## Deploying to the mainnet

To host the React app on ICP, you'll need to acquire [cycles](https://internetcomputer.org/docs/current/developer-docs/getting-started/tokens-and-cycles) (the equivalent of "gas" on other blockchains). Cycles pay for the execution of your app, and they are also needed to create canisters.

After making sure you have cycles available, you can run

```
dfx deploy --network ic
```

The command will build the project, create a new canister on ICP and deploy the React app into it. The command will also create a new file `canister_ids.json` which will help the dfx tool deploy to the same canister in future updates. You can commit this file in your repository.

You can now open your React app running onchain. You can find the canister ID in the deploy command output, or use the ID in `canister_ids.json`.

The link to your app is `<canister_id>.ic0.app`. For example, if your canister ID is `be2us-64aaa-aaaaa-qaabq-cai`, your app will be at `https://be2us-64aaa-aaaaa-qaabq-cai.ic0.app/`.

## Route Information

The application uses React Router for client-side routing. The main route structure includes:

### Main Routes
- `/` - Landing/Index page
- `/user-dashboard` - User dashboard
- `/user-dashboard/wallet-settings` - Wallet settings

### Nested Routes (under `/home` with MainDashboard layout)
- `/home` - Home page
- `/home/dashboard` - AIO dashboard
- `/home/agent-store` - Agent store
- `/home/mcp-store` - MCP server store
- `/home/mcp-stacking-records` - MCP staking records
- `/home/ai-projects` - AI projects
- `/home/add-agent` - Add agent
- `/home/add-mcp-server` - Add MCP server
- `/home/agent-implementation` - Agent implementation
- `/home/mcp-implementation` - MCP implementation
- `/home/best-practices` - Best practices
- `/home/open-source` - Open source
- `/home/flag-agent` - Flag agent
- `/home/user-dashboard` - User dashboard
- `/home/profile` - User profile
- `/home/wallet-settings` - Wallet settings
- `/home/agent/:agentName` - Agent details page
- `/home/mcp-server/:serverName` - MCP server details page

All `/home` routes use the ChatProvider context, providing chat functionality and state management.

## AIO Framework Information

### What is AIO-2030?

**AIO-2030 (Super AI Decentralized Network)** aims to fundamentally reconstruct the AI ecosystem and interaction paradigm. By leveraging decentralized networks and blockchain technology, AIO-2030 introduces the *De-Super Agentic AI Network*, a contract-based agent registration framework, on-chain task traceability, and incentive mechanisms—ultimately building an open, trustworthy, and composable AI Agent collaboration network.

### Core Components

| **Role/Component** | **Description** |
| --- | --- |
| **User** | Initiates AI tasks by submitting intent-based requests. The **Queen Agent** responds by generating a dedicated **AIO-Context Instance**, orchestrating service composition and execution via the agentic network. |
| **Developer** | Contributes to the ecosystem by uploading or registering custom-built **AI Agents** or **MCP Servers** to the AIO Network. |
| **Queen Agent** | The core superintelligence of AIO-2030. It transcends individual agents and MCP nodes by serving as a high-dimensional orchestrator—managing **capability discovery**, **thought-chain execution**, and **ecosystem-wide intelligence integration**. |
| **Arbiter** | The execution layer of the **AIO-Tokenization Protocol**, implemented as a smart contract via **ICP Canisters**. It governs token-based operations including grants, staking, usage accounting, and incentive distribution for ecosystem participants. |
| **AIO-MCP Server** | Generalized AI service nodes participating in AIO-2030, encompassing (but not limited to) providers such as OpenAI, Claude, Gemini, as well as independent/self-hosted agents, tools, RAG services, and canister-based modules—exposed via standardized **AIO-INF EndPoint instances**. |

### AIO Protocol Stack

The AIO Protocol is a multi-layered framework designed to standardize how agentic AI services interact, execute, and coordinate within a decentralized, composable AI ecosystem.

#### Protocol Layers

1. **Application Layer (Intent & Interaction Interface)**
   - Captures user goals, system-level prompts, or inter-agent requests
   - Structures them into actionable tasks

2. **Protocol Layer (Inter-Agent Communication Format)**
   - Uses extended JSON-RPC 2.0 standard
   - Includes trace_id for multi-agent call chain tracing

3. **Transport Layer (Message Transmission Protocols)**
   - Supports stdio, HTTP, SSE (Server-Sent Events)

4. **Execution Layer (Runtime Abstraction for AI Agents)**
   - AIO_POD: Default for dynamic, isolated tasks
   - Wasm Modules: For ICP Canister or edge-based execution
   - Hosted APIs: For integrating third-party AI

5. **Coordination Layer (Orchestration & Trust Coordination)**
   - Queen Agent: Constructs execution chains and resolves intent
   - EndPoint Canister: Smart contracts storing agent metadata, stake, and capability

6. **Ledger Layer (On-Chain Execution & Incentive Settlement)**
   - Implements distributed ledger via ICP Canisters
   - Distributes $AIO token rewards based on validated workload

### Token Economic Model

- **Total Supply**: 21,000,000,000,000,000 $AIO tokens (8 decimal places of precision)
- **Staking Requirements**: Agents and MCP servers need to stake $AIO tokens
- **Incentive Mechanism**: Reward allocation based on task execution, quality scores, and contributions
- **Governance**: Supports proposals, voting, and community decisions

## Prompts/ContextLLM Project

This project contains rich prompt engineering and context language model configurations designed to support AIO-2030's intelligent coordination and task execution.

### Core Prompt Configurations

#### System Prompts (`systemPrompts.ts`)
Defines the core roles and behaviors of the **Queen Agent**:
- **Intent Analyzer**: Parses and understands user requests
- **Task Decomposer**: Breaks down complex requests into atomic tasks
- **MCP Orchestrator**: Selects appropriate MCPs and manages interactions
- **Plan Generator**: Creates structured execution plans
- **Quality Controller**: Validates task completion and output quality

#### AIO Intent Prompts (`aioIntentPrompts.ts`)
Contains specialized prompts for intent recognition and task routing, supporting:
- Multilingual understanding
- Context-aware task classification
- Intelligent capability matching

#### AIO Index Prompts (`aioIndexPrompts.ts`)
Used for building and maintaining capability indexes in the AIO network:
- Keyword-group-MCP-method inverted indexes
- Capability discovery and recommendation
- Intelligent agent selection

#### AI Prompts Library (`aiPrompts.ts`)
Contains prompt templates for various AI tasks:
- Content generation
- Code analysis
- Multimodal processing
- Reasoning chain construction

#### Protocol Output Adapter (`aioProtocalOutputAdapterPrompts.ts`)
Defines adaptation rules for different AI service output formats, ensuring:
- Unified output formats
- Cross-service compatibility
- Quality standardization

#### Real-time Keywords Mapping (`realtimeKeywordsMapping.ts`)
Supports dynamic keyword identification and mapping:
- Real-time intent parsing
- Context keyword extraction
- Intelligent routing decisions

#### User Case Intent Prompts (`userCaseIntentPrompts.ts`)
Intent recognition for specific use case scenarios:
- Business process automation
- Content creation workflows
- Data analysis tasks

### Template System

The `config/template/` directory contains prompt templates for various task types, supporting:
- Standardized task structures
- Reusable prompt components
- Dynamic template generation

### Technical Features

- **Multilingual Support**: All prompt systems support multilingual processing
- **Context Awareness**: Intelligent prompt generation based on conversation history and user preferences
- **Dynamic Adaptation**: Adjusts prompt strategies based on task complexity and available resources
- **Quality Assurance**: Built-in output validation and quality assessment mechanisms

This prompt system is the core of AIO-2030's intelligent coordination capabilities, enabling the Queen Agent to understand complex human intent and transform it into efficient multi-agent execution plans.

## Tech Stack

This project is built with the following technologies:

- **Frontend Framework**: React 18.3.1 + TypeScript
- **Build Tool**: Vite
- **UI Framework**: shadcn/ui + Radix UI + Tailwind CSS
- **Blockchain**: Internet Computer (ICP) + Dfinity Agent
- **State Management**: React Context + TanStack Query
- **Routing**: React Router DOM
- **Other Libraries**:
  - axios (HTTP client)
  - react-hook-form (form handling)
  - zod (data validation)
  - lucide-react (icons)
  - recharts (charts)
  - react-syntax-highlighter (code highlighting) 
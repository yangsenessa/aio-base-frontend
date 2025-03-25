
# 📘 AIO-MCP Protocol Technical Whitepaper (English Version)

## 📍 Version: v1.2.1
> Updated: March 2025  
> Specification: Unified AIO interface + MCP-compatible execution layer  
> Purpose: Standardize interaction and composition between multiple heterogeneous AI Agents

---

## Table of Contents

1. Protocol Overview  
2. Core JSON-RPC Structure  
3. Namespace & `trace_id` Mechanism  
4. Communication Types  
5. MCP-Type Interaction Semantics  
6. Multimodal Input/Output Format  
7. Execution Trace & Routing Structure  
8. Appendix: MCP Module Interface Specs

---

## 1. Protocol Overview

The AIO protocol abstracts the invocation and orchestration of agents across various transport types (stdio, http, mcp).  
When combined with the [Model Context Protocol (MCP)](https://modelcontextprotocol.io), it enables LLM-aware context agents with structured modular capabilities.

The protocol follows **JSON-RPC 2.0** across all layers.

---

## 2. Base JSON-RPC Call Structure

```json
{
  "jsonrpc": "2.0",
  "method": "<namespace>::<method>",
  "params": {...},
  "id": 1,
  "trace_id": "AIO-TR-20250326-0001"
}
```

---

## 3. Namespace & Trace ID Semantics

| Field           | Description                                            |
|----------------|--------------------------------------------------------|
| `method`        | Format: `agent_name::method_name`                     |
| `trace_id`      | Unique task session ID issued by Queen Agent          |
| `trace_id#id`   | Globally unique call identifier within execution graph|

---

## 4. Communication Types

Declared via `help`:

```json
{
  "type": "stdio" | "http" | "mcp",
  "methods": [...],
  "modalities": [...],
  "mcp": {
    "resources": true,
    "prompts": true,
    "tools": true,
    "sampling": true
  }
}
```

---

## 5. MCP-Type Interaction Semantics

When `type == "mcp"`, AIO clients must switch to **MCP-native method calls**, using the module interface namespaced to each agent:

| Module     | Method                     | Namespaced Form                     |
|------------|----------------------------|--------------------------------------|
| `resources`| `resources.list`, `get`    | `reader::resources.list`            |
| `prompts`  | `prompts.list`, `get`      | `summarizer::prompts.get`           |
| `tools`    | `tools.list`, `tools.call` | `math_agent::tools.call`            |
| `sampling` | `sampling.start`, `step`   | `llm_agent::sampling.start`         |

> ✅ **Note**: MCP agents DO NOT use the generic `input` method.

---

## 6. Multimodal Input/Output Format

Supported modality types:

| Type     | Format                     |
|----------|----------------------------|
| `text`   | UTF-8 string               |
| `image`  | base64 / public URL        |
| `audio`  | base64 / public URL (MP3)  |
| `video`  | base64 / URL (experimental)|
| `file`   | JSON, PDF in base64        |

---

## 7. Trace Structure (Execution Graph)

Each invocation must be attached to a trace entry, enabling accountability and reward calculation.

Example trace graph:

```json
{
  "trace_id": "AIO-TR-20250326-0001",
  "calls": [
    {
      "id": 1,
      "agent": "reader",
      "method": "resources.list",
      "input": {},
      "output": {...},
      "status": "ok"
    },
    {
      "id": 2,
      "agent": "reader",
      "method": "sampling.start",
      "input": {...},
      "output": {...}
    }
  ]
}
```

---

## 8. Appendix: MCP Module Interface Specs

### 8.1 `resources` Module

#### `resources.list`

```json
{
  "method": "agent::resources.list",
  "params": {},
  "id": 1,
  "trace_id": "..."
}
```

#### Response

```json
{
  "result": {
    "resources": [
      { "id": "doc-001", "title": "Spec Sheet", "type": "pdf" }
    ]
  }
}
```

---

### 8.2 `prompts` Module

#### `prompts.list`

Returns templated prompt definitions.

---

### 8.3 `tools` Module

#### `tools.call`

```json
{
  "method": "math_agent::tools.call",
  "params": {
    "tool": "calculate_area",
    "args": { "x": 3, "y": 4 }
  }
}
```

---

### 8.4 `sampling` Module

#### `sampling.start`

```json
{
  "method": "llm_agent::sampling.start",
  "params": {
    "input": {
      "type": "text",
      "value": "Please summarize this document..."
    }
  }
}
```

---

## ✅ Summary

- ✅ Unified protocol with namespaces to distinguish agent targets  
- ✅ Full support for MCP’s modular service model  
- ✅ Built-in execution tracing via `trace_id + id`  
- ✅ Multimodal I/O across all modules  
- ✅ Compatible with composable, decentralized AI agent orchestration

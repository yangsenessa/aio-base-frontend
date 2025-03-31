export const idlFactory = ({ IDL }) => {
  const Platform = IDL.Variant({
    'Linux' : IDL.Null,
    'Both' : IDL.Null,
    'Windows' : IDL.Null,
  });
  const AgentItem = IDL.Record({
    'id' : IDL.Nat64,
    'input_params' : IDL.Opt(IDL.Text),
    'image_url' : IDL.Opt(IDL.Text),
    'owner' : IDL.Text,
    'exec_file_url' : IDL.Opt(IDL.Text),
    'name' : IDL.Text,
    'homepage' : IDL.Opt(IDL.Text),
    'description' : IDL.Text,
    'platform' : Platform,
    'git_repo' : IDL.Text,
    'author' : IDL.Text,
    'version' : IDL.Text,
    'output_example' : IDL.Opt(IDL.Text),
  });
  const McpItem = IDL.Record({
    'id' : IDL.Nat64,
    'tools' : IDL.Bool,
    'remote_endpoint' : IDL.Opt(IDL.Text),
    'mcp_type' : IDL.Text,
    'owner' : IDL.Text,
    'resources' : IDL.Bool,
    'name' : IDL.Text,
    'homepage' : IDL.Opt(IDL.Text),
    'description' : IDL.Text,
    'git_repo' : IDL.Text,
    'author' : IDL.Text,
    'community_body' : IDL.Opt(IDL.Text),
    'sampling' : IDL.Bool,
    'prompts' : IDL.Bool,
  });
  const IOData = IDL.Record({ 'value' : IDL.Text, 'data_type' : IDL.Text });
  const CallItem = IDL.Record({
    'id' : IDL.Nat64,
    'protocol' : IDL.Text,
    'status' : IDL.Text,
    'method' : IDL.Text,
    'agent' : IDL.Text,
    'inputs' : IDL.Vec(IOData),
    'outputs' : IDL.Vec(IOData),
    'call_type' : IDL.Text,
  });
  const TraceItem = IDL.Record({
    'id' : IDL.Nat64,
    'updated_at' : IDL.Nat64,
    'owner' : IDL.Text,
    'metadata' : IDL.Opt(IDL.Text),
    'calls' : IDL.Vec(CallItem),
    'created_at' : IDL.Nat64,
    'trace_id' : IDL.Text,
  });
  return IDL.Service({
    'add_agent_item' : IDL.Func(
        [AgentItem],
        [IDL.Variant({ 'Ok' : IDL.Nat64, 'Err' : IDL.Text })],
        [],
      ),
    'add_mcp_item' : IDL.Func(
        [McpItem, IDL.Text],
        [IDL.Variant({ 'Ok' : IDL.Nat64, 'Err' : IDL.Text })],
        [],
      ),
    'add_trace' : IDL.Func(
        [TraceItem],
        [IDL.Variant({ 'Ok' : IDL.Nat64, 'Err' : IDL.Text })],
        [],
      ),
    'get_agent_item' : IDL.Func([IDL.Nat64], [IDL.Opt(AgentItem)], ['query']),
    'get_agent_item_by_name' : IDL.Func(
        [IDL.Text],
        [IDL.Opt(AgentItem)],
        ['query'],
      ),
    'get_agent_items_paginated' : IDL.Func(
        [IDL.Nat64, IDL.Nat64],
        [IDL.Vec(AgentItem)],
        ['query'],
      ),
    'get_all_agent_items' : IDL.Func([], [IDL.Vec(AgentItem)], ['query']),
    'get_all_mcp_items' : IDL.Func([], [IDL.Vec(McpItem)], ['query']),
    'get_mcp_item' : IDL.Func([IDL.Nat64], [IDL.Opt(McpItem)], ['query']),
    'get_mcp_item_by_name' : IDL.Func(
        [IDL.Text],
        [IDL.Opt(McpItem)],
        ['query'],
      ),
    'get_mcp_items_paginated' : IDL.Func(
        [IDL.Nat64, IDL.Nat64],
        [IDL.Vec(McpItem)],
        ['query'],
      ),
    'get_trace' : IDL.Func([IDL.Nat64], [IDL.Opt(TraceItem)], ['query']),
    'get_trace_by_id' : IDL.Func([IDL.Text], [IDL.Opt(TraceItem)], ['query']),
    'get_traces_paginated' : IDL.Func(
        [IDL.Nat64, IDL.Nat64],
        [IDL.Vec(TraceItem)],
        ['query'],
      ),
    'get_user_agent_items' : IDL.Func([], [IDL.Vec(AgentItem)], ['query']),
    'get_user_agent_items_paginated' : IDL.Func(
        [IDL.Nat64, IDL.Nat64],
        [IDL.Vec(AgentItem)],
        ['query'],
      ),
    'get_user_mcp_items' : IDL.Func([], [IDL.Vec(McpItem)], ['query']),
    'get_user_mcp_items_paginated' : IDL.Func(
        [IDL.Nat64, IDL.Nat64],
        [IDL.Vec(McpItem)],
        ['query'],
      ),
    'get_user_traces' : IDL.Func([], [IDL.Vec(TraceItem)], ['query']),
    'get_user_traces_paginated' : IDL.Func(
        [IDL.Nat64, IDL.Nat64],
        [IDL.Vec(TraceItem)],
        ['query'],
      ),
    'greet' : IDL.Func([IDL.Text], [IDL.Text], ['query']),
    'update_agent_item' : IDL.Func(
        [IDL.Nat64, AgentItem],
        [IDL.Variant({ 'Ok' : IDL.Null, 'Err' : IDL.Text })],
        [],
      ),
    'update_mcp_item' : IDL.Func(
        [IDL.Nat64, McpItem],
        [IDL.Variant({ 'Ok' : IDL.Null, 'Err' : IDL.Text })],
        [],
      ),
  });
};
export const init = ({ IDL }) => { return []; };

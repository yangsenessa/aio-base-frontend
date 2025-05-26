export const idlFactory = ({ IDL }) => {
  const SchemaProperty = IDL.Rec();
  const AccountInfo = IDL.Record({
    'unclaimed_balance' : IDL.Nat,
    'last_claim_time' : IDL.Nat64,
    'credit_balance' : IDL.Nat,
    'last_claim_amount' : IDL.Nat,
    'last_claim_timestamp' : IDL.Nat64,
    'principal_id' : IDL.Text,
    'token_balance' : IDL.Nat,
    'stack_balance' : IDL.Nat,
    'symbol' : IDL.Text,
  });
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
    'platform' : IDL.Opt(Platform),
    'git_repo' : IDL.Text,
    'author' : IDL.Text,
    'version' : IDL.Text,
    'output_example' : IDL.Opt(IDL.Text),
  });
  const TransferStatus = IDL.Variant({
    'Failed' : IDL.Null,
    'Completed' : IDL.Null,
    'Pending' : IDL.Null,
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
  const Account = IDL.Record({
    'owner' : IDL.Principal,
    'subaccount' : IDL.Opt(IDL.Vec(IDL.Nat8)),
  });
  const TraceItem = IDL.Record({
    'id' : IDL.Text,
    'status' : TransferStatus,
    'updated_at' : IDL.Nat64,
    'owner' : IDL.Text,
    'metadata' : IDL.Opt(IDL.Text),
    'calls' : IDL.Vec(CallItem),
    'created_at' : IDL.Nat64,
    'error' : IDL.Opt(IDL.Text),
    'to_account' : Account,
    'trace_id' : IDL.Text,
    'from_account' : Account,
    'amount' : IDL.Nat64,
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
    'exec_file' : IDL.Opt(IDL.Text),
  });
  const RiskMetrics = IDL.Record({
    'pattern_risk' : IDL.Float64,
    'amount_risk' : IDL.Float64,
    'frequency_risk' : IDL.Float64,
    'status_risk' : IDL.Float64,
  });
  const RiskFactor = IDL.Record({
    'factor_type' : IDL.Text,
    'description' : IDL.Text,
    'severity' : IDL.Float64,
  });
  const RiskLevel = IDL.Variant({
    'Low' : IDL.Null,
    'High' : IDL.Null,
    'Medium' : IDL.Null,
  });
  const RiskAnalysis = IDL.Record({
    'risk_metrics' : RiskMetrics,
    'risk_factors' : IDL.Vec(RiskFactor),
    'risk_level' : RiskLevel,
    'risk_score' : IDL.Float64,
    'suspicious_patterns' : IDL.Vec(RiskFactor),
  });
  const TransferResult = IDL.Record({
    'error' : IDL.Opt(IDL.Text),
    'success' : IDL.Bool,
    'block_height' : IDL.Opt(IDL.Nat64),
  });
  SchemaProperty.fill(
    IDL.Record({
      'description' : IDL.Opt(IDL.Text),
      'properties' : IDL.Opt(IDL.Vec(IDL.Tuple(IDL.Text, SchemaProperty))),
      'default' : IDL.Opt(IDL.Text),
      'required' : IDL.Opt(IDL.Vec(IDL.Text)),
      'property_type' : IDL.Text,
      'items' : IDL.Opt(SchemaProperty),
      'enum_values' : IDL.Opt(IDL.Vec(IDL.Text)),
    })
  );
  const InputSchema = IDL.Record({
    'schema_type' : IDL.Text,
    'properties' : IDL.Vec(IDL.Tuple(IDL.Text, SchemaProperty)),
    'required' : IDL.Opt(IDL.Vec(IDL.Text)),
  });
  const Method = IDL.Record({
    'name' : IDL.Text,
    'description' : IDL.Text,
    'required_params' : IDL.Opt(IDL.Vec(IDL.Text)),
    'input_schema' : IDL.Opt(InputSchema),
  });
  const Source = IDL.Record({
    'author' : IDL.Text,
    'version' : IDL.Text,
    'github' : IDL.Text,
  });
  const AioIndex = IDL.Record({
    'id' : IDL.Text,
    'methods' : IDL.Vec(Method),
    'source' : Source,
    'transport' : IDL.Vec(IDL.Text),
    'description' : IDL.Text,
    'scenarios' : IDL.Vec(IDL.Text),
    'author' : IDL.Text,
    'version' : IDL.Text,
    'keywords' : IDL.Vec(IDL.Text),
    'github' : IDL.Text,
  });
  return IDL.Service({
    'add_account' : IDL.Func(
        [IDL.Text, IDL.Text],
        [IDL.Variant({ 'Ok' : AccountInfo, 'Err' : IDL.Text })],
        [],
      ),
    'add_agent_item' : IDL.Func(
        [AgentItem, IDL.Text],
        [IDL.Variant({ 'Ok' : IDL.Nat64, 'Err' : IDL.Text })],
        [],
      ),
    'add_credit' : IDL.Func(
        [IDL.Text, IDL.Nat],
        [
          IDL.Variant({
            'Ok' : IDL.Record({ 'trace' : TraceItem, 'account' : AccountInfo }),
            'Err' : IDL.Text,
          }),
        ],
        [],
      ),
    'add_mcp_item' : IDL.Func(
        [McpItem, IDL.Text],
        [IDL.Variant({ 'Ok' : IDL.Nat64, 'Err' : IDL.Text })],
        [],
      ),
    'add_token_balance' : IDL.Func(
        [IDL.Text, IDL.Nat],
        [
          IDL.Variant({
            'Ok' : IDL.Record({ 'trace' : TraceItem, 'account' : AccountInfo }),
            'Err' : IDL.Text,
          }),
        ],
        [],
      ),
    'add_trace' : IDL.Func(
        [TraceItem],
        [IDL.Variant({ 'Ok' : IDL.Nat64, 'Err' : IDL.Text })],
        [],
      ),
    'add_unclaimed_balance' : IDL.Func(
        [IDL.Text, IDL.Nat],
        [
          IDL.Variant({
            'Ok' : IDL.Record({ 'trace' : TraceItem, 'account' : AccountInfo }),
            'Err' : IDL.Text,
          }),
        ],
        [],
      ),
    'analyze_risk' : IDL.Func(
        [IDL.Text, IDL.Opt(IDL.Nat64), IDL.Opt(IDL.Nat64)],
        [RiskAnalysis],
        ['query'],
      ),
    'batch_transfer' : IDL.Func(
        [IDL.Text, IDL.Vec(IDL.Tuple(Account, IDL.Nat))],
        [
          IDL.Variant({
            'Ok' : IDL.Record({
              'traces' : IDL.Vec(TraceItem),
              'results' : IDL.Vec(TransferResult),
              'account' : AccountInfo,
            }),
            'Err' : IDL.Text,
          }),
        ],
        [],
      ),
    'claim_token' : IDL.Func(
        [IDL.Text, IDL.Nat],
        [
          IDL.Variant({
            'Ok' : IDL.Record({ 'trace' : TraceItem, 'account' : AccountInfo }),
            'Err' : IDL.Text,
          }),
        ],
        [],
      ),
    'create_aio_index_from_json' : IDL.Func(
        [IDL.Text, IDL.Text],
        [IDL.Variant({ 'Ok' : IDL.Null, 'Err' : IDL.Text })],
        [],
      ),
    'delete_account' : IDL.Func(
        [IDL.Text],
        [IDL.Variant({ 'Ok' : IDL.Null, 'Err' : IDL.Text })],
        [],
      ),
    'delete_aio_index' : IDL.Func(
        [IDL.Text],
        [IDL.Variant({ 'Ok' : IDL.Null, 'Err' : IDL.Text })],
        [],
      ),
    'delete_inverted_index_by_mcp' : IDL.Func(
        [IDL.Text],
        [IDL.Variant({ 'Ok' : IDL.Null, 'Err' : IDL.Text })],
        [],
      ),
    'delete_mcp_item' : IDL.Func(
        [IDL.Text],
        [IDL.Variant({ 'Ok' : IDL.Null, 'Err' : IDL.Text })],
        [],
      ),
    'export_aio_index_to_json' : IDL.Func(
        [IDL.Text],
        [IDL.Variant({ 'Ok' : IDL.Text, 'Err' : IDL.Text })],
        ['query'],
      ),
    'find_inverted_index_by_confidence' : IDL.Func(
        [IDL.Float32],
        [IDL.Text],
        ['query'],
      ),
    'find_inverted_index_by_group' : IDL.Func(
        [IDL.Text],
        [IDL.Text],
        ['query'],
      ),
    'find_inverted_index_by_keyword' : IDL.Func(
        [IDL.Text],
        [IDL.Text],
        ['query'],
      ),
    'find_inverted_index_by_keywords' : IDL.Func(
        [IDL.Vec(IDL.Text), IDL.Float32],
        [IDL.Text],
        ['query'],
      ),
    'find_inverted_index_by_mcp' : IDL.Func([IDL.Text], [IDL.Text], ['query']),
    'get_account_info' : IDL.Func(
        [IDL.Text],
        [IDL.Opt(AccountInfo)],
        ['query'],
      ),
    'get_accounts_paginated' : IDL.Func(
        [IDL.Nat64, IDL.Nat64],
        [IDL.Vec(AccountInfo)],
        ['query'],
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
    'get_aio_index' : IDL.Func([IDL.Text], [IDL.Opt(AioIndex)], ['query']),
    'get_aio_indices_count' : IDL.Func([], [IDL.Nat64], ['query']),
    'get_aio_indices_paginated' : IDL.Func(
        [IDL.Nat64, IDL.Nat64],
        [IDL.Vec(AioIndex)],
        ['query'],
      ),
    'get_all_accounts' : IDL.Func([], [IDL.Vec(AccountInfo)], ['query']),
    'get_all_agent_items' : IDL.Func([], [IDL.Vec(AgentItem)], ['query']),
    'get_all_aio_indices' : IDL.Func([], [IDL.Vec(AioIndex)], ['query']),
    'get_all_inverted_index_items' : IDL.Func([], [IDL.Text], ['query']),
    'get_all_keywords' : IDL.Func([], [IDL.Text], ['query']),
    'get_all_mcp_items' : IDL.Func([], [IDL.Vec(McpItem)], ['query']),
    'get_balance_summary' : IDL.Func(
        [IDL.Text],
        [
          IDL.Record({
            'unclaimed_balance' : IDL.Nat,
            'credit_balance' : IDL.Nat,
            'token_balance' : IDL.Nat,
            'stack_balance' : IDL.Nat,
          }),
        ],
        ['query'],
      ),
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
    'get_traces_by_operation' : IDL.Func(
        [IDL.Text, IDL.Text],
        [IDL.Vec(TraceItem)],
        ['query'],
      ),
    'get_traces_by_status' : IDL.Func(
        [IDL.Text, TransferStatus],
        [IDL.Vec(TraceItem)],
        ['query'],
      ),
    'get_traces_by_time_period' : IDL.Func(
        [IDL.Text, IDL.Text],
        [IDL.Vec(TraceItem)],
        ['query'],
      ),
    'get_traces_paginated' : IDL.Func(
        [IDL.Nat64, IDL.Nat64],
        [IDL.Vec(TraceItem)],
        ['query'],
      ),
    'get_traces_sorted' : IDL.Func(
        [IDL.Text, IDL.Text, IDL.Bool],
        [IDL.Vec(TraceItem)],
        ['query'],
      ),
    'get_traces_statistics' : IDL.Func(
        [IDL.Text, IDL.Opt(IDL.Nat64), IDL.Opt(IDL.Nat64)],
        [
          IDL.Record({
            'total_amount' : IDL.Nat,
            'success_amount' : IDL.Nat,
            'failed_amount' : IDL.Nat,
            'total_count' : IDL.Nat64,
          }),
        ],
        ['query'],
      ),
    'get_traces_with_filters' : IDL.Func(
        [
          IDL.Text,
          IDL.Opt(IDL.Vec(IDL.Text)),
          IDL.Opt(IDL.Vec(TransferStatus)),
          IDL.Opt(IDL.Nat64),
          IDL.Opt(IDL.Nat64),
          IDL.Opt(IDL.Nat),
          IDL.Opt(IDL.Nat),
          IDL.Opt(IDL.Vec(Account)),
        ],
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
    'revert_Index_find_by_keywords_strategy' : IDL.Func(
        [IDL.Vec(IDL.Text)],
        [IDL.Text],
        ['query'],
      ),
    'search_aio_indices_by_keyword' : IDL.Func(
        [IDL.Text],
        [IDL.Vec(AioIndex)],
        ['query'],
      ),
    'stack_token' : IDL.Func(
        [IDL.Text, IDL.Nat],
        [
          IDL.Variant({
            'Ok' : IDL.Record({ 'trace' : TraceItem, 'account' : AccountInfo }),
            'Err' : IDL.Text,
          }),
        ],
        [],
      ),
    'store_inverted_index' : IDL.Func(
        [IDL.Text, IDL.Text],
        [IDL.Variant({ 'Ok' : IDL.Null, 'Err' : IDL.Text })],
        [],
      ),
    'transfer_tokens' : IDL.Func(
        [IDL.Text, Account, IDL.Nat],
        [
          IDL.Variant({
            'Ok' : IDL.Record({
              'result' : TransferResult,
              'trace' : TraceItem,
              'account' : AccountInfo,
            }),
            'Err' : IDL.Text,
          }),
        ],
        [],
      ),
    'unstack_token' : IDL.Func(
        [IDL.Text, IDL.Nat],
        [
          IDL.Variant({
            'Ok' : IDL.Record({ 'trace' : TraceItem, 'account' : AccountInfo }),
            'Err' : IDL.Text,
          }),
        ],
        [],
      ),
    'update_agent_item' : IDL.Func(
        [IDL.Nat64, AgentItem],
        [IDL.Variant({ 'Ok' : IDL.Null, 'Err' : IDL.Text })],
        [],
      ),
    'update_aio_index' : IDL.Func(
        [IDL.Text, IDL.Text],
        [IDL.Variant({ 'Ok' : IDL.Null, 'Err' : IDL.Text })],
        [],
      ),
    'update_mcp_item' : IDL.Func(
        [IDL.Nat64, McpItem],
        [IDL.Variant({ 'Ok' : IDL.Null, 'Err' : IDL.Text })],
        [],
      ),
    'use_credit' : IDL.Func(
        [IDL.Text, IDL.Nat],
        [
          IDL.Variant({
            'Ok' : IDL.Record({ 'trace' : TraceItem, 'account' : AccountInfo }),
            'Err' : IDL.Text,
          }),
        ],
        [],
      ),
  });
};
export const init = ({ IDL }) => { return []; };

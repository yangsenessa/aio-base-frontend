import type { Principal } from '@dfinity/principal';
import type { ActorMethod } from '@dfinity/agent';
import type { IDL } from '@dfinity/candid';

export interface Account {
  'owner' : Principal,
  'subaccount' : [] | [Uint8Array | number[]],
}
export interface AccountInfo {
  'unclaimed_balance' : bigint,
  'last_claim_time' : bigint,
  'credit_balance' : bigint,
  'last_claim_amount' : bigint,
  'last_claim_timestamp' : bigint,
  'principal_id' : string,
  'token_balance' : bigint,
  'stack_balance' : bigint,
  'symbol' : string,
}
export interface AgentItem {
  'id' : bigint,
  'input_params' : [] | [string],
  'image_url' : [] | [string],
  'owner' : string,
  'exec_file_url' : [] | [string],
  'name' : string,
  'homepage' : [] | [string],
  'description' : string,
  'platform' : [] | [Platform],
  'git_repo' : string,
  'author' : string,
  'version' : string,
  'output_example' : [] | [string],
}
export interface AioIndex {
  'id' : string,
  'methods' : Array<Method>,
  'source' : Source,
  'transport' : Array<string>,
  'description' : string,
  'scenarios' : Array<string>,
  'author' : string,
  'version' : string,
  'keywords' : Array<string>,
  'github' : string,
}
export interface CallItem {
  'id' : bigint,
  'protocol' : string,
  'status' : string,
  'method' : string,
  'agent' : string,
  'inputs' : Array<IOData>,
  'outputs' : Array<IOData>,
  'call_type' : string,
}
export interface IOData { 'value' : string, 'data_type' : string }
export interface InputSchema {
  'schema_type' : string,
  'properties' : Array<[string, SchemaProperty]>,
  'required' : [] | [Array<string>],
}
export interface InvertedIndexItem {
  'standard_match' : string,
  'keyword_group' : string,
  'mcp_name' : string,
  'method_name' : string,
  'source_field' : string,
  'keyword' : string,
  'confidence' : number,
}
export interface McpItem {
  'id' : bigint,
  'tools' : boolean,
  'remote_endpoint' : [] | [string],
  'mcp_type' : string,
  'owner' : string,
  'resources' : boolean,
  'name' : string,
  'homepage' : [] | [string],
  'description' : string,
  'git_repo' : string,
  'author' : string,
  'community_body' : [] | [string],
  'sampling' : boolean,
  'prompts' : boolean,
  'exec_file' : [] | [string],
}
export interface Method {
  'name' : string,
  'description' : string,
  'required_params' : [] | [Array<string>],
  'input_schema' : [] | [InputSchema],
}
export type Platform = { 'Linux' : null } |
  { 'Both' : null } |
  { 'Windows' : null };
export interface RiskAnalysis {
  'risk_metrics' : RiskMetrics,
  'risk_factors' : Array<RiskFactor>,
  'risk_level' : RiskLevel,
  'risk_score' : number,
  'suspicious_patterns' : Array<RiskFactor>,
}
export interface RiskFactor {
  'factor_type' : string,
  'description' : string,
  'severity' : number,
}
export type RiskLevel = { 'Low' : null } |
  { 'High' : null } |
  { 'Medium' : null };
export interface RiskMetrics {
  'pattern_risk' : number,
  'amount_risk' : number,
  'frequency_risk' : number,
  'status_risk' : number,
}
export interface SchemaProperty {
  'description' : [] | [string],
  'properties' : [] | [Array<[string, SchemaProperty]>],
  'default' : [] | [string],
  'required' : [] | [Array<string>],
  'property_type' : string,
  'items' : [] | [SchemaProperty],
  'enum_values' : [] | [Array<string>],
}
export interface Source {
  'author' : string,
  'version' : string,
  'github' : string,
}
export interface TraceItem {
  'id' : string,
  'status' : TransferStatus,
  'updated_at' : bigint,
  'owner' : string,
  'metadata' : [] | [string],
  'calls' : Array<CallItem>,
  'created_at' : bigint,
  'error' : [] | [string],
  'to_account' : Account,
  'trace_id' : string,
  'from_account' : Account,
  'amount' : bigint,
}
export type TraceStatus = { 'Ok' : null } |
  { 'Fail' : null } |
  { 'Recall' : null };
export interface TransferResult {
  'error' : [] | [string],
  'success' : boolean,
  'block_height' : [] | [bigint],
}
export type TransferStatus = { 'Failed' : null } |
  { 'Completed' : null } |
  { 'Pending' : null };
export interface WorkItem {
  'id' : bigint,
  'status' : WorkStatus,
  'title' : string,
  'updated_at' : bigint,
  'owner' : string,
  'metadata' : [] | [string],
  'tags' : Array<string>,
  'description' : string,
  'created_at' : bigint,
  'assigned_to' : [] | [string],
}
export type WorkStatus = { 'Todo' : null } |
  { 'Cancelled' : null } |
  { 'InProgress' : null } |
  { 'Completed' : null };
export interface _SERVICE {
  'add_account' : ActorMethod<
    [string, string],
    { 'Ok' : AccountInfo } |
      { 'Err' : string }
  >,
  'add_agent_item' : ActorMethod<
    [AgentItem, string],
    { 'Ok' : bigint } |
      { 'Err' : string }
  >,
  'add_credit' : ActorMethod<
    [string, bigint],
    { 'Ok' : { 'trace' : TraceItem, 'account' : AccountInfo } } |
      { 'Err' : string }
  >,
  'add_mcp_item' : ActorMethod<
    [McpItem, string],
    { 'Ok' : bigint } |
      { 'Err' : string }
  >,
  'add_token_balance' : ActorMethod<
    [string, bigint],
    { 'Ok' : { 'trace' : TraceItem, 'account' : AccountInfo } } |
      { 'Err' : string }
  >,
  'add_trace' : ActorMethod<
    [TraceItem],
    { 'Ok' : bigint } |
      { 'Err' : string }
  >,
  'add_unclaimed_balance' : ActorMethod<
    [string, bigint],
    { 'Ok' : { 'trace' : TraceItem, 'account' : AccountInfo } } |
      { 'Err' : string }
  >,
  'analyze_risk' : ActorMethod<
    [string, [] | [bigint], [] | [bigint]],
    RiskAnalysis
  >,
  'batch_transfer' : ActorMethod<
    [string, Array<[Account, bigint]>],
    {
        'Ok' : {
          'traces' : Array<TraceItem>,
          'results' : Array<TransferResult>,
          'account' : AccountInfo,
        }
      } |
      { 'Err' : string }
  >,
  'claim_token' : ActorMethod<
    [string, bigint],
    { 'Ok' : { 'trace' : TraceItem, 'account' : AccountInfo } } |
      { 'Err' : string }
  >,
  'create_aio_index_from_json' : ActorMethod<
    [string, string],
    { 'Ok' : null } |
      { 'Err' : string }
  >,
  'delete_account' : ActorMethod<
    [string],
    { 'Ok' : null } |
      { 'Err' : string }
  >,
  'delete_aio_index' : ActorMethod<
    [string],
    { 'Ok' : null } |
      { 'Err' : string }
  >,
  'delete_inverted_index_by_mcp' : ActorMethod<
    [string],
    { 'Ok' : null } |
      { 'Err' : string }
  >,
  'delete_mcp_item' : ActorMethod<
    [string],
    { 'Ok' : null } |
      { 'Err' : string }
  >,
  'export_aio_index_to_json' : ActorMethod<
    [string],
    { 'Ok' : string } |
      { 'Err' : string }
  >,
  'find_inverted_index_by_confidence' : ActorMethod<[number], string>,
  'find_inverted_index_by_group' : ActorMethod<[string], string>,
  'find_inverted_index_by_keyword' : ActorMethod<[string], string>,
  'find_inverted_index_by_keywords' : ActorMethod<
    [Array<string>, number],
    string
  >,
  'find_inverted_index_by_mcp' : ActorMethod<[string], string>,
  'get_account_info' : ActorMethod<[string], [] | [AccountInfo]>,
  'get_accounts_paginated' : ActorMethod<[bigint, bigint], Array<AccountInfo>>,
  'get_agent_item' : ActorMethod<[bigint], [] | [AgentItem]>,
  'get_agent_item_by_name' : ActorMethod<[string], [] | [AgentItem]>,
  'get_agent_items_paginated' : ActorMethod<[bigint, bigint], Array<AgentItem>>,
  'get_aio_index' : ActorMethod<[string], [] | [AioIndex]>,
  'get_aio_indices_count' : ActorMethod<[], bigint>,
  'get_aio_indices_paginated' : ActorMethod<[bigint, bigint], Array<AioIndex>>,
  'get_all_accounts' : ActorMethod<[], Array<AccountInfo>>,
  'get_all_agent_items' : ActorMethod<[], Array<AgentItem>>,
  'get_all_aio_indices' : ActorMethod<[], Array<AioIndex>>,
  'get_all_inverted_index_items' : ActorMethod<[], string>,
  'get_all_keywords' : ActorMethod<[], string>,
  'get_all_mcp_items' : ActorMethod<[], Array<McpItem>>,
  'get_balance_summary' : ActorMethod<
    [string],
    {
      'unclaimed_balance' : bigint,
      'credit_balance' : bigint,
      'token_balance' : bigint,
      'stack_balance' : bigint,
    }
  >,
  'get_mcp_item' : ActorMethod<[bigint], [] | [McpItem]>,
  'get_mcp_item_by_name' : ActorMethod<[string], [] | [McpItem]>,
  'get_mcp_items_paginated' : ActorMethod<[bigint, bigint], Array<McpItem>>,
  'get_trace' : ActorMethod<[bigint], [] | [TraceItem]>,
  'get_trace_by_id' : ActorMethod<[string], [] | [TraceItem]>,
  'get_traces_by_operation' : ActorMethod<[string, string], Array<TraceItem>>,
  'get_traces_by_status' : ActorMethod<
    [string, TransferStatus],
    Array<TraceItem>
  >,
  'get_traces_by_time_period' : ActorMethod<[string, string], Array<TraceItem>>,
  'get_traces_paginated' : ActorMethod<[bigint, bigint], Array<TraceItem>>,
  'get_traces_sorted' : ActorMethod<
    [string, string, boolean],
    Array<TraceItem>
  >,
  'get_traces_statistics' : ActorMethod<
    [string, [] | [bigint], [] | [bigint]],
    {
      'total_amount' : bigint,
      'success_amount' : bigint,
      'failed_amount' : bigint,
      'total_count' : bigint,
    }
  >,
  'get_traces_with_filters' : ActorMethod<
    [
      string,
      [] | [Array<string>],
      [] | [Array<TransferStatus>],
      [] | [bigint],
      [] | [bigint],
      [] | [bigint],
      [] | [bigint],
      [] | [Array<Account>],
    ],
    Array<TraceItem>
  >,
  'get_user_agent_items' : ActorMethod<[], Array<AgentItem>>,
  'get_user_agent_items_paginated' : ActorMethod<
    [bigint, bigint],
    Array<AgentItem>
  >,
  'get_user_mcp_items' : ActorMethod<[], Array<McpItem>>,
  'get_user_mcp_items_paginated' : ActorMethod<
    [bigint, bigint],
    Array<McpItem>
  >,
  'get_user_traces' : ActorMethod<[], Array<TraceItem>>,
  'get_user_traces_paginated' : ActorMethod<[bigint, bigint], Array<TraceItem>>,
  'greet' : ActorMethod<[string], string>,
  'revert_Index_find_by_keywords_strategy' : ActorMethod<
    [Array<string>],
    string
  >,
  'search_aio_indices_by_keyword' : ActorMethod<[string], Array<AioIndex>>,
  'stack_token' : ActorMethod<
    [string, bigint],
    { 'Ok' : { 'trace' : TraceItem, 'account' : AccountInfo } } |
      { 'Err' : string }
  >,
  'store_inverted_index' : ActorMethod<
    [string, string],
    { 'Ok' : null } |
      { 'Err' : string }
  >,
  'transfer_tokens' : ActorMethod<
    [string, Account, bigint],
    {
        'Ok' : {
          'result' : TransferResult,
          'trace' : TraceItem,
          'account' : AccountInfo,
        }
      } |
      { 'Err' : string }
  >,
  'unstack_token' : ActorMethod<
    [string, bigint],
    { 'Ok' : { 'trace' : TraceItem, 'account' : AccountInfo } } |
      { 'Err' : string }
  >,
  'update_agent_item' : ActorMethod<
    [bigint, AgentItem],
    { 'Ok' : null } |
      { 'Err' : string }
  >,
  'update_aio_index' : ActorMethod<
    [string, string],
    { 'Ok' : null } |
      { 'Err' : string }
  >,
  'update_mcp_item' : ActorMethod<
    [bigint, McpItem],
    { 'Ok' : null } |
      { 'Err' : string }
  >,
  'use_credit' : ActorMethod<
    [string, bigint],
    { 'Ok' : { 'trace' : TraceItem, 'account' : AccountInfo } } |
      { 'Err' : string }
  >,
}
export declare const idlFactory: IDL.InterfaceFactory;
export declare const init: (args: { IDL: typeof IDL }) => IDL.Type[];

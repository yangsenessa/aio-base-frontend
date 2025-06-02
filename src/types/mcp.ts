
export interface McpStackRecord {
  principal_id: string;
  mcp_name: string;
  stack_time: bigint;
  stack_amount: bigint;
  stack_status: StackStatus;
}

export type StackStatus = 
  | { Active: null }
  | { Completed: null }
  | { Cancelled: null }
  | { Pending: null };

export const formatStackStatus = (status: StackStatus): string => {
  if ('Active' in status) return 'Active';
  if ('Completed' in status) return 'Completed';
  if ('Cancelled' in status) return 'Cancelled';
  if ('Pending' in status) return 'Pending';
  return 'Unknown';
};

export const getStackStatusColor = (status: StackStatus): string => {
  if ('Active' in status) return 'bg-green-100 text-green-800 border-green-200';
  if ('Completed' in status) return 'bg-blue-100 text-blue-800 border-blue-200';
  if ('Cancelled' in status) return 'bg-red-100 text-red-800 border-red-200';
  if ('Pending' in status) return 'bg-yellow-100 text-yellow-800 border-yellow-200';
  return 'bg-gray-100 text-gray-800 border-gray-200';
};

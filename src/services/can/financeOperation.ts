import { getActor, getPrincipalFromPlug } from './actorManager';
import { loggedCanisterCall } from './callUtils';
import type { AccountInfo, TokenGrant } from 'declarations/aio-base-backend/aio-base-backend.did.d.ts';

/**
 * Get account info for the current principal. If not found, add a new account and return its info.
 * @returns Promise resolving to AccountInfo or throws error
 */
export const getAccountInfo = async (): Promise<AccountInfo> => {
  return loggedCanisterCall('getAccountInfo', {}, async () => {
    const actor = await getActor() as any;
    const principalId = await getPrincipalFromPlug();
    if (!principalId) {
      throw new Error('No principal found. Please connect your wallet.');
    }
    if (!actor.get_account_info || !actor.add_account) {
      throw new Error('Backend does not support account info operations.');
    }
    // Try to get account info
    const infoResult = await actor.get_account_info(principalId);
    if (infoResult.length > 0) {
      return infoResult[0];
    }
    // If not found, try to add account
    const addResult = await actor.add_account(principalId);
    if ('Ok' in addResult) {
      return addResult.Ok;
    } else {
      throw new Error('Failed to add account: ' + (addResult.Err || 'Unknown error'));
    }
  });
};

/**
 * Stack credits for the current principal
 * @param amount Amount of credits to stack
 * @returns Promise resolving to updated account info or throws error
 */
export const stackCredit = async (amount: number): Promise<AccountInfo> => {
  return loggedCanisterCall('stackCredit', { amount }, async () => {
    const actor = await getActor() as any;
    const principalId = await getPrincipalFromPlug();
    if (!principalId) {
      throw new Error('No principal found. Please connect your wallet.');
    }
    if (!actor.stack_credit) {
      throw new Error('Backend does not support credit stacking operations.');
    }
    const result = await actor.stack_credit(principalId, BigInt(amount));
    if ('Ok' in result) {
      return result.Ok;
    } else {
      throw new Error('Failed to stack credits: ' + (result.Err || 'Unknown error'));
    }
  });
};

/**
 * Unstack credits for the current principal
 * @param amount Amount of credits to unstack
 * @returns Promise resolving to updated account info or throws error
 */
export const unstackCredit = async (amount: number): Promise<AccountInfo> => {
  return loggedCanisterCall('unstackCredit', { amount }, async () => {
    const actor = await getActor() as any;
    const principalId = await getPrincipalFromPlug();
    if (!principalId) {
      throw new Error('No principal found. Please connect your wallet.');
    }
    if (!actor.unstack_credit) {
      throw new Error('Backend does not support credit unstacking operations.');
    }
    const result = await actor.unstack_credit(principalId, BigInt(amount));
    if ('Ok' in result) {
      return result.Ok;
    } else {
      throw new Error('Failed to unstack credits: ' + (result.Err || 'Unknown error'));
    }
  });
};

/**
 * Get token grant information for the current principal
 * @returns Promise resolving to token grant information or throws error
 */
export const getTokenGrant = async () => {
  return loggedCanisterCall('getTokenGrant', {}, async () => {
    const actor = await getActor() as any;
    const principalId = await getPrincipalFromPlug();
    if (!principalId) {
      throw new Error('No principal found. Please connect your wallet.');
    }
    if (!actor.get_token_grant) {
      throw new Error('Backend does not support token grant operations.');
    }
    const result = await actor.get_token_grant(principalId);
    if ('Ok' in result) {
      return result.Ok;
    } else {
      throw new Error('Failed to get token grant: ' + (result.Err || 'Unknown error'));
    }
  });
};

/**
 * Create a new token grant
 * @param grant TokenGrant object containing grant details
 * @returns Promise resolving to success or throws error
 */
export const createTokenGrant = async (grant: TokenGrant) => {
  return loggedCanisterCall('createTokenGrant', { grant }, async () => {
    const actor = await getActor() as any;
    if (!actor.create_token_grant) {
      throw new Error('Backend does not support token grant operations.');
    }
    const result = await actor.create_token_grant(grant);
    if ('Ok' in result) {
      return result.Ok;
    } else {
      throw new Error('Failed to create token grant: ' + (result.Err || 'Unknown error'));
    }
  });
};

/**
 * Claim a token grant for the current principal
 * @returns Promise resolving to claimed amount or throws error
 */
export const claimTokenGrant = async () => {
  return loggedCanisterCall('claimTokenGrant', {}, async () => {
    const actor = await getActor() as any;
    const principalId = await getPrincipalFromPlug();
    if (!principalId) {
      throw new Error('No principal found. Please connect your wallet.');
    }
    if (!actor.claim_grant) {
      throw new Error('Backend does not support token grant operations.');
    }
    const result = await actor.claim_grant(principalId);
    if ('Ok' in result) {
      return result.Ok;
    } else {
      throw new Error('Failed to claim token grant: ' + (result.Err || 'Unknown error'));
    }
  });
};

/**
 * Claim rewards for the current principal
 * @returns Promise resolving to claimed reward amount or throws error
 */
export const claimRewards = async () => {
  return loggedCanisterCall('claimRewards', {}, async () => {
    const actor = await getActor() as any;
    const principalId = await getPrincipalFromPlug();
    if (!principalId) {
      throw new Error('No principal found. Please connect your wallet.');
    }
    if (!actor.claim_rewards) {
      throw new Error('Backend does not support reward operations.');
    }
    try {
      const result = await actor.claim_rewards(principalId);
      if ('Ok' in result) {
        return result.Ok;
      } else if ('Err' in result) {
        throw new Error(result.Err);
      } else {
        throw new Error('Unexpected response from backend.');
      }
    } catch (error) {
      throw new Error('Failed to claim rewards: ' + (error instanceof Error ? error.message : String(error)));
    }
  });
};

/**
 * Check if the current principal is a new user
 * @returns Promise resolving to boolean indicating if user is new
 */
export const checkIsNewUser = async (): Promise<boolean> => {
  return loggedCanisterCall('check_is_newuser', {}, async () => {
    const actor = await getActor() as any;
    const principalId = await getPrincipalFromPlug();
    if (!principalId) {
      throw new Error('No principal found. Please connect your wallet.');
    }
    if (!actor.check_is_newuser) {
      throw new Error('Backend does not support new user check operations.');
    }
    return await actor.check_is_newuser(principalId);
  });
};

/**
 * Initialize grant policy with default or custom policy
 * @returns Promise resolving to void or throws error
 */
export const initGrantPolicy = async () => {
  return loggedCanisterCall('initGrantPolicy', {}, async () => {
    const actor = await getActor() as any;
    if (!actor.init_grant_policy) {
      throw new Error('Backend does not support grant policy operations.');
    }
    await actor.init_grant_policy([]); // Pass empty array to use default policy
  });
};

/**
 * Create and claim a new user grant for the specified principal
 * @param principalId The principal ID to create and claim grant for
 * @returns Promise resolving to claimed amount or throws error
 */
export const createAndClaimNewUserGrant = async (): Promise<number> => {
  return loggedCanisterCall('createAndClaimNewUserGrant',{}, async () => {
    const actor = await getActor() as any;
    const principalId = await getPrincipalFromPlug();
    if (!actor.create_and_claim_newuser_grant) {
      throw new Error('Backend does not support new user grant operations.');
    }
    const result = await actor.create_and_claim_newuser_grant(principalId);
    if ('Ok' in result) {
      return Number(result.Ok);
    } else {
      throw new Error('Failed to create and claim new user grant: ' + (result.Err || 'Unknown error'));
    }
  });
};

/**
 * Create and claim a new MCP grant for the specified principal and MCP
 * @param mcpName The name of the MCP to create and claim grant for
 * @returns Promise resolving to claimed amount or throws error
 */
export const createAndClaimNewMcpGrant = async (mcpName: string): Promise<number> => {
  return loggedCanisterCall('createAndClaimNewMcpGrant', { mcpName }, async () => {
    const actor = await getActor() as any;
    const principalId = await getPrincipalFromPlug();
    if (!principalId) {
      throw new Error('No principal found. Please connect your wallet.');
    }
    if (!actor.create_and_claim_newmcp_grant) {
      throw new Error('Backend does not support MCP grant operations.');
    }
    const result = await actor.create_and_claim_newmcp_grant(principalId, mcpName);
    if ('Ok' in result) {
      return Number(result.Ok);
    } else {
      throw new Error('Failed to create and claim new MCP grant: ' + (result.Err || 'Unknown error'));
    }
  });
};

/**
 * Calculate unclaimed rewards for the current principal
 * @returns Promise resolving to unclaimed reward amount or throws error
 */
export const calUnclaimRewards = async (): Promise<number> => {
  return loggedCanisterCall('calUnclaimRewards', {}, async () => {
    const actor = await getActor() as any;
    const principalId = await getPrincipalFromPlug();
    if (!principalId) {
      throw new Error('No principal found. Please connect your wallet.');
    }
    if (!actor.cal_unclaim_rewards) {
      throw new Error('Backend does not support unclaimed rewards calculation.');
    }
    const result = await actor.cal_unclaim_rewards(principalId);
    return Number(result);
  });
};

/**
 * Get total claimable AIO tokens for the current principal
 * @returns Promise resolving to total claimable AIO tokens amount or throws error
 */
export const getTotalAioTokenClaimable = async (): Promise<number> => {
  return loggedCanisterCall('getTotalAioTokenClaimable', {}, async () => {
    const actor = await getActor() as any;
  
    if (!actor.get_total_aiotoken_claimable) {
      throw new Error('Backend does not support total AIO token claimable calculation.');
    }
    const result = await actor.get_total_aiotoken_claimable();
    return Number(result);
  });
};

/**
 * Get stacked record group by stack amount
 * @returns Promise resolving to array of StackPositionRecord or throws error
 */
export const getStackedRecordGroupByStackAmount = async () => {
  return loggedCanisterCall('get_stacked_record_group_by_stack_amount', {}, async () => {
    const actor = await getActor() as any;
    if (!actor.get_stacked_record_group_by_stack_amount) {
      throw new Error('Backend does not support stacked record group operations.');
    }
    const result = await actor.get_stacked_record_group_by_stack_amount();
    return result.map((record: any) => ({
      id: Number(record.id),
      mcp_name: record.mcp_name,
      stack_amount: Number(record.stack_amount)
    }));
  });
};

/**
 * Get MCP rewards with pagination
 * @param offset Starting index for pagination
 * @param limit Number of records to return
 * @returns Promise resolving to array of MCP rewards or throws error
 */
export const getMcpRewardsPaginated = async (offset: bigint, limit: bigint) => {
  return loggedCanisterCall('getMcpRewardsPaginated', { offset, limit }, async () => {
    const actor = await getActor() as any;
    if (!actor.get_mcp_rewards_paginated) {
      throw new Error('Backend does not support MCP rewards pagination operations.');
    }
    const result = await actor.get_mcp_rewards_paginated(offset, limit);
    return result.map((reward: any) => ({
      principalId: reward.principal_id.toString(),
      mcpName: reward.mcp_name,
      rewardAmount: Number(reward.reward_amount),
      blockId: Number(reward.block_id),
      status: reward.status
    }));
  });
};

/**
 * Get recharge principal account information
 * @param principalId The principal ID to get account info for
 * @returns Promise resolving to RechargePrincipalAccount or null if not found
 */
export const getRechargePrincipalAccountApi = async (principalId: string) => {
  return loggedCanisterCall('getRechargePrincipalAccountApi', { principalId }, async () => {
    const actor = await getActor() as any;
    if (!actor.get_recharge_principal_account_api) {
      throw new Error('Backend does not support recharge principal account operations.');
    }
    const result = await actor.get_recharge_principal_account_api(principalId);
    return result.length > 0 ? result[0] : null;
  });
};

/**
 * Simulate credit conversion from ICP amount
 * @param icpAmount The ICP amount to simulate conversion for
 * @returns Promise resolving to number of credits that would be obtained
 */
export const simulateCreditFromIcpApi = async (icpAmount: number): Promise<number> => {
  return loggedCanisterCall('simulateCreditFromIcpApi', { icpAmount }, async () => {
    const actor = await getActor() as any;
    if (!actor.simulate_credit_from_icp_api) {
      throw new Error('Backend does not support credit simulation operations.');
    }
    const result = await actor.simulate_credit_from_icp_api(icpAmount);
    return Number(result);
  });
};

/**
 * Recharge and convert ICP to credits
 * @param icpAmount The ICP amount to recharge and convert
 * @returns Promise resolving to number of credits obtained
 */
export const rechargeAndConvertCreditsApi = async (icpAmount: number): Promise<number> => {
  return loggedCanisterCall('rechargeAndConvertCreditsApi', { icpAmount }, async () => {
    const actor = await getActor() as any;
    if (!actor.recharge_and_convert_credits_api) {
      throw new Error('Backend does not support recharge and convert operations.');
    }
    const result = await actor.recharge_and_convert_credits_api(icpAmount);
    return Number(result);
  });
};

/**
 * Get the current exchange rate of credits per ICP
 * @returns Promise resolving to number of credits per ICP
 */
export const getCreditsPerIcpApi = async (): Promise<number> => {
  return loggedCanisterCall('getCreditsPerIcpApi', {}, async () => {
    const actor = await getActor() as any;
    if (!actor.get_credits_per_icp_api) {
      throw new Error('Backend does not support credits per ICP rate operations.');
    }
    const result = await actor.get_credits_per_icp_api();
    return Number(result);
  });
};










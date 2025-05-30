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
    if (!actor.claim_reward) {
      throw new Error('Backend does not support reward operations.');
    }
    const result = await actor.claim_reward(principalId);
    if ('Ok' in result) {
      return result.Ok;
    } else {
      throw new Error('Failed to claim rewards: ' + (result.Err || 'Unknown error'));
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
export const createAndClaimNewUserGrant = async (principalId: string): Promise<number> => {
  return loggedCanisterCall('createAndClaimNewUserGrant', { principalId }, async () => {
    const actor = await getActor() as any;
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




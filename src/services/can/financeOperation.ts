import { getActor, getPrincipalFromPlug } from './actorManager';
import { loggedCanisterCall } from './callUtils';
import type { AccountInfo } from 'declarations/aio-base-backend/aio-base-backend.did.d.ts';

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
    // If not found, try to add account (requires two string arguments)
    const addResult = await actor.add_account(principalId, principalId);
    if ('Ok' in addResult) {
      return addResult.Ok;
    } else {
      throw new Error('Failed to add account: ' + (addResult.Err || 'Unknown error'));
    }
  });
};

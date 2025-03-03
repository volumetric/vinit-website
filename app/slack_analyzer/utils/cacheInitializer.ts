'use client';

import userCache from '../services/userCache';
import slackUserDbService from '../services/slackUserDbService';

/**
 * Initializes the user cache by preloading users for active workspaces
 * This can be called when the application starts
 */
export async function initializeUserCache(options: {
  maxWorkspaces?: number;
  maxUsersPerWorkspace?: number;
  ttlMs?: number;
} = {}): Promise<{
  workspaces: number;
  users: number;
}> {
  const {
    maxWorkspaces = 5,
    maxUsersPerWorkspace = 1000,
    ttlMs = 3600000 // 1 hour default
  } = options;
  
  try {
    // Set the TTL for the cache
    userCache.setTTL(ttlMs);
    
    // Get active workspaces from Supabase
    // This is a placeholder - you would need to implement this method in slackUserDbService
    const workspaces = await slackUserDbService.getActiveWorkspaces(maxWorkspaces);
    
    let totalUsers = 0;
    
    // Load users for each workspace
    for (const workspace of workspaces) {
      const users = await slackUserDbService.getUsersByWorkspace(
        workspace.id,
        maxUsersPerWorkspace
      );
      
      // Add users to cache
      userCache.addUsers(users);
      totalUsers += users.length;
    }
    
    console.log(`User cache initialized with ${totalUsers} users from ${workspaces.length} workspaces`);
    
    return {
      workspaces: workspaces.length,
      users: totalUsers
    };
  } catch (error) {
    console.error('Error initializing user cache:', error);
    return {
      workspaces: 0,
      users: 0
    };
  }
}

/**
 * Schedules periodic cache refresh
 * @param intervalMs Refresh interval in milliseconds
 */
export function scheduleUserCacheRefresh(intervalMs: number = 3600000): () => void {
  console.log(`Scheduling user cache refresh every ${intervalMs / 60000} minutes`);
  
  // Start the refresh interval
  const intervalId = setInterval(async () => {
    try {
      // Get all workspaces in the cache
      const stats = userCache.getStats();
      console.log(`Refreshing user cache for ${stats.workspaces} workspaces...`);
      
      // This is a simplified approach - in a real app, you would refresh
      // each workspace individually and handle errors for each one
      const workspaces = await slackUserDbService.getActiveWorkspaces();
      
      for (const workspace of workspaces) {
        await userCache.refreshWorkspace(workspace.id);
      }
      
      console.log('User cache refresh completed');
    } catch (error) {
      console.error('Error during scheduled user cache refresh:', error);
    }
  }, intervalMs);
  
  // Return a function to clear the interval
  return () => clearInterval(intervalId);
} 
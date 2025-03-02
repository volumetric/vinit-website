import { SlackUser } from '@/app/slack_analyzer/types/database';
import slackUserDbService from './slackUserDbService';

/**
 * In-memory cache for Slack user data
 */
class UserCache {
  private static instance: UserCache;
  private cache: Map<string, SlackUser> = new Map();
  private lastRefresh: Map<string, number> = new Map();
  private ttlMs: number = 3600000; // 1 hour default TTL
  
  // Private constructor for singleton pattern
  private constructor() {}
  
  /**
   * Get the singleton instance
   */
  public static getInstance(): UserCache {
    if (!UserCache.instance) {
      UserCache.instance = new UserCache();
    }
    return UserCache.instance;
  }
  
  /**
   * Set the time-to-live (TTL) for cached entries
   */
  public setTTL(ttlMs: number): void {
    this.ttlMs = ttlMs;
  }
  
  /**
   * Create a composite key for the cache
   */
  private createKey(workspaceId: string, userId: string): string {
    return `${workspaceId}:${userId}`;
  }
  
  /**
   * Add a user to the cache
   */
  public addUser(user: SlackUser): void {
    const key = this.createKey(user.workspace_id, user.user_id);
    this.cache.set(key, user);
    this.lastRefresh.set(key, Date.now());
  }
  
  /**
   * Add multiple users to the cache
   */
  public addUsers(users: SlackUser[]): void {
    users.forEach(user => this.addUser(user));
  }
  
  /**
   * Get a user from the cache by their ID
   * If not found in cache, tries to fetch from database
   */
  public async getUser(workspaceId: string, userId: string): Promise<SlackUser | null> {
    const key = this.createKey(workspaceId, userId);
    
    // Check if in cache and not expired
    if (this.cache.has(key)) {
      const lastRefreshTime = this.lastRefresh.get(key) || 0;
      if (Date.now() - lastRefreshTime < this.ttlMs) {
        return this.cache.get(key) || null;
      }
    }
    
    // Not in cache or expired, fetch from database
    const user = await slackUserDbService.getUserByUserId(workspaceId, userId);
    
    if (user) {
      this.addUser(user);
    }
    
    return user;
  }
  
  /**
   * Get all users for a workspace
   * Loads from database if not in cache
   */
  public async getUsersForWorkspace(workspaceId: string): Promise<SlackUser[]> {
    // Check if users for this workspace are in cache
    let workspaceUsers = Array.from(this.cache.values())
      .filter(user => user.workspace_id === workspaceId);
    
    // If no users in cache or first user is expired, reload from database
    if (workspaceUsers.length === 0 || this.isWorkspaceExpired(workspaceId)) {
      const users = await slackUserDbService.getUsersByWorkspace(workspaceId);
      
      if (users.length > 0) {
        this.addUsers(users);
        workspaceUsers = users;
      }
    }
    
    return workspaceUsers;
  }
  
  /**
   * Check if workspace cache is expired
   */
  private isWorkspaceExpired(workspaceId: string): boolean {
    const workspaceKeys = Array.from(this.lastRefresh.keys())
      .filter(key => key.startsWith(`${workspaceId}:`));
    
    if (workspaceKeys.length === 0) {
      return true;
    }
    
    // Check if any key is expired
    const now = Date.now();
    return workspaceKeys.some(key => {
      const lastRefresh = this.lastRefresh.get(key) || 0;
      return now - lastRefresh > this.ttlMs;
    });
  }
  
  /**
   * Refresh the cache for a specific user
   */
  public async refreshUser(workspaceId: string, userId: string): Promise<SlackUser | null> {
    const user = await slackUserDbService.getUserByUserId(workspaceId, userId);
    
    if (user) {
      this.addUser(user);
    } else {
      // Remove from cache if not found in database
      const key = this.createKey(workspaceId, userId);
      this.cache.delete(key);
      this.lastRefresh.delete(key);
    }
    
    return user;
  }
  
  /**
   * Refresh all users for a workspace
   */
  public async refreshWorkspace(workspaceId: string): Promise<SlackUser[]> {
    const users = await slackUserDbService.getUsersByWorkspace(workspaceId);
    
    // Remove all existing users for this workspace
    const keysToRemove = Array.from(this.cache.keys())
      .filter(key => key.startsWith(`${workspaceId}:`));
    
    keysToRemove.forEach(key => {
      this.cache.delete(key);
      this.lastRefresh.delete(key);
    });
    
    // Add the fresh users
    this.addUsers(users);
    
    return users;
  }
  
  /**
   * Clear the entire cache
   */
  public clear(): void {
    this.cache.clear();
    this.lastRefresh.clear();
  }
  
  /**
   * Get cache statistics
   */
  public getStats(): any {
    return {
      size: this.cache.size,
      workspaces: new Set(Array.from(this.cache.values()).map(u => u.workspace_id)).size,
      oldest: Math.min(...Array.from(this.lastRefresh.values())),
      newest: Math.max(...Array.from(this.lastRefresh.values())),
      ttlMs: this.ttlMs
    };
  }
}

// Export the singleton instance
export default UserCache.getInstance(); 
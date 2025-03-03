'use client';

import { useState, useEffect } from 'react';
import userCache from '../services/userCache';
import { SlackUser } from '../types/database';

interface UseUserCacheOptions {
  workspaceId: string | null;
  autoLoad?: boolean;
  ttlMs?: number;
}

interface UseUserCacheResult {
  users: SlackUser[];
  loading: boolean;
  error: string | null;
  refreshCache: () => Promise<void>;
  getCacheStats: () => any;
}

/**
 * Hook for initializing and managing the user cache
 * Provides methods for loading and refreshing user data
 */
export default function useUserCache({
  workspaceId,
  autoLoad = true,
  ttlMs = 3600000 // 1 hour default
}: UseUserCacheOptions): UseUserCacheResult {
  const [users, setUsers] = useState<SlackUser[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Set the TTL when the hook is initialized
  useEffect(() => {
    userCache.setTTL(ttlMs);
  }, [ttlMs]);

  // Load users when workspaceId changes if autoLoad is true
  useEffect(() => {
    if (workspaceId && autoLoad) {
      loadUsers();
    }
  }, [workspaceId]);

  // Function to load users from cache or database
  const loadUsers = async () => {
    if (!workspaceId) {
      setError('Workspace ID is required');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const cachedUsers = await userCache.getUsersForWorkspace(workspaceId);
      setUsers(cachedUsers);
    } catch (err) {
      console.error('Error loading users from cache:', err);
      setError('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  // Function to refresh the cache
  const refreshCache = async () => {
    if (!workspaceId) {
      setError('Workspace ID is required');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const refreshedUsers = await userCache.refreshWorkspace(workspaceId);
      setUsers(refreshedUsers);
    } catch (err) {
      console.error('Error refreshing user cache:', err);
      setError('Failed to refresh users');
    } finally {
      setLoading(false);
    }
  };

  // Function to get cache statistics
  const getCacheStats = () => {
    return userCache.getStats();
  };

  return {
    users,
    loading,
    error,
    refreshCache,
    getCacheStats
  };
} 
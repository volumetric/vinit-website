'use client';

import { useState, useEffect } from 'react';
import userCache from '../services/userCache';
import { SlackUser } from '../types/database';
import UserHoverCard from './UserHoverCard';

interface UserMentionProps {
  userId: string;
  workspaceId: string;
  size?: 'small' | 'large';  // small for mentions in text, large for message authors
}

/**
 * Component for displaying a user mention with proper formatting
 * Resolves user ID to display name and shows avatar if available
 */
export default function UserMention({ userId, workspaceId, size = 'small' }: UserMentionProps) {
  const [user, setUser] = useState<SlackUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Avatar size classes
  const avatarSizeClasses = size === 'large' 
    ? 'w-9 h-9 text-sm' 
    : 'w-4 h-4 text-[10px]';

  useEffect(() => {
    const fetchUser = async () => {
      try {
        setLoading(true);
        
        // Check if workspaceId is valid
        if (!workspaceId || workspaceId.trim() === '') {
          setError('No workspace ID provided');
          setLoading(false);
          return;
        }
        
        try {
          const userData = await userCache.getUser(workspaceId, userId);
          
          if (userData) {
            setUser(userData);
          } else {
            setUser(null);
          }
        } catch (err) {
          if (err instanceof Error && err.message.includes('not defined in environment variables')) {
            setError('Supabase configuration error');
          } else {
            setError('Failed to load user data');
          }
        }
      } catch (err) {
        setError('Failed to load user data');
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [userId, workspaceId]);

  // Simple fallback display for errors
  if (error) {
    return (
      <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-yellow-500/10 text-yellow-300">
        @{userId}
      </span>
    );
  }

  // Display name fallback chain: display_name -> real_name -> name -> userId
  const displayName = user?.display_name || user?.real_name || user?.name || userId;

  // Content to display inside the hover card
  const mentionContent = (
    <span className={`inline-flex items-center gap-1 ${size === 'large' ? 'text-gray-100' : 'px-1.5 py-0.5 rounded bg-indigo-500/10 text-indigo-300 hover:bg-indigo-500/20'} transition-colors`}>
      {user?.image_url ? (
        <img 
          src={user.image_url} 
          alt={displayName} 
          className={`${avatarSizeClasses} rounded-full`}
        />
      ) : (
        <span className={`${avatarSizeClasses} rounded-full bg-indigo-500/30 flex items-center justify-center font-semibold`}>
          {displayName.charAt(0).toUpperCase()}
        </span>
      )}
      <span className={size === 'large' ? 'font-semibold' : ''}>@{displayName}</span>
    </span>
  );

  if (loading) {
    return <span className="inline-flex items-center text-indigo-300">@{userId}</span>;
  }

  // Only show the hover card if we have user data
  if (user) {
    return (
      <UserHoverCard user={user} loading={loading} error={error}>
        {mentionContent}
      </UserHoverCard>
    );
  }
  
  // If no user data was found, just show the formatted mention without the hover card
  return (
    <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-gray-500/10 text-gray-300">
      @{userId}
    </span>
  );
} 
'use client';

import { useState } from 'react';
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import { SlackUser } from '../types/database';

interface UserHoverCardProps {
  user: SlackUser | null;
  loading: boolean;
  error: string | null;
  children: React.ReactNode;
}

/**
 * Component for displaying user details in a hover card
 */
export default function UserHoverCard({ user, loading, error, children }: UserHoverCardProps) {
  // Don't show hover card if loading or error
  if (loading || error || !user) {
    return <>{children}</>;
  }

  // Display name fallback chain: display_name -> real_name -> name -> user_id
  const displayName = user.display_name || user.real_name || user.name || user.user_id;
  
  return (
    <HoverCard>
      <HoverCardTrigger asChild>
        <span className="cursor-pointer">{children}</span>
      </HoverCardTrigger>
      <HoverCardContent className="w-80 bg-gray-800 border border-gray-700 text-gray-100 shadow-xl">
        <div className="flex justify-between space-x-4">
          <div className="flex-shrink-0">
            {user.image_url ? (
              <img 
                src={user.image_url} 
                alt={displayName} 
                className="h-12 w-12 rounded-full"
              />
            ) : (
              <div className="h-12 w-12 rounded-full bg-indigo-500/30 flex items-center justify-center text-lg font-semibold">
                {displayName.charAt(0).toUpperCase()}
              </div>
            )}
          </div>
          <div className="space-y-1 flex-1">
            <h4 className="text-sm font-semibold">{user.real_name || user.name}</h4>
            {user.display_name && (
              <p className="text-xs text-gray-400">@{user.display_name}</p>
            )}
          </div>
        </div>
        
        <div className="mt-4 space-y-2">
          {user.email && (
            <div className="flex items-center text-xs">
              <span className="text-gray-400 mr-2">Email:</span>
              <span className="text-gray-200">{user.email}</span>
            </div>
          )}
          
          <div className="flex items-center text-xs">
            <span className="text-gray-400 mr-2">Status:</span>
            <span className={`px-1.5 py-0.5 rounded text-xs ${
              user.is_active 
                ? 'bg-green-500/20 text-green-300' 
                : 'bg-red-500/20 text-red-300'
            }`}>
              {user.is_active ? 'Active' : 'Deactivated'}
            </span>
          </div>
          
          <div className="flex items-center text-xs">
            <span className="text-gray-400 mr-2">Role:</span>
            <span className="text-gray-200">
              {user.is_owner 
                ? 'Owner' 
                : user.is_admin 
                  ? 'Admin' 
                  : user.is_bot 
                    ? 'Bot' 
                    : 'Member'}
            </span>
          </div>
        </div>
      </HoverCardContent>
    </HoverCard>
  );
} 
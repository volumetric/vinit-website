'use client';

import { useState, useEffect } from 'react';
import { extractUserMentions } from '../utils/userMentionResolver';
import UserMention from './UserMention';

interface MessageTextProps {
  text: string;
  workspaceId: string;
}

/**
 * Component for displaying message text with resolved user mentions
 * Parses the text and replaces <@USER_ID> with UserMention components
 * Also handles special mentions like <!channel> and <!here>
 */
export default function MessageText({ text, workspaceId }: MessageTextProps) {
  const [segments, setSegments] = useState<Array<{ type: 'text' | 'mention' | 'special', content: string }>>([]); 
  const [isWorkspaceValid, setIsWorkspaceValid] = useState<boolean>(false);
  const [isSupabaseConfigured, setIsSupabaseConfigured] = useState<boolean>(true);

  useEffect(() => {
    console.log('MessageText: workspaceId changed:', workspaceId);
    // Check if workspaceId is valid
    const isValid = !!workspaceId && workspaceId.trim() !== '';
    console.log('MessageText: workspaceId is valid:', isValid);
    setIsWorkspaceValid(isValid);

    // Check if Supabase is configured by looking for the error in console
    const originalConsoleWarn = console.warn;
    console.warn = (...args) => {
      if (args[0]?.includes?.('not defined in environment variables')) {
        console.log('MessageText: Supabase configuration error detected');
        setIsSupabaseConfigured(false);
      }
      originalConsoleWarn.apply(console, args);
    };

    return () => {
      console.warn = originalConsoleWarn;
    };
  }, [workspaceId]);

  useEffect(() => {
    // Parse the text to identify user mentions and special mentions
    const parseText = () => {
      console.log('MessageText: Starting to parse text:', text);
      
      if (!text) {
        console.log('MessageText: No text provided, setting empty segments');
        setSegments([]);
        return;
      }

      const parts: Array<{ type: 'text' | 'mention' | 'special', content: string }> = [];

      // First, find all user mentions using extractUserMentions
      const userMentions = extractUserMentions(text);
      console.log('MessageText: Extracted user mentions:', userMentions);

      // Create a map of positions for user mentions
      const mentionPositions = new Map<number, { type: 'mention' | 'special', content: string, length: number }>();
      
      // Add user mentions to the position map
      userMentions.forEach(userId => {
        const mentionText = `<@${userId}>`;
        let pos = -1;
        let currentPos = 0;
        
        // Find all occurrences of this mention
        while ((pos = text.indexOf(mentionText, currentPos)) !== -1) {
          mentionPositions.set(pos, {
            type: 'mention',
            content: userId,
            length: mentionText.length
          });
          currentPos = pos + mentionText.length;
        }
      });

      // Find special mentions like <!channel>, <!here>
      const specialMentionRegex = /<!([a-z]+)>/g;
      let specialMatch;
      while ((specialMatch = specialMentionRegex.exec(text)) !== null) {
        mentionPositions.set(specialMatch.index, {
          type: 'special',
          content: specialMatch[1],
          length: specialMatch[0].length
        });
      }

      // Sort positions and create segments
      const sortedPositions = Array.from(mentionPositions.entries())
        .sort(([posA], [posB]) => posA - posB);
      
      console.log('MessageText: Sorted positions:', sortedPositions);

      let lastIndex = 0;
      for (const [position, mention] of sortedPositions) {
        // Add text before the mention
        if (position > lastIndex) {
          const textBefore = text.substring(lastIndex, position);
          console.log('MessageText: Adding text before mention:', textBefore);
          parts.push({
            type: 'text',
            content: textBefore
          });
        }

        // Add the mention
        console.log('MessageText: Adding mention:', mention);
        parts.push({
          type: mention.type,
          content: mention.content
        });

        lastIndex = position + mention.length;
      }

      // Add any remaining text after the last mention
      if (lastIndex < text.length) {
        const remainingText = text.substring(lastIndex);
        console.log('MessageText: Adding remaining text:', remainingText);
        parts.push({
          type: 'text',
          content: remainingText
        });
      }

      console.log('MessageText: Final segments:', parts);
      setSegments(parts);
    };

    parseText();
  }, [text]);

  if (!text) {
    console.log('MessageText: Rendering null due to no text');
    return null;
  }

  // Function to render special mentions
  const renderSpecialMention = (content: string, index: number) => {
    console.log('MessageText: Rendering special mention:', content);
    switch (content) {
      case 'channel':
        return <span key={index} className="font-semibold text-green-300">@channel</span>;
      case 'here':
        return <span key={index} className="font-semibold text-green-300">@here</span>;
      case 'everyone':
        return <span key={index} className="font-semibold text-green-300">@everyone</span>;
      default:
        return <span key={index} className="font-semibold text-indigo-300">@{content}</span>;
    }
  };

  // Function to render user mentions
  const renderUserMention = (userId: string, index: number) => {
    console.log('MessageText: Rendering user mention:', { userId, isSupabaseConfigured, isWorkspaceValid });
    
    // If Supabase is not configured, show a simple mention
    if (!isSupabaseConfigured) {
      console.log('MessageText: Rendering without Supabase config');
      return (
        <span key={index} className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-yellow-500/10 text-yellow-300">
          @{userId}
        </span>
      );
    }
    
    // If workspace is not valid, just show the user ID without the UserMention component
    if (!isWorkspaceValid) {
      console.log('MessageText: Rendering with invalid workspace');
      return (
        <span key={index} className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-indigo-500/10 text-indigo-300">
          @{userId}
        </span>
      );
    }
    
    console.log('MessageText: Rendering with UserMention component');
    return (
      <UserMention 
        key={index}
        userId={userId} 
        workspaceId={workspaceId} 
      />
    );
  };

  console.log('MessageText: Rendering segments:', segments);
  return (
    <div className="whitespace-pre-wrap break-words">
      {segments.map((segment, index) => {
        console.log('MessageText: Rendering segment:', { type: segment.type, content: segment.content, index });
        if (segment.type === 'text') {
          return <span key={index}>{segment.content}</span>;
        } else if (segment.type === 'mention') {
          return renderUserMention(segment.content, index);
        } else if (segment.type === 'special') {
          return renderSpecialMention(segment.content, index);
        }
        return null;
      })}
    </div>
  );
} 
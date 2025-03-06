'use client';

import { Message } from '../../types/interfaces';
import { useEffect, useState } from 'react';

interface SimpleConversationDetailProps {
    messages: Message[];
    workspaceId: string | null;
    formatTimestamp: (ts: string) => string;
}

export default function SimpleConversationDetail({
    messages,
    workspaceId,
    formatTimestamp
}: SimpleConversationDetailProps) {
    const [userNames, setUserNames] = useState<Record<string, string>>({});
    const [isLoading, setIsLoading] = useState(true);
    const [combinedText, setCombinedText] = useState<string>('');
    
    // Extract all user IDs from messages for loading
    const getAllUserIds = () => {
        const userIds = new Set<string>();
        
        // Add message authors
        messages.forEach(message => {
            userIds.add(message.user);
        });
        
        // Extract user IDs from message content
        messages.forEach(message => {
            const matches = message.text.match(/<@([A-Z0-9]+)>/g) || [];
            matches.forEach(match => {
                const userId = match.substring(2, match.length - 1);
                userIds.add(userId);
            });
        });
        
        return [...userIds];
    };
    
    useEffect(() => {
        const loadUserNames = async () => {
            if (!workspaceId) {
                setIsLoading(false);
                return;
            }
            
            setIsLoading(true);
            
            try {
                // This is handled by the parent component now (ConversationsList),
                // but we keep this for standalone usage if needed
                const userCache = (await import('../../services/userCache')).default;
                
                const userIds = getAllUserIds();
                const userMap: Record<string, string> = {};
                
                // Load all users' data in parallel for better performance
                await Promise.all(userIds.map(async (userId) => {
                    try {
                        const userData = await userCache.getUser(workspaceId, userId);
                        if (userData) {
                            userMap[userId] = userData.display_name || userData.real_name || userData.name || userId;
                        } else {
                            userMap[userId] = userId;
                        }
                    } catch (error) {
                        userMap[userId] = userId;
                    }
                }));
                
                setUserNames(userMap);
            } catch (error) {
                console.error('Error loading user data:', error);
            } finally {
                setIsLoading(false);
            }
        };
        
        loadUserNames();
    }, [messages, workspaceId]);
    
    // Generate combined text from all messages
    useEffect(() => {
        if (Object.keys(userNames).length === 0) return;
        
        let text = '';
        messages.forEach((message, index) => {
            const userName = userNames[message.user] || message.user;
            const processedText = processText(message.text);
            
            text += `${userName}: ${processedText}`;
            
            // Add newline between messages
            if (index < messages.length - 1) {
                text += '\n\n';
            }
        });
        
        setCombinedText(text);
    }, [messages, userNames]);
    
    // Process text to replace user mentions but preserve markdown formatting
    const processText = (text: string) => {
        if (!text) return '';
        
        // Replace user mentions <@USER_ID> with the user's name
        // Use a more robust regex to catch all possible user mention formats
        let processedText = text.replace(/<@([A-Z0-9]+)(?:\|[^>]+)?>/g, (match, userId) => {
            const name = userNames[userId] || userId;
            return `@${name}`;
        });
        
        // Replace special mentions <!channel>, <!here>, etc.
        processedText = processedText.replace(/<!([a-z]+)>/g, (match, type) => {
            return `@${type}`;
        });
        
        // Handle Slack file attachments with a specific format
        processedText = processedText.replace(/<(https?:\/\/files\.slack\.com[^|>]+)\|([^>]+)>/g, (match, url, text) => {
            // Check if it's likely an image by looking at the extension
            const isImage = /\.(jpg|jpeg|png|gif|webp)($|\?)/.test(url.toLowerCase());
            if (isImage) {
                return `[📷 ${text}](${url})`;
            }
            return `[📎 ${text}](${url})`;
        });
        
        // Convert Slack-style links with labels <http://example.com|example> to Markdown links [example](http://example.com)
        processedText = processedText.replace(/<(https?:\/\/[^|>]+)\|([^>]+)>/g, '[$2]($1)');
        
        // Keep plain URLs intact <http://example.com> -> http://example.com
        processedText = processedText.replace(/<(https?:\/\/[^>]+)>/g, '$1');
        
        // Handle file links <file://path/to/file|filename> to Markdown links [filename](file://path/to/file)
        processedText = processedText.replace(/<(file:\/\/[^|>]+)\|([^>]+)>/g, '[$2]($1)');
        
        // Preserve image references while removing the formatting
        processedText = processedText.replace(/<!(\[[^]]+\]\([^)]+\))>/g, '$1');
        
        // PRESERVE markdown formatting
        // We no longer remove bold, italic, code formatting
        
        // Do a final post-processing pass to catch any unresolved user IDs in the text
        // This handles cases where user IDs might be mentioned in a non-standard format
        Object.entries(userNames).forEach(([userId, userName]) => {
            // Replace raw user IDs that might not be in the standard format
            const userIdRegex = new RegExp(`\\b${userId}\\b`, 'g');
            if (userId !== userName && processedText.match(userIdRegex)) {
                processedText = processedText.replace(userIdRegex, userName);
            }
        });
        
        return processedText;
    };
    
    if (!messages || messages.length === 0) {
        return <div className="text-gray-400 p-4">No messages to display</div>;
    }
    
    // If still loading user data, show a simple loading state
    if (isLoading) {
        return (
            <div className="p-4 bg-gray-750 border border-gray-700 rounded-lg">
                <div className="space-y-3">
                    <div className="h-4 bg-gray-700 rounded w-1/4 animate-pulse"></div>
                    <div className="h-4 bg-gray-700 rounded w-full animate-pulse"></div>
                    <div className="h-4 bg-gray-700 rounded w-5/6 animate-pulse"></div>
                    <div className="h-4 bg-gray-700 rounded w-full animate-pulse"></div>
                    <div className="h-4 bg-gray-700 rounded w-4/6 animate-pulse"></div>
                </div>
            </div>
        );
    }
    
    return (
        <div className="p-4 bg-gray-750 border border-gray-700 rounded-lg">
            <div className="text-gray-300 whitespace-pre-wrap break-words font-mono text-sm">
                {combinedText}
            </div>
        </div>
    );
} 
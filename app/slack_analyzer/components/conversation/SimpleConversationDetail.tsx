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
    
    // Process text to remove formatting and properly handle user mentions
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
        
        // Remove any bold or italic formatting but preserve the content
        processedText = processedText.replace(/(\*|_)(.+?)\1/g, '$2');
        
        // Remove any code formatting but preserve the content
        processedText = processedText.replace(/`([^`]+)`/g, '$1');
        
        // Remove any blockquote formatting but preserve the content
        processedText = processedText.replace(/^>\s(.+)$/gm, '$1');
        
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
    
    // Convert markdown-style links to JSX
    const markdownToJSX = (text: string) => {
        // Find all markdown links [text](url)
        const parts: React.ReactNode[] = [];
        const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
        let lastIndex = 0;
        let match;
        
        while ((match = linkRegex.exec(text)) !== null) {
            // Add text before the link
            if (match.index > lastIndex) {
                parts.push(text.substring(lastIndex, match.index));
            }
            
            // Add the link as JSX
            const [, linkText, linkUrl] = match;
            parts.push(
                <a 
                    key={match.index} 
                    href={linkUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-blue-400 hover:text-blue-300 underline"
                >
                    {linkText}
                </a>
            );
            
            lastIndex = match.index + match[0].length;
        }
        
        // Add the remaining text
        if (lastIndex < text.length) {
            parts.push(text.substring(lastIndex));
        }
        
        // Check for plain URLs that aren't in markdown format
        if (parts.length === 1 && typeof parts[0] === 'string') {
            const urlRegex = /(https?:\/\/[^\s]+)/g;
            const urlParts: React.ReactNode[] = [];
            lastIndex = 0;
            
            const plainText = parts[0] as string;
            while ((match = urlRegex.exec(plainText)) !== null) {
                // Add text before the URL
                if (match.index > lastIndex) {
                    urlParts.push(plainText.substring(lastIndex, match.index));
                }
                
                // Add the URL as JSX
                const url = match[0];
                urlParts.push(
                    <a 
                        key={`url-${match.index}`} 
                        href={url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-blue-400 hover:text-blue-300 underline"
                    >
                        {url}
                    </a>
                );
                
                lastIndex = match.index + match[0].length;
            }
            
            // Add the remaining text
            if (lastIndex < plainText.length) {
                urlParts.push(plainText.substring(lastIndex));
            }
            
            return urlParts.length > 1 ? urlParts : parts;
        }
        
        return parts;
    };
    
    if (!messages || messages.length === 0) {
        return <div className="text-gray-400 p-4">No messages to display</div>;
    }
    
    // If still loading user data, show a simple loading state for user names
    if (isLoading) {
        return (
            <div className="space-y-4 font-mono">
                {messages.map((message, idx) => (
                    <div
                        key={message.ts}
                        className={`p-3 ${
                            idx === 0 
                                ? 'bg-gray-750 border border-gray-700 rounded-lg' 
                                : 'ml-4 border-l-2 border-l-gray-600'
                        }`}
                    >
                        <div className="flex justify-between mb-1 text-sm">
                            <span className="font-semibold text-gray-200">
                                <span className="inline-block w-24 h-4 bg-gray-700 rounded animate-pulse"></span>
                            </span>
                            <span className="text-gray-400">
                                {formatTimestamp(message.ts)}
                            </span>
                        </div>
                        
                        <div className="text-gray-300 whitespace-pre-wrap break-words">
                            <div className="space-y-2">
                                <div className="h-4 bg-gray-700 rounded w-full animate-pulse"></div>
                                <div className="h-4 bg-gray-700 rounded w-5/6 animate-pulse"></div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        );
    }
    
    return (
        <div className="space-y-4 font-mono">
            {messages.map((message, idx) => (
                <div
                    key={message.ts}
                    className={`p-3 ${
                        idx === 0 
                            ? 'bg-gray-750 border border-gray-700 rounded-lg' 
                            : 'ml-4 border-l-2 border-l-gray-600'
                    }`}
                >
                    <div className="flex justify-between mb-1 text-sm">
                        <span className="font-semibold text-gray-200">
                            {userNames[message.user] || message.user}: 
                        </span>
                        <span className="text-gray-400">
                            {formatTimestamp(message.ts)}
                        </span>
                    </div>
                    
                    <div className="text-gray-300 whitespace-pre-wrap break-words">
                        {markdownToJSX(processText(message.text))}
                    </div>
                </div>
            ))}
        </div>
    );
} 
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
    
    useEffect(() => {
        const loadUserNames = async () => {
            if (!workspaceId) return;
            
            // This is handled by the parent component now (ConversationsList),
            // but we keep this for standalone usage if needed
            const userCache = (await import('../../services/userCache')).default;
            
            const userIds = [...new Set(messages.map(message => message.user))];
            const userMap: Record<string, string> = {};
            
            for (const userId of userIds) {
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
            }
            
            setUserNames(userMap);
        };
        
        loadUserNames();
    }, [messages, workspaceId]);
    
    // Process text to remove formatting and properly handle user mentions
    const processText = (text: string) => {
        if (!text) return '';
        
        // Replace user mentions <@USER_ID> with the user's name
        let processedText = text.replace(/<@([A-Z0-9]+)>/g, (match, userId) => {
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
'use client';

import { useState, useEffect, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronUp, FileText, Edit3, Copy, Check } from "lucide-react";
import ConversationDetail from './ConversationDetail';
import SimpleConversationDetail from './SimpleConversationDetail';
import { Message, ConversationDocument } from '../../types/interfaces';
import userCache from '../../services/userCache';

interface ConversationsListProps {
    conversations: ConversationDocument[];
    loading: boolean;
    error: string | null;
    workspaceId: string | null;
    formatTimestamp: (ts: string) => string;
    isSimpleMode: boolean;
    toggleSimpleMode: () => void;
}

export default function ConversationsList({
    conversations,
    loading,
    error,
    workspaceId,
    formatTimestamp,
    isSimpleMode,
    toggleSimpleMode
}: ConversationsListProps) {
    const [openConversations, setOpenConversations] = useState<Set<string>>(() => {
        // Initialize with all conversation IDs to expand everything by default
        return new Set(conversations.map(conv => conv.thread_id));
    });
    
    const [copyStates, setCopyStates] = useState<Record<string, boolean>>({});
    const [userNames, setUserNames] = useState<Record<string, string>>({});
    
    // Update openConversations when conversations change
    useEffect(() => {
        // When conversations change, add any new conversations to the openConversations set
        setOpenConversations(prevOpen => {
            const newOpen = new Set(prevOpen);
            conversations.forEach(conv => {
                newOpen.add(conv.thread_id);
            });
            return newOpen;
        });
    }, [conversations]);
    
    // Load user names for all conversations
    useEffect(() => {
        const loadUserNames = async () => {
            if (!workspaceId) return;
            
            // Collect all unique user IDs from all conversations
            const userIds = new Set<string>();
            
            // Add all message authors
            conversations.forEach(conversation => {
                conversation.messages.forEach(message => {
                    userIds.add(message.user);
                });
            });
            
            // Extract user IDs from message content as well
            conversations.forEach(conversation => {
                conversation.messages.forEach(message => {
                    const matches = message.text.match(/<@([A-Z0-9]+)(?:\|[^>]+)?>/g) || [];
                    matches.forEach(match => {
                        // Extract just the ID part
                        const userId = match.substring(2).split(/[>|]/)[0];
                        userIds.add(userId);
                    });
                });
            });
            
            const userMap: Record<string, string> = {};
            
            // Load all users' data in parallel
            await Promise.all([...userIds].map(async (userId) => {
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
        };
        
        loadUserNames();
    }, [workspaceId, conversations]);

    const toggleConversation = (threadId: string) => {
        const newOpenConversations = new Set(openConversations);
        if (newOpenConversations.has(threadId)) {
            newOpenConversations.delete(threadId);
        } else {
            newOpenConversations.add(threadId);
        }
        setOpenConversations(newOpenConversations);
    };

    const toggleAllConversations = () => {
        if (openConversations.size === conversations.length) {
            // All are open, so close all
            setOpenConversations(new Set());
        } else {
            // Not all are open, so open all
            setOpenConversations(new Set(conversations.map(conv => conv.thread_id)));
        }
    };
    
    // Generate plain text content for a conversation
    const generatePlainText = (conversation: ConversationDocument): string => {
        let text = '';
        conversation.messages.forEach((message, index) => {
            const userName = userNames[message.user] || message.user;
            
            // Process message text to preserve formatting and properly handle user mentions
            let processedText = message.text;
            
            // Replace user mentions with a more robust regex
            processedText = processedText.replace(/<@([A-Z0-9]+)(?:\|[^>]+)?>/g, (match, userId) => {
                const name = userNames[userId] || userId;
                return `@${name}`;
            });
            
            // Replace special mentions
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
            
            // Final pass to catch any raw user IDs
            Object.entries(userNames).forEach(([userId, userName]) => {
                // Replace raw user IDs that might not be in the standard format
                const userIdRegex = new RegExp(`\\b${userId}\\b`, 'g');
                if (userId !== userName && processedText.match(userIdRegex)) {
                    processedText = processedText.replace(userIdRegex, userName);
                }
            });
            
            text += `${userName}: ${processedText}`;
            
            // Add double newline between messages
            if (index < conversation.messages.length - 1) {
                text += '\n\n';
            }
        });
        
        return text;
    };
    
    // Copy conversation text to clipboard
    const copyConversation = async (threadId: string) => {
        const conversation = conversations.find(c => c.thread_id === threadId);
        if (!conversation) return;
        
        const text = generatePlainText(conversation);
        
        try {
            await navigator.clipboard.writeText(text);
            
            // Show success state
            setCopyStates(prev => ({ ...prev, [threadId]: true }));
            
            // Reset after 2 seconds
            setTimeout(() => {
                setCopyStates(prev => ({ ...prev, [threadId]: false }));
            }, 2000);
        } catch (err) {
            console.error('Failed to copy text: ', err);
        }
    };

    if (loading) {
        return (
            <div className="py-8">
                <div className="animate-pulse flex space-x-4">
                    <div className="flex-1 space-y-4 py-1">
                        <div className="h-4 bg-gray-700 rounded"></div>
                        <div className="space-y-2">
                            <div className="h-4 bg-gray-700 rounded"></div>
                            <div className="h-4 bg-gray-700 rounded w-5/6"></div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-red-900/20 border border-red-700 text-red-300 p-4 rounded">
                {error}
            </div>
        );
    }

    if (!conversations || conversations.length === 0) {
        return (
            <div className="bg-gray-800 border border-gray-700 p-6 rounded-lg text-center">
                <p className="text-gray-400">No conversations found in this channel.</p>
                <p className="text-gray-500 text-sm mt-2">Try selecting a different channel or adjusting your search.</p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center mb-4">
                <div className="flex items-center gap-2">
                    <h2 className="text-xl font-semibold text-gray-100">
                        Conversations ({conversations.length})
                    </h2>
                    <Button
                        onClick={toggleSimpleMode}
                        size="sm"
                        variant="outline"
                        className="ml-4 bg-gray-700 hover:bg-gray-600 text-gray-100 border-gray-600 flex items-center gap-1"
                    >
                        {isSimpleMode ? (
                            <>
                                <Edit3 className="h-4 w-4" />
                                <span>Rich View</span>
                            </>
                        ) : (
                            <>
                                <FileText className="h-4 w-4" />
                                <span>Simple View</span>
                            </>
                        )}
                    </Button>
                </div>
                <Button
                    onClick={toggleAllConversations}
                    size="sm"
                    variant="outline"
                    className="bg-gray-700 hover:bg-gray-600 text-gray-100 border-gray-600"
                >
                    {openConversations.size === conversations.length ? "Collapse All" : "Expand All"}
                </Button>
            </div>

            <div className="space-y-4">
                {conversations.map(conversation => (
                    <div key={conversation.thread_id} className="bg-gray-800 border border-gray-700 rounded-lg overflow-hidden">
                        <div className="p-6 flex items-center justify-between hover:bg-gray-750 transition-colors">
                            <button
                                onClick={() => toggleConversation(conversation.thread_id)}
                                className="flex-1 text-left flex items-center"
                            >
                                <span className="text-sm font-medium text-gray-300 bg-gray-700/50 px-3 py-1.5 rounded-full">
                                    {formatTimestamp(conversation.timestamp)}
                                </span>
                                {openConversations.has(conversation.thread_id) ? (
                                    <ChevronUp className="h-5 w-5 text-gray-400 ml-2" />
                                ) : (
                                    <ChevronDown className="h-5 w-5 text-gray-400 ml-2" />
                                )}
                            </button>
                            
                            {isSimpleMode && (
                                <Button
                                    onClick={() => copyConversation(conversation.thread_id)}
                                    size="sm"
                                    variant="outline"
                                    className={`${
                                        copyStates[conversation.thread_id]
                                            ? 'bg-green-900/20 border-green-700 text-green-300'
                                            : 'bg-gray-700 hover:bg-gray-600 text-gray-100 border-gray-600'
                                    } flex items-center gap-1`}
                                >
                                    {copyStates[conversation.thread_id] ? (
                                        <>
                                            <Check className="h-4 w-4" />
                                            <span>Copied!</span>
                                        </>
                                    ) : (
                                        <>
                                            <Copy className="h-4 w-4" />
                                            <span>Copy Text</span>
                                        </>
                                    )}
                                </Button>
                            )}
                        </div>

                        {/* Collapsible Content */}
                        {openConversations.has(conversation.thread_id) && (
                            <div className="border-t border-gray-700 p-6">
                                {isSimpleMode ? (
                                    <SimpleConversationDetail 
                                        messages={conversation.messages}
                                        workspaceId={workspaceId}
                                        formatTimestamp={formatTimestamp}
                                    />
                                ) : (
                                    <ConversationDetail 
                                        messages={conversation.messages}
                                        workspaceId={workspaceId}
                                        formatTimestamp={formatTimestamp}
                                    />
                                )}
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
} 
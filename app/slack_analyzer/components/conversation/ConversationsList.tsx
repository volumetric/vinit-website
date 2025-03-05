'use client';

import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronUp } from "lucide-react";
import ConversationDetail from './ConversationDetail';
import { Message, ConversationDocument } from '../../types/interfaces';

interface ConversationsListProps {
    conversations: ConversationDocument[];
    loading: boolean;
    error: string | null;
    workspaceId: string | null;
    formatTimestamp: (ts: string) => string;
}

export default function ConversationsList({
    conversations,
    loading,
    error,
    workspaceId,
    formatTimestamp
}: ConversationsListProps) {
    const [openConversations, setOpenConversations] = useState<Set<string>>(() => {
        // Initialize with all conversation IDs to expand everything by default
        return new Set(conversations.map(conv => conv.thread_id));
    });

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
                <h2 className="text-xl font-semibold text-gray-100">
                    Conversations ({conversations.length})
                </h2>
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
                        <button
                            onClick={() => toggleConversation(conversation.thread_id)}
                            className="w-full p-6 flex items-center justify-between text-left hover:bg-gray-750 transition-colors"
                        >
                            <div>
                                <span className="text-sm font-medium text-gray-300 bg-gray-700/50 px-3 py-1.5 rounded-full">
                                    {formatTimestamp(conversation.timestamp)}
                                </span>
                            </div>
                            {openConversations.has(conversation.thread_id) ? (
                                <ChevronUp className="h-5 w-5 text-gray-400" />
                            ) : (
                                <ChevronDown className="h-5 w-5 text-gray-400" />
                            )}
                        </button>

                        {/* Collapsible Content */}
                        {openConversations.has(conversation.thread_id) && (
                            <div className="border-t border-gray-700 p-6">
                                <ConversationDetail 
                                    messages={conversation.messages}
                                    workspaceId={workspaceId}
                                    formatTimestamp={formatTimestamp}
                                />
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
} 
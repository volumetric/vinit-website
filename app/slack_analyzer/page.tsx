'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { format } from 'date-fns';

interface Channel {
    id: string;
    name: string;
    is_private: boolean;
    member_count: number;
}

interface Message {
    ts: string;
    thread_ts?: string;
    user: string;
    text: string;
    files?: any[];
    reactions?: Array<{
        name: string;
        count: number;
        users: string[];
    }>;
}

interface ConversationDocument {
    thread_id: string;
    channel_id: string;
    messages: Message[];
    participant_count: number;
    timestamp: string;
    has_files: boolean;
    metadata: {
        reply_count: number;
        reply_users: string[];
        reactions: Record<string, number>;
    };
}

export default function SlackAnalyzer() {
    const [channels, setChannels] = useState<Channel[]>([]);
    const [selectedChannel, setSelectedChannel] = useState<string>('');
    const [conversations, setConversations] = useState<ConversationDocument[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        fetchChannels();
    }, []);

    const fetchChannels = async () => {
        try {
            setLoading(true);
            const response = await fetch('/slack_analyzer/api?action=listChannels');
            const data = await response.json();
            
            if (data.success) {
                setChannels(data.channels);
            } else {
                setError(data.error || 'Failed to fetch channels');
            }
        } catch (err) {
            setError('Error fetching channels');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const fetchMessages = async (channelName: string) => {
        try {
            setLoading(true);
            setError(null);
            const response = await fetch(`/slack_analyzer/api?action=fetchMessages&channelName=${channelName}`);
            const data = await response.json();
            
            if (data.success) {
                setConversations(data.conversations);
            } else {
                setError(data.error || 'Failed to fetch messages');
            }
        } catch (err) {
            setError('Error fetching messages');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleChannelChange = (value: string) => {
        setSelectedChannel(value);
        fetchMessages(value);
    };

    const formatTimestamp = (ts: string) => {
        return format(new Date(Number(ts) * 1000), 'MMM dd, yyyy HH:mm:ss');
    };

    return (
        <div className="container mx-auto p-4">
            <h1 className="text-3xl font-bold mb-6">Slack Conversation Analyzer</h1>
            
            {/* Channel Selection */}
            <div className="mb-8">
                <h2 className="text-xl font-semibold mb-4">Select Channel</h2>
                <Select value={selectedChannel} onValueChange={handleChannelChange}>
                    <SelectTrigger className="w-[300px]">
                        <SelectValue placeholder="Select a channel" />
                    </SelectTrigger>
                    <SelectContent>
                        {channels.map((channel) => (
                            <SelectItem key={channel.id} value={channel.name}>
                                #{channel.name} ({channel.member_count} members)
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            {/* Loading State */}
            {loading && (
                <div className="text-center py-4">
                    Loading...
                </div>
            )}

            {/* Error State */}
            {error && (
                <div className="text-red-500 py-4">
                    {error}
                </div>
            )}

            {/* Conversations Display */}
            {selectedChannel && conversations.length > 0 && (
                <div>
                    <h2 className="text-xl font-semibold mb-4">
                        Conversations in #{selectedChannel}
                    </h2>
                    <div className="space-y-4">
                        {conversations.map((conversation) => (
                            <Card key={conversation.thread_id} className="overflow-hidden">
                                <CardContent className="p-4">
                                    <div className="mb-2">
                                        <span className="text-sm text-gray-500">
                                            {formatTimestamp(conversation.timestamp)}
                                        </span>
                                    </div>
                                    
                                    {/* Messages */}
                                    <div className="space-y-2">
                                        {conversation.messages.map((message, idx) => (
                                            <div 
                                                key={message.ts} 
                                                className={`p-2 rounded ${idx === 0 ? 'bg-gray-100' : 'ml-4'}`}
                                            >
                                                <div className="text-sm text-gray-600 mb-1">
                                                    User: {message.user}
                                                </div>
                                                <div className="whitespace-pre-wrap">
                                                    {message.text}
                                                </div>
                                                
                                                {/* Reactions */}
                                                {message.reactions && message.reactions.length > 0 && (
                                                    <div className="mt-2 flex gap-2">
                                                        {message.reactions.map(reaction => (
                                                            <span 
                                                                key={reaction.name}
                                                                className="text-sm bg-gray-200 px-2 py-1 rounded"
                                                            >
                                                                :{reaction.name}: {reaction.count}
                                                            </span>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>

                                    {/* Metadata */}
                                    <div className="mt-4 text-sm text-gray-500">
                                        <div>Participants: {conversation.participant_count}</div>
                                        <div>Replies: {conversation.metadata.reply_count}</div>
                                        {conversation.has_files && (
                                            <div>Contains files</div>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>
            )}

            {/* No Conversations State */}
            {selectedChannel && conversations.length === 0 && !loading && (
                <div className="text-center py-4">
                    No conversations found in this channel.
                </div>
            )}
        </div>
    );
}

'use client';

import { useState, useEffect, useRef } from 'react';
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
import { Input } from "@/components/ui/input";
import { ChevronDown, ChevronUp, X } from "lucide-react";

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
    const [searchQuery, setSearchQuery] = useState('');
    const [openConversations, setOpenConversations] = useState<Set<string>>(new Set());
    const [isAllExpanded, setIsAllExpanded] = useState(true);
    const searchInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        fetchChannels();
    }, []);

    useEffect(() => {
        if (conversations.length > 0) {
            setOpenConversations(new Set(conversations.map(conv => conv.thread_id)));
        }
    }, [conversations]);

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
        setSearchQuery('');
        setConversations([]); // Clear conversations immediately
        // Reset conversation states when changing channels
        setOpenConversations(new Set());
        setIsAllExpanded(true);
        fetchMessages(value);
    };

    const clearSearch = () => {
        setSearchQuery('');
        if (searchInputRef.current) {
            searchInputRef.current.focus();
        }
    };

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
        if (isAllExpanded) {
            setOpenConversations(new Set());
        } else {
            setOpenConversations(new Set(conversations.map(conv => conv.thread_id)));
        }
        setIsAllExpanded(!isAllExpanded);
    };

    const filteredChannels = channels
        .filter(channel =>
            channel.name.toLowerCase().includes(searchQuery.toLowerCase())
        )
        .sort((a, b) => a.name.localeCompare(b.name));

    const formatTimestamp = (ts: string) => {
        return format(new Date(Number(ts) * 1000), 'MMM dd, yyyy HH:mm:ss');
    };

    return (
        <div className="min-h-screen bg-gray-900 py-8">
            <div className="container mx-auto px-4 max-w-5xl">
                <h1 className="text-4xl font-bold mb-8 text-white">Slack Conversation Analyzer</h1>
                
                {/* Channel Stats */}
                <div className="mb-6 text-gray-300">
                    Total Channels: <span className="font-semibold text-white">{channels.length}</span>
                </div>

                {/* Channel Selection */}
                <div className="mb-8 bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-700">
                    <h2 className="text-xl font-semibold mb-4 text-gray-100">Select Channel</h2>
                    
                    {/* Channel Dropdown */}
                    <Select value={selectedChannel} onValueChange={handleChannelChange}>
                        <SelectTrigger className="w-[300px] bg-gray-700 border-gray-600 text-gray-100">
                            <SelectValue placeholder="Select a channel" />
                        </SelectTrigger>
                        <SelectContent className="bg-gray-800 border-gray-700">
                            <div className="p-2">
                                <div className="relative">
                                    <Input
                                        ref={searchInputRef}
                                        type="text"
                                        placeholder="Search channels..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="bg-gray-700 border-gray-600 text-gray-100 placeholder:text-gray-400 pr-8"
                                    />
                                    {searchQuery && (
                                        <button
                                            onClick={clearSearch}
                                            className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-200"
                                        >
                                            <X className="h-4 w-4" />
                                        </button>
                                    )}
                                </div>
                            </div>
                            <div className="max-h-[300px] overflow-auto">
                                {filteredChannels.map((channel) => (
                                    <SelectItem 
                                        key={channel.id} 
                                        value={channel.name}
                                        className="text-gray-100 focus:bg-gray-700 focus:text-white"
                                    >
                                        <span className="flex items-center">
                                            <span className="font-medium">#{channel.name}</span>
                                            <span className="ml-2 text-sm text-gray-400">
                                                ({channel.member_count} members)
                                            </span>
                                        </span>
                                    </SelectItem>
                                ))}
                                {filteredChannels.length === 0 && (
                                    <div className="py-2 px-2 text-sm text-gray-400">
                                        No channels found
                                    </div>
                                )}
                            </div>
                        </SelectContent>
                    </Select>
                </div>

                {/* Loading State */}
                {loading && (
                    <div className="text-center py-12 bg-gray-800 rounded-xl shadow-lg border border-gray-700">
                        <div className="animate-pulse text-gray-100 font-medium">Loading...</div>
                    </div>
                )}

                {/* Error State */}
                {error && (
                    <div className="bg-red-900/50 border-2 border-red-700 text-red-200 px-6 py-4 rounded-xl font-medium">
                        {error}
                    </div>
                )}

                {/* Conversations Display */}
                {selectedChannel && conversations.length > 0 && (
                    <div>
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-2xl font-bold text-white">
                                Conversations in #{selectedChannel}
                            </h2>
                            <Button
                                onClick={toggleAllConversations}
                                variant="outline"
                                className="bg-gray-700 border-gray-600 text-gray-100 hover:bg-gray-600"
                            >
                                {isAllExpanded ? 'Collapse All' : 'Expand All'}
                            </Button>
                        </div>

                        {/* Date Range Info */}
                        <div className="mb-6 text-gray-300">
                            Showing messages from the last 30 days
                        </div>

                        <div className="space-y-8">
                            {conversations.map((conversation) => (
                                <Card key={conversation.thread_id} className="overflow-hidden bg-gray-800 border border-gray-700 shadow-lg rounded-xl">
                                    <CardContent className="p-0">
                                        {/* Conversation Header */}
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
                                                {/* Messages */}
                                                <div className="space-y-4">
                                                    {conversation.messages.map((message, idx) => (
                                                        <div 
                                                            key={message.ts} 
                                                            className={`rounded-xl ${
                                                                idx === 0 
                                                                    ? 'bg-gray-750 border border-gray-700' 
                                                                    : 'ml-8 bg-gray-800 border border-gray-700'
                                                            } p-4 hover:bg-gray-750 transition-colors duration-200`}
                                                        >
                                                            <div className="flex items-center gap-3 mb-3">
                                                                <div className="w-9 h-9 rounded-full bg-indigo-500/20 flex items-center justify-center">
                                                                    <span className="text-sm font-semibold text-indigo-300">
                                                                        {message.user.charAt(0).toUpperCase()}
                                                                    </span>
                                                                </div>
                                                                <div className="text-sm font-semibold text-gray-100">
                                                                    {message.user}
                                                                </div>
                                                            </div>
                                                            <div className="text-gray-300 whitespace-pre-wrap leading-relaxed pl-12">
                                                                {message.text}
                                                            </div>
                                                            
                                                            {/* Reactions */}
                                                            {message.reactions && message.reactions.length > 0 && (
                                                                <div className="mt-4 flex flex-wrap gap-2 pl-12">
                                                                    {message.reactions.map(reaction => (
                                                                        <span 
                                                                            key={reaction.name}
                                                                            className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-indigo-500/20 text-indigo-200 border border-indigo-500/30 font-medium"
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
                                                <div className="mt-6 pt-4 border-t border-gray-700">
                                                    <div className="flex flex-wrap gap-4 text-sm">
                                                        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-gray-700/50 text-gray-300 font-medium">
                                                            {conversation.participant_count} participants
                                                        </div>
                                                        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-gray-700/50 text-gray-300 font-medium">
                                                            {conversation.metadata.reply_count} replies
                                                        </div>
                                                        {conversation.has_files && (
                                                            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-gray-700/50 text-gray-300 font-medium">
                                                                Contains files
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    </div>
                )}

                {/* No Conversations State */}
                {selectedChannel && conversations.length === 0 && !loading && (
                    <div className="text-center py-12 bg-gray-800 rounded-xl shadow-lg border border-gray-700">
                        <div className="text-gray-300 font-medium">No conversations found in this channel.</div>
                    </div>
                )}
            </div>
        </div>
    );
}

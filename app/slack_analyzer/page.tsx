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
import { ChevronDown, ChevronUp, X, RefreshCw, Users } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { SlackUser } from './types/database';
import MessageText from './components/MessageText';
import useUserCache from './hooks/useUserCache';
import CacheStats from './components/CacheStats';
import { initializeUserCache, scheduleUserCacheRefresh } from './utils/cacheInitializer';
import UserMention from './components/UserMention';

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
    const [activeTab, setActiveTab] = useState('conversations');
    
    // User data state
    const [users, setUsers] = useState<SlackUser[]>([]);
    const [userSearchQuery, setUserSearchQuery] = useState('');
    const [loadingUsers, setLoadingUsers] = useState(false);
    const [userError, setUserError] = useState<string | null>(null);
    const [workspaceId, setWorkspaceId] = useState<string | null>("b4974b15-c113-42b3-9b88-a60d3a8b2773");
    const [hasLoadedUsers, setHasLoadedUsers] = useState(false);
    const [isRefresh, setIsRefresh] = useState(false);
    const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

    // User cache hook
    const {
        refreshCache: refreshUserCache,
        getCacheStats
    } = useUserCache({
        workspaceId,
        autoLoad: false, // We'll load users when needed
    });

    // Initialize user cache when the application starts
    useEffect(() => {
        // Initialize the user cache with default settings
        initializeUserCache({
            maxWorkspaces: 5,
            maxUsersPerWorkspace: 1000,
            ttlMs: 3600000 // 1 hour
        }).catch(err => {
            console.error('Error initializing user cache:', err);
        });
        
        // Schedule cache refresh every hour
        const clearRefreshInterval = scheduleUserCacheRefresh(3600000);
        
        // Clean up the interval when the component unmounts
        return () => {
            clearRefreshInterval();
        };
    }, []);

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
        
        // If we haven't loaded users yet, fetch them now
        if (!hasLoadedUsers && workspaceId) {
            fetchUsers(false);
        } else if (!workspaceId) {
            // If we don't have a workspace ID yet, we'll need to fetch users later
            // This will happen automatically when the workspaceId is set
        }
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

    // User data functions
    const fetchUsers = async (isRefreshRequest = false) => {
        try {
            setLoadingUsers(true);
            setUserError(null);
            setIsRefresh(isRefreshRequest);
            
            // For demo purposes, using a placeholder team ID and name
            // In a real app, you would get these from the Slack API or user input
            const teamId = "T12345"; // Replace with actual team ID
            const workspaceName = "Demo Workspace"; // Replace with actual workspace name
            
            // If we're refreshing, skip the Supabase check and fetch directly from Slack
            if (isRefreshRequest) {
                const refreshResponse = await fetch(`/slack_analyzer/api?action=refreshUsers&teamId=${teamId}&workspaceName=${workspaceName}`);
                const refreshData = await refreshResponse.json();
                
                if (refreshData.success) {
                    setWorkspaceId(refreshData.workspaceId);
                    
                    // Now fetch the updated user data
                    const usersResponse = await fetch(`/slack_analyzer/api?action=getUsers&workspaceId=${refreshData.workspaceId}`);
                    const usersData = await usersResponse.json();
                    
                    if (usersData.success) {
                        setUsers(usersData.users);
                        setHasLoadedUsers(true);
                        setLastUpdated(new Date());
                        
                        // Also refresh the user cache
                        await refreshUserCache();
                    } else {
                        setUserError(usersData.error || 'Failed to fetch user details');
                    }
                } else {
                    handleApiError(refreshData);
                }
                setLoadingUsers(false);
                return;
            }
            
            // First, check if we have a workspace ID
            if (!workspaceId) {
                // Try to get the workspace ID from Supabase based on team_id
                const workspaceResponse = await fetch(`/slack_analyzer/api?action=getWorkspaceByTeamId&teamId=${teamId}`);
                const workspaceData = await workspaceResponse.json();
                
                if (workspaceData.success && workspaceData.workspace) {
                    // We found the workspace in Supabase
                    const foundWorkspaceId = workspaceData.workspace.id;
                    setWorkspaceId(foundWorkspaceId);
                    
                    // Check if the workspace has users
                    const hasUsersResponse = await fetch(`/slack_analyzer/api?action=checkWorkspaceHasUsers&workspaceId=${foundWorkspaceId}`);
                    const hasUsersData = await hasUsersResponse.json();
                    
                    if (hasUsersData.success && hasUsersData.hasUsers) {
                        // Workspace has users, fetch them
                        const usersResponse = await fetch(`/slack_analyzer/api?action=getUsers&workspaceId=${foundWorkspaceId}`);
                        const usersData = await usersResponse.json();
                        
                        if (usersData.success) {
                            setUsers(usersData.users);
                            setHasLoadedUsers(true);
                            setLastUpdated(new Date());
                            setLoadingUsers(false);
                            return; // Exit early, no need to fetch from Slack
                        }
                    } else if (hasUsersData.success) {
                        // Workspace exists but has no users
                        setLastUpdated(new Date());
                    }
                }
            } else {
                // We already have a workspace ID, check if it has users
                const hasUsersResponse = await fetch(`/slack_analyzer/api?action=checkWorkspaceHasUsers&workspaceId=${workspaceId}`);
                const hasUsersData = await hasUsersResponse.json();
                
                if (hasUsersData.success && hasUsersData.hasUsers) {
                    // Workspace has users, fetch them
                    const usersResponse = await fetch(`/slack_analyzer/api?action=getUsers&workspaceId=${workspaceId}`);
                    const usersData = await usersResponse.json();
                    
                    if (usersData.success) {
                        setUsers(usersData.users);
                        setHasLoadedUsers(true);
                        setLastUpdated(new Date());
                        setLoadingUsers(false);
                        return; // Exit early, no need to fetch from Slack
                    }
                } else if (hasUsersData.success) {
                    // Workspace exists but has no users
                    setLastUpdated(new Date());
                }
            }
            
            // If we get here, we need to fetch from Slack
            const response = await fetch(`/slack_analyzer/api?action=fetchUsers&teamId=${teamId}&workspaceName=${workspaceName}`);
            const data = await response.json();
            
            if (data.success) {
                setWorkspaceId(data.workspaceId);
                
                // Now fetch the actual user data
                const usersResponse = await fetch(`/slack_analyzer/api?action=getUsers&workspaceId=${data.workspaceId}`);
                const usersData = await usersResponse.json();
                
                if (usersData.success) {
                    setUsers(usersData.users);
                    setHasLoadedUsers(true);
                    setLastUpdated(new Date());
                    
                    // Also refresh the user cache
                    await refreshUserCache();
                } else {
                    setUserError(usersData.error || 'Failed to fetch user details');
                }
            } else {
                handleApiError(data);
            }
        } catch (err) {
            console.error('Error fetching users:', err);
            setUserError('Error fetching users. Check the console for details.');
        } finally {
            setLoadingUsers(false);
        }
    };

    // Helper function to handle API errors
    const handleApiError = (data: any) => {
        // Check for specific error types and provide helpful messages
        if (data.error && data.error.includes('row-level security policy')) {
            setUserError(
                'Supabase RLS policy error: You need to set up the SUPABASE_SERVICE_ROLE_KEY in your .env.local file. ' +
                'Please check the documentation for instructions on setting up Supabase credentials.'
            );
        } else if (data.error && data.error.includes('not defined in environment variables')) {
            setUserError(
                'Missing environment variables: Please set up your Supabase credentials in the .env.local file. ' +
                'You need to add NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY, and SUPABASE_SERVICE_ROLE_KEY.'
            );
        } else {
            setUserError(data.error || 'Failed to fetch users');
        }
    };

    const handleTabChange = (value: string) => {
        setActiveTab(value);
        
        // If switching to users tab and we haven't loaded users yet, fetch them
        if (value === 'users' && !hasLoadedUsers) {
            fetchUsers();
        }
    };

    const filteredUsers = users.filter(user => {
        const searchLower = userSearchQuery.toLowerCase();
        return (
            (user.name?.toLowerCase().includes(searchLower) || false) ||
            (user.real_name?.toLowerCase().includes(searchLower) || false) ||
            (user.display_name?.toLowerCase().includes(searchLower) || false) ||
            (user.email?.toLowerCase().includes(searchLower) || false)
        );
    });

    // Add a useEffect to fetch users when workspaceId changes
    useEffect(() => {
        if (workspaceId && !hasLoadedUsers) {
            fetchUsers(false);
        }
    }, [workspaceId, hasLoadedUsers]);

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

                {/* Tabs */}
                <Tabs value={activeTab} onValueChange={handleTabChange} className="mt-8">
                    <TabsList className="bg-gray-800 border border-gray-700">
                        <TabsTrigger 
                            value="conversations" 
                            className="data-[state=active]:bg-gray-700 data-[state=active]:text-white text-gray-300"
                        >
                            Conversations
                        </TabsTrigger>
                        <TabsTrigger 
                            value="users" 
                            className="data-[state=active]:bg-gray-700 data-[state=active]:text-white text-gray-300"
                        >
                            Users
                        </TabsTrigger>
                    </TabsList>

                    {/* Conversations Tab */}
                    <TabsContent value="conversations">
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
                                                    <UserMention userId={message.user} workspaceId={workspaceId || ''} size="large" />
                                                </div>
                                                <div className="text-gray-300 leading-relaxed pl-12">
                                                    <MessageText text={message.text} workspaceId={workspaceId || ''} />
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
                    </TabsContent>

                    {/* Users Tab */}
                    <TabsContent value="users">
                        <div className="bg-gray-800 rounded-xl shadow-lg border border-gray-700 p-6">
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                                    <Users className="h-6 w-6" />
                                    Workspace Users
                                </h2>
                                <Button
                                    onClick={() => fetchUsers(true)}
                                    variant="outline"
                                    className="bg-gray-700 border-gray-600 text-gray-100 hover:bg-gray-600 flex items-center gap-2"
                                    disabled={loadingUsers}
                                    title={lastUpdated ? `Last updated: ${format(lastUpdated, 'MMM dd, yyyy HH:mm:ss')}` : 'Refresh user data from Slack'}
                                >
                                    <RefreshCw className={`h-4 w-4 ${loadingUsers ? 'animate-spin' : ''}`} />
                                    {hasLoadedUsers ? 'Refresh Users' : 'Fetch Users'}
                                </Button>
                            </div>

                            {/* User Search */}
                            <div className="mb-6">
                                <div className="relative">
                                    <Input
                                        type="text"
                                        placeholder="Search users..."
                                        value={userSearchQuery}
                                        onChange={(e) => setUserSearchQuery(e.target.value)}
                                        className="bg-gray-700 border-gray-600 text-gray-100 placeholder:text-gray-400 pr-8"
                                        disabled={loadingUsers || users.length === 0}
                                    />
                                    {userSearchQuery && (
                                        <button
                                            onClick={() => setUserSearchQuery('')}
                                            className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-200"
                                            disabled={loadingUsers}
                                        >
                                            <X className="h-4 w-4" />
                                        </button>
                                    )}
                                </div>
                            </div>

                            {/* User Loading State */}
                            {loadingUsers && (
                                <div className="text-center py-12">
                                    <div className="animate-pulse flex flex-col items-center">
                                        <RefreshCw className="h-8 w-8 text-gray-400 animate-spin mb-4" />
                                        <div className="text-gray-100 font-medium">
                                            {hasLoadedUsers && isRefresh ? 'Refreshing user data from Slack...' : 
                                             hasLoadedUsers ? 'Loading users from database...' : 
                                             'Loading users from Slack...'}
                                        </div>
                                        <div className="text-gray-400 text-sm mt-2">
                                            {hasLoadedUsers && isRefresh ? 'Getting the latest user information from Slack API' : 
                                             hasLoadedUsers ? 'Retrieving stored user data from Supabase' : 
                                             'This may take a moment for workspaces with many users'}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* User Error State */}
                            {userError && (
                                <div className="bg-red-900/50 border-2 border-red-700 text-red-200 px-6 py-4 rounded-xl font-medium mb-6">
                                    <div className="mb-2">{userError}</div>
                                    
                                    {userError.includes('RLS policy') || userError.includes('environment variables') ? (
                                        <div className="mt-4 text-sm">
                                            <h3 className="font-bold mb-2">Setup Instructions:</h3>
                                            <ol className="list-decimal pl-5 space-y-2">
                                                <li>Create a Supabase project at <a href="https://supabase.com" target="_blank" rel="noopener noreferrer" className="underline hover:text-red-100">supabase.com</a></li>
                                                <li>Go to Project Settings &gt; API to get your URL and keys</li>
                                                <li>Create a <code className="bg-red-900/70 px-1 rounded">.env.local</code> file in your project root with:
                                                    <pre className="bg-red-900/70 p-2 mt-1 rounded overflow-x-auto">
                                                        NEXT_PUBLIC_SUPABASE_URL=your_supabase_url<br/>
                                                        NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key<br/>
                                                        SUPABASE_SERVICE_ROLE_KEY=your_service_role_key<br/>
                                                        SLACK_BOT_TOKEN=your_slack_bot_token
                                                    </pre>
                                                </li>
                                                <li>Run the SQL script in <code className="bg-red-900/70 px-1 rounded">app/slack_analyzer/db/schema.sql</code> in the Supabase SQL Editor</li>
                                                <li>Restart your development server</li>
                                            </ol>
                                        </div>
                                    ) : null}
                                </div>
                            )}

                            {/* Users Table */}
                            {!loadingUsers && users.length > 0 && (
                                <div>
                                    <div className="mb-4 text-gray-300 flex justify-between items-center">
                                        <div>
                                            Showing {filteredUsers.length} of {users.length} users
                                        </div>
                                        <div className="text-sm text-gray-400">
                                            <span className="inline-flex items-center">
                                                <span className="w-2 h-2 rounded-full bg-green-400 mr-2"></span>
                                                Data loaded from {hasLoadedUsers && !isRefresh ? 'database' : 'Slack API'}
                                                {lastUpdated && (
                                                    <span className="ml-2">
                                                        · Last updated: {format(lastUpdated, 'MMM dd, yyyy HH:mm:ss')}
                                                    </span>
                                                )}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="rounded-md border border-gray-700 overflow-hidden">
                                        <Table>
                                            <TableHeader className="bg-gray-750">
                                                <TableRow className="hover:bg-gray-700 border-gray-700">
                                                    <TableHead className="text-gray-300">User</TableHead>
                                                    <TableHead className="text-gray-300">Display Name</TableHead>
                                                    <TableHead className="text-gray-300">Email</TableHead>
                                                    <TableHead className="text-gray-300">Status</TableHead>
                                                    <TableHead className="text-gray-300">Role</TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {filteredUsers.map((user) => (
                                                    <TableRow key={user.id} className="hover:bg-gray-750 border-gray-700">
                                                        <TableCell className="font-medium text-gray-200">
                                                            <div className="flex items-center gap-3">
                                                                {user.image_url ? (
                                                                    <img 
                                                                        src={user.image_url} 
                                                                        alt={user.name || 'User'} 
                                                                        className="w-8 h-8 rounded-full"
                                                                    />
                                                                ) : (
                                                                    <div className="w-8 h-8 rounded-full bg-indigo-500/20 flex items-center justify-center">
                                                                        <span className="text-sm font-semibold text-indigo-300">
                                                                            {(user.name || 'U').charAt(0).toUpperCase()}
                                                                        </span>
                                                                    </div>
                                                                )}
                                                                <span>{user.real_name || user.name}</span>
                                                            </div>
                                                        </TableCell>
                                                        <TableCell className="text-gray-300">
                                                            {user.display_name || '-'}
                                                        </TableCell>
                                                        <TableCell className="text-gray-300">
                                                            {user.email || '-'}
                                                        </TableCell>
                                                        <TableCell>
                                                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                                                user.is_active 
                                                                    ? 'bg-green-500/20 text-green-300' 
                                                                    : 'bg-red-500/20 text-red-300'
                                                            }`}>
                                                                {user.is_active ? 'Active' : 'Deactivated'}
                                                            </span>
                                                        </TableCell>
                                                        <TableCell className="text-gray-300">
                                                            {user.is_owner 
                                                                ? 'Owner' 
                                                                : user.is_admin 
                                                                    ? 'Admin' 
                                                                    : user.is_bot 
                                                                        ? 'Bot' 
                                                                        : 'Member'}
                                                        </TableCell>
                                                    </TableRow>
                                                ))}
                                            </TableBody>
                                        </Table>
                                    </div>
                                </div>
                            )}

                            {/* No Users State */}
                            {!loadingUsers && users.length === 0 && !userError && (
                                <div className="text-center py-12">
                                    <div className="text-gray-300 font-medium mb-4">
                                        No user data available.
                                    </div>
                                    <div className="text-gray-400 text-sm mb-2">
                                        {workspaceId ? 
                                            'No users found in the database for this workspace. Click "Fetch Users" to load user data from Slack.' : 
                                            'Click "Fetch Users" to load user data from Slack and store it in your database.'}
                                    </div>
                                    {lastUpdated && (
                                        <div className="text-gray-500 text-xs mb-6">
                                            Last checked: {format(lastUpdated, 'MMM dd, yyyy HH:mm:ss')}
                                        </div>
                                    )}
                                    <Button
                                        onClick={() => fetchUsers(false)}
                                        variant="outline"
                                        className="bg-gray-700 border-gray-600 text-gray-100 hover:bg-gray-600 flex items-center gap-2"
                                    >
                                        <Users className="h-4 w-4" />
                                        Fetch Users
                                    </Button>
                                </div>
                            )}

                            {/* Cache Stats */}
                            {workspaceId && hasLoadedUsers && (
                                <div className="mt-8">
                                    <CacheStats 
                                        getStats={getCacheStats} 
                                        refreshCache={refreshUserCache} 
                                    />
                </div>
            )}
                        </div>
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    );
}

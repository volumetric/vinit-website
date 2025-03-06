'use client';

import { useEffect, useState } from "react";
import { format } from 'date-fns';
import { SlackUser } from './types/database';
import useUserCache from './hooks/useUserCache';
import { initializeUserCache, scheduleUserCacheRefresh } from './utils/cacheInitializer';
import { Channel, Message, ConversationDocument } from './types/interfaces';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { X, Search, RefreshCw, Info, Users, ChevronDown, ArrowUp, ArrowDown, MessageCircle, FileText, Edit3 } from "lucide-react";
import UsersList from "./components/user/UsersList";
import ConversationsList from "./components/conversation/ConversationsList";
import ConversationDetail from "./components/conversation/ConversationDetail";
import SimpleConversationDetail from "./components/conversation/SimpleConversationDetail";
import CacheStats from "./components/CacheStats";

// Workspace configuration constants
const DEFAULT_WORKSPACE_ID = "b4974b15-c113-42b3-9b88-a60d3a8b2773";
const TEAM_ID = "T19R6KUS0";  // Use the existing value
const WORKSPACE_NAME = "Tars Team";  // Use the existing value
const WORKSPACE_SUBDOMAIN = "hellotars";  // Use the existing value

export default function SlackAnalyzer() {
    // Main state
    const [activeTab, setActiveTab] = useState('users');
    
    // Channel & messages state
    const [channels, setChannels] = useState<Channel[]>([]);
    const [selectedChannel, setSelectedChannel] = useState<string | null>(null);
    const [selectedChannelName, setSelectedChannelName] = useState<string | null>(null);
    const [conversations, setConversations] = useState<ConversationDocument[]>([]);
    const [loadingConversations, setLoadingConversations] = useState(false);
    const [loadingChannels, setLoadingChannels] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [channelSearchQuery, setChannelSearchQuery] = useState('');
    const [conversationsError, setConversationsError] = useState<string | null>(null);
    const [channelsError, setChannelsError] = useState<string | null>(null);
    const [showConversationPane, setShowConversationPane] = useState(false);
    const [isSimpleMode, setIsSimpleMode] = useState(false);
    
    // User data state
    const [users, setUsers] = useState<SlackUser[]>([]);
    const [loadingUsers, setLoadingUsers] = useState(false);
    const [userError, setUserError] = useState<string | null>(null);
    const [workspaceId, setWorkspaceId] = useState<string | null>(DEFAULT_WORKSPACE_ID);
    const [hasLoadedUsers, setHasLoadedUsers] = useState(false);
    const [isRefresh, setIsRefresh] = useState(false);
    const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
    const [userStatusFilter, setUserStatusFilter] = useState<'active' | 'inactive' | 'all'>('active');
    const [userBotFilter, setUserBotFilter] = useState<'human' | 'bot' | 'all'>('human');
    const [userSortField, setUserSortField] = useState<'created_at' | 'display_name'>('created_at');
    const [userSortDirection, setUserSortDirection] = useState<'asc' | 'desc'>('asc');

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
        }).catch((err: Error) => {
            console.error('Error initializing user cache:', err);
        });
        
        // Set up a refresh schedule
        const cleanup = scheduleUserCacheRefresh(3600000); // 1 hour
        
        // Add refresh callback
        const refreshInterval = setInterval(() => {
            console.log('Scheduled cache refresh triggered');
            refreshUserCache().catch((err: Error) => console.error('Error refreshing cache:', err));
        }, 3600000);

        // Clean up on unmount
        return () => {
            cleanup();
            clearInterval(refreshInterval);
        };
    }, [refreshUserCache]);

    // Effect to fetch channels on initial load
    useEffect(() => {
        fetchChannels();
    }, []);

    // Effect to fetch users when tab changes to users
    useEffect(() => {
        if (activeTab === 'users' && !hasLoadedUsers && workspaceId) {
            fetchUsers();
        }
    }, [activeTab, hasLoadedUsers, workspaceId]);

    // Format timestamp for display
    const formatTimestamp = (ts: string) => {
        return format(new Date(parseFloat(ts) * 1000), 'MMM d, yyyy h:mm a');
    };

    // Clear search query
    const clearSearch = () => {
        setSearchQuery('');
    };

    // Clear channel search query
    const clearChannelSearch = () => {
        setChannelSearchQuery('');
    };

    // Handle channel selection
    const handleChannelSelect = (channelId: string, channelName: string) => {
        setSelectedChannel(channelId);
        setSelectedChannelName(channelName);
        fetchMessages(channelId);
        setShowConversationPane(true);
    };

    // Close conversation pane
    const closeConversationPane = () => {
        setShowConversationPane(false);
    };

    // Fetch channels list
    const fetchChannels = async () => {
        try {
            setLoadingChannels(true);
            setChannelsError(null);
            
            const response = await fetch('/slack_analyzer/api?action=listChannels');
            const data = await response.json();
            
            if (data.success) {
                // Sort channels alphabetically
                const sortedChannels = data.channels.sort((a: Channel, b: Channel) => 
                    a.name.localeCompare(b.name)
                );
                setChannels(sortedChannels);
            } else {
                setChannelsError(data.error || 'Failed to load channels');
            }
        } catch (err) {
            console.error('Error fetching channels:', err);
            setChannelsError('Failed to load channels');
        } finally {
            setLoadingChannels(false);
        }
    };

    // Fetch conversations for a channel
    const fetchMessages = async (channelId: string, query = '') => {
        try {
            setLoadingConversations(true);
            setConversationsError(null);
            
            const queryParam = query ? `&query=${encodeURIComponent(query)}` : '';
            const response = await fetch(`/slack_analyzer/api?action=fetchMessages&channelId=${channelId}${queryParam}`);
            const data = await response.json();
            
            if (data.success) {
                setConversations(data.conversations || []);
                setSearchQuery(query);
            } else {
                setConversationsError(data.error || 'Failed to load conversations');
                setConversations([]);
            }
        } catch (err) {
            console.error('Error fetching messages:', err);
            setConversationsError('Failed to load conversations');
            setConversations([]);
        } finally {
            setLoadingConversations(false);
        }
    };

    // Fetch users from database or Slack API
    const fetchUsers = async (isRefreshRequest = false) => {
        try {
            setLoadingUsers(true);
            setUserError(null);
            setIsRefresh(isRefreshRequest);
            
            // If we're refreshing, skip the Supabase check and fetch directly from Slack
            if (isRefreshRequest) {
                const refreshResponse = await fetch(`/slack_analyzer/api?action=refreshUsers&teamId=${TEAM_ID}&workspaceName=${WORKSPACE_NAME}&workspaceDomain=${WORKSPACE_SUBDOMAIN}`);
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
                const workspaceResponse = await fetch(`/slack_analyzer/api?action=getWorkspaceByTeamId&teamId=${TEAM_ID}`);
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
                        } else {
                            setUserError(usersData.error || 'Failed to fetch user details');
                        }
                    } else {
                        // Workspace exists but has no users
                        setUsers([]);
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
                    } else {
                        setUserError(usersData.error || 'Failed to fetch user details');
                    }
                } else {
                    // Workspace exists but has no users
                    setUsers([]);
                }
            }
            
            // If we get here, we need to fetch from Slack
            const response = await fetch(`/slack_analyzer/api?action=fetchUsers&teamId=${TEAM_ID}&workspaceName=${WORKSPACE_NAME}&workspaceDomain=${WORKSPACE_SUBDOMAIN}`);
            const data = await response.json();
            
            if (data.success) {
                setWorkspaceId(data.workspaceId);
                
                // Now fetch the user data we just imported
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
            setUserError('Failed to fetch user details');
        } finally {
            setLoadingUsers(false);
        }
    };

    // Handle API errors
    const handleApiError = (data: any) => {
        if (data.error === 'token_missing') {
            setUserError('Slack API token not configured. Please set up your environment variables.');
        } else if (data.error === 'invalid_auth') {
            setUserError('Invalid Slack API token. Please check your credentials.');
        } else {
            setUserError(data.error || 'An unknown error occurred');
        }
    };

    const toggleSimpleMode = () => {
        setIsSimpleMode(prev => !prev);
    };

    // Filter channels based on search
    const filteredChannels = channels.filter(channel => {
        if (!channelSearchQuery.trim()) return true;
        return channel.name.toLowerCase().includes(channelSearchQuery.toLowerCase());
    });

    return (
        <div className="container mx-auto p-6 max-w-7xl">
            {/* Workspace Information */}
            <Card className="bg-gray-800 border-gray-700 mb-6">
                <CardHeader className="pb-2">
                    <CardTitle className="text-xl text-gray-100">Slack Workspace</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div className="space-y-1">
                            <div className="text-gray-400">Workspace Name</div>
                            <div className="text-gray-100 font-medium">{WORKSPACE_NAME}</div>
                        </div>
                        <div className="space-y-1">
                            <div className="text-gray-400">Subdomain</div>
                            <div className="text-gray-100 font-medium">{WORKSPACE_SUBDOMAIN}</div>
                        </div>
                        <div className="space-y-1">
                            <div className="text-gray-400">Team ID</div>
                            <div className="text-gray-100 font-medium font-mono">{TEAM_ID}</div>
                        </div>
                        <div className="space-y-1">
                            <div className="text-gray-400">Workspace ID</div>
                            <div className="text-gray-100 font-medium font-mono text-xs truncate" title={workspaceId || ''}>
                                {workspaceId}
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Main Tabs */}
            <Tabs 
                defaultValue="users" 
                value={activeTab}
                onValueChange={setActiveTab}
                className="space-y-6"
            >
                <TabsList className="bg-gray-800 border border-gray-700 mb-2 w-full p-1">
                    <TabsTrigger 
                        value="users"
                        className="data-[state=active]:bg-indigo-600 data-[state=active]:text-white text-md py-3 flex-1"
                    >
                        <Users className="h-5 w-5 mr-2" />
                        Users
                    </TabsTrigger>
                    <TabsTrigger 
                        value="channels"
                        className="data-[state=active]:bg-indigo-600 data-[state=active]:text-white text-md py-3 flex-1"
                    >
                        <MessageCircle className="h-5 w-5 mr-2" />
                        Channels
                    </TabsTrigger>
                </TabsList>
                
                {/* Users Tab */}
                <TabsContent value="users">
                    <Card className="bg-gray-850 border-gray-700">
                        <CardContent className="p-6">
                            <div className="space-y-6">
                                <div className="flex justify-between items-center">
                                    <h2 className="text-xl font-semibold text-gray-100 flex items-center gap-2">
                                        <Users className="h-5 w-5" />
                                        Workspace Users
                                    </h2>
                                    <div className="flex gap-2">
                                        <div className="relative">
                                            <select
                                                value={userStatusFilter}
                                                onChange={(e) => setUserStatusFilter(e.target.value as 'active' | 'inactive' | 'all')}
                                                className="bg-gray-700 border border-gray-600 text-gray-200 rounded px-3 py-1.5 pr-8 appearance-none"
                                            >
                                                <option value="active">Active Users</option>
                                                <option value="inactive">Deactivated Users</option>
                                                <option value="all">All Status</option>
                                            </select>
                                            <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                                        </div>
                                        
                                        <div className="relative">
                                            <select
                                                value={userBotFilter}
                                                onChange={(e) => setUserBotFilter(e.target.value as 'human' | 'bot' | 'all')}
                                                className="bg-gray-700 border border-gray-600 text-gray-200 rounded px-3 py-1.5 pr-8 appearance-none"
                                            >
                                                <option value="human">Humans Only</option>
                                                <option value="bot">Bots Only</option>
                                                <option value="all">All Types</option>
                                            </select>
                                            <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                                        </div>
                                        
                                        <Button
                                            onClick={() => fetchUsers(true)}
                                            size="sm"
                                            variant="outline"
                                            className="bg-gray-700 hover:bg-gray-600 text-gray-100 border-gray-600"
                                            disabled={loadingUsers || isRefresh}
                                        >
                                            <RefreshCw className={`h-4 w-4 mr-2 ${isRefresh ? 'animate-spin' : ''}`} />
                                            Refresh Users
                                        </Button>
                                    </div>
                                </div>

                                {lastUpdated && (
                                    <div className="text-sm text-gray-400">
                                        Last updated: {lastUpdated.toLocaleString()}
                                    </div>
                                )}

                                {userError && (
                                    <div className="bg-red-900/20 border border-red-700 text-red-300 p-4 rounded">
                                        {userError}
                                    </div>
                                )}

                                {/* Custom User Search and Sort */}
                                <div className="flex flex-col sm:flex-row gap-4">
                                    <div className="relative flex-1">
                                        <Input 
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                            placeholder="Search users..."
                                            className="bg-gray-700 border-gray-600 text-gray-200 w-full pl-10"
                                        />
                                        <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                        {searchQuery && (
                                            <button 
                                                onClick={clearSearch}
                                                className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-300"
                                            >
                                                <X className="h-4 w-4" />
                                            </button>
                                        )}
                                    </div>
                                    
                                    <div className="flex items-center gap-2">
                                        <span className="text-sm text-gray-400">Sort by:</span>
                                        <div className="relative">
                                            <select
                                                value={userSortField}
                                                onChange={(e) => setUserSortField(e.target.value as 'created_at' | 'display_name')}
                                                className="bg-gray-700 border border-gray-600 text-gray-200 rounded px-3 py-1.5 pr-8 appearance-none"
                                            >
                                                <option value="created_at">Join Date</option>
                                                <option value="display_name">Name</option>
                                            </select>
                                            <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                                        </div>
                                        
                                        <button
                                            onClick={() => setUserSortDirection(userSortDirection === 'asc' ? 'desc' : 'asc')}
                                            className="p-1.5 bg-gray-700 border border-gray-600 rounded hover:bg-gray-600 transition-colors"
                                            title={userSortDirection === 'asc' ? 'Ascending order' : 'Descending order'}
                                        >
                                            {userSortDirection === 'asc' ? (
                                                <ArrowUp className="h-4 w-4 text-gray-300" />
                                            ) : (
                                                <ArrowDown className="h-4 w-4 text-gray-300" />
                                            )}
                                        </button>
                                    </div>
                                </div>
                                
                                {/* User Table */}
                                {loadingUsers ? (
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
                                ) : !users.length ? (
                                    <div className="bg-gray-800 border border-gray-700 p-6 rounded-lg text-center">
                                        <p className="text-gray-400">
                                            {workspaceId ?
                                                'No users found in the database for this workspace. Click "Refresh Users" to load user data from Slack.' :
                                                'Please select a workspace first to view users.'}
                                        </p>
                                    </div>
                                ) : (
                                    <>
                                        {/* Filtered Users Count */}
                                        <div className="text-sm text-gray-400 mb-4">
                                            {(() => {
                                                const filteredUsers = users.filter(user => {
                                                    // Status filter
                                                    if (userStatusFilter === 'active' && !user.is_active) return false;
                                                    if (userStatusFilter === 'inactive' && user.is_active) return false;
                                                    
                                                    // Bot/Human filter
                                                    if (userBotFilter === 'human' && user.is_bot) return false;
                                                    if (userBotFilter === 'bot' && !user.is_bot) return false;
                                                    
                                                    // Search query filter
                                                    if (searchQuery.trim()) {
                                                        const query = searchQuery.toLowerCase();
                                                        return (
                                                            (user.display_name && user.display_name.toLowerCase().includes(query)) ||
                                                            (user.real_name && user.real_name.toLowerCase().includes(query)) ||
                                                            (user.name && user.name.toLowerCase().includes(query)) ||
                                                            (user.user_id && user.user_id.toLowerCase().includes(query))
                                                        );
                                                    }
                                                    return true;
                                                });
                                                
                                                return `Showing ${filteredUsers.length} of ${users.length} users`;
                                            })()}
                                        </div>
                                        
                                        <div className="rounded-md border border-gray-700 overflow-hidden">
                                            <table className="w-full">
                                                <thead className="bg-gray-800">
                                                    <tr className="border-gray-700 hover:bg-gray-750">
                                                        <th className="py-3 px-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">User</th>
                                                        <th className="py-3 px-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">User ID</th>
                                                        <th className="py-3 px-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Status</th>
                                                        <th className="py-3 px-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Role</th>
                                                        <th 
                                                            className={`py-3 px-4 text-left text-xs font-medium uppercase tracking-wider cursor-pointer ${userSortField === 'created_at' ? 'text-indigo-300' : 'text-gray-300'}`}
                                                            onClick={() => {
                                                                setUserSortField('created_at');
                                                                if (userSortField === 'created_at') {
                                                                    setUserSortDirection(userSortDirection === 'asc' ? 'desc' : 'asc');
                                                                }
                                                            }}
                                                        >
                                                            <div className="flex items-center">
                                                                Joined
                                                                {userSortField === 'created_at' && (
                                                                    <span className="ml-1">
                                                                        {userSortDirection === 'asc' ? '↑' : '↓'}
                                                                    </span>
                                                                )}
                                                            </div>
                                                        </th>
                                                        <th className="py-3 px-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Last Activity</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="bg-gray-800 divide-y divide-gray-700">
                                                    {users
                                                        .filter(user => {
                                                            // Status filter
                                                            if (userStatusFilter === 'active' && !user.is_active) return false;
                                                            if (userStatusFilter === 'inactive' && user.is_active) return false;
                                                            
                                                            // Bot/Human filter
                                                            if (userBotFilter === 'human' && user.is_bot) return false;
                                                            if (userBotFilter === 'bot' && !user.is_bot) return false;
                                                            
                                                            // Search query filter
                                                            if (searchQuery.trim()) {
                                                                const query = searchQuery.toLowerCase();
                                                                return (
                                                                    (user.display_name && user.display_name.toLowerCase().includes(query)) ||
                                                                    (user.real_name && user.real_name.toLowerCase().includes(query)) ||
                                                                    (user.name && user.name.toLowerCase().includes(query)) ||
                                                                    (user.user_id && user.user_id.toLowerCase().includes(query))
                                                                );
                                                            }
                                                            return true;
                                                        })
                                                        .sort((a, b) => {
                                                            if (userSortField === 'created_at') {
                                                                const dateA = a.created_at ? new Date(a.created_at).getTime() : 0;
                                                                const dateB = b.created_at ? new Date(b.created_at).getTime() : 0;
                                                                return userSortDirection === 'asc' ? dateA - dateB : dateB - dateA;
                                                            } else {
                                                                const nameA = (a.display_name || a.real_name || a.name || a.user_id || '').toLowerCase();
                                                                const nameB = (b.display_name || b.real_name || b.name || b.user_id || '').toLowerCase();
                                                                return userSortDirection === 'asc' 
                                                                    ? nameA.localeCompare(nameB)
                                                                    : nameB.localeCompare(nameA);
                                                            }
                                                        })
                                                        .map(user => (
                                                            <tr key={user.id} className="border-gray-700 hover:bg-gray-750">
                                                                <td className="py-3 px-4">
                                                                    <div className="flex items-center">
                                                                        {user.image_url ? (
                                                                            <img 
                                                                                src={user.image_url} 
                                                                                alt={user.display_name || user.real_name || user.name || ''} 
                                                                                className="w-8 h-8 rounded-full mr-3"
                                                                            />
                                                                        ) : (
                                                                            <div className="w-8 h-8 rounded-full bg-indigo-500/30 flex items-center justify-center text-sm font-semibold mr-3">
                                                                                {(user.display_name || user.real_name || user.name || user.user_id).charAt(0).toUpperCase()}
                                                                            </div>
                                                                        )}
                                                                        <div>
                                                                            <div className="text-gray-200 font-medium">
                                                                                {user.display_name || user.real_name || user.name || user.user_id}
                                                                            </div>
                                                                            {user.email && (
                                                                                <div className="text-gray-400 text-xs">
                                                                                    {user.email}
                                                                                </div>
                                                                            )}
                                                                        </div>
                                                                    </div>
                                                                </td>
                                                                <td className="py-3 px-4 font-mono text-xs text-gray-400">{user.user_id}</td>
                                                                <td className="py-3 px-4">
                                                                    <span className={`px-2 py-1 rounded text-xs ${
                                                                        user.is_active 
                                                                            ? 'bg-green-500/20 text-green-300' 
                                                                            : 'bg-red-500/20 text-red-300'
                                                                    }`}>
                                                                        {user.is_active ? 'Active' : 'Deactivated'}
                                                                    </span>
                                                                </td>
                                                                <td className="py-3 px-4 text-gray-300">
                                                                    <span className={`px-2 py-1 rounded text-xs ${
                                                                        user.is_owner 
                                                                            ? 'bg-purple-500/20 text-purple-300'
                                                                            : user.is_admin 
                                                                                ? 'bg-blue-500/20 text-blue-300'
                                                                                : user.is_bot 
                                                                                    ? 'bg-yellow-500/20 text-yellow-300'
                                                                                    : 'bg-gray-500/20 text-gray-300'
                                                                    }`}>
                                                                        {user.is_owner 
                                                                            ? 'Owner' 
                                                                            : user.is_admin 
                                                                                ? 'Admin' 
                                                                                : user.is_bot 
                                                                                    ? 'Bot' 
                                                                                    : 'Member'}
                                                            </span>
                                                                </td>
                                                                <td className="py-3 px-4 text-gray-300 text-sm">
                                                                    {user.created_at ? format(new Date(user.created_at), 'MMM d, yyyy') : 'Unknown'}
                                                                </td>
                                                                <td className="py-3 px-4 text-gray-300 text-sm">
                                                                    {user.updated ? format(new Date(user.updated), 'MMM d, yyyy') : 'Unknown'}
                                                                </td>
                                                            </tr>
                                                        ))}
                                                </tbody>
                                            </table>
                                        </div>
                                        
                                        {workspaceId && hasLoadedUsers && (
                                            <CacheStats 
                                                getStats={getCacheStats}
                                                refreshCache={refreshUserCache}
                                            />
                                        )}
                                    </>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
                
                {/* Channels Tab */}
                <TabsContent value="channels">
                    <div className="flex space-x-6">
                        {/* Channels List */}
                        <Card className={`bg-gray-850 border-gray-700 ${showConversationPane ? 'w-1/3' : 'w-full'} transition-all duration-300`}>
                            <CardHeader className="pb-2">
                                <div className="flex justify-between items-center">
                                    <CardTitle className="text-lg text-gray-100">Slack Channels</CardTitle>
                                    <Button
                                        onClick={fetchChannels}
                                        size="sm"
                                        variant="outline"
                                        className="bg-gray-700 hover:bg-gray-600 text-gray-100 border-gray-600"
                                        disabled={loadingChannels}
                                    >
                                        <RefreshCw className={`h-4 w-4 mr-2 ${loadingChannels ? 'animate-spin' : ''}`} />
                                        Refresh
                                    </Button>
                                </div>
                            </CardHeader>
                            <CardContent className="p-6">
                                {/* Search Box */}
                                <div className="relative mb-4">
                                    <Input 
                                        value={channelSearchQuery}
                                        onChange={(e) => setChannelSearchQuery(e.target.value)}
                                        placeholder="Search channels..."
                                        className="bg-gray-700 border-gray-600 text-gray-200 w-full pl-10"
                                    />
                                    <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                    {channelSearchQuery && (
                                        <button 
                                            onClick={clearChannelSearch}
                                            className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-300"
                                        >
                                            <X className="h-4 w-4" />
                                        </button>
                                    )}
                                </div>
                                
                                {channelsError && (
                                    <div className="bg-red-900/20 border border-red-700 text-red-300 p-4 rounded mb-4">
                                        {channelsError}
                                    </div>
                                )}
                                
                                {loadingChannels ? (
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
                                ) : (
                                    <div className="rounded-md border border-gray-700 overflow-hidden">
                                        <table className="w-full">
                                            <thead className="bg-gray-800">
                                                <tr className="border-b border-gray-700">
                                                    <th className="py-3 px-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Channel</th>
                                                    <th className="py-3 px-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Members</th>
                                                    <th className="py-3 px-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Type</th>
                                                </tr>
                                            </thead>
                                            <tbody className="bg-gray-800 divide-y divide-gray-700">
                                                {filteredChannels.length === 0 ? (
                                                    <tr>
                                                        <td colSpan={3} className="py-4 px-4 text-gray-400 text-center">
                                                            No channels found
                                                        </td>
                                                    </tr>
                                                ) : (
                                                    filteredChannels.map(channel => (
                                                        <tr 
                                                            key={channel.id} 
                                                            className={`hover:bg-gray-750 cursor-pointer transition-colors ${selectedChannel === channel.id ? 'bg-indigo-900/20' : ''}`}
                                                            onClick={() => handleChannelSelect(channel.id, channel.name)}
                                                        >
                                                            <td className="py-3 px-4 text-gray-200 font-medium">
                                                                # {channel.name}
                                                            </td>
                                                            <td className="py-3 px-4 text-gray-300">
                                                                {channel.member_count}
                                                            </td>
                                                            <td className="py-3 px-4">
                                                                <span className={`px-2 py-1 rounded text-xs ${
                                                                    channel.is_private 
                                                                        ? 'bg-gray-500/20 text-gray-300' 
                                                                        : 'bg-green-500/20 text-green-300'
                                                                }`}>
                                                                    {channel.is_private ? 'Private' : 'Public'}
                                                                </span>
                                                            </td>
                                                        </tr>
                                                    ))
                                                )}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                        
                        {/* Conversation Pane */}
                        {showConversationPane && (
                            <Card className="bg-gray-850 border-gray-700 w-2/3 transition-all duration-300">
                                <CardHeader className="pb-2">
                                    <div className="flex justify-between items-center">
                                        <CardTitle className="text-lg text-gray-100 flex items-center">
                                            <span>Conversations in #{selectedChannelName}</span>
                                        </CardTitle>
                                        <Button
                                            onClick={closeConversationPane}
                                            size="icon"
                                            variant="ghost"
                                            className="h-8 w-8 text-gray-400 hover:text-gray-200 hover:bg-gray-700"
                                        >
                                            <X className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </CardHeader>
                                <CardContent className="p-6">
                                    <ConversationsList
                                        conversations={conversations}
                                        loading={loadingConversations}
                                        error={conversationsError}
                                        workspaceId={workspaceId}
                                        formatTimestamp={formatTimestamp}
                                        isSimpleMode={isSimpleMode}
                                        toggleSimpleMode={toggleSimpleMode}
                                    />
                                </CardContent>
                            </Card>
                        )}
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    );
}
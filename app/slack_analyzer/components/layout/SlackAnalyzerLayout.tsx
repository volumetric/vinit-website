'use client';

import { useState } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ConversationsList from '../conversation/ConversationsList';
import UsersList from '../user/UsersList';
import ChannelSelector from '../channel/ChannelSelector';
import { SlackUser } from '../../types/database';
import { Message, ConversationDocument, CacheStatsData } from '../../types/interfaces';

interface SlackAnalyzerLayoutProps {
    // Channel & messages state
    selectedChannel: string | null;
    conversations: ConversationDocument[];
    loadingConversations: boolean;
    searchQuery: string;
    conversationsError: string | null;
    
    // User data state
    users: SlackUser[];
    loadingUsers: boolean;
    userError: string | null;
    workspaceId: string | null;
    hasLoadedUsers: boolean;
    isRefresh: boolean;
    lastUpdated: Date | null;
    
    // Functions
    handleChannelChange: (value: string) => void;
    clearSearch: () => void;
    formatTimestamp: (ts: string) => string;
    refreshUsers: (isRefresh?: boolean) => Promise<void>;
    getCacheStats: () => Promise<CacheStatsData>;
    refreshUserCache: () => Promise<void>;
}

export default function SlackAnalyzerLayout({
    // Channel & messages state
    selectedChannel,
    conversations,
    loadingConversations,
    searchQuery,
    conversationsError,
    
    // User data state
    users,
    loadingUsers,
    userError,
    workspaceId,
    hasLoadedUsers,
    isRefresh,
    lastUpdated,
    
    // Functions
    handleChannelChange,
    clearSearch,
    formatTimestamp,
    refreshUsers,
    getCacheStats,
    refreshUserCache
}: SlackAnalyzerLayoutProps) {
    const [activeTab, setActiveTab] = useState('conversations');

    const handleTabChange = (value: string) => {
        setActiveTab(value);
        
        // When switching to the users tab, load users if they haven't been loaded yet
        if (value === 'users' && !hasLoadedUsers && workspaceId) {
            refreshUsers();
        }
    };

    return (
        <div className="container mx-auto p-6 max-w-6xl">
            <h1 className="text-2xl font-bold text-gray-100 mb-6">Slack Analyzer</h1>
            
            {/* Channel Selector */}
            <div className="mb-6">
                <ChannelSelector
                    selectedChannel={selectedChannel}
                    onChannelChange={handleChannelChange}
                    onClearSearch={clearSearch}
                    hasSearchQuery={!!searchQuery}
                />
            </div>
            
            {/* Main Content */}
            <Card className="bg-gray-850 border-gray-700">
                <CardContent className="p-6">
                    <Tabs 
                        defaultValue="conversations" 
                        value={activeTab}
                        onValueChange={handleTabChange}
                        className="space-y-6"
                    >
                        <TabsList className="bg-gray-800 border border-gray-700">
                            <TabsTrigger 
                                value="conversations"
                                className="data-[state=active]:bg-indigo-600 data-[state=active]:text-white"
                            >
                                Conversations
                            </TabsTrigger>
                            <TabsTrigger 
                                value="users"
                                className="data-[state=active]:bg-indigo-600 data-[state=active]:text-white"
                            >
                                Users
                            </TabsTrigger>
                        </TabsList>
                        
                        <TabsContent value="conversations" className="mt-6">
                            <ConversationsList
                                conversations={conversations}
                                loading={loadingConversations}
                                error={conversationsError}
                                workspaceId={workspaceId}
                                formatTimestamp={formatTimestamp}
                            />
                        </TabsContent>
                        
                        <TabsContent value="users" className="mt-6">
                            <UsersList
                                users={users}
                                loading={loadingUsers}
                                error={userError}
                                workspaceId={workspaceId}
                                hasLoadedUsers={hasLoadedUsers}
                                isRefresh={isRefresh}
                                lastUpdated={lastUpdated}
                                onRefreshUsers={refreshUsers}
                                getCacheStats={getCacheStats}
                                refreshUserCache={refreshUserCache}
                            />
                        </TabsContent>
                    </Tabs>
                </CardContent>
            </Card>
        </div>
    );
} 
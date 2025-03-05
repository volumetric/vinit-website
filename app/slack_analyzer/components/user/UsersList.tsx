'use client';

import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Users, RefreshCw, X } from "lucide-react";
import { SlackUser } from '../../types/database';
import CacheStats from '../CacheStats';
import { CacheStatsData } from '../../types/interfaces';

interface UsersListProps {
    users: SlackUser[];
    loading: boolean;
    error: string | null;
    workspaceId: string | null;
    hasLoadedUsers: boolean;
    isRefresh: boolean;
    lastUpdated: Date | null;
    onRefreshUsers: (isRefresh?: boolean) => Promise<void>;
    getCacheStats: () => Promise<CacheStatsData>;
    refreshUserCache: () => Promise<void>;
}

export default function UsersList({
    users,
    loading,
    error,
    workspaceId,
    hasLoadedUsers,
    isRefresh,
    lastUpdated,
    onRefreshUsers,
    getCacheStats,
    refreshUserCache
}: UsersListProps) {
    const [searchQuery, setSearchQuery] = useState('');

    const filteredUsers = users.filter(user => {
        if (!searchQuery.trim()) return true;
        
        const query = searchQuery.toLowerCase();
        return (
            (user.display_name && user.display_name.toLowerCase().includes(query)) ||
            (user.real_name && user.real_name.toLowerCase().includes(query)) ||
            (user.name && user.name.toLowerCase().includes(query)) ||
            (user.user_id && user.user_id.toLowerCase().includes(query))
        );
    });

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchQuery(e.target.value);
    };

    const clearSearch = () => {
        setSearchQuery('');
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

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold text-gray-100 flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    Workspace Users
                </h2>
                <div className="flex gap-2">
                    <Button
                        onClick={() => onRefreshUsers(true)}
                        size="sm"
                        variant="outline"
                        className="bg-gray-700 hover:bg-gray-600 text-gray-100 border-gray-600"
                        disabled={loading || isRefresh}
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
            
            {error && (
                <div className="bg-red-900/20 border border-red-700 text-red-300 p-4 rounded">
                    {error}
                </div>
            )}
            
            <div className="relative">
                <Input 
                    value={searchQuery}
                    onChange={handleSearchChange}
                    placeholder="Search users..."
                    className="bg-gray-700 border-gray-600 text-gray-200 w-full"
                />
                {searchQuery && (
                    <button 
                        onClick={clearSearch}
                        className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-300"
                    >
                        <X className="h-4 w-4" />
                    </button>
                )}
            </div>
            
            {!users.length && !loading && (
                <div className="bg-gray-800 border border-gray-700 p-6 rounded-lg text-center">
                    <p className="text-gray-400">
                        {workspaceId ?
                            'No users found in the database for this workspace. Click "Fetch Users" to load user data from Slack.' :
                            'Please select a workspace first to view users.'}
                    </p>
                </div>
            )}
            
            {users.length > 0 && (
                <>
                    <div className="text-sm text-gray-400">
                        Showing {filteredUsers.length} of {users.length} users
                    </div>
                    
                    <div className="rounded-md border border-gray-700 overflow-hidden">
                        <Table>
                            <TableHeader className="bg-gray-800">
                                <TableRow className="border-gray-700 hover:bg-gray-750">
                                    <TableHead className="text-gray-300">User ID</TableHead>
                                    <TableHead className="text-gray-300">Username</TableHead>
                                    <TableHead className="text-gray-300">Display Name</TableHead>
                                    <TableHead className="text-gray-300">Real Name</TableHead>
                                    <TableHead className="text-gray-300">Status</TableHead>
                                    <TableHead className="text-gray-300">Role</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredUsers.map(user => (
                                    <TableRow key={user.id} className="border-gray-700 hover:bg-gray-750">
                                        <TableCell className="font-mono text-gray-400">{user.user_id}</TableCell>
                                        <TableCell className="text-gray-300">{user.name || '-'}</TableCell>
                                        <TableCell className="text-gray-300">{user.display_name || '-'}</TableCell>
                                        <TableCell className="text-gray-300">{user.real_name || '-'}</TableCell>
                                        <TableCell>
                                            <span className={`px-2 py-1 rounded text-xs ${
                                                user.is_active 
                                                    ? 'bg-green-500/20 text-green-300' 
                                                    : 'bg-red-500/20 text-red-300'
                                            }`}>
                                                {user.is_active ? 'Active' : 'Inactive'}
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
                </>
            )}
            
            {workspaceId && hasLoadedUsers && (
                <CacheStats 
                    getStats={getCacheStats}
                    refreshCache={refreshUserCache}
                />
            )}
        </div>
    );
} 
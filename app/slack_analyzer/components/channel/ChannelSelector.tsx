'use client';

import { useState, useEffect } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { Channel } from "../../types/interfaces";

interface ChannelSelectorProps {
    selectedChannel: string | null;
    onChannelChange: (channelId: string) => void;
    onClearSearch: () => void;
    hasSearchQuery: boolean;
}

export default function ChannelSelector({
    selectedChannel,
    onChannelChange,
    onClearSearch,
    hasSearchQuery
}: ChannelSelectorProps) {
    const [channels, setChannels] = useState<Channel[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Fetch channels on component mount
    useEffect(() => {
        fetchChannels();
    }, []);

    const fetchChannels = async () => {
        try {
            setLoading(true);
            setError(null);
            
            const response = await fetch('/slack_analyzer/api?action=getChannels');
            const data = await response.json();
            
            if (data.success) {
                // Sort channels alphabetically
                const sortedChannels = data.channels.sort((a: Channel, b: Channel) => 
                    a.name.localeCompare(b.name)
                );
                setChannels(sortedChannels);
                
                // If no channel is selected and we have channels, select the first one
                if (!selectedChannel && sortedChannels.length > 0) {
                    onChannelChange(sortedChannels[0].id);
                }
            } else {
                setError(data.error || 'Failed to load channels');
            }
        } catch (err) {
            console.error('Error fetching channels:', err);
            setError('Failed to load channels');
        } finally {
            setLoading(false);
        }
    };

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchQuery(e.target.value);
    };

    const handleSearchKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter' && selectedChannel) {
            onChannelChange(selectedChannel);
        }
    };

    return (
        <div className="bg-gray-800 border border-gray-700 p-6 rounded-lg shadow-lg space-y-4">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-gray-100">Slack Channels</h2>
                <Button
                    onClick={fetchChannels}
                    size="sm"
                    variant="outline"
                    className="bg-gray-700 hover:bg-gray-600 text-gray-100 border-gray-600"
                >
                    Refresh
                </Button>
            </div>
            
            {error && (
                <div className="text-red-400 text-sm mb-4">{error}</div>
            )}
            
            <div className="flex flex-col space-y-4">
                <Select
                    value={selectedChannel || ""}
                    onValueChange={onChannelChange}
                    disabled={loading || channels.length === 0}
                >
                    <SelectTrigger className="bg-gray-700 border-gray-600 text-gray-200">
                        <SelectValue placeholder="Select a channel" />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-700 border-gray-600 text-gray-200">
                        {channels.map(channel => (
                            <SelectItem 
                                key={channel.id} 
                                value={channel.id}
                                className="hover:bg-gray-600 focus:bg-gray-600"
                            >
                                {channel.name}
                                {channel.is_private && " 🔒"}
                                <span className="text-gray-400 ml-2">
                                    ({channel.member_count} members)
                                </span>
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
                
                <div className="flex space-x-2">
                    <div className="relative flex-1">
                        <Input 
                            value={searchQuery}
                            onChange={handleSearchChange}
                            onKeyDown={handleSearchKeyPress}
                            placeholder="Search in channel..."
                            className="bg-gray-700 border-gray-600 text-gray-200 w-full"
                            disabled={!selectedChannel || loading}
                        />
                        {hasSearchQuery && (
                            <button 
                                onClick={onClearSearch}
                                className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-300"
                            >
                                <X className="h-4 w-4" />
                            </button>
                        )}
                    </div>
                    <Button
                        onClick={() => selectedChannel && onChannelChange(selectedChannel)}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white"
                        disabled={!selectedChannel || loading}
                    >
                        Search
                    </Button>
                </div>
            </div>
        </div>
    );
} 
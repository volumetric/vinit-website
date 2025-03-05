/**
 * Common interface types shared across components
 */

export interface Channel {
    id: string;
    name: string;
    is_private: boolean;
    member_count: number;
}

export interface Reaction {
    name: string;
    count: number;
    users: string[];
}

export interface Message {
    ts: string;
    thread_ts?: string;
    user: string;
    text: string;
    files?: any[];
    reactions?: Reaction[];
}

export interface ConversationDocument {
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

export interface CacheStatsData {
    userCount: number;
    workspaceCount: number;
    maxAge: string;
    oldestEntry: string;
} 
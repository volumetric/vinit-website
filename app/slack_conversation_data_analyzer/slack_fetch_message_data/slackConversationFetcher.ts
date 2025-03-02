import { config } from 'dotenv';
import { WebClient } from '@slack/web-api';
import moment from 'moment';

// Load environment variables when running directly with Node
if (process.env.NODE_ENV !== 'production') {
    config({ path: '.env.local' });
}

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
    channel?: string;
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

// Initialize Slack Web Client with token from Next.js environment
const SLACK_BOT_TOKEN = process.env.NEXT_PUBLIC_SLACK_BOT_TOKEN || process.env.SLACK_BOT_TOKEN;
const slack = new WebClient(SLACK_BOT_TOKEN);

export class SlackConversationFetcher {
    constructor() {
        if (!SLACK_BOT_TOKEN) {
            throw new Error('SLACK_BOT_TOKEN is required in .env.local file');
        }
    }

    /**
     * List all channels the bot has access to
     */
    async listChannels(): Promise<Channel[]> {
        try {
            const result = await slack.conversations.list({
                types: 'public_channel,private_channel',
                limit: 1000,
                exclude_archived: true
            });

            if (!result.channels) {
                return [];
            }

            return result.channels
                .filter((channel): channel is Required<typeof channel> => {
                    return !!(channel.id && channel.name && typeof channel.is_private !== 'undefined' && typeof channel.num_members !== 'undefined');
                })
                .map(channel => ({
                    id: channel.id,
                    name: channel.name,
                    is_private: channel.is_private,
                    member_count: channel.num_members
                }));
        } catch (error) {
            console.error('Error listing channels:', error);
            throw error;
        }
    }

    /**
     * Fetch messages from a channel within a date range
     */
    async fetchChannelMessages(
        channelId: string,
        startDate?: Date,
        endDate?: Date
    ): Promise<ConversationDocument[]> {
        try {
            if (!startDate) {
                startDate = moment().subtract(30, 'days').toDate();
            }
            if (!endDate) {
                endDate = new Date();
            }

            const conversations: ConversationDocument[] = [];
            let cursor: string | undefined;

            do {
                const result = await slack.conversations.history({
                    channel: channelId,
                    limit: 100,
                    cursor: cursor,
                    oldest: moment(startDate).unix().toString(),
                    latest: moment(endDate).unix().toString()
                });

                await this.processMessages(result.messages as Message[], channelId, conversations);

                cursor = result.response_metadata?.next_cursor;
            } while (cursor);

            return conversations;
        } catch (error) {
            console.error('Error fetching channel messages:', error);
            throw error;
        }
    }

    /**
     * Process messages and organize them into conversations
     */
    private async processMessages(
        messages: Message[],
        channelId: string,
        conversations: ConversationDocument[]
    ): Promise<void> {
        for (const message of messages) {
            if (message.thread_ts) {
                if (message.thread_ts === message.ts) {
                    const threadMessages = await this.fetchThreadReplies(channelId, message.ts);
                    conversations.push(this.createConversationDocument(message, threadMessages));
                }
                continue;
            }

            if (!message.thread_ts) {
                conversations.push(this.createConversationDocument(message));
            }
        }
    }

    /**
     * Fetch all replies in a thread
     */
    private async fetchThreadReplies(channelId: string, threadTs: string): Promise<Message[]> {
        try {
            const result = await slack.conversations.replies({
                channel: channelId,
                ts: threadTs,
                limit: 100
            });

            return result.messages as Message[];
        } catch (error) {
            console.error('Error fetching thread replies:', error);
            return [];
        }
    }

    /**
     * Create a conversation document from a message and its replies
     */
    private createConversationDocument(
        parentMessage: Message,
        threadMessages: Message[] = []
    ): ConversationDocument {
        return {
            thread_id: parentMessage.thread_ts || parentMessage.ts,
            channel_id: parentMessage.channel || '',
            messages: threadMessages.length > 0 ? threadMessages : [parentMessage],
            participant_count: new Set([
                parentMessage.user,
                ...threadMessages.map(msg => msg.user)
            ]).size,
            timestamp: parentMessage.ts,
            has_files: this.checkForFiles(parentMessage) || 
                      threadMessages.some(msg => this.checkForFiles(msg)),
            metadata: {
                reply_count: threadMessages.length,
                reply_users: [...new Set(threadMessages.map(msg => msg.user))],
                reactions: this.extractReactions(parentMessage, threadMessages)
            }
        };
    }

    /**
     * Check if a message contains files
     */
    private checkForFiles(message: Message): boolean {
        return !!(message.files && message.files.length > 0);
    }

    /**
     * Extract reactions from a message and its replies
     */
    private extractReactions(
        parentMessage: Message,
        threadMessages: Message[]
    ): Record<string, number> {
        const allReactions = new Map<string, number>();

        if (parentMessage.reactions) {
            parentMessage.reactions.forEach(reaction => {
                allReactions.set(reaction.name, reaction.count);
            });
        }

        threadMessages.forEach(msg => {
            if (msg.reactions) {
                msg.reactions.forEach(reaction => {
                    const currentCount = allReactions.get(reaction.name) || 0;
                    allReactions.set(reaction.name, currentCount + reaction.count);
                });
            }
        });

        return Object.fromEntries(allReactions);
    }
} 
import { NextResponse } from 'next/server';
import { SlackConversationFetcher } from '../slack_fetch_message_data/slackConversationFetcher';

async function getMessagesByChannelName(
    fetcher: SlackConversationFetcher,
    channelName: string,
    startDate?: Date,
    endDate?: Date
) {
    // Get all channels first
    const channels = await fetcher.listChannels();
    
    // Find the channel by name
    const channel = channels.find(ch => ch.name === channelName);
    if (!channel) {
        throw new Error(`Channel "${channelName}" not found or bot doesn't have access to it`);
    }

    // Fetch messages from the channel
    return await fetcher.fetchChannelMessages(channel.id, startDate, endDate);
}

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const action = searchParams.get('action');
        const channelId = searchParams.get('channelId');
        const channelName = searchParams.get('channelName');
        const startDate = searchParams.get('startDate');
        const endDate = searchParams.get('endDate');

        const fetcher = new SlackConversationFetcher();

        switch (action) {
            case 'listChannels':
                const channels = await fetcher.listChannels();
                return NextResponse.json({ success: true, channels });

            case 'fetchMessages':
                if (!channelId && !channelName) {
                    return NextResponse.json(
                        { success: false, error: 'Either Channel ID or Channel Name is required' },
                        { status: 400 }
                    );
                }

                let conversations;
                if (channelName) {
                    conversations = await getMessagesByChannelName(
                        fetcher,
                        channelName,
                        startDate ? new Date(startDate) : undefined,
                        endDate ? new Date(endDate) : undefined
                    );
                } else {
                    conversations = await fetcher.fetchChannelMessages(
                        channelId!,
                        startDate ? new Date(startDate) : undefined,
                        endDate ? new Date(endDate) : undefined
                    );
                }
                
                return NextResponse.json({ 
                    success: true, 
                    conversations,
                    metadata: {
                        total_conversations: conversations.length,
                        date_range: {
                            start: startDate || 'last 30 days',
                            end: endDate || 'now'
                        }
                    }
                });

            default:
                return NextResponse.json(
                    { success: false, error: 'Invalid action' },
                    { status: 400 }
                );
        }
    } catch (error: any) {
        console.error('Error in Slack API route:', error);
        return NextResponse.json(
            { success: false, error: error.message || 'Unknown error occurred' },
            { status: 500 }
        );
    }
} 
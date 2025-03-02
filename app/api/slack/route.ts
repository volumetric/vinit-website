import { NextResponse } from 'next/server';
const { SlackConversationFetcher } = require('@/app/slack_conversation_data_analyzer/slack_fetch_message_data/slackConversationFetcher');

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const action = searchParams.get('action');
        const channelId = searchParams.get('channelId');
        const startDate = searchParams.get('startDate');
        const endDate = searchParams.get('endDate');

        const fetcher = new SlackConversationFetcher();

        switch (action) {
            case 'listChannels':
                const channels = await fetcher.listChannels();
                return NextResponse.json({ success: true, channels });

            case 'fetchMessages':
                if (!channelId) {
                    return NextResponse.json(
                        { success: false, error: 'Channel ID is required' },
                        { status: 400 }
                    );
                }
                const conversations = await fetcher.fetchChannelMessages(
                    channelId,
                    startDate ? new Date(startDate) : undefined,
                    endDate ? new Date(endDate) : undefined
                );
                return NextResponse.json({ success: true, conversations });

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
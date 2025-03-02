import { NextRequest, NextResponse } from 'next/server';
import { SlackConversationFetcher } from '../slack_fetch_message_data/slackConversationFetcher';
import SlackUserService from '../services/slackUserService';
import slackUserDbService from '../services/slackUserDbService';
import { supabase } from '../services/supabaseClient';

async function getMessagesByChannelName(
    fetcher: SlackConversationFetcher,
    channelName: string,
    startDate?: Date,
    endDate?: Date
) {
    // Get channel ID from name
    const channels = await fetcher.listChannels();
    const channel = channels.find(c => c.name === channelName);
    
    if (!channel) {
        throw new Error(`Channel not found: ${channelName}`);
    }
    
    // Fetch messages using the channel ID
    return await fetcher.fetchChannelMessages(
        channel.id,
        startDate,
        endDate
    );
}

export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams;
        const action = searchParams.get('action');
        
        // Get Slack token from environment variable
        const slackToken = process.env.SLACK_BOT_TOKEN;
        if (!slackToken) {
            return NextResponse.json({ 
                success: false, 
                error: 'Slack token not found in environment variables' 
            }, { status: 500 });
        }
        
        // Handle all possible actions
        switch (action) {
            case 'fetchUsers':
                return await handleFetchUsers(slackToken, searchParams);
                
            case 'refreshUsers':
                return await handleRefreshUsers(slackToken, searchParams);
                
            case 'getUsers':
                return await handleGetUsers(searchParams);
                
            case 'getUser':
                return await handleGetUser(searchParams);
                
            case 'getWorkspaceByTeamId':
                return await handleGetWorkspaceByTeamId(searchParams);
                
            case 'checkWorkspaceHasUsers':
                return await handleCheckWorkspaceHasUsers(searchParams);
                
            case 'listChannels': {
                const fetcher = new SlackConversationFetcher();
                const channels = await fetcher.listChannels();
                return NextResponse.json({ success: true, channels });
            }
                
            case 'fetchMessages': {
                const channelId = searchParams.get('channelId');
                const channelName = searchParams.get('channelName');
                const startDate = searchParams.get('startDate');
                const endDate = searchParams.get('endDate');
                
                if (!channelId && !channelName) {
                    return NextResponse.json(
                        { success: false, error: 'Either Channel ID or Channel Name is required' },
                        { status: 400 }
                    );
                }
                
                const fetcher = new SlackConversationFetcher();
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
            }
                
            default:
                return NextResponse.json(
                    { success: false, error: `Unknown action: ${action}` },
                    { status: 400 }
                );
        }
    } catch (error: any) {
        console.error('API route error:', error);
        return NextResponse.json({ 
            success: false, 
            error: error.message || 'Unknown error' 
        }, { status: 500 });
    }
}

/**
 * Fetches users from Slack and stores them in the database
 */
async function handleFetchUsers(slackToken: string, searchParams: URLSearchParams) {
    try {
        // Get workspace info from query params
        const teamId = searchParams.get('teamId');
        const workspaceName = searchParams.get('workspaceName');
        const workspaceDomain = searchParams.get('workspaceDomain');
        
        if (!teamId || !workspaceName) {
            return NextResponse.json({ 
                success: false, 
                error: 'Missing required parameters: teamId and workspaceName' 
            }, { status: 400 });
        }
        
        // Store workspace info in database
        const workspaceId = await slackUserDbService.upsertWorkspace({
            team_id: teamId,
            name: workspaceName,
            domain: workspaceDomain || null
        });
        
        // Fetch users from Slack
        const slackUserService = new SlackUserService(slackToken);
        const users = await slackUserService.fetchAllUsers(workspaceId);
        
        // Store users in database
        await slackUserDbService.bulkUpsertUsers(users);
        
        return NextResponse.json({ 
            success: true, 
            count: users.length,
            workspaceId
        });
    } catch (error: any) {
        console.error('Error in fetchUsers:', error);
        return NextResponse.json({ 
            success: false, 
            error: error.message || 'Error fetching users' 
        }, { status: 500 });
    }
}

/**
 * Refreshes user data from Slack
 * Similar to fetchUsers but typically called periodically
 */
async function handleRefreshUsers(slackToken: string, searchParams: URLSearchParams) {
    // This is similar to fetchUsers but may be triggered by a different context
    return handleFetchUsers(slackToken, searchParams);
}

/**
 * Gets all users for a workspace from database
 */
async function handleGetUsers(searchParams: URLSearchParams) {
    try {
        const workspaceId = searchParams.get('workspaceId');
        
        if (!workspaceId) {
            return NextResponse.json({ 
                success: false, 
                error: 'Missing required parameter: workspaceId' 
            }, { status: 400 });
        }
        
        const users = await slackUserDbService.getUsersByWorkspace(workspaceId);
        
        return NextResponse.json({ 
            success: true, 
            users,
            count: users.length
        });
    } catch (error: any) {
        console.error('Error in getUsers:', error);
        return NextResponse.json({ 
            success: false, 
            error: error.message || 'Error getting users' 
        }, { status: 500 });
    }
}

/**
 * Gets a specific user by their Slack user ID
 */
async function handleGetUser(searchParams: URLSearchParams) {
    try {
        const workspaceId = searchParams.get('workspaceId');
        const userId = searchParams.get('userId');
        
        if (!workspaceId || !userId) {
            return NextResponse.json({ 
                success: false, 
                error: 'Missing required parameters: workspaceId and userId' 
            }, { status: 400 });
        }
        
        const user = await slackUserDbService.getUserByUserId(workspaceId, userId);
        
        if (!user) {
            return NextResponse.json({ 
                success: false, 
                error: 'User not found' 
            }, { status: 404 });
        }
        
        return NextResponse.json({ 
            success: true, 
            user
        });
    } catch (error: any) {
        console.error('Error in getUser:', error);
        return NextResponse.json({ 
            success: false, 
            error: error.message || 'Error getting user' 
        }, { status: 500 });
    }
}

/**
 * Gets a workspace by its Slack team ID
 */
async function handleGetWorkspaceByTeamId(searchParams: URLSearchParams) {
    try {
        const teamId = searchParams.get('teamId');
        
        if (!teamId) {
            return NextResponse.json({ 
                success: false, 
                error: 'Missing required parameter: teamId' 
            }, { status: 400 });
        }
        
        // Query Supabase for the workspace
        const { data, error } = await supabase
            .from('workspaces')
            .select('*')
            .eq('team_id', teamId)
            .single();
        
        if (error) {
            // If no rows found, return success but with null workspace
            if (error.code === 'PGRST116') {
                return NextResponse.json({ 
                    success: true, 
                    workspace: null
                });
            }
            throw error;
        }
        
        return NextResponse.json({ 
            success: true, 
            workspace: data
        });
    } catch (error: any) {
        console.error('Error in getWorkspaceByTeamId:', error);
        return NextResponse.json({ 
            success: false, 
            error: error.message || 'Error getting workspace' 
        }, { status: 500 });
    }
}

/**
 * Checks if a workspace has any users in the database
 */
async function handleCheckWorkspaceHasUsers(searchParams: URLSearchParams) {
    try {
        const workspaceId = searchParams.get('workspaceId');
        
        if (!workspaceId) {
            return NextResponse.json({ 
                success: false, 
                error: 'Missing required parameter: workspaceId' 
            }, { status: 400 });
        }
        
        // Query Supabase to count users for this workspace
        const { count, error } = await supabase
            .from('slack_users')
            .select('*', { count: 'exact', head: true })
            .eq('workspace_id', workspaceId);
        
        if (error) throw error;
        
        return NextResponse.json({ 
            success: true, 
            hasUsers: count !== null && count > 0,
            count: count || 0
        });
    } catch (error: any) {
        console.error('Error in checkWorkspaceHasUsers:', error);
        return NextResponse.json({ 
            success: false, 
            error: error.message || 'Error checking workspace users' 
        }, { status: 500 });
    }
} 
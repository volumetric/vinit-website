import { WebClient } from '@slack/web-api';
import { SlackUser } from '@/app/slack_analyzer/types/database';

class SlackUserService {
  private client: WebClient;
  
  constructor(token: string) {
    this.client = new WebClient(token);
  }
  
  /**
   * Fetches all users from a Slack workspace
   * Handles pagination to ensure all users are retrieved
   */
  async fetchAllUsers(workspaceId: string): Promise<Partial<SlackUser>[]> {
    let users: Partial<SlackUser>[] = [];
    let cursor: string | undefined;
    
    try {
      do {
        // Fetch a batch of users with pagination
        const response = await this.client.users.list({
          cursor: cursor,
          limit: 200 // Maximum allowed by Slack API
        });
        
        if (!response.ok || !response.members) {
          throw new Error(`Failed to fetch users: ${response.error || 'Unknown error'}`);
        }
        
        // Transform the Slack user data to match our database schema
        const transformedUsers = response.members.map(member => this.transformSlackUser(member, workspaceId));
        users = [...users, ...transformedUsers];
        
        // Update cursor for pagination
        cursor = response.response_metadata?.next_cursor;
      } while (cursor);
      
      return users;
    } catch (error) {
      console.error('Error fetching users from Slack:', error);
      throw error;
    }
  }
  
  /**
   * Transforms a Slack user object to match our database schema
   */
  private transformSlackUser(slackUser: any, workspaceId: string): Partial<SlackUser> {
    return {
      workspace_id: workspaceId,
      user_id: slackUser.id,
      name: slackUser.name,
      real_name: slackUser.real_name,
      display_name: slackUser.profile?.display_name,
      email: slackUser.profile?.email,
      image_url: slackUser.profile?.image_192 || slackUser.profile?.image_72,
      is_admin: slackUser.is_admin || false,
      is_owner: slackUser.is_owner || false,
      is_bot: slackUser.is_bot || false,
      is_active: !slackUser.deleted,
      timezone: slackUser.tz,
      updated: new Date().toISOString()
    };
  }
}

export default SlackUserService; 
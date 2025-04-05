import { supabase, handleSupabaseError } from './supabaseClient';
import { Message, ConversationDocument } from '@/app/slack_analyzer/types/interfaces';
import { SlackConversation } from '@/app/slack_analyzer/types/database';
import SlackUserService from './slackUserService';
import userCache from './userCache';

export class SlackConversationService {
  private userService: SlackUserService | null = null;
  
  constructor() {
    // We'll initialize the SlackUserService on-demand when we have a token
    const slackToken = process.env.NEXT_PUBLIC_SLACK_BOT_TOKEN || process.env.SLACK_BOT_TOKEN;
    if (slackToken) {
      this.userService = new SlackUserService(slackToken);
    }
  }
  
  /**
   * Gets user information from cache or the database
   * @param workspaceId The workspace ID
   * @param userId The Slack user ID
   * @returns The user information or undefined if not found
   */
  private async getUserInfo(workspaceId: string, userId: string) {
    // Try to get user from cache first
    const cachedUser = await userCache.getUser(workspaceId, userId);
    if (cachedUser) {
      return cachedUser;
    }
    
    // If not found in cache, try to get from database
    try {
      const { data, error } = await supabase
        .from('slack_users')
        .select('*')
        .eq('workspace_id', workspaceId)
        .eq('user_id', userId)
        .single();
      
      if (error) {
        console.warn(`Error fetching user info for ${userId}:`, error);
        return undefined;
      }
      
      return data;
    } catch (error) {
      console.warn(`Error fetching user info for ${userId}:`, error);
      return undefined;
    }
  }

  /**
   * Converts a Slack conversation to simplified markdown plain text
   * @param conversation The conversation document containing messages
   * @param workspaceId The workspace ID for user lookups
   * @returns A markdown string representation of the conversation
   */
  async convertToMarkdown(conversation: ConversationDocument, workspaceId: string): Promise<string> {
    let markdown = `# Conversation in <#${conversation.channel_id}>\n\n`;
    
    // Sort messages by timestamp
    const sortedMessages = [...conversation.messages].sort((a, b) => 
      parseFloat(a.ts) - parseFloat(b.ts)
    );
    
    // Process each message
    for (const message of sortedMessages) {
      // Get user display name if possible
      let userIdentifier = message.user;
      try {
        const user = await this.getUserInfo(workspaceId, message.user);
        userIdentifier = user?.display_name || user?.real_name || user?.name || message.user;
      } catch (error) {
        console.warn(`Couldn't resolve user ${message.user}:`, error);
      }
      
      // Format timestamp
      const timestamp = new Date(parseFloat(message.ts) * 1000).toISOString()
        .replace('T', ' ')
        .replace(/\.\d+Z$/, '');
      
      // Add message to markdown
      markdown += `**${userIdentifier}** (${timestamp}):\n${message.text}\n\n`;
      
      // Add reactions if any
      if (message.reactions && message.reactions.length > 0) {
        markdown += "Reactions: ";
        markdown += message.reactions.map(r => `${r.name} (${r.count})`).join(', ');
        markdown += '\n\n';
      }
    }
    
    return markdown;
  }
  
  /**
   * Stores a simplified conversation in the slack_conversations table
   * @param conversation The conversation document
   * @param workspaceId The workspace ID
   * @returns The ID of the saved conversation
   */
  async saveConversation(conversation: ConversationDocument, workspaceId: string): Promise<string> {
    try {
      // First convert conversation to markdown
      const conversationText = await this.convertToMarkdown(conversation, workspaceId);
      
      // Check if conversation already exists
      const { data: existingConversation } = await supabase
        .from('slack_conversations')
        .select('id')
        .eq('thread_id', conversation.thread_id)
        .eq('workspace_id', workspaceId)
        .single();
      
      if (existingConversation) {
        // Update existing conversation
        const { error } = await supabase
          .from('slack_conversations')
          .update({
            conversation_text: conversationText,
            participant_count: conversation.participant_count,
            updated_at: new Date().toISOString()
          })
          .eq('id', existingConversation.id);
        
        if (error) throw error;
        return existingConversation.id;
      } else {
        // Insert new conversation
        const { data, error } = await supabase
          .from('slack_conversations')
          .insert({
            thread_id: conversation.thread_id,
            channel_id: conversation.channel_id,
            workspace_id: workspaceId,
            conversation_text: conversationText,
            participant_count: conversation.participant_count
          })
          .select('id')
          .single();
        
        if (error) throw error;
        return data.id;
      }
    } catch (error) {
      handleSupabaseError(error, 'save conversation');
      throw error;
    }
  }
  
  /**
   * Retrieves a conversation by its thread ID
   * @param threadId The Slack thread ID
   * @param workspaceId The workspace ID
   * @returns The conversation or null if not found
   */
  async getConversationByThreadId(threadId: string, workspaceId: string): Promise<SlackConversation | null> {
    try {
      const { data, error } = await supabase
        .from('slack_conversations')
        .select('*')
        .eq('thread_id', threadId)
        .eq('workspace_id', workspaceId)
        .single();
      
      if (error) {
        if (error.code === 'PGRST116') {
          // PGRST116 is the error code for "No rows returned"
          return null;
        }
        throw error;
      }
      
      return data;
    } catch (error) {
      handleSupabaseError(error, 'get conversation by thread ID');
      throw error;
    }
  }
}

// Export a singleton instance for convenience
const slackConversationService = new SlackConversationService();
export default slackConversationService; 
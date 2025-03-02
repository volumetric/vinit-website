import { supabase, handleSupabaseError } from './supabaseClient';
import { SlackUser, Workspace } from '@/app/slack_analyzer/types/database';

export class SlackUserDbService {
  /**
   * Creates or updates a workspace in the database
   */
  async upsertWorkspace(workspace: Partial<Workspace>): Promise<string> {
    try {
      // Check if workspace exists
      const { data: existingWorkspace } = await supabase
        .from('workspaces')
        .select('id')
        .eq('team_id', workspace.team_id)
        .single();
      
      if (existingWorkspace) {
        // Update existing workspace
        const { error } = await supabase
          .from('workspaces')
          .update(workspace)
          .eq('team_id', workspace.team_id);
        
        if (error) throw error;
        return existingWorkspace.id;
      } else {
        // Insert new workspace
        const { data, error } = await supabase
          .from('workspaces')
          .insert(workspace)
          .select('id')
          .single();
        
        if (error) throw error;
        return data.id;
      }
    } catch (error) {
      handleSupabaseError(error, 'upsert workspace');
      throw error;
    }
  }
  
  /**
   * Performs a bulk upsert of users for a workspace
   */
  async bulkUpsertUsers(users: Partial<SlackUser>[]): Promise<void> {
    try {
      // Split into batches of 100 to avoid large payload issues
      const batchSize = 100;
      for (let i = 0; i < users.length; i += batchSize) {
        const batch = users.slice(i, i + batchSize);
        
        const { error } = await supabase
          .from('slack_users')
          .upsert(batch, { 
            onConflict: 'workspace_id,user_id',
            ignoreDuplicates: false
          });
        
        if (error) throw error;
      }
    } catch (error) {
      handleSupabaseError(error, 'bulk upsert users');
      throw error;
    }
  }
  
  /**
   * Gets all users for a workspace
   */
  async getUsersByWorkspace(workspaceId: string): Promise<SlackUser[]> {
    try {
      const { data, error } = await supabase
        .from('slack_users')
        .select('*')
        .eq('workspace_id', workspaceId);
      
      if (error) throw error;
      return data || [];
    } catch (error) {
      handleSupabaseError(error, 'get users by workspace');
      return [];
    }
  }
  
  /**
   * Gets a user by their Slack user ID
   */
  async getUserByUserId(workspaceId: string, userId: string): Promise<SlackUser | null> {
    try {
      const { data, error } = await supabase
        .from('slack_users')
        .select('*')
        .eq('workspace_id', workspaceId)
        .eq('user_id', userId)
        .single();
      
      if (error) {
        if (error.code === 'PGRST116') { // No rows returned
          return null;
        }
        throw error;
      }
      
      return data;
    } catch (error) {
      handleSupabaseError(error, 'get user by ID');
      return null;
    }
  }
}

export default new SlackUserDbService(); 
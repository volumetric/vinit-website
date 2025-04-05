/**
 * TypeScript interface definitions for Supabase database schema
 */

export interface Workspace {
  id: string; // UUID
  team_id: string;
  name: string;
  domain: string | null;
  created_at: string; // ISO date string
  updated_at: string; // ISO date string
}

export interface SlackUser {
  id: string; // UUID
  workspace_id: string; // UUID reference to workspaces.id
  user_id: string; // Slack user ID
  name: string | null;
  real_name: string | null;
  display_name: string | null;
  email: string | null;
  image_url: string | null;
  is_admin: boolean;
  is_owner: boolean;
  is_bot: boolean;
  is_active: boolean;
  timezone: string | null;
  updated: string | null; // ISO date string
  created_at: string; // ISO date string
  updated_at: string; // ISO date string
}

export interface SlackConversation {
  id: string; // UUID
  thread_id: string; // The Slack thread ID (ts)
  channel_id: string; // The Slack channel ID
  workspace_id: string; // UUID reference to workspaces.id
  conversation_text: string; // The simplified markdown plain text of the conversation
  participant_count: number;
  created_at: string; // ISO date string
  updated_at: string; // ISO date string
} 
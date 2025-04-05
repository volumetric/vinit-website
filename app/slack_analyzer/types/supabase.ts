import { Workspace, SlackUser, SlackConversation } from './database';

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      workspaces: {
        Row: Workspace;
        Insert: Omit<Workspace, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<Workspace, 'id' | 'created_at' | 'updated_at'>>;
      };
      slack_users: {
        Row: SlackUser;
        Insert: Omit<SlackUser, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<SlackUser, 'id' | 'created_at' | 'updated_at'>>;
      };
      slack_conversations: {
        Row: SlackConversation;
        Insert: Omit<SlackConversation, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<SlackConversation, 'id' | 'created_at' | 'updated_at'>>;
      };
    };
    Views: {
      [key: string]: {
        Row: Record<string, unknown>;
      };
    };
    Functions: {
      [key: string]: {
        Args: Record<string, unknown>;
        Returns: unknown;
      };
    };
    Enums: {
      [key: string]: string[];
    };
  };
} 
-- Create workspaces table
CREATE TABLE IF NOT EXISTS workspaces (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    team_id TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    domain TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create trigger to update updated_at automatically
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_workspaces_updated_at
BEFORE UPDATE ON workspaces
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Create slack_users table
CREATE TABLE IF NOT EXISTS slack_users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
    user_id TEXT NOT NULL,
    name TEXT,
    real_name TEXT,
    display_name TEXT,
    email TEXT,
    image_url TEXT,
    is_admin BOOLEAN DEFAULT FALSE,
    is_owner BOOLEAN DEFAULT FALSE,
    is_bot BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    timezone TEXT,
    updated TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(workspace_id, user_id)
);

-- Create trigger for slack_users updated_at
CREATE TRIGGER update_slack_users_updated_at
BEFORE UPDATE ON slack_users
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Create index for faster lookups by user_id
CREATE INDEX IF NOT EXISTS idx_slack_users_user_id ON slack_users(user_id);

-- Create index for faster lookups by workspace_id
CREATE INDEX IF NOT EXISTS idx_slack_users_workspace_id ON slack_users(workspace_id);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_slack_users_is_active ON slack_users(is_active);

-- Create slack_conversations table
CREATE TABLE IF NOT EXISTS slack_conversations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    thread_id TEXT NOT NULL,
    channel_id TEXT NOT NULL,
    workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
    conversation_text TEXT NOT NULL,
    participant_count INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create trigger for slack_conversations updated_at
CREATE TRIGGER update_slack_conversations_updated_at
BEFORE UPDATE ON slack_conversations
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Create index for faster lookups by thread_id and workspace_id
CREATE INDEX IF NOT EXISTS idx_slack_conversations_thread_workspace 
ON slack_conversations(thread_id, workspace_id);

-- Create index for faster lookups by workspace_id
CREATE INDEX IF NOT EXISTS idx_slack_conversations_workspace_id 
ON slack_conversations(workspace_id);

-- Enable Row Level Security
ALTER TABLE workspaces ENABLE ROW LEVEL SECURITY;
ALTER TABLE slack_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE slack_conversations ENABLE ROW LEVEL SECURITY;

-- Create a policy that allows service role to do anything
-- This is needed for our server-side operations
CREATE POLICY "Service role can do anything on workspaces"
  ON workspaces
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Service role can do anything on slack_users"
  ON slack_users
  USING (true)
  WITH CHECK (true);
  
CREATE POLICY "Service role can do anything on slack_conversations"
  ON slack_conversations
  USING (true)
  WITH CHECK (true); 
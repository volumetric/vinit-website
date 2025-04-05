-- Create the slack_conversations table
CREATE TABLE IF NOT EXISTS public.slack_conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  thread_id TEXT NOT NULL,
  channel_id TEXT NOT NULL,
  workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  conversation_text TEXT NOT NULL,
  participant_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Create an index for fast lookups by thread_id and workspace_id
CREATE INDEX IF NOT EXISTS idx_slack_conversations_thread_workspace
ON public.slack_conversations(thread_id, workspace_id);

-- Add RLS (Row Level Security) policies
ALTER TABLE public.slack_conversations ENABLE ROW LEVEL SECURITY;

-- Create a policy that allows read access to all authenticated users
CREATE POLICY "Allow read access for all authenticated users"
ON public.slack_conversations
FOR SELECT
TO authenticated
USING (true);

-- Create a policy that allows insert/update/delete for service role only
CREATE POLICY "Allow all access for service role"
ON public.slack_conversations
FOR ALL
TO service_role
USING (true);

-- Update function that automatically sets updated_at timestamp
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add trigger to automatically update the updated_at field
DROP TRIGGER IF EXISTS set_updated_at_timestamp ON public.slack_conversations;
CREATE TRIGGER set_updated_at_timestamp
BEFORE UPDATE ON public.slack_conversations
FOR EACH ROW
EXECUTE FUNCTION public.set_updated_at(); 
# Slack Analyzer

A tool for analyzing Slack conversations and user data.

## Features

- View and search Slack channels
- Browse conversations and threads
- View user data in a searchable table
- Refresh user data from Slack API

## Setup Instructions

### 1. Supabase Setup

1. Create a Supabase project at [supabase.com](https://supabase.com)
2. Go to Project Settings > API to get your URL and keys
3. Run the SQL script in `app/slack_analyzer/db/schema.sql` in the Supabase SQL Editor to create the necessary tables and policies

### 2. Slack API Setup

1. Create a Slack App at [api.slack.com/apps](https://api.slack.com/apps)
2. Add the following OAuth scopes:
   - `channels:read`
   - `channels:history`
   - `users:read`
   - `users:read.email`
3. Install the app to your workspace
4. Copy the Bot User OAuth Token

### 3. Environment Variables

Create a `.env.local` file in the project root with the following variables:

```
# Supabase credentials
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Slack API token
SLACK_BOT_TOKEN=your_slack_bot_token
```

### 4. Running the Application

1. Install dependencies:
   ```
   npm install
   ```

2. Start the development server:
   ```
   npm run dev
   ```

3. Open [http://localhost:3000/slack_analyzer](http://localhost:3000/slack_analyzer) in your browser

## Troubleshooting

### Row-Level Security (RLS) Errors

If you encounter RLS policy errors, make sure:
1. You've set up the `SUPABASE_SERVICE_ROLE_KEY` in your `.env.local` file
2. You've run the SQL script that creates the necessary RLS policies
3. You've restarted your development server after making these changes

### Missing User Data

If no user data appears:
1. Check that your Slack token has the correct permissions
2. Verify that the token is correctly set in your `.env.local` file
3. Check the browser console for any API errors 
# Slack Analyzer

A tool for analyzing Slack conversations and user data.

## Features

- View and search Slack channels
- Browse conversations and threads
- View user data in a searchable table
- Refresh user data from Slack API

## In-Memory Caching Strategy

The Slack Analyzer implements an in-memory caching strategy for user data to improve performance when resolving user mentions in messages. This document explains how the caching system works and how to use it.

### Overview

The caching system consists of the following components:

1. **User Cache Service**: A singleton service that stores user data in memory.
2. **User Mention Resolver**: Utilities for resolving user mentions in message text.
3. **React Components**: UI components for displaying user mentions and message text.
4. **Cache Initialization**: Logic for preloading and refreshing the cache.

### User Cache Service

The `UserCache` class (`services/userCache.ts`) is implemented as a singleton that provides methods for adding, retrieving, and refreshing user data. Key features include:

- **TTL (Time-To-Live)**: Cache entries expire after a configurable period (default: 1 hour).
- **Composite Keys**: Users are stored using a composite key of `workspaceId:userId`.
- **Lazy Loading**: If a user is not in the cache, it's fetched from the database.
- **Bulk Operations**: Support for adding and refreshing multiple users at once.

```typescript
// Example usage
import userCache from './services/userCache';

// Add a user to the cache
userCache.addUser(user);

// Get a user from the cache
const user = await userCache.getUser(workspaceId, userId);

// Refresh the cache for a workspace
await userCache.refreshWorkspace(workspaceId);
```

### User Mention Resolver

The `userMentionResolver.ts` utilities provide functions for working with user mentions in message text:

- **resolveUserMentions**: Replaces `<@USER_ID>` with user display names.
- **resolveUserIds**: Resolves multiple user IDs to their display names.
- **extractUserMentions**: Extracts all user mentions from a message.

```typescript
// Example usage
import { resolveUserMentions } from './utils/userMentionResolver';

const resolvedText = await resolveUserMentions(message.text, workspaceId);
```

### React Components

The following React components are provided for displaying user mentions:

- **UserMention**: Displays a user mention with proper formatting.
- **MessageText**: Parses message text and renders user mentions.
- **CacheStats**: Displays cache statistics and controls.

```tsx
// Example usage
<MessageText text={message.text} workspaceId={workspaceId} />
```

### Cache Initialization

The cache is initialized when the application starts using the `initializeUserCache` function. This preloads user data for active workspaces to minimize database queries.

```typescript
// Example usage
import { initializeUserCache, scheduleUserCacheRefresh } from './utils/cacheInitializer';

// Initialize the cache
await initializeUserCache({
  maxWorkspaces: 5,
  maxUsersPerWorkspace: 1000,
  ttlMs: 3600000 // 1 hour
});

// Schedule periodic refresh
const clearInterval = scheduleUserCacheRefresh(3600000); // 1 hour
```

### React Hook

The `useUserCache` hook provides a convenient way to use the cache in React components:

```tsx
// Example usage
const { users, loading, error, refreshCache, getCacheStats } = useUserCache({
  workspaceId,
  autoLoad: true,
  ttlMs: 3600000
});
```

### Performance Considerations

- The cache is designed to minimize database queries by storing user data in memory.
- TTL ensures that the cache doesn't become stale.
- Lazy loading ensures that only needed users are loaded into memory.
- Bulk operations minimize the number of database queries.

### Monitoring

The `CacheStats` component provides a way to monitor the cache's performance:

- Cache size (number of users)
- Number of workspaces
- TTL setting
- Last update time

### Future Improvements

- Implement LRU (Least Recently Used) eviction policy for large workspaces.
- Add more granular control over which users are cached.
- Implement cache persistence across page reloads.
- Add more detailed monitoring and logging.

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
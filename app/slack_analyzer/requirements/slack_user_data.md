1. Fetch and Save (and later Update) the user data from slack. Save it in Supabase. Needed to find the user info (including their names, etc.) from the user_id that is there in messages when someone is tagged.

Since this will be needed very frequently, i.e. to map the user id with the correct name and other info, and it will be needed for all the message that has some user tagging, we need to load this information in memory and keep it there for quick referencing.

It should ideally keep the information for all the users in the system. Even the ones that are deactivated. Because we would need them for decoding the older message that has earlier people tagged but those people are now deactivated.

Keep pretty much all the information about the user that is coming from slack, in our DB, in the same way. Including this information if they are active or deactivated in a given Slack workspace or Team (with team_id value).

Also, it should be easy to update this information in the system.

Save this information in Supabase. We need to save this user list for a given Slack workspace and later we will add other kinds of data like channel list and conversations for each slack workspace. Suggest a data schema in Supabase so that this data can be modelled in a good way that supports the app and also that keeps the data for each workspace some what isolated, while still using the DB resources in an efficient way.


================

Plan to do this:

## 1. Database Schema Design in Supabase

### Tables:

**workspaces**
- `id` (primary key, UUID)
- `team_id` (string, Slack workspace/team ID)
- `name` (string, Workspace name)
- `domain` (string, Workspace domain)
- `created_at` (timestamp)
- `updated_at` (timestamp)

**slack_users**
- `id` (primary key, UUID)
- `workspace_id` (foreign key referencing workspaces.id)
- `user_id` (string, Slack user ID)
- `name` (string, Display name)
- `real_name` (string, User's full name)
- `display_name` (string, User's display name)
- `email` (string, optional)
- `image_url` (string, Profile picture URL)
- `is_admin` (boolean)
- `is_owner` (boolean)
- `is_bot` (boolean)
- `is_active` (boolean, Whether user is active or deactivated)
- `timezone` (string)
- `updated` (timestamp, Last time the user data was updated in Slack)
- `created_at` (timestamp)
- `updated_at` (timestamp)
- Unique constraint on (workspace_id, user_id)

## 2. API Implementation

1. **Create a Slack API Service Module**
   - Create `app/slack_analyzer/services/slackUserService.ts`
   - Implement methods to interact with Slack API for user data

2. **Implement Data Fetching Function**
   - Use Slack's `users.list` API endpoint to fetch all users
   - Handle pagination for workspaces with many users
   - Parse and transform the response to match our database schema

3. **Create Supabase Service**
   - Implement methods for CRUD operations on the slack_users table
   - Include bulk upsert functionality for efficient updates

4. **API Endpoints**
   - Create an API route at `/slack_analyzer/api` with query parameter `action=fetchUsers`
   - Implement handler to fetch users from Slack and store in Supabase
   - Add endpoint for refreshing user data (e.g., `action=refreshUsers`)

## 3. In-Memory Caching Strategy

1. **Create User Cache Module**
   - Implement a singleton cache for user data in `app/slack_analyzer/services/userCache.ts`
   - Structure cache as a Map with composite keys (workspace_id + user_id)
   - Include methods for adding, retrieving, and refreshing user data

2. **Initial Cache Loading**
   - Load user data from Supabase into memory when application starts
   - Implement selective loading based on active workspace

3. **Cache Management**
   - Add TTL (Time-To-Live) mechanism to refresh cache periodically
   - Implement LRU (Least Recently Used) eviction policy if memory constraints arise

## 4. User ID Resolution in UI

1. **Create User Resolution Component**
   - Implement a React component for displaying user mentions
   - Component should resolve user_id to display name and avatar

2. **Update Message Display**
   - Modify `page.tsx` to use the User Resolution Component
   - Parse message text to identify user mentions (pattern: `<@USER_ID>`)
   - Replace mentions with the resolved user component

3. **Fallback Mechanism**
   - Display user_id with a special style if resolution fails
   - Add mechanism to trigger user data refresh if unknown IDs are encountered

## 5. Synchronization Mechanism

1. **Periodic Update Strategy**
   - Implement a background job to refresh user data daily
   - Use webhook or periodic polling to detect workspace membership changes

2. **On-Demand Updates**
   - Add UI control to manually trigger user data refresh
   - Implement incremental updates for efficiency

3. **Change Tracking**
   - Track user data changes to update only what's necessary
   - Maintain version history for critical changes

## 6. Implementation Timeline

**Phase 1: Core Infrastructure (Week 1)**
- Set up database schema in Supabase
- Implement basic API service for Slack user data fetching
- Create data storage and retrieval functions

**Phase 2: UI Integration (Week 2)**
- Implement in-memory caching
- Create user resolution components
- Update message display to use resolved user data

**Phase 3: Optimization & Maintenance (Week 3)**
- Implement synchronization mechanisms
- Add monitoring for cache performance
- Optimize queries and cache usage

## 7. Monitoring and Maintenance

1. **Performance Monitoring**
   - Track cache hit/miss ratios
   - Monitor memory usage of the user cache

2. **Error Handling**
   - Implement robust error handling for API failures
   - Add retry mechanisms for transient errors

3. **Logging**
   - Log user data refresh operations
   - Track synchronization performance

This plan provides a comprehensive approach to implementing the Slack user data functionality, ensuring efficient data storage, quick access through caching, and seamless UI integration while maintaining workspace isolation in the database.


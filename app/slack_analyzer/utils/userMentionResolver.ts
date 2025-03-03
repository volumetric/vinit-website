import userCache from '../services/userCache';

/**
 * Resolves Slack user mentions in a message text
 * Replaces `<@USER_ID>` with user display name or real name
 */
export async function resolveUserMentions(
  text: string,
  workspaceId: string
): Promise<string> {
  if (!text || !workspaceId) {
    return text;
  }
  
  // Match all user mentions in the format <@USER_ID>
  const mentionRegex = /<@([A-Z0-9]+)>/g;
  const mentions = text.match(mentionRegex) || [];
  
  // If no mentions found, return original text
  if (mentions.length === 0) {
    return text;
  }
  
  let resolvedText = text;
  
  // Process each mention
  for (const mention of mentions) {
    // Extract the user ID from the mention format
    const userId = mention.replace('<@', '').replace('>', '');
    
    try {
      // Get user info from cache
      const user = await userCache.getUser(workspaceId, userId);
      
      if (user) {
        // Replace mention with user's display name or real name
        const displayName = user.display_name || user.real_name || user.name || userId;
        resolvedText = resolvedText.replace(mention, `@${displayName}`);
      }
    } catch (error) {
      // If error, leave the mention as is
    }
  }
  
  return resolvedText;
}

/**
 * Resolves multiple user IDs to their display names
 * Useful for participant lists
 */
export async function resolveUserIds(
  userIds: string[],
  workspaceId: string
): Promise<{ [userId: string]: string }> {
  const result: { [userId: string]: string } = {};
  
  if (!userIds || !workspaceId) {
    return result;
  }
  
  // Get all users for the workspace at once to minimize database calls
  await userCache.getUsersForWorkspace(workspaceId);
  
  // Resolve each user ID
  for (const userId of userIds) {
    try {
      const user = await userCache.getUser(workspaceId, userId);
      if (user) {
        result[userId] = user.display_name || user.real_name || user.name || userId;
      } else {
        result[userId] = userId; // Use the ID as fallback
      }
    } catch (error) {
      result[userId] = userId; // Use the ID as fallback
    }
  }
  
  return result;
}

/**
 * Extract all user mentions from a message
 */
export function extractUserMentions(text: string): string[] {
  if (!text) {
    return [];
  }
  
  const mentionRegex = /<@([A-Z0-9]+)>/g;
  const matches = [...text.matchAll(mentionRegex)];
  
  // Extract just the user IDs from matches
  return matches.map(match => match[1]);
}

// Function to add special highlight to all user mentions in a text
export function highlightUserMentions(text: string): string {
  if (!text) {
    return '';
  }
  
  // Replace user mentions with highlighted version
  return text.replace(/<@([A-Z0-9]+)>/g, (match, userId) => {
    return `<span class="user-mention">@${userId}</span>`;
  });
}

// Function to resolve user IDs from text that includes user mentions
export function extractUserIdsFromText(text: string): string[] {
  return extractUserMentions(text);
} 
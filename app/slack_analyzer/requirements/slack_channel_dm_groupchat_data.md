1. Fetch and Save (and later Update) the slack channel data and data about different group chats and DMs from slack. Save it in Supabase. Needed to find the channel info (including channel name, type of channel (public, private), numer of members etc.) from the channel_id that is there in messages when someone is tagged.


Along with the public channel and private channel, we also want to keep the information about all the group chats and all the DMs that the app has access to. We want all of this information so that we can fetch conversations and messages from these different channels, public or private, group chats, DMs, etc. in an easy manner. 

We can still call all of these things as channels, even though it goes beyond just public channel and private channels, since it also includes group chats and DMs. But we can still call all of them channels, because the alternative to calling it conversations, which is what the Slack calls it, is not good because we have a different definition of conversations in our app.



Since this will be needed very frequently, i.e. to map the channel_id with the correct channel name and other info, and it will be needed for all the message that has some channel tagging, we need to load this information in memory and keep it there for quick referencing.

It should ideally keep the information for all the channels in the system. Even the ones that are deactivated. Because we would need them for decoding the older message that has earlier people tagged but those people are now deactivated.

Keep pretty much all the information about the channel that is coming from slack, in our DB, in the same way. Including this information if they are active or deactivated in a given Slack workspace or Team (with team_id value).

Also, it should be easy to update this information in the system.

Save this information in Supabase. We need to save this channel list for a given Slack workspace and later we will add other kinds of data like channel list and conversations for each slack workspace. Suggest a data schema in Supabase so that this data can be modelled in a good way that supports the app and also that keeps the data for each workspace some what isolated, while still using the DB resources in an efficient way.
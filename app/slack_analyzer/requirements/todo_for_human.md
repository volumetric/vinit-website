[DONE] 1. Buy Cursor subscription
2. Learn to use the latest features added in Cursor, using YT videos. Watch a maximum of 5 videos. Then use it.
3. Use Cursor to make something completely new, i.e. in your personal website.
4. Use Cursor to make something in our own product codebase.



========================
1. Fetch relevant data from Slack (Read only)
2. Organize the raw data into conversation transcript documents



------
1. Setup slack connection, add bot token to .env.local, do test calls to verify that the data is coming.
2. Given a channel name, get all the messages from that channel in the past 30 days.
    Optionally, take a date range in which to get all the messages.
3. For each message in the channel, also get all the replies in that thread. and keep all those reply messages organized as threads. The return obkect should be an array of these thread conversations. Each thread conversation is an object with some metadata about the thread, including the 1st message (i.e. the channel message) of the thread and who started it, when it was started, etc. all the data coming from slack. Don't remore anything. and it should have a property called replies which should be an array of message objects, from that thread.








===========
1. Use Supabase managed cloud service for storing the embeddings.

2. A Question Answering Agent, built.

3. Fetch all the message data from Slack, using slack APIs. Including files and images shared. And links, etc.

4. Keep them tagged based on the person who created those messages. I.e. the sender of the message.

5. Organize based on the conversation. It could be slack thread based. But not always. This is 1st level topic based conversation organisation.

6. Next level is to look at messages in the same channel. Maybe ones that are written and exchanged in a close time proximity.
7. Next level of topic organisation is to connect different conversations in the same channel. Keeping ther order in mind.

8. Next is to connect different conversation clusters in different channels.
Hey the cycle repaired and ride it within the society.
9. Do this for the messages from 1 channel only. To begin with. That channel is #p_updates. It is one of the most organised channels. Following the 1st level of conversation organisation explained in point 5 above.
10. Use cases for doing the things in point 9 for the #p_updates channel:

a. Make a help doc that has all the product updates. That is the one that we have in Intercom help docs. Make a single update from this data to make that page upto date.

b. Create separate blog posts, linkedin post and other social posts, include some video ideas and corresponding video outline/script corresponding to a relevant update.
Use spaced repetition to help the user free the remember something
c. Analyze it to understand what kind of features we build

import { SlackConversationFetcher } from './slackConversationFetcher';

async function main() {
    try {
        const fetcher = new SlackConversationFetcher();
        
        // First, list all available channels
        console.log('Fetching channels where the bot is a member...');
        const channels = await fetcher.listChannels();
        
        console.log(`\nFound ${channels.length} accessible channels:`);
        console.log('(Note: This only shows channels where the bot has been added)\n');
        channels.forEach((channel, index) => {
            console.log(`${index + 1}. #${channel.name} (ID: ${channel.id})`);
            console.log(`   Private: ${channel.is_private}, Members: ${channel.member_count}`);
        });

        // Example: Let's fetch from the first available channel
        if (channels.length > 0) {
            const targetChannel = channels[0];
            console.log(`\nFetching messages from #${targetChannel.name}...`);
            
            // Fetch last 30 days of conversations
            const conversations = await fetcher.fetchChannelMessages(targetChannel.id);
            
            console.log(`\nFetched ${conversations.length} conversations`);
            if (conversations.length > 0) {
                console.log('\nFirst conversation sample:');
                console.log(JSON.stringify(conversations[0], null, 2));
            }
        } else {
            console.log('\nNo channels available - make sure the bot is added to at least one channel');
        }
    } catch (error) {
        console.error('Error:', error);
    }
}

main(); 
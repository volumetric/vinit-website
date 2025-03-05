'use client';

import MessageText from '../MessageText';
import UserMention from '../UserMention';
import { Message } from '../../types/interfaces';

interface ConversationDetailProps {
    messages: Message[];
    workspaceId: string | null;
    formatTimestamp: (ts: string) => string;
}

export default function ConversationDetail({
    messages,
    workspaceId,
    formatTimestamp
}: ConversationDetailProps) {
    if (!messages || messages.length === 0) {
        return <div className="text-gray-400 p-4">No messages to display</div>;
    }

    return (
        <div className="space-y-4">
            {messages.map((message, idx) => (
                <div 
                    key={message.ts} 
                    className={`rounded-xl ${
                        idx === 0 
                            ? 'bg-gray-750 border border-gray-700' 
                            : 'ml-8 bg-gray-800 border border-gray-700'
                    } p-4 hover:bg-gray-750 transition-colors duration-200`}
                >
                    <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                            <UserMention userId={message.user} workspaceId={workspaceId || ''} size="large" />
                        </div>
                        <span className="text-sm text-gray-400">
                            {formatTimestamp(message.ts)}
                        </span>
                    </div>
                    
                    <div className="text-gray-300 leading-relaxed pl-12">
                        <MessageText text={message.text} workspaceId={workspaceId || ''} />
                    </div>

                    {/* Reactions */}
                    {message.reactions && message.reactions.length > 0 && (
                        <div className="mt-4 flex flex-wrap gap-2 pl-12">
                            {message.reactions.map(reaction => (
                                <span 
                                    key={reaction.name}
                                    className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-indigo-500/20 text-indigo-200 border border-indigo-500/30 font-medium"
                                >
                                    :{reaction.name}: {reaction.count}
                                </span>
                            ))}
                        </div>
                    )}
                </div>
            ))}
        </div>
    );
} 
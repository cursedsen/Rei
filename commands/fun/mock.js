import { sendMessage } from '../../functions/reiMessageMaker.js';
import { logModAction } from '../../functions/auditLogger.js';

export default {
    name: 'mock',
    description: 'cOnVeRtS tExT tO mOcKiNg TeXt',
    category: 'fun',
    usage: '<text>',
    execute: async (message, args) => {
        let text;
        if (!args.length) {
            const messages = await message.channel.messages.fetch({ limit: 2 });
            const previousMessage = messages.last();
            
            if (!previousMessage || !previousMessage.content) {
                return await sendMessage(message, {
                    title: 'Error',
                    description: 'No previous message found to mock!',
                    color: 0xFF0000
                });
            }
            text = previousMessage.content;
        } else {
            text = args.join(' ');
        }

        if (/@(everyone|here|&\d+)/.test(text)) {
            try {
                await message.member.timeout(5 * 60 * 1000, 'Attempted mention exploitation');
                
                await logModAction(message, 'timeout', message.author, 'Attempted mention exploitation in mock command');
                
                await sendMessage(message, {
                    content: `🤡`,
                    color: 0xFF0000
                });
                return;
            } catch (error) {
                console.error('Failed to timeout user:', error);
            }
        }

        text = text.replace(/@(everyone|here|&\d+)/g, '@\u200b$1');

        let mocked = '';
        let capitalize = true;

        for (const char of text) {
            mocked += capitalize ? char.toUpperCase() : char.toLowerCase();
            if (char.match(/[a-zA-Z]/)) capitalize = !capitalize;
        }

        await sendMessage(message, {
            content: mocked
        });
    }
};

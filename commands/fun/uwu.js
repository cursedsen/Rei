import { sendMessage } from '../../functions/reiMessageMaker.js';
import { logModAction } from '../../functions/auditLogger.js';

export default {
    name: 'uwu',
    description: 'Converts text to uwu speak',
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
                    description: 'No previous message found to uwu-ify!',
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
                
                await logModAction(message, 'timeout', message.author, 'Attempted mention exploitation in uwu command');
                
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

        let uwuText = text
            .replace(/[lr]/g, 'w')
            .replace(/[LR]/g, 'W')
            .replace(/n([aeiou])/g, 'ny$1')
            .replace(/N([aeiou])/g, 'Ny$1')
            .replace(/N([AEIOU])/g, 'NY$1')
            .replace(/ove/g, 'uv')
            .replace(/!+/g, '! uwu');

        if (Math.random() < 0.3) {
            uwuText += ' ' + ['uwu', 'owo', '>w<', ':3', '~'][Math.floor(Math.random() * 5)];
        }

        await sendMessage(message, {
            content: uwuText
        });
    }
};

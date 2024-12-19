import { sendMessage } from '../../functions/reiMessageMaker.js';

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

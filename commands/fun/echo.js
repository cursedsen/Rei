import { sendMessage } from '../../functions/reiMessageMaker.js';
import { isBotMaster } from '../../config/botMasters.js';

export default {
    name: 'echo',
    description: 'Repeats what you say',
    category: 'fun',
    usage: '<message>',
    execute: async (message, args) => {
        if (!isBotMaster(message.author.id)) {
            return await sendMessage(message, {
                title: 'Access Denied',
                description: 'Only bot masters can use this command.',
                color: 0xFF0000
            });
        }

        if (!args.length) {
            return await sendMessage(message, {
                title: 'Error',
                description: 'Please provide a message to echo.',
                color: 0xFF0000
            });
        }

        const echoMessage = args.join(' ');
        
        try {
            await message.delete();
            await message.channel.send(echoMessage);
        } catch (error) {
            console.error(error);
            await sendMessage(message, {
                title: 'Error',
                description: 'Failed to send message.',
                color: 0xFF0000
            });
        }
    }
};

import { sendMessage } from '../../functions/reiMessageMaker.js';

export default {
    name: 'echo',
    description: 'Repeats what you say',
    category: 'fun',
    usage: '<message>',
    execute: async (message, args) => {
        if (!message.member.permissions.has('Administrator')) {
            return await sendMessage(message, {
                title: 'Error',
                description: 'You do not have permission to use this command.',
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

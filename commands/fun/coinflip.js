import { sendMessage } from '../../functions/reiMessageMaker.js';

export default {
    name: 'coinflip',
    description: 'Gambling addiction :3',
    category: 'fun',
    aliases: ['cf', 'flip'],
    execute: async (message) => {
        const result = Math.random() < 0.5 ? 'Heads' : 'Tails';

        await sendMessage(message, {
            title: `🪙 Flip result:`,
            description: `You got **${result}**!`,
            color: 0x2B2D31
        });
    }
};

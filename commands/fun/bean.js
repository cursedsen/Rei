import { sendMessage } from "../../functions/reiMessageMaker.js";
import { readFileSync } from 'fs';

export default {
    name: 'bean',
    description: 'Bean a user.',
    category: 'fun',
    permissions: ['BanMembers'],
    usage: '<user> [reason]',
    execute: async (message, args) => {
        if (!args[0]) {
            return await sendMessage(message, {
                title: 'Error',
                description: 'Please provide a valid user tag or ID to ban.',
                color: 0xFF0000,
            });
        }

        let target = message.mentions.members.first();

        if (!target) {
            target = await message.guild.members.fetch(args[0]).catch(() => null);
        }

        if (!target) {
            return await sendMessage(message, {
                title: 'Error',
                description: 'Could not find that user.',
                color: 0xFF0000,
            });
        }

        if (target.id === message.author.id) {
            return await sendMessage(message, {
                content: 'Nice try.',
            });
        }

        const strings = JSON.parse(readFileSync('./things/strings.json', 'utf8'));
        const funnyRandomAction = strings.user_was_x[Math.floor(Math.random() * strings.user_was_x.length)];

        await sendMessage(message, {
            content: `${target.user.tag} was ${funnyRandomAction}`,
        });
    }
};

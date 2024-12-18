import { sendMessage } from '../../functions/reiMessageMaker.js';
import { User } from 'discord.js';

export default {
    name: 'unban',
    description: 'Unban a user',
    category: 'moderation',
    permissions: ['BanMembers'],
    execute: async (message, args) => {
        if (!args[0]) {
            return await sendMessage(message, {
                title: 'Error',
                description: 'Please provide a valid user tag or ID to unban.',
                color: 0xFF0000,
            });
        }

        let target = message.mentions.users.first();

        if (!target) {
            try {
                target = await message.client.users.fetch(args[0]);
            } catch (err) {
                return await sendMessage(message, {
                    title: 'Error',
                    description: 'Could not find that user.',
                    color: 0xFF0000,
                });
            }
        }

        if (target.id === message.author.id) {
            return await sendMessage(message, {
                content: 'Nice try.',
            });
        }

        try {
            await message.guild.bans.remove(target);

            await sendMessage(message, {
                content: `${target.tag} was unbanned.`,
            });
        } catch (error) {
            console.error(error);
            await sendMessage(message, {
                title: 'Error',
                description: 'Could not find that user or they are not banned.',
                color: 0xFF0000,
            });
        }
    }
};

import { sendMessage } from "../../functions/reiMessageMaker.js";
import { User } from 'discord.js';
import { readFileSync } from 'fs';

export default {
    name: 'ban',
    description: 'Ban a member from the server.',
    category: 'moderation',
    usage: '<user> [reason]',
    execute: async (message, args) => {
        if (!message.member.permissions.has('BanMembers')) {
            return await sendMessage(message, {
                title: 'Access Denied',
                description: 'You do not have permission to use this command.',
                color: 0xFF0000,
            });
        }
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
            const userId = args[0];
            try {
                const user = await message.client.users.fetch(userId);
                target = user;
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
        if (target instanceof User) {
            const reason = args.slice(1).join(' ') || 'No reason provided';
            try {
                await message.guild.bans.create(target, { reason: reason });

                const strings = JSON.parse(readFileSync('./things/strings.json', 'utf8'));
                const funnyRandomAction = strings.user_was_x[Math.floor(Math.random() * strings.user_was_x.length)];

                await sendMessage(message, {
                    content: `${target.tag} was ${funnyRandomAction}`,
                });
            } catch (error) {
                console.error(error);
                await sendMessage(message, {
                    title: 'Error',
                    description: 'An error occurred while trying to ban the user.',
                    color: 0xFF0000,
                });
            }
        } else if (target.moderatable) {
            const reason = args.slice(1).join(' ') || 'No reason provided';
            try {
                await target.ban({ reason: reason });

                const strings = JSON.parse(readFileSync('./things/strings.json', 'utf8'));
                const funnyRandomAction = strings.user_was_x[Math.floor(Math.random() * strings.user_was_x.length)];

                await sendMessage(message, {
                    content: `${target.user.tag} was ${funnyRandomAction}`,
                });
            } catch (error) {
                console.error(error);
                await sendMessage(message, {
                    title: 'Error',
                    description: 'An error occurred while trying to ban the user.',
                    color: 0xFF0000,
                });
            }
        } else {
            await sendMessage(message, {
                title: 'Error',
                description: 'I cannot ban this user. They may have higher permissions than me.',
                color: 0xFF0000,
            });
        }
    }
};

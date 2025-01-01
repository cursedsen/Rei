import { sendMessage } from '../../functions/reiMessageMaker.js';
import { logModAction } from '../../functions/auditLogger.js';
import { User } from 'discord.js';
import { readFileSync } from 'fs';

export default {
    name: 'ban',
    description: 'Ban a user',
    category: 'moderation',
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

        const reason = args.slice(1).join(' ') || 'No reason provided';
        let target = message.mentions.members.first() || 
            await message.guild.members.fetch(args[0]).catch(() => null);

        let userId, userTag, userAvatar;

        if (!target) {
            try {
                const user = await message.client.users.fetch(args[0]);
                userId = user.id;
                userTag = user.tag;
                userAvatar = user.displayAvatarURL();

                try {
                    await message.guild.bans.create(user, { reason: reason });
                    
                    const strings = JSON.parse(readFileSync('./things/strings.json', 'utf8'));
                    const funnyRandomAction = strings.user_was_x[Math.floor(Math.random() * strings.user_was_x.length)];

                    await sendMessage(message, {
                        content: `${userTag} was ${funnyRandomAction}`,
                    });

                    await logModAction(message, 'ban', user, reason);
                    return;
                } catch (error) {
                    console.error(error);
                    return await sendMessage(message, {
                        title: 'Error',
                        description: 'An error occurred while trying to ban the user.',
                        color: 0xFF0000,
                    });
                }
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

        if (!target.moderatable) {
            return await sendMessage(message, {
                title: 'Error',
                description: 'I cannot ban this user. They may have higher permissions than me.',
                color: 0xFF0000,
            });
        }

        try {
            await target.ban({ reason: reason });

            const strings = JSON.parse(readFileSync('./things/strings.json', 'utf8'));
            const funnyRandomAction = strings.user_was_x[Math.floor(Math.random() * strings.user_was_x.length)];

            await sendMessage(message, {
                content: `${target.user.tag} was ${funnyRandomAction}`,
            });

            await logModAction(message, 'ban', target.user, reason);
        } catch (error) {
            console.error(error);
            await sendMessage(message, {
                title: 'Error',
                description: 'An error occurred while trying to ban the user.',
                color: 0xFF0000,
            });
        }
    }
};

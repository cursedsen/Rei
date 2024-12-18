import { sendMessage } from '../../functions/reiMessageMaker.js';

export default {
    name: 'kick',
    description: 'Kick a member from the server.',
    category: 'moderation',
    permissions: ['KickMembers'],
    usage: '<user> [reason]',
    execute: async (message, args) => {
        if (!args[0]) {
            return await sendMessage(message, {
                title: 'Error',
                description: 'Please provide a valid user tag or ID to kick.',
                color: 0xFF0000,
            });
        }

        const target = message.mentions.members.first() || 
            await message.guild.members.fetch(args[0]).catch(() => null);

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
        if (!target.moderatable) {
            return await sendMessage(message, {
                title: 'Error',
                description: 'I cannot kick this user. They may have higher permissions than me.',
                color: 0xFF0000,
            });
        }
        
        const reason = args.slice(1).join(' ') || 'No reason provided';

        try {
            await target.kick(reason);

            try {
                await target.send({
                    embeds: [{
                        title: `You were kicked from ${message.guild.name}`,
                        description: `**Reason:** ${reason}`,
                        color: 0xFF0000,
                    }]
                });
            } catch (dmError) {
                console.log(`Could not send a DM to ${target.user.tag}`);
            }

            await sendMessage(message, {
                title: 'Done👍',
                description: `${target.user.tag} was kicked for: ${reason}`,
                color: 0x00FF00,
                timestamp: true
            });
        } catch (error) {
            console.error(error);
            await sendMessage(message, {
                title: 'Error',
                description: 'An error occurred while trying to kick the user.',
                color: 0xFF0000,
            });
        }
        console.log(args);
    }
}
// i literally just copied the ban command and changed the name and description

import { sendMessage } from "../../functions/reiMessageMaker.js";

export default {
    name: 'unban',
    description: 'Unban a member from the server.',
    usage: '<user> [reason]',
    execute: async (message, args) => {
        if (!message.member.permissions.has('UnbanMembers')) {
            return await sendMessage(message, {
                title: 'Access Denied',
                description: 'You do not have permission to use this command.',
                color: 0xFF0000,
            });
        }
            if (!args[0]) {
                return await sendMessage(message, {
                    title: 'Error',
                    description: 'Please provide a valid user tag or ID to unban.',
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
                    content: 'Lol nice try.',
                });
            }
            if (!target.moderatable) {
                return await sendMessage(message, {
                    title: 'Error',
                    description: 'I cannot unban this user. They may have higher permissions than me.',
                    color: 0xFF0000,
                });
            }

            const reason = args.slice(1).join(' ') || 'No reason provided';

        try {
            await target.unban(reason);

            try {
                await target.send({
                    embeds: [{
                        title: `You were unbanned from ${message.guild.name}`,
                        description: `Yayy :D`,
                        color: 0xFF0000,
                    }]
                });
            } catch (dmError) {
                console.log(`Could not send a DM to ${target.user.tag}`);
            }

            await sendMessage(message, {
                title: 'Done👍',
                description: `${target.user.tag} was unbanned for: ${reason}`,
                color: 0x00FF00,
                timestamp: true
            });
       } catch (error) {
            console.error(error);
            await sendMessage(message, {
                title: 'Error',
                description: 'An error occurred while trying to unban the user.',
                color: 0xFF0000,
            });
        }
        console.log(args);
    }
}
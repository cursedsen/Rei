import { sendMessage } from '../../functions/reiMessageMaker.js';

export default {
    name: 'unkick',
    description: 'Unkick a member from the server.',
    usage: '<user> [reason]',
    execute: async (message, args) => {
        if (!message.member.permissions.has('KickMembers')) {
            return await sendMessage(message, {
                title: 'Access Denied',
                description: 'You do not have permission to use this command.',
                color: 0xFF0000,
            });
        }
        if (!args[0]) {
            return await sendMessage(message, {
                title: 'Error',
                description: 'Please provide a valid user tag or ID to unkick.',
                color: 0xFF0000,
            });
        }

        const target = message.mentions.members.first() || 
            await message.guild.members.fetch(args[0]).catch(() => null);
        
        const reason = args.slice(1).join(' ') || 'No reason provided';

        try {
            await sendMessage(message, {
                content: 'https://giphy.com/gifs/latelateshow-james-corden-late-show-3o85g2ttYzgw6o661q',
            });
        } catch (error) {
            console.error(error);
            await sendMessage(message, {
                title: 'Error',
                description: 'An error occurred while trying to unkick the user.',
                color: 0xFF0000,
            });
        }
    }
}
import { sendMessage } from '../../functions/reiMessageMaker.js';

export default {
    name: 'mute',
    description: 'Mute a user',
    category: 'moderation',
    permissions: ['Administrator'],
    async execute(message, args) {
        if (!message.member.permissions.has('MuteMembers')) {
            return await sendMessage(message, {
                title: 'Access Denied',
                description: 'You do not have permission to use this command.',
                color: 0xFF0000,
            });
        }
        if (!args[0]) {
            return await sendMessage(message, {
                title: 'Error',
                description: 'Please provide a valid user tag or ID to mute.',
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
                description: 'I cannot mute this user. They may have higher permissions than me.',
                color: 0xFF0000,
            });
        }
        if (!args[1]) {
            return await sendMessage(message, {
                title: 'Error',
                description: 'Please specify a duration (e.g. 1h, 30m, 1d).',
                color: 0xFF0000,
            });
        }

        const timeString = args[1].toLowerCase();
        let duration = 0;
        
        if (timeString.endsWith('m')) duration = parseInt(timeString) * 60 * 1000;
        else if (timeString.endsWith('h')) duration = parseInt(timeString) * 60 * 60 * 1000;
        else if (timeString.endsWith('d')) duration = parseInt(timeString) * 24 * 60 * 60 * 1000;
        else {
            return await sendMessage(message, {
                title: 'Error',
                description: 'Invalid time format. Please use m (minutes), h (hours), or d (days).',
                color: 0xFF0000,
            });
        }
        if (isNaN(duration) || duration <= 0) {
            return await sendMessage(message, {
                title: 'Error',
                description: 'Please provide a valid positive duration.',
                color: 0xFF0000,
            });
        }
        const reason = args.slice(2).join(' ') || 'No reason provided';

        try {
            await target.timeout(duration, reason);
            
            try {
                await target.send({
                    embeds: [{
                        title: `You were muted in ${message.guild.name}`,
                        description: `**Duration:** ${timeString}\n**Reason:** ${reason}`,
                        color: 0xFF0000,
                    }]
                });
            } catch (dmError) {
                console.log(`Could not send a DM to ${target.user.tag}`);
            }
            
            await sendMessage(message, {
                title: 'Done👍',
                description: `${target.user.tag} was muted for: ${reason}`,
                color: 0x00FF00,
                timestamp: true
            });
        } catch (error) {
            console.error(error);
            await sendMessage(message, {
                title: 'Error',
                description: 'An error occurred while trying to mute the user.',
                color: 0xFF0000,
            });
        }
        console.log(args);
    }
}

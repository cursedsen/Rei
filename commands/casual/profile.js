import { sendMessage } from '../../functions/reiMessageMaker.js';

export default {
    name: 'profile',
    description: 'View profile information for yourself or another user',
    category: 'casual',
    usage: '[user]',
    async execute(message, args) {
        let target;
        
        if (args.length > 0) {
            target = message.mentions.members.first() || 
                await message.guild.members.fetch(args[0]).catch(() => null);
        } else {
            target = message.member;
        }

        if (!target || !target.user) {
            return await sendMessage(message, {
                title: 'Error',
                description: 'Could not find that user.',
                color: 0xFF0000
            });
        }

        const joinedAt = target.joinedAt;
        const createdAt = target.user.createdAt;
        const roles = target.roles.cache
            .filter(role => role.name !== '@everyone')
            .sort((a, b) => b.position - a.position)
            .map(role => `<@&${role.id}>`)
            .join(', ') || 'No roles';

        const description = [
            `**User Info**`,
            `**• Name:** ${target.user.tag}`,
            `**• ID:** ${target.id}`,
            `**• Created:** <t:${Math.floor(createdAt.getTime() / 1000)}:R>`,
            '',
            `**Server Info**`,
            `**• Nickname:** ${target.nickname || 'None'}`,
            `**• Joined:** <t:${Math.floor(joinedAt.getTime() / 1000)}:R>`,
            '',
            `**Roles [${target.roles.cache.size - 1}]**`,
            roles
        ].join('\n');

        await sendMessage(message, {
            title: `${target.user.displayName}'s Profile`,
            description: description,
            color: 0xFFD700,
            thumbnail: target.user.displayAvatarURL({ dynamic: true, size: 1024 }),
            timestamp: true
        });
    }
};

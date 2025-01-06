import { sendMessage } from '../../functions/reiMessageMaker.js';

export default {
    name: 'profile',
    description: 'View profile information for yourself or another user',
    category: 'casual',
    usage: '[user]/[userid]',
    aliases: ['user', 'userinfo', 'userinfo'],
    async execute(message, args) {
        let target;
        
        if (args.length > 0) {
            target = message.mentions.members.first() || 
                await message.guild.members.fetch(args[0]).catch(() => null);

            if (!target) {
                try {
                    const user = await message.client.users.fetch(args[0]);
                    return await sendMessage(message, {
                        title: `${user.displayName}'s Profile`,
                        description: [
                            `**Username:**\n${user.tag}`,
                            `**ID:**\n\`\`\`${user.id}\`\`\``,
                            `**Created:**\n<t:${Math.floor(user.createdAt.getTime() / 1000)}:R>`,
                            '',
                            '*User is not in this server*'
                        ].join('\n'),
                        color: 0xFFD700,
                        thumbnail: user.displayAvatarURL({ dynamic: true, size: 1024 }),
                        timestamp: true
                    });
                } catch {
                    return await sendMessage(message, {
                        title: 'Error',
                        description: 'Could not find that user.',
                        color: 0xFF0000
                    });
                }
            }
        } else {
            target = message.member;
        }

        const joinedAt = target.joinedAt;
        const createdAt = target.user.createdAt;
        const roles = target.roles.cache
            .filter(role => role.name !== '@everyone')
            .sort((a, b) => b.position - a.position)
            .map(role => `<@&${role.id}>`)
            .join(', ') || 'No roles';

        const description = [
            `**Username:**\n${target.user.tag}`,
            `**ID:**\n\`\`\`${target.id}\`\`\``,
            `**Created:**\n<t:${Math.floor(createdAt.getTime() / 1000)}:R>`,
            '',
            `**Nickname:**\n${target.nickname || 'None'}`,
            `**Joined:**\n<t:${Math.floor(joinedAt.getTime() / 1000)}:R>`,
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

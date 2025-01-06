import { sendMessage } from '../../functions/reiMessageMaker.js';

export default {
    name: 'invite',
    description: 'Get the Minecraft server IP and Discord invite link',
    category: 'casual',
    aliases: ['server', 'discord', 'dc', 'ip', 'minecraft'],
    async execute(message) {
        const serverIP = 'placeholder';
        const discordInvite = 'placeholder';

        await sendMessage(message, {
            content: `${discordInvite}`,
            title: `Click to copy`,
            description: [
                '**Minecraft Server**',
                `\`\`\`${serverIP}\`\`\``,
                '',
                '**Discord Server**',
                `\`\`\`${discordInvite}\`\`\``,
            ].join('\n'),
            color: 0x2B2D31
        });
    }
};